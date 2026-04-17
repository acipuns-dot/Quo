"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteItem } from "../../lib/workspace/api-client";
import type { ItemRecord } from "../../lib/workspace/types";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { ItemFormModal } from "./item-form-modal";

function formatItemUnit(item: ItemRecord) {
  const unitLabel = item.unit === "custom" ? item.customUnit : item.unit;
  return unitLabel ? `${item.quantity} ${unitLabel}` : `${item.quantity}`;
}

export function ItemsTab({
  items,
  businessId,
}: {
  items: ItemRecord[];
  businessId: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<ItemRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function refreshWorkspace() {
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingItem) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteItem(businessId, deletingItem.id);
      setDeletingItem(null);
      router.refresh();
    } catch (caughtError) {
      setDeleteError(caughtError instanceof Error ? caughtError.message : "Unable to delete item.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div data-testid="items-tab" className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#faf9f7]">Items</h2>
          <p className="mt-1 text-sm text-white/40">Reusable services and products for this business.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-2xl bg-[#d4901e] px-4 py-2.5 text-sm font-bold text-[#111111]"
        >
          Add item
        </button>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
            <svg className="h-6 w-6 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5H3.75m16.5 0v9a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-9m16.5 0-1.048-2.619A2.25 2.25 0 0 0 17.114 3.75H6.886a2.25 2.25 0 0 0-2.088 1.131L3.75 7.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/40">No items yet</p>
          <p className="mt-1 text-xs text-white/25">Save repeat services and products here for faster document building.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-[#faf9f7]">
                {item.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-[#faf9f7]">{item.name}</div>
              <div className="mt-0.5 text-xs text-white/40 line-clamp-1">{item.description}</div>
              {item.note ? <div className="mt-0.5 text-xs text-white/30 line-clamp-1">{item.note}</div> : null}
              <div className="mt-0.5 text-xs text-white/30">{formatItemUnit(item)} | {item.unitPrice}</div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => setEditingItem(item)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80"
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => {
                    setDeletingItem(item);
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
      )}
      <ItemFormModal
        open={creating}
        businessId={businessId}
        mode="create"
        onClose={() => setCreating(false)}
        onSaved={refreshWorkspace}
      />
      <ItemFormModal
        open={Boolean(editingItem)}
        businessId={businessId}
        mode="edit"
        initialItem={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={refreshWorkspace}
      />
      <DeleteConfirmModal
        open={Boolean(deletingItem)}
        title="Delete item"
        description="Delete this saved item if you no longer need it in the catalogue."
        confirmLabel="Delete item"
        error={deleteError}
        isSubmitting={isDeleting}
        onClose={() => {
          setDeletingItem(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
