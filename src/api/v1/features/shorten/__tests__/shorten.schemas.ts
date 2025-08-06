import { ZodError } from "zod";

import { urlSchema } from "../shorten.schemas";

describe("urlSchema", () => {
  it("should pass with a valid URL", () => {
    const data = { url: "https://example.com" };
    expect(() => urlSchema.parse(data)).not.toThrow();
  });

  it("should fail when url is missing", () => {
    const data = {};
    try {
      urlSchema.parse(data);
    } catch (e) {
      if (e instanceof ZodError) {
        expect(e.errors[0].message).toBe("URL is required");
      } else {
        throw e;
      }
    }
  });

  it("should fail when url is empty", () => {
    const data = { url: "" };
    try {
      urlSchema.parse(data);
    } catch (e) {
      if (e instanceof ZodError) {
        expect(e.errors[0].message).toBe("URL is empty");
      } else {
        throw e;
      }
    }
  });

  it("should fail when url is invalid", () => {
    const data = { url: "not-a-url" };
    try {
      urlSchema.parse(data);
    } catch (e) {
      if (e instanceof ZodError) {
        expect(e.errors[0].message).toBe("Provided URL is not a valid URL");
      } else {
        throw e;
      }
    }
  });
});
