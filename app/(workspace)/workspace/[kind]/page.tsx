import React from "react";
import { notFound, redirect } from "next/navigation";
import { DocumentGenerator } from "../../../../components/generator/document-generator";
import { BusinessDefaultsBanner } from "../../../../components/workspace/business-defaults-banner";
import { FirstBusinessOnboarding } from "../../../../components/workspace/first-business-onboarding";
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
  searchParams?: Promise<{ businessId?: string; tab?: string }>;
}) {
  const { kind } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const validTabs = new Set(["documents", "businesses", "customers", "history"]);
  const requestedTab = resolvedSearchParams?.tab ?? "documents";

  if (!validKinds.includes(kind as DocumentKind)) {
    notFound();
  }

  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const activeTab = validTabs.has(requestedTab) ? requestedTab : "documents";

  if (!hasSupabaseEnv) {
    const customers: CustomerRecord[] = [];
    const documents: SavedDocumentRecord[] = [];

    return (
      <WorkspaceShell
        activeBusiness={fallbackBusiness}
        businesses={[fallbackBusiness]}
        customers={customers}
        documents={documents}
        activeTab={activeTab}
        kind={kind as DocumentKind}
      >
        <BusinessDefaultsBanner business={fallbackBusiness} />
        <DocumentGenerator
          kind={kind as DocumentKind}
          workspace={{
            businessId: fallbackBusiness.id,
            businessName: fallbackBusiness.name,
            businessAddress: fallbackBusiness.address,
            defaultCurrency: fallbackBusiness.defaultCurrency,
            defaultTaxLabel: fallbackBusiness.defaultTaxLabel,
            defaultTaxRate: fallbackBusiness.defaultTaxRate,
            defaultPaymentTerms: fallbackBusiness.defaultPaymentTerms,
            apiBasePath: `/api/workspace/businesses/${fallbackBusiness.id}/documents`,
            customerOptions: [],
            persistenceMode: "workspace",
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
    return <FirstBusinessOnboarding kind={kind as DocumentKind} />;
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
      activeTab={activeTab}
      kind={kind as DocumentKind}
    >
      <BusinessDefaultsBanner business={activeBusiness} />
      <DocumentGenerator
        kind={kind as DocumentKind}
        workspace={{
          businessId: activeBusiness.id,
          businessName: activeBusiness.name,
          businessAddress: activeBusiness.address,
          defaultCurrency: activeBusiness.defaultCurrency,
          defaultTaxLabel: activeBusiness.defaultTaxLabel,
          defaultTaxRate: activeBusiness.defaultTaxRate,
          defaultPaymentTerms: activeBusiness.defaultPaymentTerms,
          apiBasePath: `/api/workspace/businesses/${activeBusiness.id}/documents`,
          customerOptions: customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            address: customer.address,
          })),
          persistenceMode: "workspace",
        }}
      />
    </WorkspaceShell>
  );
}
