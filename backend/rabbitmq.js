// Simple RabbitMQ utility for publishing messages
const amqp = require('amqplib');
const { rabbitmqUrl: RABBITMQ_URL, rabbitmqQueue: QUEUE } = require('./config');

async function publishBookingRequest(message) {
  const conn = await amqp.connect(RABBITMQ_URL);
  try {
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
    // Await close so the publish is flushed before the connection drops.
    await channel.close();
  } finally {
    await conn.close();
  }
}

module.exports = { publishBookingRequest, QUEUE };
