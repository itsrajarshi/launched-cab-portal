jest.mock("../supabase");

const request = require("supertest");
const bcrypt = require("bcryptjs");
const supabase = require("../supabase");
const app = require("../index");

beforeEach(() => {
  supabase.from.mockReset();
});

describe("POST /api/auth/register", () => {
  it("rejects an invalid payload with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bad", password: "x", role: "admin" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects a duplicate user with 409", async () => {
    supabase.from.mockReturnValue(
      supabase.makeBuilder([{ id: "u1" }], null)
    );
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@demo.com", password: "password123", role: "company" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it("creates a user and returns a token with 201", async () => {
    // First from() call: existing-user check -> no rows (data null + PGRST116).
    supabase.from.mockReturnValueOnce(
      supabase.makeBuilder(null, { code: "PGRST116", message: "no rows" })
    );
    // Second from() call: insert -> returns the created row.
    supabase.from.mockReturnValueOnce(
      supabase.makeBuilder([
        { id: "u-new", email: "new@demo.com", role: "company", name: "New" },
      ])
    );

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@demo.com", password: "password123", role: "company", name: "New" });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: "new@demo.com", role: "company" });
    expect(res.body.token).toBeTruthy();
  });
});

describe("POST /api/auth/login", () => {
  it("rejects unknown credentials with 401", async () => {
    supabase.from.mockReturnValue(supabase.makeBuilder(null, { message: "no rows" }));
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@demo.com", password: "whatever" });
    expect(res.status).toBe(401);
  });

  it("rejects a wrong password with 401", async () => {
    const hash = bcrypt.hashSync("rightpass", 4);
    supabase.from.mockReturnValue(
      supabase.makeBuilder({ id: "u1", email: "a@b.com", role: "company", password: hash })
    );
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("logs in successfully and returns a token with 200", async () => {
    const hash = bcrypt.hashSync("rightpass", 4);
    supabase.from.mockReturnValue(
      supabase.makeBuilder({ id: "u1", email: "a@b.com", role: "vendor", name: "A", password: hash })
    );
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "rightpass" });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: "a@b.com", role: "vendor" });
    expect(res.body.token).toBeTruthy();
  });
});