module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["models/**/*.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  moduleFileExtensions: ["js", "json", "node"],
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
};