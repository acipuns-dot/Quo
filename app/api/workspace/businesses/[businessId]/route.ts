import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";
import {
  buildBusinessDeleteGuard,
  normalizeBusinessPayload,
  userOwnsBusiness,
} from "../../../../../lib/workspace/route-helpers";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getAuthedBusinessScope(businessId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!(await userOwnsBusiness(user.id, businessId, supabase))) {
    return {
      supabase,
      error: NextResponse.json({ error: "Business not found" }, { status: 404 }),
    };
  }

  return { supabase, error: null };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const scope = await getAuthedBusinessScope(businessId);
  if (scope.error) {
    return scope.error;
  }

  const body = normalizeBusinessPayload(await request.json());
  const { data, error } = await scope.supabase
    .from("businesses")
    .update({
      name: body.name,
      address: body.address,
      email: body.email,
      phone: body.phone,
      tax_number: body.taxNumber,
      default_currency: body.defaultCurrency,
      default_tax_label: body.defaultTaxLabel,
      default_tax_rate: body.defaultTaxRate,
      apply_tax_by_default: body.applyTaxByDefault,
      default_payment_terms: body.defaultPaymentTerms,
      logo_url: body.logoUrl,
      notes: body.notes,
    })
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const scope = await getAuthedBusinessScope(businessId);
  if (scope.error) {
    return scope.error;
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  const [{ count: customerCount, error: customerCountError }, { count: documentCount, error: documentCountError }] =
    await Promise.all([
      scope.supabase
        .from("customers")
        .select("*", { head: true, count: "exact" })
        .eq("business_id", businessId),
      scope.supabase
        .from("documents")
        .select("*", { head: true, count: "exact" })
        .eq("business_id", businessId),
    ]);

  if (customerCountError) {
    throw customerCountError;
  }

  if (documentCountError) {
    throw documentCountError;
  }

  const guard = buildBusinessDeleteGuard({
    customerCount: customerCount ?? 0,
    documentCount: documentCount ?? 0,
  });

  if (guard.needsForceDelete && !force) {
    return NextResponse.json(
      { error: "Business still has linked customers or documents.", guard },
      { status: 409 },
    );
  }

  if (force) {
    const [{ error: customerDeleteError }, { error: documentDeleteError }] = await Promise.all([
      scope.supabase.from("customers").delete().eq("business_id", businessId),
      scope.supabase.from("documents").delete().eq("business_id", businessId),
    ]);

    if (customerDeleteError) {
      throw customerDeleteError;
    }

    if (documentDeleteError) {
      throw documentDeleteError;
    }
  }

  const { error } = await scope.supabase.from("businesses").delete().eq("id", businessId);

  if (error) {
    throw error;
  }

  return NextResponse.json({ ok: true, guard });
}
