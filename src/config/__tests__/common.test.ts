import { API_VERSIONS, HTTP_STATUS, MORGAN_SETTING } from "../common";

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
