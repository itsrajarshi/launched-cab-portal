// RabbitMQ topology + publisher, shared by the API (producer) and worker.js
// (consumer).
const amqp = require('amqplib');
const { rabbitmqUrl: RABBITMQ_URL, rabbitmqQueue: QUEUE } = require('./config');

const DLQ = `${QUEUE}.dlq`;

// Declares the queue topology once, identically, from whichever side
// connects first. The dead-letter queue is reachable through the *default*
// exchange — publishing "" with a routing key equal to a queue's name
// delivers straight to that queue, so a message that's nacked without
// requeue from `booking_requests` (a malformed payload, or one that will
// never process) lands in `booking_requests.dlq` for inspection instead of
// looping forever or being silently dropped. No custom exchange needed.
//
// Note: queue arguments are immutable once declared. If `booking_requests`
// already exists from before this change (no `x-dead-letter-*` args), this
// throws PRECONDITION_FAILED — delete the queue once (or run against a
// fresh broker) and it will be redeclared correctly from then on.
async function assertTopology(channel) {
  await channel.assertQueue(DLQ, { durable: true });
  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': DLQ,
    },
  });
}

async function publishBookingRequest(message) {
  const conn = await amqp.connect(RABBITMQ_URL);
  try {
    const channel = await conn.createChannel();
    await assertTopology(channel);
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
    // Await close so the publish is flushed before the connection drops.
    await channel.close();
  } finally {
    await conn.close();
  }
}

module.exports = { publishBookingRequest, assertTopology, QUEUE, DLQ, RABBITMQ_URL };
