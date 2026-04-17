import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature, getSubscription } from "../../../../../lib/billing/paypal";

// Use service role client — webhook runs without user session
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const headers: Record<string, string> = {
    "paypal-auth-algo": req.headers.get("paypal-auth-algo") ?? "",
    "paypal-cert-url": req.headers.get("paypal-cert-url") ?? "",
    "paypal-transmission-id": req.headers.get("paypal-transmission-id") ?? "",
    "paypal-transmission-sig": req.headers.get("paypal-transmission-sig") ?? "",
    "paypal-transmission-time": req.headers.get("paypal-transmission-time") ?? "",
  };

  const valid = await verifyWebhookSignature(headers, rawBody);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.event_type;
  const resource = event.resource;

  const supabase = getServiceClient();

  try {
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED": {
        await handleSubscriptionActive(supabase, resource);
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        await handleSubscriptionCancelled(supabase, resource);
        break;
      }
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await handleSubscriptionExpired(supabase, resource);
        break;
      }
      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionActive(
  supabase: ReturnType<typeof getServiceClient>,
  resource: Record<string, unknown>,
) {
  const subscriptionId = resource.id as string;

  // Fetch full subscription details to get custom_id (our user ID)
  const sub = await getSubscription(subscriptionId);
  const userId = sub.custom_id as string | undefined;

  if (!userId) {
    console.error("No custom_id (userId) in PayPal subscription", subscriptionId);
    return;
  }

  const planInterval = resolvePlanInterval(sub.plan_id as string);
  const periodStart = sub.billing_info?.last_payment?.time as string | undefined;
  const periodEnd = sub.billing_info?.next_billing_time as string | undefined;

  // Upsert billing subscription row
  await supabase.from("billing_subscriptions").upsert(
    {
      user_id: userId,
      provider: "paypal",
      provider_subscription_id: subscriptionId,
      plan_interval: planInterval,
      status: sub.status as string,
      current_period_start: periodStart ?? null,
      current_period_end: periodEnd ?? null,
      cancel_at_period_end: false,
      canceled_at: null,
    },
    { onConflict: "provider_subscription_id" },
  );

  // Upgrade the user plan
  await supabase
    .from("user_profiles")
    .update({ plan: "premium" })
    .eq("user_id", userId);
}

// Cancelled/suspended — mark the subscription but keep premium access until period ends
async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof getServiceClient>,
  resource: Record<string, unknown>,
) {
  const subscriptionId = resource.id as string;

  await supabase
    .from("billing_subscriptions")
    .update({
      status: "CANCELLED",
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", subscriptionId);

  // Do NOT downgrade plan here — user keeps access until expiry
}

// Expired — period is over, downgrade to free now
async function handleSubscriptionExpired(
  supabase: ReturnType<typeof getServiceClient>,
  resource: Record<string, unknown>,
) {
  const subscriptionId = resource.id as string;

  await supabase
    .from("billing_subscriptions")
    .update({
      status: "EXPIRED",
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", subscriptionId);

  // Downgrade user plan
  const { data: subRow } = await supabase
    .from("billing_subscriptions")
    .select("user_id")
    .eq("provider_subscription_id", subscriptionId)
    .single();

  if (subRow?.user_id) {
    await supabase
      .from("user_profiles")
      .update({ plan: "free" })
      .eq("user_id", subRow.user_id);
  }
}

function resolvePlanInterval(planId: string): "monthly" | "yearly" {
  if (planId === process.env.PAYPAL_PLAN_ID_YEARLY) return "yearly";
  return "monthly";
}
