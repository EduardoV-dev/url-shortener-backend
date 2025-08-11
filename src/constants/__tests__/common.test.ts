import { API_VERSIONS, HTTP_STATUS, MORGAN_SETTING, PRISMA_CODES } from "../common";

describe("API_VERSIONS", () => {
  it("should have V1 as 'v1'", () => {
    expect(API_VERSIONS.V1).toBe("v1");
  });
});

describe("MORGAN_SETTING", () => {
  it("should be 'tiny'", () => {
    expect(MORGAN_SETTING).toBe("tiny");
  });
});

describe("HTTP_STATUS", () => {
  it("should have correct status codes", () => {
    expect(HTTP_STATUS).toEqual({
      OK: 200,
      CREATED: 201,
      NO_CONTENT: 204,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
    });
  });
});

describe("PRISMA_CODES", () => {
  it("should have RECORD_NOT_FOUND as 'P2025'", () => {
    expect(PRISMA_CODES).toEqual({
      VALUE_TOO_LONG: "P2000",
      UNIQUE_CONSTRAINT_FAILED: "P2002",
      FOREIGN_KEY_CONSTRAINT_FAILED: "P2003",
      RECORD_NOT_FOUND: "P2025",
    });
  });

  it("should be immutable (frozen)", () => {
    expect(Object.isFrozen(PRISMA_CODES)).toBe(true);
    expect(() => {
      // @ts-expect-error Attempting to change a frozen object should throw an error
      PRISMA_CODES.RECORD_NOT_FOUND = "CHANGED";
    }).toThrow(TypeError);
    expect(PRISMA_CODES.RECORD_NOT_FOUND).toBe("P2025");
  });
});
