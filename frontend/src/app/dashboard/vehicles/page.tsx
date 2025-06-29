"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from "@/lib/api";

interface Vehicle {
  id: string;
  type: string;
  plate: string;
  model: string;
  availability: string;
  condition: string;
  insurance: string;
}

function VehicleForm({ onClose, onSubmit, initial }: {
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => Promise<any>;
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
      } catch (err: any) {
        setApiError(err?.message || "Failed to add vehicle");
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
  if (user?.role !== "vendor") {
    return <div className="max-w-xl mx-auto mt-16 text-center text-red-500 text-lg font-semibold">Not authorized. Only vendors can access vehicle management.</div>;
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle> | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles().then(data => {
      // Map snake_case fields to camelCase for frontend
      const mapped = data.map((v: any) => ({
        ...v,
        model: v.model,
        availability: v.availability,
        condition: v.condition,
        insurance: v.insurance,
        type: v.type,
        plate: v.plate,
        // Add more mappings if needed
      }));
      setVehicles(mapped);
      setLoading(false);
    });
  }, []);

  async function handleAdd(data: Partial<Vehicle>) {
    return createVehicle(data).then(newVehicle => {
      setVehicles(v => [...v, newVehicle]);
    });
  }

  async function handleEdit(data: Partial<Vehicle>) {
    if (!data.id) return;
    const updated = await updateVehicle(data.id, data);
    setVehicles(v => v.map(row => row.id === data.id ? updated : row));
  }

  async function handleDelete(id: string) {
    await deleteVehicle(id);
    setVehicles(v => v.filter(row => row.id !== id));
  }

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button className="bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900 px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-400" onClick={() => { setEditData(null); setModalOpen(true); }}>
          + Add Vehicle
        </button>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Vehicle" : "Add Vehicle"}>
        <VehicleForm
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEdit : handleAdd}
          initial={editData || {}}
        />
      </Modal>
      <div className="overflow-x-auto rounded-lg border shadow-sm bg-white dark:bg-gray-900/90 dark:text-white dark:border-gray-700">
        {loading ? (
          <div>Loading...</div>
        ) : (
        <table className="min-w-full bg-white dark:bg-gray-900 border rounded shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Plate</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Availability</th>
              <th className="px-4 py-2">Condition</th>
              <th className="px-4 py-2">Insurance</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(row => (
              <tr key={row.id} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900">
                <td className="border px-4 py-2">{row.type}</td>
                <td className="border px-4 py-2">{row.plate}</td>
                <td className="border px-4 py-2">{row.model}</td>
                <td className="border px-4 py-2">{row.availability}</td>
                <td className="border px-4 py-2">{row.condition}</td>
                <td className="border px-4 py-2">{row.insurance}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button className="text-blue-600 dark:text-blue-300 hover:underline" onClick={() => { setEditData(row); setModalOpen(true); }}>Edit</button>
                  <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => handleDelete(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
