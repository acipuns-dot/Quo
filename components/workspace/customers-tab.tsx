"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerRecord } from "../../lib/workspace/types";
import { deleteCustomer } from "../../lib/workspace/api-client";
import { CustomerFormModal } from "./customer-form-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";

export function CustomersTab({
  customers,
  businessId,
}: {
  customers: CustomerRecord[];
  businessId: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function refreshWorkspace() {
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingCustomer) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteCustomer(businessId, deletingCustomer.id);
      setDeletingCustomer(null);
      router.refresh();
    } catch (caughtError) {
      setDeleteError(
        caughtError instanceof Error ? caughtError.message : "Unable to delete customer.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#faf9f7]">Customers</h2>
          <p className="mt-1 text-sm text-white/40">Saved customers for this business.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-2xl bg-[#d4901e] px-4 py-2.5 text-sm font-bold text-[#111111]"
        >
          Add customer
        </button>
      </div>
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
            <svg className="h-6 w-6 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/40">No customers yet</p>
          <p className="mt-1 text-xs text-white/25">Customers will appear here once added from the document editor or this tab.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-[#faf9f7]">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-[#faf9f7]">{customer.name}</div>
              {customer.email && <div className="mt-0.5 text-xs text-white/40">{customer.email}</div>}
              {customer.address && <div className="mt-0.5 text-xs text-white/30 line-clamp-1">{customer.address}</div>}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  aria-label={`Edit ${customer.name}`}
                  onClick={() => setEditingCustomer(customer)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80"
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${customer.name}`}
                  onClick={() => {
                    setDeletingCustomer(customer);
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
      <CustomerFormModal
        open={creating}
        businessId={businessId}
        mode="create"
        onClose={() => setCreating(false)}
        onSaved={refreshWorkspace}
      />
      <CustomerFormModal
        open={Boolean(editingCustomer)}
        businessId={businessId}
        mode="edit"
        initialCustomer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSaved={refreshWorkspace}
      />
      <DeleteConfirmModal
        open={Boolean(deletingCustomer)}
        title="Delete customer"
        description="Delete this customer if you no longer need the saved details."
        confirmLabel="Delete customer"
        error={deleteError}
        isSubmitting={isDeleting}
        onClose={() => {
          setDeletingCustomer(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
