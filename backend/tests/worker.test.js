const { processBookingRequest, PoisonMessageError } = require("../worker");

describe("worker: processBookingRequest", () => {
  it("resolves for a well-formed NEW_BOOKING_REQUEST", async () => {
    await expect(
      processBookingRequest({
        type: "NEW_BOOKING_REQUEST",
        bookingId: "b1",
        company: "Acme",
        trip: { pickup: "A", drop: "B" },
      })
    ).resolves.toBeUndefined();
  });

  it("treats an unknown message type as poison (dead-letter, not requeue)", async () => {
    await expect(
      processBookingRequest({ type: "SOMETHING_ELSE", bookingId: "b1" })
    ).rejects.toBeInstanceOf(PoisonMessageError);
  });

  it("treats a missing bookingId as poison", async () => {
    await expect(
      processBookingRequest({ type: "NEW_BOOKING_REQUEST" })
    ).rejects.toBeInstanceOf(PoisonMessageError);
  });
});
