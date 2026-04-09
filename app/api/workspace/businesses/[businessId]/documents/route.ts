import { NextResponse } from "next/server";
import { z } from "zod";
import { documentSchema } from "../../../../../../lib/documents/schema";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import {
  listDocumentsForBusiness,
  upsertWorkspaceDocument,
} from "../../../../../../lib/workspace/documents";

const workspaceDocumentRequestSchema = z.object({
  kind: z.enum(["quotation", "invoice", "receipt"]),
  customerId: z.string().min(1).nullable(),
  status: z.enum(["draft", "exported"]),
  data: documentSchema,
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

async function saveDocumentForBusiness(
  request: Request,
  businessId: string,
) {
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

  const body = workspaceDocumentRequestSchema.parse(await request.json());
  const item = await upsertWorkspaceDocument(supabase, {
    businessId,
    customerId: body.customerId,
    kind: body.kind,
    status: body.status,
    data: body.data,
  });

  return NextResponse.json({ item });
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
