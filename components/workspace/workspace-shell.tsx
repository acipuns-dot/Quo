"use client";

import React, { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { DocumentKind } from "../../lib/documents/types";
import type { BusinessRecord, CustomerRecord, SavedDocumentRecord } from "../../lib/workspace/types";
import type { WorkspaceDocumentAction, WorkspaceSidebarAction } from "../../lib/workspace/sidebar-actions";
import { BusinessSwitcher } from "./business-switcher";
import { BusinessPanel } from "./business-panel";
import { ConfirmWorkspaceActionModal } from "./confirm-workspace-action-modal";
import { CustomerPanel } from "./customer-panel";
import { DocumentHistoryPanel } from "./document-history-panel";
import { WorkspaceSidebar, type WorkspaceTab } from "./workspace-sidebar";
import { BusinessesTab } from "./businesses-tab";
import { CustomersTab } from "./customers-tab";
import { DocumentHistoryTab } from "./document-history-tab";

type WorkspaceShellProps = {
  activeBusiness: BusinessRecord;
  businesses: BusinessRecord[];
  customers: CustomerRecord[];
  documents: SavedDocumentRecord[];
  activeTab: WorkspaceTab;
  kind: DocumentKind;
  children: ReactNode;
};

type WorkspaceDocumentChildProps = {
  workspaceAction?: WorkspaceDocumentAction | null;
  onWorkspaceActionHandled?: (actionId: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export function WorkspaceShell({
  activeBusiness,
  businesses,
  customers,
  documents,
  activeTab,
  kind,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<WorkspaceSidebarAction | null>(null);
  const [workspaceAction, setWorkspaceAction] = useState<WorkspaceDocumentAction | null>(null);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextSearchParams = new URLSearchParams(window.location.search);
    nextSearchParams.set("tab", currentTab);
    const nextSearch = nextSearchParams.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;

    window.history.replaceState(window.history.state, "", nextUrl);
  }, [currentTab]);

  function executeSidebarAction(action: WorkspaceSidebarAction) {
    if (action.kind === "business") {
      router.push(`${pathname}?businessId=${action.business.id}&tab=documents`);
      return;
    }

    setCurrentTab("documents");
    if (action.kind === "customer") {
      setWorkspaceAction({
        id: action.id,
        kind: "customer",
        customer: {
          id: action.customer.id,
          name: action.customer.name,
          address: action.customer.address,
        },
      });
      return;
    }

    setWorkspaceAction({
      id: action.id,
      kind: "document",
      document: action.document,
    });
  }

  function queueSidebarAction(action: WorkspaceSidebarAction) {
    const replacesCurrentDraft =
      action.kind === "business" ||
      action.kind === "customer" ||
      action.kind === "document";

    if (replacesCurrentDraft && isDraftDirty) {
      setPendingAction(action);
      return;
    }

    executeSidebarAction(action);
  }

  function getPendingActionLabel(action: WorkspaceSidebarAction | null) {
    if (!action) {
      return "";
    }

    if (action.kind === "business") {
      return `Switch to ${action.business.name}`;
    }

    if (action.kind === "customer") {
      return `Load customer ${action.customer.name}`;
    }

    return `Open saved draft ${action.document.documentNumber || "Untitled"}`;
  }

  const documentChild = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || typeof child.type === "string") {
      return child;
    }

    return React.cloneElement(child as React.ReactElement<WorkspaceDocumentChildProps>, {
      workspaceAction,
      onWorkspaceActionHandled: (actionId: string) => {
        setWorkspaceAction((current) => (current?.id === actionId ? null : current));
      },
      onDirtyChange: setIsDraftDirty,
    });
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#111111] text-[#faf9f7]">
      <header className="flex-shrink-0 border-b border-white/[0.07] bg-[#111111]">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-extrabold tracking-[0.06em] text-[#faf9f7]">QUO<span className="text-[#d4901e]">.</span></div>
            <span className="rounded-full border border-[#d4901e]/25 bg-[#d4901e]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d4901e]">Premium</span>
          </div>
          <div className="flex items-center gap-3">
            <BusinessSwitcher businesses={businesses} activeBusinessId={activeBusiness.id} />
            <Link
              href="/profile"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="flex w-[220px] flex-shrink-0 flex-col gap-3 overflow-y-auto border-r border-white/[0.07] p-4">
          <WorkspaceSidebar activeTab={currentTab} onTabChange={setCurrentTab} />
          <BusinessPanel
            businesses={businesses}
            activeBusinessId={activeBusiness.id}
            onSelectBusiness={(business) =>
              queueSidebarAction({
                id: `business:${business.id}`,
                kind: "business",
                business,
              })
            }
          />
          <CustomerPanel
            customers={customers}
            onSelectCustomer={(customer) =>
              queueSidebarAction({
                id: `customer:${customer.id}`,
                kind: "customer",
                customer,
              })
            }
          />
          <DocumentHistoryPanel
            documents={documents}
            onOpenDocument={(document) =>
              queueSidebarAction({
                id: `document:${document.id}`,
                kind: "document",
                document,
              })
            }
          />
        </aside>
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {currentTab === "documents" && documentChild}
          {currentTab === "businesses" && (
            <BusinessesTab businesses={businesses} activeBusiness={activeBusiness} kind={kind} />
          )}
          {currentTab === "customers" && (
            <CustomersTab customers={customers} businessId={activeBusiness.id} />
          )}
          {currentTab === "history" && (
            <DocumentHistoryTab documents={documents} kind={kind} />
          )}
        </main>
      </div>
      <ConfirmWorkspaceActionModal
        open={Boolean(pendingAction)}
        title="Leave current draft?"
        description="You have in-progress edits in the current document. Opening another workspace item will replace them."
        targetLabel={getPendingActionLabel(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) {
            return;
          }

          const action = pendingAction;
          setPendingAction(null);
          executeSidebarAction(action);
        }}
      />
    </div>
  );
}
