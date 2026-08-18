jest.mock("../supabase");
jest.mock("../rabbitmq", () => ({
  publishBookingRequest: jest.fn().mockResolvedValue(true),
  QUEUE: "booking_requests",
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");
const rabbit = require("../rabbitmq");
const { jwtSecret } = require("../config");
const app = require("../index");

const companyToken = jwt.sign({ email: "c@demo.com", role: "company" }, jwtSecret);
const vendorToken = jwt.sign({ email: "v@demo.com", role: "vendor" }, jwtSecret);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

beforeEach(() => {
  supabase.from.mockReset();
  rabbit.publishBookingRequest.mockClear();
});

describe("GET /api/bookings", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(401);
  });

  it("returns bookings for an authenticated user", async () => {
    supabase.from.mockReturnValue(
      supabase.makeBuilder([{ id: "b1", guest: "G" }])
    );
    const res = await request(app)
      .get("/api/bookings")
      .set(auth(companyToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("POST /api/bookings", () => {
  it("requires the company role", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set(auth(vendorToken))
      .send({ guest: "G", date: "2026-08-18", pickup: "A", drop: "B", category: "Sedan" });
    expect(res.status).toBe(403);
  });

  it("rejects an invalid payload", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set(auth(companyToken))
      .send({ guest: "G" });
    expect(res.status).toBe(400);
  });

  it("creates a booking and publishes to RabbitMQ", async () => {
    const booking = {
      id: "b-new",
      guest: "G",
      date: "2026-08-18",
      pickup: "A",
      drop: "B",
      category: "Sedan",
      company: "Co",
      contact: "123",
    };
    supabase.from.mockReturnValue(supabase.makeBuilder([booking]));
    const res = await request(app)
      .post("/api/bookings")
      .set(auth(companyToken))
      .send({ guest: "G", date: "2026-08-18", pickup: "A", drop: "B", category: "Sedan", company: "Co", contact: "123" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("b-new");
    expect(rabbit.publishBookingRequest).toHaveBeenCalledWith(
      expect.objectContaining({ type: "NEW_BOOKING_REQUEST", bookingId: "b-new" })
    );
  });
});

describe("booking lifecycle (vendor actions)", () => {
  it("starttrip requires the vendor role", async () => {
    const res = await request(app)
      .post("/api/bookings/b1/starttrip")
      .set(auth(companyToken));
    expect(res.status).toBe(403);
  });

  it("starttrip updates status to ongoing", async () => {
    supabase.from.mockReturnValue(
      supabase.makeBuilder([{ id: "b1", status: "ongoing" }])
    );
    const res = await request(app)
      .post("/api/bookings/b1/starttrip")
      .set(auth(vendorToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ongoing");
  });

  it("endtrip returns 404 when the booking is missing", async () => {
    supabase.from.mockReturnValue(supabase.makeBuilder([]));
    const res = await request(app)
      .post("/api/bookings/missing/endtrip")
      .set(auth(vendorToken));
    expect(res.status).toBe(404);
  });

  it("filters open-market bookings to the 30-minute SLA window", async () => {
    const now = Date.now();
    const within = {
      id: "b-in",
      status: "open_market",
      open_market_placed_at: new Date(now - 5 * 60 * 1000).toISOString(),
    };
    const stale = {
      id: "b-old",
      status: "open_market",
      open_market_placed_at: new Date(now - 90 * 60 * 1000).toISOString(),
    };
    supabase.from.mockReturnValue(supabase.makeBuilder([within, stale]));
    const res = await request(app)
      .get("/api/bookings/open-market/eligible")
      .set(auth(vendorToken));
    expect(res.status).toBe(200);
    expect(res.body.map((b) => b.id)).toEqual(["b-in"]);
  });
});