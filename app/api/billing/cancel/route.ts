import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { cancelSubscription } from "../../../../lib/billing/paypal";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find active subscription for this user — match status case-insensitively
  const { data: sub, error } = await supabase
    .from("billing_subscriptions")
    .select("provider_subscription_id, status")
    .eq("user_id", user.id)
    .eq("provider", "paypal")
    .eq("cancel_at_period_end", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !sub) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  try {
    await cancelSubscription(sub.provider_subscription_id);

    // Mark as cancel_at_period_end — webhook will do the final downgrade
    await supabase
      .from("billing_subscriptions")
      .update({ cancel_at_period_end: true, canceled_at: new Date().toISOString() })
      .eq("provider_subscription_id", sub.provider_subscription_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
