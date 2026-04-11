"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessRecord } from "../../lib/workspace/types";
import type { DocumentKind } from "../../lib/documents/types";
import { deleteBusiness } from "../../lib/workspace/api-client";
import { BusinessFormModal } from "./business-form-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";

export function BusinessesTab({
  businesses,
  activeBusiness,
  kind,
}: {
  businesses: BusinessRecord[];
  activeBusiness: BusinessRecord;
  kind: DocumentKind;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessRecord | null>(null);
  const [deletingBusiness, setDeletingBusiness] = useState<BusinessRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [forceDelete, setForceDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function refreshWorkspace() {
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingBusiness) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteBusiness(deletingBusiness.id, forceDelete);
      setDeletingBusiness(null);
      setForceDelete(false);

      if (deletingBusiness.id === activeBusiness.id) {
        router.push(`/workspace/${kind}?tab=businesses`);
      }

      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to delete business.";

      if (/linked customers or documents/i.test(message)) {
        setForceDelete(true);
        setDeleteError(
          "This business still has linked customers or saved documents. Confirm force delete to remove everything.",
        );
      } else {
        setDeleteError(message);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#faf9f7]">Businesses</h2>
          <p className="mt-1 text-sm text-white/40">Manage your businesses and switch between them.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-2xl bg-[#d4901e] px-4 py-2.5 text-sm font-bold text-[#111111]"
        >
          Add business
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <div
            key={business.id}
            className={`group rounded-2xl border p-4 transition-all ${
              business.id === activeBusiness.id
                ? "border-[#d4901e]/40 bg-[#d4901e]/10"
                : "border-white/[0.07] bg-white/[0.03] hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-[#faf9f7]">
                {business.name.charAt(0).toUpperCase()}
              </div>
              {business.id === activeBusiness.id && (
                <span className="rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d4901e]">
                  Active
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-[#faf9f7]">{business.name}</div>
            <div className="mt-0.5 text-xs text-white/40">{business.defaultCurrency}</div>
            {business.email && (
              <div className="mt-0.5 text-xs text-white/30">{business.email}</div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`/workspace/${kind}?businessId=${business.id}&tab=documents`}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80"
              >
                Switch to this business
              </a>
              <button
                type="button"
                aria-label={`Edit ${business.name}`}
                onClick={() => setEditingBusiness(business)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80"
              >
                Edit
              </button>
              <button
                type="button"
                aria-label={`Delete ${business.name}`}
                onClick={() => {
                  setDeletingBusiness(business);
                  setForceDelete(false);
                  setDeleteError(null);
                }}
                className="rounded-xl border border-[#dc2626]/30 px-3 py-2 text-xs font-semibold text-[#fecaca]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <BusinessFormModal
        open={creating}
        mode="create"
        onClose={() => setCreating(false)}
        onSaved={refreshWorkspace}
      />
      <BusinessFormModal
        open={Boolean(editingBusiness)}
        mode="edit"
        initialBusiness={editingBusiness}
        onClose={() => setEditingBusiness(null)}
        onSaved={refreshWorkspace}
      />
      <DeleteConfirmModal
        open={Boolean(deletingBusiness)}
        title={forceDelete ? "Force delete business" : "Delete business"}
        description={
          forceDelete
            ? "This will delete the business, all linked customers, and saved document history."
            : "Delete this business if you no longer need it."
        }
        confirmLabel={forceDelete ? "Delete everything" : "Delete business"}
        requiresText={forceDelete}
        expectedText={deletingBusiness?.name}
        error={deleteError}
        isSubmitting={isDeleting}
        onClose={() => {
          setDeletingBusiness(null);
          setForceDelete(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
