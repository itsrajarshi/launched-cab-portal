"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { fetchInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  company: string;
  amount: number;
  status: "pending" | "received";
  date: string;
  month: string;
}

function InvoiceForm({ onClose, onSubmit, initial }: {
  onClose: () => void;
  onSubmit: (data: Partial<Invoice>) => void;
  initial?: Partial<Invoice>;
}) {
  const [form, setForm] = useState<Partial<Invoice>>(initial || {});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.invoiceNumber) errs.invoiceNumber = "Invoice number required";
    if (!form.company) errs.company = "Company required";
    if (!form.amount) errs.amount = "Amount required";
    if (!form.date) errs.date = "Date required";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit(form);
      onClose();
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Invoice Number" value={form.invoiceNumber || ""} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
        {errors.invoiceNumber && <div className="text-red-500 text-sm">{errors.invoiceNumber}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Company" value={form.company || ""} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
        {errors.company && <div className="text-red-500 text-sm">{errors.company}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Amount" type="number" value={form.amount === undefined ? '' : form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))} />
        {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Date" type="date" value={form.date || ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Month (e.g. 2025-06)" value={form.month || ""} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
    </form>
  );
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice> | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'received' | 'monthly'>('all');

  useEffect(() => {
    fetchInvoices().then(data => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  async function handleAdd(data: Partial<Invoice>) {
    const newInvoice = await createInvoice(data);
    setInvoices(i => [...i, newInvoice]);
  }

  async function handleEdit(data: Partial<Invoice>) {
    if (!data.id) return;
    const updated = await updateInvoice(data.id, data);
    setInvoices(i => i.map(row => row.id === data.id ? updated : row));
  }

  async function handleDelete(id: string) {
    await deleteInvoice(id);
    setInvoices(i => i.filter(row => row.id !== id));
  }

  const filtered = invoices.filter(row =>
    tab === 'all' ? true : tab === 'monthly' ? true : row.status === tab
  );

  // Monthly report: group by month
  const monthly = invoices.reduce((acc, inv) => {
    acc[inv.month] = acc[inv.month] || [];
    acc[inv.month].push(inv);
    return acc;
  }, {} as Record<string, Invoice[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => { setEditData(null); setModalOpen(true); }}>
          + Submit Invoice
        </button>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Invoice" : "Submit Invoice"}>
        <InvoiceForm
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEdit : handleAdd}
          initial={editData || {}}
        />
      </Modal>
      <div className="flex gap-2">
        <button className={`px-3 py-1 rounded ${tab === 'all' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`} onClick={() => setTab('all')}>All</button>
        <button className={`px-3 py-1 rounded ${tab === 'pending' ? 'bg-yellow-600 text-white dark:bg-yellow-500 dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`px-3 py-1 rounded ${tab === 'received' ? 'bg-green-600 text-white dark:bg-green-500 dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`} onClick={() => setTab('received')}>Received</button>
        <button className={`px-3 py-1 rounded ${tab === 'monthly' ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`} onClick={() => setTab('monthly')}>Monthly Report</button>
      </div>
      <div className="overflow-x-auto rounded-lg border shadow-sm bg-white dark:bg-gray-900/90 dark:text-white dark:border-gray-700 mt-4">
        {loading ? (
          <div>Loading...</div>
        ) : tab !== 'monthly' ? (
          <table className="min-w-full bg-white dark:bg-gray-900 border rounded shadow">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2">Invoice #</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id || idx} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900">
                  <td className="border px-4 py-2">{row.invoiceNumber}</td>
                  <td className="border px-4 py-2">{row.company}</td>
                  <td className="border px-4 py-2">₹{row.amount}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>{row.status}</span>
                  </td>
                  <td className="border px-4 py-2">{row.date}</td>
                  <td className="border px-4 py-2">{row.month}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => handleDelete(row.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            {Object.keys(monthly).length === 0 && <div>No invoices found.</div>}
            {Object.entries(monthly).map(([month, invs]) => (
              <div key={month} className="mb-6">
                <h2 className="font-bold text-lg mb-2">{month}</h2>
                <table className="min-w-full bg-white dark:bg-gray-900 border rounded shadow">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2">Invoice #</th>
                      <th className="px-4 py-2">Company</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invs as Invoice[]).map((row, idx) => (
                      <tr key={row.id || idx} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900">
                        <td className="border px-4 py-2">{row.invoiceNumber}</td>
                        <td className="border px-4 py-2">{row.company}</td>
                        <td className="border px-4 py-2">₹{row.amount}</td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>{row.status}</span>
                        </td>
                        <td className="border px-4 py-2">{row.date}</td>
                        <td className="border px-4 py-2 flex gap-2">
                          <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => handleDelete(row.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
