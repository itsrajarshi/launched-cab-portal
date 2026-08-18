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
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from "@/lib/hooks";
import type { Driver } from "@/lib/types";

function DriverForm({ onClose, onSubmit, initial }: {
  onClose: () => void;
  onSubmit: (data: Partial<Driver>) => Promise<unknown>;
  initial?: Partial<Driver>;
}) {
  const [form, setForm] = useState<Partial<Driver>>(initial || {});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.name) errs.name = "Name required";
    if (!form.contact) errs.contact = "Contact required";
    if (!form.license) errs.license = "License required";
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
        setApiError(err instanceof Error ? err.message : "Failed to add driver");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {apiError && <div className="text-red-500 text-sm mb-2">{apiError}</div>}
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="EmployeeId" value={form.id || ""} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Name" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={loading} />
        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Date of Joining" type="date" value={form.dateOfJoining || ""} onChange={e => setForm(f => ({ ...f, dateOfJoining: e.target.value }))} disabled={loading} />
      </div>
      <div className="flex gap-2">
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Vehicle Type" value={form.vehicleType || ""} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))} disabled={loading} />
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Vehicle Number" value={form.vehicleNumber || ""} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="PAN Number" value={form.pan || ""} onChange={e => setForm(f => ({ ...f, pan: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Aadhar Details" value={form.aadhar || ""} onChange={e => setForm(f => ({ ...f, aadhar: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="License Number" value={form.license || ""} onChange={e => setForm(f => ({ ...f, license: e.target.value }))} disabled={loading} />
        {errors.license && <div className="text-red-500 text-sm">{errors.license}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Phone" value={form.contact || ""} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} disabled={loading} />
        {errors.contact && <div className="text-red-500 text-sm">{errors.contact}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={loading} />
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Address" value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={loading} />
      </div>
      <div className="flex gap-2">
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Department" value={form.department || ""} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} disabled={loading} />
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Salary" value={form.salary || ""} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} disabled={loading} />
      </div>
      <div className="flex gap-2">
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Account Number" value={form.accountNumber || ""} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} disabled={loading} />
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="IFSC Code" value={form.ifscCode || ""} onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} disabled={loading} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? "Saving..." : "Submit"}</button>
        <button type="button" className="px-4 py-2 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </form>
  );
}

export default function DriversPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Driver> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);
  const { data: drivers = [], isLoading: loading, isError, error } = useDrivers();
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();
  const deleteMutation = useDeleteDriver();

  if (user?.role !== "vendor") {
    return <div className="max-w-xl mx-auto mt-16 text-center text-red-500 text-lg font-semibold">Not authorized. Only vendors can access driver management.</div>;
  }

  async function handleAdd(data: Partial<Driver>) {
    return createMutation.mutateAsync(data);
  }

  async function handleEdit(data: Partial<Driver>) {
    if (!data.id) return;
    return updateMutation.mutateAsync({ id: data.id, data });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="dark:bg-gray-800 dark:text-white">
      <PageHeader
        title="Drivers"
        actions={
          <button className="bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900 px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-400" onClick={() => { setEditData(null); setModalOpen(true); }}>
            + Add Driver
          </button>
        }
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Driver" : "Add Driver"}>
        <DriverForm
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEdit : handleAdd}
          initial={editData || {}}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Driver"
        message={`Delete ${deleteTarget?.name ?? "this driver"}? This cannot be undone.`}
        busy={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
      {isError && (
        <ErrorBanner message={error instanceof Error ? error.message : "Failed to load drivers"} />
      )}
      <div className="overflow-x-auto rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900/90 dark:text-white">
        <table className="min-w-full bg-white dark:bg-gray-900 border-0 rounded-xl">
          <thead>
            <tr className="bg-blue-50/70 dark:bg-gray-800">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">License</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Vehicle Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Vehicle Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={6} />
            ) : drivers.length === 0 ? (
              <EmptyState message="No drivers found." colSpan={6} />
            ) : (
            drivers.map(row => (
              <tr key={row.id} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.contact}</td>
                <td className="px-4 py-3">{row.license}</td>
                <td className="px-4 py-3">{row.vehicleType}</td>
                <td className="px-4 py-3">{row.vehicleNumber}</td>
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
