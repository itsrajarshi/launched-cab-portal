// RabbitMQ consumer for the `booking_requests` queue.
//
// Runs as its own process (`npm run worker`), separate from the HTTP API, so
// a crash in message processing can never take booking creation down with
// it, and notification throughput scales independently of request
// throughput.
//
// Delivery semantics, made explicit rather than left implicit:
//   - `noAck: false` — acknowledgement is manual. A message stays on the
//     queue, invisible to other consumers, until this process explicitly
//     acks or nacks it.
//   - `prefetch(PREFETCH)` — caps how many unacknowledged messages this
//     consumer holds at once. Without it, RabbitMQ hands the whole queue to
//     whichever consumer connects first, and running a second worker for
//     more throughput would do nothing.
//   - A message that fails to even parse as JSON is poison — it will never
//     succeed no matter how many times it's redelivered — so it is nacked
//     with `requeue: false`, which (via the `x-dead-letter-*` queue
//     arguments declared in rabbitmq.js) routes it to `booking_requests.dlq`
//     for inspection instead of looping forever.
//   - A message that parses but fails to *process* (the kind of failure
//     that might succeed on retry) is nacked with `requeue: true`, so
//     another delivery attempt is made. That makes delivery at-least-once,
//     which is why processing below is written to be safe to run twice.
const amqp = require('amqplib');
const { rabbitmqUrl: RABBITMQ_URL, assertTopology, QUEUE } = require('./rabbitmq');

const PREFETCH = parseInt(process.env.WORKER_PREFETCH || '5', 10);

// The actual notification work. Kept separate from the AMQP plumbing so it
// can be unit-tested without a running broker.
async function processBookingRequest(payload) {
  if (payload.type !== 'NEW_BOOKING_REQUEST') {
    throw new PoisonMessageError(`unknown message type: ${payload.type}`);
  }
  if (!payload.bookingId) {
    throw new PoisonMessageError('missing bookingId');
  }
  // A real deployment would fan this out to vendors here (email/SMS/push).
  // What matters for this queue is *how* that work would be acknowledged,
  // not what the notification channel is — so the visible effect is a log
  // line, and every ack/nack/redelivery/DLQ decision around it is real.
  console.log(
    `[worker] notify vendors: booking ${payload.bookingId} from ${payload.company || 'unknown company'} ` +
      `(${payload.trip?.pickup || '?'} -> ${payload.trip?.drop || '?'})`
  );
}

// Distinguishes "this will never succeed, dead-letter it" from "this might
// succeed on retry, requeue it" — the fork every real consumer has to make.
class PoisonMessageError extends Error {}

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await assertTopology(channel);
  await channel.prefetch(PREFETCH);

  console.log(`[worker] listening on "${QUEUE}" (prefetch ${PREFETCH})`);

  channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return; // consumer cancelled by the broker
      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch (err) {
        console.error(`[worker] poison message (invalid JSON), dead-lettering: ${err.message}`);
        channel.nack(msg, false, false); // requeue: false -> DLX -> booking_requests.dlq
        return;
      }
      try {
        await processBookingRequest(payload);
        channel.ack(msg);
      } catch (err) {
        if (err instanceof PoisonMessageError) {
          console.error(`[worker] poison message, dead-lettering: ${err.message}`);
          channel.nack(msg, false, false);
        } else {
          console.error(`[worker] transient failure, requeueing: ${err.message}`);
          channel.nack(msg, false, true); // requeue: true -> redelivered
        }
      }
    },
    { noAck: false }
  );

  const shutdown = async () => {
    console.log('[worker] shutting down');
    await channel.close();
    await conn.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[worker] fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = { processBookingRequest, PoisonMessageError, start };
