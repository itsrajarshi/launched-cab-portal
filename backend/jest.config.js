module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "config.js",
    "validation.js",
    "rabbitmq.js",
    "middleware/**/*.js",
    "routes/**/*.js",
  ],
  coverageDirectory: "coverage",
};