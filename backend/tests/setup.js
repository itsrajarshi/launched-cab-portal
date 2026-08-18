// Test environment: hermetic config so tests never touch real secrets.
process.env.JWT_SECRET = "test-jwt-secret-0123456789abcdef";
process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.NODE_ENV = "test";