// Central runtime configuration.
// Required secrets are validated at startup (fail-fast) so misconfiguration is
// caught immediately rather than at request time with a confusing error.
require('dotenv').config();

const PLACEHOLDER = /^\(your .*\)$/i;

function required(name, hint = '') {
  const value = process.env[name];
  if (!value || PLACEHOLDER.test(value.trim())) {
    throw new Error(
      `[config] Missing or placeholder value for required environment variable "${name}". ` +
        `Copy backend/.env.example to backend/.env and set it. ${hint}`.trim()
    );
  }
  return value;
}

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: required(
    'JWT_SECRET',
    'Use a long random string (e.g. `openssl rand -hex 32`).'
  ),
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  rabbitmqQueue: process.env.RABBITMQ_BOOKING_QUEUE || 'booking_requests',
};
