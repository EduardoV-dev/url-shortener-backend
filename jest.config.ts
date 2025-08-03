import type { Config } from "jest";

export default {
  coveragePathIgnorePatterns: ["/node_modules/", "/src/test/", "/src/generated"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  preset: "ts-jest",
  roots: ["<rootDir>"],
  setupFilesAfterEnv: ["<rootDir>/src/test/prisma-mock.ts"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts", "!**/mocks.ts", "!**/*.mocks.ts"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts?$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!.*?nanoid)/"],
  verbose: true,
} as Config;
