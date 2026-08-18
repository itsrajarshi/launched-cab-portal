"use client";
import { useRef, useState } from "react";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import { TableSkeleton } from "@/components/TableSkeleton";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from "@/lib/hooks";
import { uploadInvoiceAttachment } from "@/lib/api";
import { toast } from "sonner";
import type { Invoice } from "@/lib/types";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice> | null>(null);
  const { data: invoices = [], isLoading: loading, isError, error, refetch } = useInvoices();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();
  const [tab, setTab] = useState<'all' | 'pending' | 'received' | 'monthly'>('all');
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleAdd(data: Partial<Invoice>) {
    await createMutation.mutateAsync(data);
  }

  async function handleEdit(data: Partial<Invoice>) {
    if (!data.id) return;
    await updateMutation.mutateAsync({ id: data.id, data });
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    setUploadingId(uploadTarget);
    try {
      await uploadInvoiceAttachment(uploadTarget, file);
      toast.success("Invoice attachment uploaded");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      <PageHeader
        title="Invoices"
        actions={
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => { setEditData(null); setModalOpen(true); }}>
            + Submit Invoice
          </button>
        }
      />
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
      {isError && (
        <ErrorBanner message={error instanceof Error ? error.message : "Failed to load invoices"} />
      )}
      <div className="overflow-x-auto rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900/90 dark:text-white mt-4">
        {loading ? (
          <TableSkeleton cols={7} rows={5} />
        ) : tab !== 'monthly' ? (
          <table className="min-w-full bg-white dark:bg-gray-900 border-0 rounded-xl">
            <thead>
              <tr className="bg-blue-50/70 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Month</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <EmptyState message="No invoices found." colSpan={7} />
              )}
              {filtered.map((row, idx) => (
                <tr key={row.id || idx} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">{row.invoiceNumber}</td>
                  <td className="px-4 py-3">{row.company}</td>
                  <td className="px-4 py-3">₹{row.amount}</td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.month}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      className="text-blue-600 dark:text-blue-300 hover:underline disabled:opacity-50"
                      onClick={() => {
                        setUploadTarget(row.id);
                        fileInputRef.current?.click();
                      }}
                      disabled={uploadingId === row.id}
                      title="Upload attachment"
                    >
                      {uploadingId === row.id ? "Uploading..." : "📎 Upload"}
                    </button>
                    {row.fileUrl && (
                      <a
                        href={row.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        View
                      </a>
                    )}
                    <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => handleDelete(row.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4">
            {Object.keys(monthly).length === 0 && <EmptyState message="No invoices found." />}
            {Object.entries(monthly).map(([month, invs]) => (
              <div key={month} className="mb-6">
                <h2 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-200">{month}</h2>
                <table className="min-w-full bg-white dark:bg-gray-900 border-0 rounded-xl">
                  <thead>
                    <tr className="bg-blue-50/70 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invs as Invoice[]).map((row, idx) => (
                      <tr key={row.id || idx} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3">{row.invoiceNumber}</td>
                        <td className="px-4 py-3">{row.company}</td>
                        <td className="px-4 py-3">₹{row.amount}</td>
                        <td className="px-4 py-3">
                          <InvoiceStatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            className="text-blue-600 dark:text-blue-300 hover:underline disabled:opacity-50"
                            onClick={() => {
                              setUploadTarget(row.id);
                              fileInputRef.current?.click();
                            }}
                            disabled={uploadingId === row.id}
                            title="Upload attachment"
                          >
                            {uploadingId === row.id ? "Uploading..." : "📎 Upload"}
                          </button>
                          {row.fileUrl && (
                            <a
                              href={row.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-600 dark:text-green-400 hover:underline"
                            >
                              View
                            </a>
                          )}
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
