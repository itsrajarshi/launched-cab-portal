// Request validation using zod. Each schema validates req.body and returns
// parsed (and coerced) data. `validate` wraps a schema into Express middleware.
//
// Two shapes are used deliberately:
//   - CREATE schemas keep `.passthrough()` — a new row's shape is well
//     known and the route handlers build the insert explicitly field by
//     field, so extra keys in the body are harmless.
//   - UPDATE schemas do NOT use `.passthrough()` or `.strict()`. Plain
//     `z.object({...})` strips any key that isn't listed, which is exactly
//     an allowlist: only the fields a role is actually allowed to change
//     survive validation, and everything else (status, ownership columns,
//     ids) is silently dropped rather than reaching the database. Every PUT
//     route used to accept the request body completely unvalidated — this
//     is what closes that.
const { z } = require('zod');

const schemas = {
  register: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['company', 'vendor']),
    name: z.string().max(200).optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),

  booking: z
    .object({
      guest: z.string().min(1, 'Guest name is required'),
      date: z.string().min(1, 'Date is required'),
      pickup: z.string().min(1, 'Pickup is required'),
      drop: z.string().min(1, 'Drop is required'),
      category: z.string().min(1, 'Category is required'),
      contact: z.string().optional(),
      company: z.string().optional(),
      status: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    })
    .passthrough(),

  // Company-editable fields only. Status, driver/vehicle assignment,
  // vendor_id and user_id are never accepted here — those change through
  // the dedicated vendor lifecycle routes instead, each with its own
  // status guard.
  bookingUpdate: z.object({
    guest: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    pickup: z.string().min(1).optional(),
    drop: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    contact: z.string().optional(),
    notes: z.string().optional(),
    location: z.string().optional(),
    locationLink: z.string().optional(),
  }),

  endTrip: z.object({
    amount: z
      .union([z.number(), z.string()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v >= 0, 'amount must be a non-negative number'),
    km: z
      .union([z.number(), z.string()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v >= 0, 'km must be a non-negative number')
      .optional(),
  }),

  invoice: z
    .object({
      invoiceNumber: z.string().min(1, 'Invoice number is required'),
      company: z.string().min(1, 'Company is required'),
      amount: z.union([z.number(), z.string()]).transform((v) => Number(v)),
      status: z.enum(['pending', 'received']).optional(),
      date: z.string().optional(),
      month: z.string().optional(),
      bookingId: z.string().optional(),
      fileUrl: z.string().optional(),
    })
    .passthrough(),

  invoiceUpdate: z.object({
    invoiceNumber: z.string().min(1).optional(),
    company: z.string().min(1).optional(),
    amount: z
      .union([z.number(), z.string()])
      .transform((v) => Number(v))
      .optional(),
    status: z.enum(['pending', 'received']).optional(),
    date: z.string().optional(),
    month: z.string().optional(),
    fileUrl: z.string().optional(),
  }),

  driver: z
    .object({
      name: z.string().min(1, 'Name is required'),
      contact: z.string().optional(),
      license: z.string().optional(),
      vehicleType: z.string().optional(),
      vehicleNumber: z.string().optional(),
      email: z.string().email().optional(),
    })
    .passthrough(),

  driverUpdate: z.object({
    name: z.string().min(1).optional(),
    dateOfJoining: z.string().optional(),
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
    pan: z.string().optional(),
    aadhar: z.string().optional(),
    license: z.string().optional(),
    contact: z.string().optional(),
    // The edit form round-trips the driver's existing email even when it's
    // blank, so an empty string must stay valid here (same behaviour as the
    // untouched-field case on create).
    email: z.union([z.string().email(), z.literal('')]).optional(),
    address: z.string().optional(),
    salary: z.string().optional(),
    department: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
  }),

  vehicle: z
    .object({
      type: z.string().min(1, 'Type is required'),
      plate: z.string().min(1, 'Plate is required'),
      model: z.string().min(1, 'Model is required'),
      availability: z.string().optional(),
      condition: z.string().optional(),
      insurance: z.string().optional(),
    })
    .passthrough(),

  vehicleUpdate: z.object({
    type: z.string().min(1).optional(),
    plate: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    availability: z.string().optional(),
    condition: z.string().optional(),
    insurance: z.string().optional(),
  }),

  // Driver/vehicle come from the request; which vendor is accepting comes
  // from the caller's own verified token, never from the body — a client
  // can no longer claim someone else's vendor id here.
  acceptOpenMarket: z.object({
    driver: z.string().optional(),
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
  }),
};

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { schemas, validate };
