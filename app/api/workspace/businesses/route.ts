import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { listBusinessesForUser } from "../../../../lib/workspace/businesses";

const businessCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().max(300),
  email: z.string().max(160),
  phone: z.string().max(40),
  taxNumber: z.string().max(60),
  defaultCurrency: z.string().trim().min(1).max(8),
  defaultTaxLabel: z.string().max(40),
  defaultTaxRate: z.number().min(0).max(100),
  defaultPaymentTerms: z.string().max(80),
  logoUrl: z.string().url().nullable(),
  notes: z.string().max(500),
});

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function GET() {
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

  const items = await listBusinessesForUser(supabase, user.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
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

  const body = businessCreateSchema.parse(await request.json());
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      name: body.name,
      address: body.address,
      email: body.email,
      phone: body.phone,
      tax_number: body.taxNumber,
      default_currency: body.defaultCurrency,
      default_tax_label: body.defaultTaxLabel,
      default_tax_rate: body.defaultTaxRate,
      default_payment_terms: body.defaultPaymentTerms,
      logo_url: body.logoUrl,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ item: data });
}
