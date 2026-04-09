import React from "react";
import { notFound, redirect } from "next/navigation";
import { DocumentGenerator } from "../../../../components/generator/document-generator";
import { BusinessDefaultsBanner } from "../../../../components/workspace/business-defaults-banner";
import { WorkspaceShell } from "../../../../components/workspace/workspace-shell";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { DocumentKind } from "../../../../lib/documents/types";
import { listBusinessesForUser, resolveActiveBusiness } from "../../../../lib/workspace/businesses";
import { listCustomersForBusiness } from "../../../../lib/workspace/customers";
import { listDocumentsForBusiness } from "../../../../lib/workspace/documents";
import { getWorkspaceAccountProfile } from "../../../../lib/workspace/account-profiles";
import { resolveWorkspaceAccess } from "../../../../lib/workspace/session";
import type { BusinessRecord, CustomerRecord, SavedDocumentRecord } from "../../../../lib/workspace/types";

const validKinds: DocumentKind[] = ["quotation", "invoice", "receipt"];

const fallbackBusiness: BusinessRecord = {
  id: "workspace-demo",
  userId: "workspace-user",
  name: "Workspace Demo",
  address: "",
  email: "",
  phone: "",
  taxNumber: "",
  defaultCurrency: "USD",
  defaultTaxLabel: "Tax",
  defaultTaxRate: 0,
  defaultPaymentTerms: "",
  logoUrl: null,
  notes: "",
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export default async function WorkspaceKindPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams?: Promise<{ businessId?: string }>;
}) {
  const { kind } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!validKinds.includes(kind as DocumentKind)) {
    notFound();
  }

  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!hasSupabaseEnv) {
    const customers: CustomerRecord[] = [];
    const documents: SavedDocumentRecord[] = [];

    return (
      <WorkspaceShell
        activeBusiness={fallbackBusiness}
        businesses={[fallbackBusiness]}
        customers={customers}
        documents={documents}
      >
        <BusinessDefaultsBanner business={fallbackBusiness} />
        <DocumentGenerator
          kind={kind as DocumentKind}
          workspace={{
            businessId: fallbackBusiness.id,
            businessName: fallbackBusiness.name,
            apiBasePath: `/api/workspace/businesses/${fallbackBusiness.id}/documents`,
            customerOptions: [],
          }}
        />
      </WorkspaceShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getWorkspaceAccountProfile(supabase, user.id) : null;
  const access = resolveWorkspaceAccess(user, profile?.plan ?? null, kind as DocumentKind);

  if (!access.allowed) {
    redirect(access.redirectTo);
  }

  if (!user) {
    redirect("/login");
  }

  const businesses = await listBusinessesForUser(supabase, user.id);
  const activeBusiness = resolveActiveBusiness(businesses, resolvedSearchParams?.businessId);

  if (!activeBusiness) {
    return <main className="p-6">Create your first business to start using Quo Premium.</main>;
  }

  const [customers, documents] = await Promise.all([
    listCustomersForBusiness(supabase, activeBusiness.id),
    listDocumentsForBusiness(supabase, activeBusiness.id),
  ]);

  return (
    <WorkspaceShell
      activeBusiness={activeBusiness}
      businesses={businesses}
      customers={customers}
      documents={documents}
    >
      <BusinessDefaultsBanner business={activeBusiness} />
      <DocumentGenerator
        kind={kind as DocumentKind}
        workspace={{
          businessId: activeBusiness.id,
          businessName: activeBusiness.name,
          apiBasePath: `/api/workspace/businesses/${activeBusiness.id}/documents`,
          customerOptions: customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            address: customer.address,
          })),
        }}
      />
    </WorkspaceShell>
  );
}
