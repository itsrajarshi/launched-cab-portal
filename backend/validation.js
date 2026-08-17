// Request validation using zod. Each schema validates req.body and returns
// parsed (and coerced) data. `validate` wraps a schema into Express middleware.
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

  acceptOpenMarket: z
    .object({
      vendorId: z.string().optional(),
      driver: z.string().optional(),
      vehicleType: z.string().optional(),
      vehicleNumber: z.string().optional(),
    })
    .passthrough(),
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
