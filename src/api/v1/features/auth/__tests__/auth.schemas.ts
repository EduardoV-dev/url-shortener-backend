import { z } from "zod";

import { authCreationSchema, authLoginSchema, AuthSchema } from "../auth.schemas";

describe("Auth Schemas", () => {
  describe("authLoginSchema", () => {
    let data: AuthSchema;

    beforeEach(() => {
      data = { email: "test@example.com", password: "password123" };
    });

    it("validates correct input", () => {
      expect(() => authLoginSchema.parse(data)).not.toThrow();
    });

    it("fails on empty email", () => {
      data.email = "";
      expect(() => authCreationSchema.parse(data)).toThrow(/cannot be empty/);
    });

    it("fails on invalid email", () => {
      data.email = "invalid-email";
      expect(() => authLoginSchema.parse(data)).toThrow(/Invalid email format/);
    });

    it("fails on short password", () => {
      data.password = "short";
      expect(() => authLoginSchema.parse(data)).toThrow(/at least 8 characters/);
    });

    it("fails on long password", () => {
      data.password = "a".repeat(129);
      expect(() => authLoginSchema.parse(data)).toThrow(/at most 128 characters/);
    });
  });

  describe("authCreationSchema", () => {
    let data: z.infer<typeof authCreationSchema>;

    beforeEach(() => {
      data = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
    });

    it("fails when passwords do not match", () => {
      data.confirmPassword = "differentPassword";
      expect(() => authCreationSchema.parse(data)).toThrow(/Passwords do not match/);
    });
  });
});
