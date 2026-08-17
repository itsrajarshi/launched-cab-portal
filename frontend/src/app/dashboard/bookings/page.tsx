"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { fetchBookings, createBooking, updateBooking, deleteBooking, startTrip, endTrip, fetchDrivers, fetchVehicles, createInvoice } from "@/lib/api";
import { saveAs } from "file-saver";
import './boardingpass.css';

interface Booking {
  id: string;
  guest: string;
  date: string;
  pickup: string;
  drop: string;
  category: string;
  status: string;
  driver: string;
  vehicleType: string;
  vehicleNumber: string;
  location: string;
  contact: string;
  company: string;
  accepted_by_vendor?: string; // vendor assigned after open market acceptance
  open_market_placed_at?: string;
  referenceName?: string;
  invoiceNumber?: string;
  opKm?: string;
  totalKm?: string;
  tollParking?: string;
  totalAmount?: string;
  fuelOffice?: string;
  fuelCash?: string;
  roadTax?: string;
  expenses?: string;
  advOffice?: string;
  pickupTime?: string;
  dropTime?: string;
  locationLink?: string;
  assocVendor?: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

function safeTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
}

function escapeCsv(value: unknown): string {
  const s = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function BookingForm({ onClose, onSubmit, initial }: {
  onClose: () => void;
  onSubmit: (data: Partial<Booking>) => void;
  initial?: Partial<Booking>;
}) {
  const [form, setForm] = useState<Partial<Booking>>(initial || {});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.guest) errs.guest = "Guest name required";
    if (!form.date) errs.date = "Date required";
    if (!form.pickup) errs.pickup = "Pickup required";
    if (!form.drop) errs.drop = "Drop required";
    if (!form.category) errs.category = "Category required";
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
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Guest Name" value={form.guest || ""} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} />
        {errors.guest && <div className="text-red-500 text-sm">{errors.guest}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Date" type="date" value={form.date || ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Pickup Location" value={form.pickup || ""} onChange={e => setForm(f => ({ ...f, pickup: e.target.value }))} />
        {errors.pickup && <div className="text-red-500 text-sm">{errors.pickup}</div>}
      </div>
      <div>
        <input className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="Drop Location" value={form.drop || ""} onChange={e => setForm(f => ({ ...f, drop: e.target.value }))} />
        {errors.drop && <div className="text-red-500 text-sm">{errors.drop}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium">Car Category
          <select className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-700" value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">Select</option>
            <option>Sedan</option>
            <option>Hatchback</option>
            <option>SUV</option>
            <option>Luxury</option>
          </select>
        </label>
        {errors.category && <div className="text-red-500 text-sm">{errors.category}</div>}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
    </form>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Booking> | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<{
    status?: string;
    driver?: string;
    company?: string;
    guest?: string;
    pickup?: string;
    contact?: string;
    reference?: string;
    invoiceNumber?: string;
  }>({
    status: undefined,
    driver: undefined,
    company: undefined,
    guest: undefined,
    pickup: undefined,
    contact: undefined,
    reference: undefined,
    invoiceNumber: undefined,
  });
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<{ id: string } | null>(null);
  const [tripModal, setTripModal] = useState<{ id: string, pickup: string, drop: string } | null>(null);
  const [tripModalState, setTripModalState] = useState<{ km: number, amount: number, progress: number, running: boolean } | null>(null);

  useEffect(() => {
    fetchBookings().then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, [user]);

  // In handleAdd, ensure all required fields are set
  async function handleAdd(data: Partial<Booking>) {
    // Always set status to 'pending' for new bookings
    const bookingData = {
      ...data,
      status: 'pending',
      company: data.company || 'Unknown Company',
      guest: data.guest || 'Unknown Guest',
      contact: data.contact || 'Unknown Contact',
      category: data.category || 'Sedan',
      date: data.date || new Date().toISOString().slice(0, 10),
      pickup: data.pickup || 'Unknown Pickup',
      drop: data.drop || 'Unknown Drop',
    };
    await createBooking(bookingData);
    // Always fetch the latest bookings after adding
    const latest = await fetchBookings();
    setBookings(latest);
  }

  async function handleEdit(data: Partial<Booking>) {
    if (!data.id) return;
    const updated = await updateBooking(data.id, data);
    setBookings(b => b.map(row => row.id === data.id ? updated : row));
  }

  async function handleDelete(id: string) {
    await deleteBooking(id);
    setBookings(b => b.filter(row => row.id !== id));
  }

  // Vendor action handlers for status changes (persist to backend)
  async function handlePlaceInOpenMarket(id: string) {
    const updated = await updateBooking(id, { status: 'open_market' });
    setBookings(b => b.map(row => row.id === id ? updated : row));
  }
  // Accept handler now opens assign modal
  async function handleAcceptOpenMarket(id: string) {
    setAssignModal({ id });
  }
  // Assign handler updates booking with selected driver/vehicle
  async function handleAssign(id: string, driver: string, vehicleType: string, vehicleNumber: string) {
    setAcceptingId(id);
    try {
      const prev = bookings.find(b => b.id === id);
      const updated = await updateBooking(id, {
        status: 'upcoming',
        driver,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        company: prev?.company || 'Unknown Company',
        guest: prev?.guest || 'Unknown Guest',
        contact: prev?.contact || 'Unknown Contact',
        category: prev?.category || 'Sedan',
        date: prev?.date || new Date().toISOString().slice(0, 10),
        pickup: prev?.pickup || 'Unknown Pickup',
        drop: prev?.drop || 'Unknown Drop',
      });
      const latest = await fetchBookings();
      setBookings(latest);
      setAssignModal(null);
      setLoading(true); // force refresh
      const refreshed = await fetchBookings();
      setBookings(refreshed);
      setLoading(false);
    } catch (e) {
      alert('Failed to assign driver/vehicle. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  }
  async function handleStartTrip(id: string) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return;
    }
    setTripModal({ id, pickup: booking.pickup, drop: booking.drop });
    setTripModalState({ km: 0, amount: 0, progress: 0, running: true });
    await startTrip(id); // Use correct API for starting trip
    const latest = await fetchBookings();
    setBookings(latest);
  }
  async function handleEndTripModal(id: string) {
    setTripModal(null);
    setTripModalState(null);
    // End trip in backend using the dedicated endpoint
    await endTrip(id);
    // Fetch latest bookings to sync UI with backend
    const latest = await fetchBookings();
    setBookings(latest);
    // Save invoice to Supabase when trip ends
    const booking = latest.find(b => b.id === id);
    // Check for required fields before creating invoice
    if (booking && booking.company && booking.id && (tripModalState?.amount || booking.totalAmount)) {
      const invoiceData = {
        bookingId: booking.id,
        invoiceNumber: `INV-${booking.id}`,
        company: booking.company,
        amount: Number(tripModalState?.amount || booking.totalAmount || 600),
        status: 'received' as const,
        date: booking.date,
        month: booking.date?.slice(0, 7) || '',
      };
      try {
        await createInvoice(invoiceData);
      } catch (e) {
        // error handling only, no debug log
      }
    } else {
      alert('Cannot create invoice: booking is missing company, amount, or other required fields.');
    }
  }
  
  // Manual refresh function for bookings (e.g., after editing or deleting)
  async function handleRefresh() {
    setLoading(true);
    const latest = await fetchBookings();
    setBookings(latest);
    setLoading(false);
  }

  // Sort and filter logic for bookings
  const filteredBookings = bookings.filter(b => {
    return (!filter.status || b.status === filter.status) &&
           (!filter.driver || b.driver === filter.driver) &&
           (!filter.company || b.company === filter.company) &&
           (!filter.guest || b.guest.toLowerCase().includes(filter.guest.toLowerCase())) &&
           (!filter.pickup || b.pickup.toLowerCase().includes(filter.pickup.toLowerCase())) &&
           (!filter.contact || b.contact.toLowerCase().includes(filter.contact.toLowerCase())) &&
           (!filter.reference || b.referenceName?.toLowerCase().includes(filter.reference.toLowerCase())) &&
           (!filter.invoiceNumber || b.invoiceNumber?.toLowerCase().includes(filter.invoiceNumber.toLowerCase()));
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'date') {
      return dir * (safeTimestamp(a.date) - safeTimestamp(b.date));
    } else if (sortBy === 'guest') {
      return dir * (a.guest.localeCompare(b.guest));
    } else if (sortBy === 'status' ) {
      return dir * (a.status.localeCompare(b.status));
    }
    return 0;
  });

  const handleExport = async () => {
    const headers = ['ID', 'Guest', 'Date', 'Pickup', 'Drop', 'Category', 'Status', 'Driver', 'Vehicle Type', 'Vehicle Number', 'Location', 'Contact', 'Company', 'Total Amount'];
    const rows = bookings.map(b => [
      b.id,
      b.guest,
      b.date,
      b.pickup,
      b.drop,
      b.category,
      b.status,
      b.driver,
      b.vehicleType,
      b.vehicleNumber,
      b.location,
      b.contact,
      b.company,
      b.totalAmount,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Animation effect for trip modal
  React.useEffect(() => {
    if (!tripModal || !tripModalState?.running) return;
    let t = 0;
    const interval = setInterval(() => {
      t++;
      setTripModalState(prev => prev ? {
        ...prev,
        km: t * 1.2,
        amount: t * 60,
        progress: t / 10,
        running: t < 10
      } : prev);
      if (t >= 10) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [tripModal]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      {user?.role === 'vendor' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Guest</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Date</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Pickup</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Drop</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Category</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Status</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Driver</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Vehicle</th>
                <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-4 dark:text-gray-200">Loading...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-4 dark:text-gray-200">No bookings found.</td></tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-b dark:border-gray-700">
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.guest}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{formatDate(booking.date)}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.pickup}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.drop}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.category}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.status}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.driver || 'Not assigned'}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.vehicleType} - {booking.vehicleNumber}</td>
                    <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">
                      {/* Vendor workflow actions */}
                      {booking.status === 'pending' && (!assignModal || assignModal.id !== booking.id) && (
                        <button
                          onClick={() => setAssignModal({ id: booking.id })}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 mr-1 disabled:opacity-50"
                          disabled={acceptingId === booking.id}
                        >
                          {acceptingId === booking.id ? 'Accepting...' : 'Accept & Assign'}
                        </button>
                      )}
                      {booking.status === 'upcoming' && (
                        <button onClick={() => handleStartTrip(booking.id)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Start Trip</button>
                      )}
                      {booking.status === 'ongoing' && (
                        <span className="text-yellow-700 mr-2">Ongoing...</span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-green-700 font-semibold">Completed (₹{booking.totalAmount || 600})</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Driver & Vehicle">
            {assignModal && (
              <AssignForm
                onAssign={(driver, vehicleType, vehicleNumber) => handleAssign(assignModal.id, driver, vehicleType, vehicleNumber)}
                onClose={() => setAssignModal(null)}
              />
            )}
          </Modal>
        </div>
      ) : (
        <>
          {/* Company UI remains as before */}
          <div className="flex flex-wrap gap-4 mb-4">
            {user?.role === 'company' && (
              <button onClick={() => setModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Booking</button>
            )}
            <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export CSV</button>
            <button onClick={handleRefresh} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Refresh</button>
          </div>
          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Guest</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Date</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Pickup</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Drop</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Category</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Status</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Driver</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Vehicle</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Company</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Total Amount</th>
                  <th className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="text-center py-4 dark:text-gray-200">Loading...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-4 dark:text-gray-200">No bookings found.</td></tr>
                ) : (
                  filteredBookings.map(booking => (
                    <tr key={booking.id} className="border-b dark:border-gray-700">
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.guest}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{formatDate(booking.date)}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.pickup}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.drop}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.category}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.status}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.driver || 'Not assigned'}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.vehicleType} - {booking.vehicleNumber}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">{booking.company}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">₹{booking.totalAmount || '-'}</td>
                      <td className="px-3 py-2 border dark:border-gray-700 dark:text-gray-100">
                        {user?.role === 'company' && (
                          <>
                            <button onClick={() => { setEditData(booking); setModalOpen(true); }} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-1">Edit</button>
                            <button onClick={() => handleDelete(booking.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                          </>
                        )}
                        {user?.role === 'vendor' && (
                          <>
                            {booking.status === 'pending' && (!assignModal || assignModal.id !== booking.id) ? (
                              <>
                                <button
                                  onClick={() => handleAcceptOpenMarket(booking.id)}
                                  className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 mr-1 disabled:opacity-50"
                                  disabled={acceptingId === booking.id}
                                >
                                  {acceptingId === booking.id ? 'Accepting...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handlePlaceInOpenMarket(booking.id)}
                                  className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                >
                                  Open Market
                                </button>
                              </>
                            ) : null}
                            {booking.status === 'upcoming' && (
                              <button onClick={() => handleStartTrip(booking.id)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Start Trip</button>
                            )}
                            {booking.status === 'ongoing' && (
                              <>
                                <span className="text-yellow-700 mr-2">Ongoing...</span>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <span className="text-green-700 font-semibold">Completed</span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Booking" : "New Booking"}>
            <BookingForm
              onClose={() => setModalOpen(false)}
              onSubmit={editData ? handleEdit : handleAdd}
              initial={editData || undefined}
            />
          </Modal>
          {/* Trip Modal for ongoing trip */}
          {tripModal && (
            <Modal open={!!tripModal} onClose={() => {}} title="Trip in Progress">
              {(() => {
                const booking = bookings.find(b => b.id === tripModal.id);
                if (!booking || !tripModalState) return null;
                return (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full flex justify-between text-sm mb-2">
                      <span>Pickup: <b>{booking.pickup}</b></span>
                      <span>Drop: <b>{booking.drop}</b></span>
                    </div>
                    <div className="relative w-full h-16 bg-gray-200 dark:bg-gray-800 rounded">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2">🚕</div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2">🏁</div>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 trip-car"
                        data-progress={tripModalState.progress}
                      >
                        <span className="trip-car-icon">🚖</span>
                      </div>
                    </div>
                    <div className="flex justify-between w-full text-lg">
                      <span>Kms: <b>{tripModalState.km.toFixed(1)}</b></span>
                      <span>Amount: <b>₹{tripModalState.amount}</b></span>
                    </div>
                    <div className="w-full flex flex-col gap-1 text-sm">
                      <span>Driver: <b>{booking.driver}</b></span>
                      <span>Vehicle: <b>{booking.vehicleType} - {booking.vehicleNumber}</b></span>
                      <span>Contact: <b>{booking.contact}</b></span>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-4" onClick={() => handleEndTripModal(booking.id)}>End Trip</button>
                  </div>
                );
              })()}
            </Modal>
          )}
        </>
      )}
      {user?.role === 'vendor' && bookings.some(b => b.status === 'ongoing') && (() => {
  const ongoing = bookings.find(b => b.status === 'ongoing');
  if (!ongoing) return null;
  const handleEndTripClick = async () => {
    if (ongoing.status === 'completed' || ongoing.status === 'trip_ended') return;
    await handleEndTripModal(ongoing.id);
    setBookings(prev => prev.map(row => row.id === ongoing.id ? { ...row, status: 'completed' } : row));
    setTripModalState(prev => prev ? { ...prev, running: false, progress: 1 } : prev);
    // Fade out the boarding pass card
    const card = document.querySelector('.boardingpass-card');
    if (card) {
      card.classList.add('animate-fade-out');
      setTimeout(() => {
        card.classList.add('hidden');
      }, 700);
    }
  };
  return (
    <div className="boardingpass-card animate-fade-in">
      {/* Accent bar removed for a cleaner look */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-base font-bold tracking-widest opacity-90">BOARDING PASS</div>
            <div className="text-xs opacity-60">Trip ID: {ongoing.id.slice(0, 8).toUpperCase()}</div>
          </div>
          <div className="text-3xl animate-bounce">🚖</div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs opacity-60">Pickup</div>
            <div className="text-lg font-semibold">{ongoing.pickup}</div>
          </div>
          <div className="mx-2 text-xl opacity-60">→</div>
          <div>
            <div className="text-xs opacity-60">Drop</div>
            <div className="text-lg font-semibold">{ongoing.drop}</div>
          </div>
        </div>
        {/* Animated car on a road */}
        <div className="relative w-full h-8 my-3">
          <div className="boardingpass-road opacity-80" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🚕</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xl">🏁</div>
          <div
            className={`boardingpass-car animate-car-bounce ${typeof tripModalState?.progress === 'number' ? `car-progress-${Math.round((tripModalState.progress) * 80 + 10)}` : ''}`}
            style={{ left: `${(tripModalState?.progress ?? 0) * 80 + 10}%` }}
          >
            🚖
          </div>
        </div>
        <div className="flex justify-between mb-2 text-xs opacity-80">
          <div>Date: <span className="font-medium opacity-90">{formatDate(ongoing.date)}</span></div>
          <div>Pickup: <span className="font-medium opacity-90">{ongoing.pickupTime || '--:--'}</span></div>
          <div>Drop: <span className="font-medium opacity-90">{ongoing.dropTime || '--:--'}</span></div>
        </div>
        <div className="flex flex-wrap gap-4 mb-2 text-xs opacity-80">
          <div>Guest: <span className="font-medium opacity-90">{ongoing.guest}</span></div>
          <div>Driver: <span className="font-medium opacity-90">{ongoing.driver}</span></div>
          <div>Vehicle: <span className="font-medium opacity-90">{ongoing.vehicleType} - {ongoing.vehicleNumber}</span></div>
          <div>Contact: <span className="font-medium opacity-90">{ongoing.contact}</span></div>
        </div>
        <div className="flex justify-between items-center mb-2 mt-3">
          <div>
            <div className="text-xs opacity-60">Live Kms</div>
            <div className="text-base font-bold">{tripModalState?.km?.toFixed(1) ?? '0.0'} km</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Live Amount</div>
            <div className="text-base font-bold">₹{tripModalState?.amount ?? '0'}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Status</div>
            <div className="text-base font-bold text-yellow-200 animate-pulse">Ongoing</div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 text-base font-semibold transition animate-pulse"
            disabled={ongoing.status === 'completed' || ongoing.status === 'trip_ended'}
            onClick={handleEndTripClick}
          >
            {ongoing.status === 'completed' || ongoing.status === 'trip_ended' ? 'Trip Ended' : 'End Trip'}
          </button>
        </div>
      </div>
    </div>
  );
})()
      }
    </div>
  );
}

// Add AssignForm component (must be above export default)
function AssignForm({ onAssign, onClose }: { onAssign: (driver: string, vehicleType: string, vehicleNumber: string) => void, onClose: () => void }) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [driver, setDriver] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  useEffect(() => {
    fetchDrivers().then(setDrivers);
    fetchVehicles().then(setVehicles);
  }, []);
  return (
    <form onSubmit={e => { e.preventDefault(); onAssign(driver, vehicleType, vehicleNumber); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Driver
          <select className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-700" value={driver} onChange={e => setDriver(e.target.value)} required>
            <option value="">Select</option>
            {drivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">Vehicle
          <select className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-700" value={vehicleNumber} onChange={e => {
            const v = vehicles.find(v => v.plate === e.target.value);
            setVehicleNumber(e.target.value);
            setVehicleType(v ? v.type : "");
          }} required>
            <option value="">Select</option>
            {vehicles.map(v => <option key={v.id} value={v.plate}>{v.type} - {v.plate}</option>)}
          </select>
        </label>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Assign & Confirm</button>
      <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
    </form>
  );
}

/* Add to your global CSS (e.g. globals.css or tailwind.css):
.animate-gradient-x {
  background-size: 200% 100%;
  animation: gradient-x 3s linear infinite;
}
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.animate-car-bounce {
  animation: car-bounce 1.2s infinite alternate cubic-bezier(.5,1.8,.5,1);
}
@keyframes car-bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px) scale(1.08); }
}
.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: none; }
}
.refined-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
*/
