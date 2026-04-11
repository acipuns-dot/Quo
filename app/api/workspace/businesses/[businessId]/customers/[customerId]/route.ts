import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../../../lib/supabase/server";
import {
  normalizeCustomerPayload,
  userOwnsBusiness,
} from "../../../../../../../lib/workspace/route-helpers";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function customerBelongsToBusiness(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  businessId: string,
  customerId: string,
) {
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ businessId: string; customerId: string }> },
) {
  const { businessId, customerId } = await params;

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

  if (!(await customerBelongsToBusiness(supabase, businessId, customerId))) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const body = normalizeCustomerPayload(await request.json());
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: body.name,
      address: body.address,
      email: body.email,
      phone: body.phone,
      tax_number: body.taxNumber,
      notes: body.notes,
    })
    .eq("id", customerId)
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
  { params }: { params: Promise<{ businessId: string; customerId: string }> },
) {
  const { businessId, customerId } = await params;

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

  if (!(await customerBelongsToBusiness(supabase, businessId, customerId))) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { count, error: countError } = await supabase
    .from("documents")
    .select("*", { head: true, count: "exact" })
    .eq("business_id", businessId)
    .eq("customer_id", customerId);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Customer is still used by saved workspace documents." },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("business_id", businessId)
    .eq("id", customerId);

  if (error) {
    throw error;
  }

  return NextResponse.json({ ok: true });
}
