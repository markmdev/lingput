module.exports = {
  preset: "ts-jest",
  setupFiles: ["<rootDir>/test-setup.ts"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
