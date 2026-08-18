import type {
  AuthResponse,
  Booking,
  BookingDTO,
  BookingInput,
  Driver,
  DriverDTO,
  DriverInput,
  Invoice,
  InvoiceInput,
  LoginInput,
  RegisterInput,
  Vehicle,
  VehicleInput,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) {
        message = body.error;
      } else if (Array.isArray(body?.details)) {
        message = body.details.join(", ");
      }
    } catch {
      // ignore parse failure
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// --- Booking field mapping (snake_case API -> camelCase UI) ---
function mapBookingFields(b: BookingDTO): Booking {
  return {
    id: b.id ?? "",
    guest: b.guest ?? "",
    date: b.date ?? "",
    pickup: b.pickup ?? "",
    drop: b.drop ?? "",
    category: b.category ?? "",
    status: (b.status || "pending") as Booking["status"],
    driver: b.driver ?? "",
    vehicleType: b.vehicle_type ?? "",
    vehicleNumber: b.vehicle_number ?? "",
    location: b.location ?? "",
    contact: b.contact ?? "",
    company: b.company ?? "",
    referenceName: b.reference_name ?? "",
    invoiceNumber: b.invoice_number ?? "",
    opKm: b.op_km ?? "",
    totalKm: b.total_km ?? "",
    pickupTime: b.pickup_time ?? "",
    dropTime: b.drop_time ?? "",
    tollParking: b.toll_parking ?? "",
    totalAmount: b.total_amount ?? "",
    fuelOffice: b.fuel_office ?? "",
    fuelCash: b.fuel_cash ?? "",
    roadTax: b.road_tax ?? "",
    expenses: b.expenses ?? "",
    advOffice: b.adv_office ?? "",
    locationLink: b.location_link ?? "",
    night: b.night ?? "",
    assocVendor: b.assoc_vendor ?? "",
    accepted_by_vendor: b.accepted_by_vendor ?? "",
    open_market_placed_at: b.open_market_placed_at ?? "",
    open_market_accepted_at: b.open_market_accepted_at ?? "",
    created_at: b.created_at ?? "",
  };
}

// --- Driver field mapping (snake_case API -> camelCase UI) ---
function mapDriverFields(d: DriverDTO): Driver {
  return {
    id: d.id ?? "",
    name: d.name ?? "",
    dateOfJoining: d.date_of_joining ?? "",
    vehicleType: d.vehicle_type ?? "",
    vehicleNumber: d.vehicle_number ?? "",
    pan: d.pan ?? "",
    aadhar: d.aadhar ?? "",
    license: d.license ?? "",
    contact: d.contact ?? "",
    email: d.email ?? "",
    address: d.address ?? "",
    salary: d.salary ?? "",
    department: d.department ?? "",
    accountNumber: d.account_number ?? "",
    ifscCode: d.ifsc_code ?? "",
  };
}

// --- Bookings ---
export const fetchBookings = () =>
  request<BookingDTO[]>("/bookings").then((data) =>
    (data ?? []).map(mapBookingFields)
  );

export const createBooking = (data: Partial<BookingInput>) =>
  request<BookingDTO>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(mapBookingFields);

export const updateBooking = (id: string, data: Partial<BookingInput>) =>
  request<BookingDTO>(`/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then(mapBookingFields);

export const deleteBooking = (id: string) =>
  request<void>(`/bookings/${id}`, { method: "DELETE" });

// --- Trip lifecycle / open market ---
export const startTrip = (id: string) =>
  request<BookingDTO>(`/bookings/${id}/starttrip`, { method: "POST" }).then(
    mapBookingFields
  );

export const endTrip = (id: string) =>
  request<BookingDTO>(`/bookings/${id}/endtrip`, { method: "POST" }).then(
    mapBookingFields
  );

export const rejectBooking = (id: string) =>
  request<BookingDTO>(`/bookings/${id}/reject`, { method: "POST" }).then(
    mapBookingFields
  );

export const placeInOpenMarket = (id: string) =>
  request<BookingDTO>(`/bookings/${id}/open-market`, { method: "POST" }).then(
    mapBookingFields
  );

export const acceptOpenMarket = (
  id: string,
  vendorId: string,
  driver?: string,
  vehicleType?: string,
  vehicleNumber?: string
) =>
  request<BookingDTO>(`/bookings/${id}/accept-open-market`, {
    method: "POST",
    body: JSON.stringify({ vendorId, driver, vehicleType, vehicleNumber }),
  }).then(mapBookingFields);

export const fetchEligibleOpenMarketBookings = () =>
  request<BookingDTO[]>("/bookings/open-market/eligible").then((data) =>
    (data ?? []).map(mapBookingFields)
  );

// --- Drivers ---
export const fetchDrivers = () =>
  request<DriverDTO[]>("/drivers").then((data) =>
    (data ?? []).map(mapDriverFields)
  );

export const createDriver = (data: Partial<DriverInput>) =>
  request<DriverDTO>("/drivers", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(mapDriverFields);

export const updateDriver = (id: string, data: Partial<DriverInput>) =>
  request<DriverDTO>(`/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then(mapDriverFields);

export const deleteDriver = (id: string) =>
  request<void>(`/drivers/${id}`, { method: "DELETE" });

// --- Vehicles ---
export const fetchVehicles = () => request<Vehicle[]>("/vehicles");

export const createVehicle = (data: Partial<VehicleInput>) =>
  request<Vehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateVehicle = (id: string, data: Partial<VehicleInput>) =>
  request<Vehicle>(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteVehicle = (id: string) =>
  request<void>(`/vehicles/${id}`, { method: "DELETE" });

// --- Invoices ---
export const fetchInvoices = () => request<Invoice[]>("/invoices");

export const createInvoice = (data: Partial<InvoiceInput>) =>
  request<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateInvoice = (id: string, data: Partial<InvoiceInput>) =>
  request<Invoice>(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteInvoice = (id: string) =>
  request<void>(`/invoices/${id}`, { method: "DELETE" });

export const uploadInvoiceAttachment = async (id: string, file: File) => {
  const res = await fetch(
    `${API_URL}/invoices/${id}/attachment?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    }
  );
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse failure
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<Invoice>;
};

// --- Auth ---
export const registerUser = (data: RegisterInput) =>
  request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const loginUser = (data: LoginInput) =>
  request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
