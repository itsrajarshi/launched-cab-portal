const requireRole = require("../middleware/requireRole");

function mockRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

describe("requireRole middleware", () => {
  it("allows a matching role", () => {
    const req = { user: { email: "a@b.com", role: "vendor" } };
    const res = mockRes();
    const next = jest.fn();
    requireRole("vendor")(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows any of several roles", () => {
    const req = { user: { email: "a@b.com", role: "company" } };
    const next = jest.fn();
    requireRole("vendor", "company")(req, {}, next);
    expect(next).toHaveBeenCalled();
  });

  it("rejects a non-matching role with 403", () => {
    const req = { user: { email: "a@b.com", role: "vendor" } };
    const res = mockRes();
    requireRole("company")(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining("Forbidden") });
  });

  it("rejects a missing user", () => {
    const req = {};
    const res = mockRes();
    requireRole("vendor")(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});