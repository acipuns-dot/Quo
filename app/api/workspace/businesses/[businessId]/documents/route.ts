import { NextResponse } from "next/server";
import { z } from "zod";
import { documentSchema, draftDocumentSchema } from "../../../../../../lib/documents/schema";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import {
  listDocumentsForBusiness,
  upsertWorkspaceDocument,
} from "../../../../../../lib/workspace/documents";

const workspaceDocumentRequestSchema = z.object({
  kind: z.enum(["quotation", "invoice", "receipt"]),
  customerId: z.string().min(1).nullable(),
  status: z.enum(["draft", "exported"]),
  data: z.unknown(),
});

function normalizeDraftDocumentData(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }

  const candidate = data as {
    additionalFees?: Array<{
      id?: unknown;
      label?: unknown;
      amount?: unknown;
    }>;
  };

  if (!Array.isArray(candidate.additionalFees)) {
    return data;
  }

  return {
    ...candidate,
    additionalFees: candidate.additionalFees.map((fee) => {
      if (!fee || typeof fee !== "object" || Array.isArray(fee)) {
        return fee;
      }

      const amount =
        typeof fee.amount === "number" && Number.isFinite(fee.amount)
          ? fee.amount
          : null;
      const label = typeof fee.label === "string" ? fee.label : "";

      if (amount !== null && amount > 0 && !label.trim()) {
        return {
          ...fee,
          label: "Additional fee",
        };
      }

      return fee;
    }),
  };
}

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

async function saveDocumentForBusiness(
  request: Request,
  businessId: string,
) {
  try {
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

    const requestBody = workspaceDocumentRequestSchema.parse(await request.json());
    const data =
      requestBody.status === "draft"
        ? normalizeDraftDocumentData(requestBody.data)
        : requestBody.data;
    const body = {
      ...requestBody,
      data:
        requestBody.status === "draft"
          ? draftDocumentSchema.parse(data)
          : documentSchema.parse(data),
    };
    const item = await upsertWorkspaceDocument(supabase, {
      businessId,
      customerId: body.customerId,
      kind: body.kind,
      status: body.status,
      data: body.data,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid workspace document payload." },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Workspace document save failed." }, { status: 500 });
  }
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

  const items = await listDocumentsForBusiness(supabase, businessId);
  return NextResponse.json({ items });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;

  return saveDocumentForBusiness(request, businessId);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;

  return saveDocumentForBusiness(request, businessId);
}
