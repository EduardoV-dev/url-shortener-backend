import { HttpError } from "../http-error";

describe("HttpError", () => {
  it("Sets message and statusCode", () => {
    const err = new HttpError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.details).toBeUndefined();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
  });

  it("Sets details when provided", () => {
    const details = { info: "Resource missing" };
    const err = new HttpError("Not found", 404, details);
    expect(err.details).toBe(details);
  });

  it("Captures stack trace", () => {
    const err = new HttpError("Error", 500);
    expect(typeof err.stack).toBe("string");
    expect(err.stack).toContain("Error: Error");
    expect(err.name).toBe("HttpError");
  });
});
