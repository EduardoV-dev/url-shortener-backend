describe("ENVS", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should read environment variables", async () => {
    process.env.CORS_ORIGINS = "foo";
    process.env.DATABASE_URL = "bar";
    process.env.NODE_ENV = "test";
    process.env.PORT = "1234";

    const { ENVS } = await import("../env");
    expect(ENVS).toEqual({
      CORS_ORIGINS: "foo",
      DATABASE_URL: "bar",
      NODE_ENV: "test",
      PORT: 1234,
    });
  });

  it("should use default values if env vars are missing", async () => {
    process.env.CORS_ORIGINS = undefined;
    process.env.DATABASE_URL = undefined;
    process.env.NODE_ENV = undefined;
    process.env.PORT = undefined;

    const { ENVS } = await import("../env");
    expect(ENVS).toEqual({
      CORS_ORIGINS: "",
      DATABASE_URL: "",
      NODE_ENV: "development",
      PORT: 3000,
    });
  });

  it("should be frozen", async () => {
    const { ENVS } = await import("../env");
    expect(Object.isFrozen(ENVS)).toBe(true);
  });
});
