import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { createSubscription } from "../../../../lib/billing/paypal";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const interval: "monthly" | "yearly" = body.interval === "yearly" ? "yearly" : "monthly";

  const planId =
    interval === "yearly"
      ? process.env.PAYPAL_PLAN_ID_YEARLY!
      : process.env.PAYPAL_PLAN_ID_MONTHLY!;

  const origin = req.nextUrl.origin;
  const returnUrl = `${origin}/upgrade/success?interval=${interval}`;
  const cancelUrl = `${origin}/upgrade?canceled=1`;

  try {
    const { id, approvalUrl } = await createSubscription(planId, returnUrl, cancelUrl);
    return NextResponse.json({ subscriptionId: id, approvalUrl });
  } catch (err) {
    console.error("PayPal subscribe error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
