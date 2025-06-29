const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

function mapBookingFields(b: any) {
  return {
    ...b,
    status: b.status || b.status || 'pending',
    vehicleType: b.vehicle_type ?? b.vehicleType ?? '',
    vehicleNumber: b.vehicle_number ?? b.vehicleNumber ?? '',
    opKm: b.op_km ?? b.opKm ?? '',
    totalKm: b.total_km ?? b.totalKm ?? '',
    pickupTime: b.pickup_time ?? b.pickupTime ?? '',
    dropTime: b.drop_time ?? b.dropTime ?? '',
    tollParking: b.toll_parking ?? b.tollParking ?? '',
    totalAmount: b.total_amount ?? b.totalAmount ?? '',
    fuelOffice: b.fuel_office ?? b.fuelOffice ?? '',
    fuelCash: b.fuel_cash ?? b.fuelCash ?? '',
    roadTax: b.road_tax ?? b.roadTax ?? '',
    advOffice: b.adv_office ?? b.advOffice ?? '',
    locationLink: b.location_link ?? b.locationLink ?? '',
    night: b.night ?? '',
    expenses: b.expenses ?? '',
    driver: b.driver ?? '',
    company: b.company ?? '',
    guest: b.guest ?? '',
    contact: b.contact ?? '',
    id: b.id ?? '',
    referenceName: b.reference_name ?? b.referenceName ?? '',
    invoiceNumber: b.invoice_number ?? b.invoiceNumber ?? '',
    assocVendor: b.assoc_vendor ?? b.assocVendor ?? '',
    open_market_placed_at: b.open_market_placed_at ?? b.open_market_placed_at ?? '',
    accepted_by_vendor: b.accepted_by_vendor ?? b.accepted_by_vendor ?? '',
  };
}

export async function fetchBookings() {
  const res = await fetch(`${API_URL}/bookings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    console.error('fetchBookings error:', res.status, await res.text());
    return [];
  }
  const data = await res.json();
  console.debug('fetchBookings result:', data);
  return Array.isArray(data) ? data.map(mapBookingFields) : [];
}

export async function createBooking(data: any) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error('createBooking error:', res.status, await res.text());
    throw new Error('Failed to create booking');
  }
  const booking = await res.json();
  console.debug('createBooking result:', booking);
  return booking;
}

export async function updateBooking(id: string, data: any) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBooking(id: string) {
  await fetch(`${API_URL}/bookings/${id}`, { method: "DELETE", headers: getAuthHeaders() });
}

export async function fetchDrivers() {
  const res = await fetch(`${API_URL}/drivers`, { headers: getAuthHeaders() });
  return res.json();
}
export async function createDriver(data: any) {
  const res = await fetch(`${API_URL}/drivers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function updateDriver(id: string, data: any) {
  const res = await fetch(`${API_URL}/drivers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteDriver(id: string) {
  await fetch(`${API_URL}/drivers/${id}`, { method: "DELETE", headers: getAuthHeaders() });
}

export async function fetchVehicles() {
  const res = await fetch(`${API_URL}/vehicles`, { headers: getAuthHeaders() });
  return res.json();
}
export async function createVehicle(data: any) {
  const res = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function updateVehicle(id: string, data: any) {
  const res = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteVehicle(id: string) {
  await fetch(`${API_URL}/vehicles/${id}`, { method: "DELETE", headers: getAuthHeaders() });
}

export async function fetchInvoices() {
  const res = await fetch(`${API_URL}/invoices`, { headers: getAuthHeaders() });
  return res.json();
}
export async function createInvoice(data: any) {
  const res = await fetch(`${API_URL}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function updateInvoice(id: string, data: any) {
  const res = await fetch(`${API_URL}/invoices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteInvoice(id: string) {
  await fetch(`${API_URL}/invoices/${id}`, { method: "DELETE", headers: getAuthHeaders() });
}

export async function registerUser(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
  return res.json();
}

export async function loginUser(data: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
}

export async function placeInOpenMarket(id: string) {
  const res = await fetch(`${API_URL}/bookings/${id}/open-market`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function acceptOpenMarket(id: string, vendorId: string, driver?: string, vehicleType?: string, vehicleNumber?: string) {
  const res = await fetch(`${API_URL}/bookings/${id}/accept-open-market`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ vendorId, driver, vehicleType, vehicleNumber }),
  });
  return res.json();
}

export async function startTrip(id: string) {
  const res = await fetch(`${API_URL}/bookings/${id}/starttrip`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function endTrip(id: string) {
  const res = await fetch(`${API_URL}/bookings/${id}/endtrip`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to end trip');
  }
  const booking = await res.json();
  return mapBookingFields(booking);
}

export async function rejectBooking(id: string) {
  const res = await fetch(`${API_URL}/bookings/${id}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchEligibleOpenMarketBookings() {
  const res = await fetch(`${API_URL}/bookings/open-market/eligible`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}
