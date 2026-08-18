"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorBanner from "@/components/ErrorBanner";
import { TableSkeleton } from "@/components/TableSkeleton";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/lib/hooks";
import type { Vehicle } from "@/lib/types";

function VehicleForm({ onClose, onSubmit, initial }: {
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => Promise<unknown>;
  initial?: Partial<Vehicle>;
}) {
  const [form, setForm] = useState<Partial<Vehicle>>(initial || {});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.type) errs.type = "Type required";
    if (!form.plate) errs.plate = "Plate required";
    if (!form.model) errs.model = "Model required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        await onSubmit(form);
        onClose();
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Failed to add vehicle");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form className="space-y-4 p-2 sm:p-4 md:p-6 min-w-[260px] w-full max-w-xs mx-auto" onSubmit={handleSubmit}>
      {apiError && <div className="text-red-500 text-sm mb-2">{apiError}</div>}
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Type" value={form.type || ""} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} disabled={loading} />
        {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Plate" value={form.plate || ""} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} disabled={loading} />
        {errors.plate && <div className="text-red-500 text-sm">{errors.plate}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Model" value={form.model || ""} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} disabled={loading} />
        {errors.model && <div className="text-red-500 text-sm">{errors.model}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Availability" value={form.availability || ""} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Condition" value={form.condition || ""} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Insurance" value={form.insurance || ""} onChange={e => setForm(f => ({ ...f, insurance: e.target.value }))} disabled={loading} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 animated-btn" disabled={loading}>{loading ? "Saving..." : "Submit"}</button>
        <button type="button" className="px-4 py-2 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </form>
  );
}

export default function VehiclesPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const { data: vehicles = [], isLoading: loading, isError, error } = useVehicles();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  if (user?.role !== "vendor") {
    return <div className="max-w-xl mx-auto mt-16 text-center text-red-500 text-lg font-semibold">Not authorized. Only vendors can access vehicle management.</div>;
  }

  async function handleAdd(data: Partial<Vehicle>) {
    return createMutation.mutateAsync(data);
  }

  async function handleEdit(data: Partial<Vehicle>) {
    if (!data.id) return;
    return updateMutation.mutateAsync({ id: data.id, data });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      <PageHeader
        title="Vehicles"
        actions={
          <button className="bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900 px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-400" onClick={() => { setEditData(null); setModalOpen(true); }}>
            + Add Vehicle
          </button>
        }
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Vehicle" : "Add Vehicle"}>
        <VehicleForm
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEdit : handleAdd}
          initial={editData || {}}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Vehicle"
        message={`Delete vehicle ${deleteTarget?.plate ?? ""}? This cannot be undone.`}
        busy={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
      {isError && (
        <ErrorBanner message={error instanceof Error ? error.message : "Failed to load vehicles"} />
      )}
      <div className="overflow-x-auto rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900/90 dark:text-white">
        <table className="min-w-full bg-white dark:bg-gray-900 border-0 rounded-xl">
          <thead>
            <tr className="bg-blue-50/70 dark:bg-gray-800">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Plate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Availability</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Insurance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={7} />
            ) : vehicles.length === 0 ? (
              <EmptyState message="No vehicles found." colSpan={7} />
            ) : (
            vehicles.map(row => (
              <tr key={row.id} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.plate}</td>
                <td className="px-4 py-3">{row.model}</td>
                <td className="px-4 py-3">{row.availability}</td>
                <td className="px-4 py-3">{row.condition}</td>
                <td className="px-4 py-3">{row.insurance}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="text-blue-600 dark:text-blue-300 hover:underline" onClick={() => { setEditData(row); setModalOpen(true); }}>Edit</button>
                  <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => setDeleteTarget(row)}>Delete</button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
