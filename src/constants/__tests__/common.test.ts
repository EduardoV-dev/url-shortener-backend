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
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.NO_CONTENT).toBe(204);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

describe("PRISMA_CODES", () => {
  it("should have RECORD_NOT_FOUND as 'P2025'", () => {
    expect(PRISMA_CODES.RECORD_NOT_FOUND).toBe("P2025");
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
