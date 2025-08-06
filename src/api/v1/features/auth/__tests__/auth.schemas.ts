import { authCreationSchema } from "../auth.schemas";

describe("userSchema", () => {
  it("validates correct input", () => {
    const data = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };
    expect(() => authCreationSchema.parse(data)).not.toThrow();
  });

  it("fails on invalid email", () => {
    const data = {
      email: "invalid-email",
      password: "password123",
      confirmPassword: "password123",
    };
    expect(() => authCreationSchema.parse(data)).toThrow(/Invalid email format/);
  });

  it("fails on short password", () => {
    const data = {
      email: "test@example.com",
      password: "short",
      confirmPassword: "short",
    };
    expect(() => authCreationSchema.parse(data)).toThrow(/at least 8 characters/);
  });

  it("fails on long password", () => {
    const longPassword = "a".repeat(129);
    const data = {
      email: "test@example.com",
      password: longPassword,
      confirmPassword: longPassword,
    };
    expect(() => authCreationSchema.parse(data)).toThrow(/at most 128 characters/);
  });

  it("fails when passwords do not match", () => {
    const data = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password321",
    };
    expect(() => authCreationSchema.parse(data)).toThrow(/Passwords do not match/);
  });

  it("fails on empty email", () => {
    const data = {
      email: "",
      password: "password123",
      confirmPassword: "password123",
    };
    expect(() => authCreationSchema.parse(data)).toThrow(/cannot be empty/);
  });
});
