// Simple RabbitMQ utility for publishing messages
const amqp = require('amqplib');
const { rabbitmqUrl: RABBITMQ_URL, rabbitmqQueue: QUEUE } = require('./config');

async function publishBookingRequest(message) {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
  setTimeout(() => {
    channel.close();
    conn.close();
  }, 500);
}

module.exports = { publishBookingRequest, QUEUE };
