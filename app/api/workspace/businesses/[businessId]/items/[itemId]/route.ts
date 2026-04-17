import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../../lib/supabase/server";
import {
  itemBelongsToBusiness,
  normalizeItemPayload,
  userOwnsBusiness,
} from "../../../../../../../lib/workspace/route-helpers";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ businessId: string; itemId: string }> },
) {
  const { businessId, itemId } = await params;

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

  if (!(await itemBelongsToBusiness(supabase, businessId, itemId))) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const body = normalizeItemPayload(await request.json());
  const { data, error } = await supabase
    .from("items")
    .update({
      name: body.name,
      description: body.description,
      quantity: body.quantity,
      unit: body.unit,
      custom_unit: body.customUnit,
      unit_price: body.unitPrice,
    })
    .eq("id", itemId)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ businessId: string; itemId: string }> },
) {
  const { businessId, itemId } = await params;

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

  if (!(await itemBelongsToBusiness(supabase, businessId, itemId))) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("business_id", businessId)
    .eq("id", itemId);

  if (error) {
    throw error;
  }

  return NextResponse.json({ ok: true });
}
