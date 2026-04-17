import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { listItemsForBusiness } from "../../../../../../lib/workspace/items";
import {
  normalizeItemPayload,
  userOwnsBusiness,
} from "../../../../../../lib/workspace/route-helpers";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ items: [] });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await userOwnsBusiness(user.id, businessId, supabase))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const items = await listItemsForBusiness(supabase, businessId);
  return NextResponse.json({ items });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await userOwnsBusiness(user.id, businessId, supabase))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const body = normalizeItemPayload(await request.json());
  const { data, error } = await supabase
    .from("items")
    .insert({
      business_id: businessId,
      name: body.name,
      description: body.description,
      quantity: body.quantity,
      unit: body.unit,
      custom_unit: body.customUnit,
      unit_price: body.unitPrice,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ item: data });
}
