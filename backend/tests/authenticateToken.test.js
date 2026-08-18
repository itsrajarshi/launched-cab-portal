const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const authenticateToken = require("../middleware/authenticateToken");

function mockRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

describe("authenticateToken middleware", () => {
  it("rejects a request with no token", () => {
    const res = mockRes();
    authenticateToken({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("rejects a malformed Authorization header", () => {
    const res = mockRes();
    authenticateToken({ headers: { authorization: "Bearer" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("rejects an invalid token", () => {
    const res = mockRes();
    authenticateToken(
      { headers: { authorization: "Bearer not.a.jwt" } },
      res,
      jest.fn()
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("attaches the decoded user and calls next for a valid token", () => {
    const token = jwt.sign({ email: "a@b.com", role: "company" }, jwtSecret);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    authenticateToken(req, {}, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ email: "a@b.com", role: "company" });
  });
});