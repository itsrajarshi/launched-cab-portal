"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from "@/lib/api";

interface Driver {
  id: string; // EmployeeId
  name: string;
  dateOfJoining: string;
  vehicleType: string;
  vehicleNumber: string;
  pan: string;
  aadhar: string;
  license: string;
  contact: string;
  email: string;
  address: string;
  salary: string;
  department: string;
  accountNumber: string;
  ifscCode: string;
}

function DriverForm({ onClose, onSubmit, initial }: {
  onClose: () => void;
  onSubmit: (data: Partial<Driver>) => Promise<any>;
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
      } catch (err: any) {
        setApiError(err?.message || "Failed to add driver");
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
  if (user?.role !== "vendor") {
    return <div className="max-w-xl mx-auto mt-16 text-center text-red-500 text-lg font-semibold">Not authorized. Only vendors can access driver management.</div>;
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Driver> | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers().then(data => {
      setDrivers(data);
      setLoading(false);
    });
  }, []);

  async function handleAdd(data: Partial<Driver>) {
    return createDriver(data).then(newDriver => {
      console.debug('createDriver result:', newDriver);
      setDrivers(d => [...d, newDriver]);
    });
  }

  async function handleEdit(data: Partial<Driver>) {
    if (!data.id) return;
    const updated = await updateDriver(data.id, data);
    setDrivers(d => d.map(row => row.id === data.id ? updated : row));
  }

  async function handleDelete(id: string) {
    await deleteDriver(id);
    setDrivers(d => d.filter(row => row.id !== id));
  }

  return (
    <div className="dark:bg-gray-800 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <button className="bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900 px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-400" onClick={() => { setEditData(null); setModalOpen(true); }}>
          + Add Driver
        </button>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Driver" : "Add Driver"}>
        <DriverForm
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEdit : handleAdd}
          initial={editData || {}}
        />
      </Modal>
      <div className="overflow-x-auto rounded-lg border shadow-sm bg-white dark:bg-gray-900/90 dark:text-white dark:border-gray-700">
        {loading ? (
          <div>Loading...</div>
        ) : drivers.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300 p-4">No drivers found.</div>
        ) : (
        <table className="min-w-full bg-white dark:bg-gray-900 border rounded shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">License</th>
              <th className="px-4 py-2">Vehicle Type</th>
              <th className="px-4 py-2">Vehicle Number</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(row => (
              <tr key={row.id} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900">
                <td className="border px-4 py-2">{row.name}</td>
                <td className="border px-4 py-2">{row.contact}</td>
                <td className="border px-4 py-2">{row.license}</td>
                <td className="border px-4 py-2">{row.vehicleType}</td>
                <td className="border px-4 py-2">{row.vehicleNumber}</td>
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
