const { schemas } = require("../validation");

describe("validation schemas", () => {
  describe("register", () => {
    it("accepts a valid payload", () => {
      const r = schemas.register.safeParse({
        email: "user@demo.com",
        password: "password123",
        role: "vendor",
        name: "Test User",
      });
      expect(r.success).toBe(true);
    });

    it("rejects a bad email", () => {
      const r = schemas.register.safeParse({
        email: "not-an-email",
        password: "password123",
        role: "company",
      });
      expect(r.success).toBe(false);
    });

    it("rejects a short password", () => {
      const r = schemas.register.safeParse({
        email: "user@demo.com",
        password: "short",
        role: "company",
      });
      expect(r.success).toBe(false);
    });

    it("rejects an unknown role", () => {
      const r = schemas.register.safeParse({
        email: "user@demo.com",
        password: "password123",
        role: "admin",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("login", () => {
    it("accepts a valid payload", () => {
      expect(schemas.login.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    });
    it("rejects missing password", () => {
      expect(schemas.login.safeParse({ email: "a@b.com" }).success).toBe(false);
    });
  });

  describe("booking", () => {
    it("accepts a valid payload", () => {
      const r = schemas.booking.safeParse({
        guest: "G",
        date: "2026-08-18",
        pickup: "A",
        drop: "B",
        category: "Sedan",
      });
      expect(r.success).toBe(true);
    });
    it("rejects missing required fields", () => {
      const r = schemas.booking.safeParse({ guest: "G" });
      expect(r.success).toBe(false);
    });
  });

  describe("invoice", () => {
    it("coerces a string amount to a number", () => {
      const r = schemas.invoice.safeParse({
        invoiceNumber: "INV-1",
        company: "Co",
        amount: "123.45",
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.amount).toBe(123.45);
    });
    it("rejects an invalid status", () => {
      const r = schemas.invoice.safeParse({
        invoiceNumber: "INV-1",
        company: "Co",
        amount: 1,
        status: "paid",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("driver / vehicle", () => {
    it("rejects a driver without a name", () => {
      expect(schemas.driver.safeParse({ contact: "123" }).success).toBe(false);
    });
    it("rejects a vehicle without plate/model", () => {
      expect(schemas.vehicle.safeParse({ type: "Sedan" }).success).toBe(false);
    });
  });

  describe("update schemas strip fields a role should not be able to change", () => {
    it("bookingUpdate drops status/vendor_id/driver, keeps allowed fields", () => {
      const r = schemas.bookingUpdate.safeParse({
        guest: "New Guest",
        status: "completed",
        vendor_id: "someone-elses-id",
        driver: "Someone",
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data).toEqual({ guest: "New Guest" });
      }
    });

    it("driverUpdate maps camelCase fields and allows a blank email", () => {
      const r = schemas.driverUpdate.safeParse({ vehicleType: "SUV", email: "" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data).toEqual({ vehicleType: "SUV", email: "" });
    });

    it("acceptOpenMarket no longer accepts a client-supplied vendorId", () => {
      const r = schemas.acceptOpenMarket.safeParse({
        vendorId: "attacker-controlled",
        driver: "D",
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data).toEqual({ driver: "D" });
    });
  });

  describe("endTrip", () => {
    it("requires a non-negative amount", () => {
      expect(schemas.endTrip.safeParse({}).success).toBe(false);
      expect(schemas.endTrip.safeParse({ amount: -5 }).success).toBe(false);
    });
    it("coerces a string amount and accepts an optional km", () => {
      const r = schemas.endTrip.safeParse({ amount: "450", km: "12.5" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.amount).toBe(450);
        expect(r.data.km).toBe(12.5);
      }
    });
  });
});