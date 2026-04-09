import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { listCustomersForBusiness } from "../../../../../../lib/workspace/customers";

const customerCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().max(300),
  email: z.string().max(160),
  phone: z.string().max(40),
  taxNumber: z.string().max(60),
  notes: z.string().max(500),
});

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function userOwnsBusiness(
  userId: string,
  businessId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
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

  const items = await listCustomersForBusiness(supabase, businessId);
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

  const body = customerCreateSchema.parse(await request.json());
  const { data, error } = await supabase
    .from("customers")
    .insert({
      business_id: businessId,
      name: body.name,
      address: body.address,
      email: body.email,
      phone: body.phone,
      tax_number: body.taxNumber,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ item: data });
}
