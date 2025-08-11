import express from "express";

import { HTTP_STATUS } from "./constants/common";
import { httpErrorHandlerMiddleware } from "./middlewares/http-error-handler";
import { createServer } from "./server";
import { createTestServer, TestServer } from "./test/test-server";

jest.mock("./config/env", () => ({
  ENVS: { CORS_ORIGINS: "http://localhost:3000" },
}));
jest.mock("./api", () => express.Router());

describe("App Server", () => {
  let app: ReturnType<typeof createServer>;
  let request: TestServer;

  beforeAll(() => {
    app = createServer();
    request = createTestServer(app);
  });

  describe("Middlewares", () => {
    it("Should use JSON middleware", () => {
      expect(app.router.stack.some((r) => r.name === "jsonParser")).toBe(true);
    });

    it("Should use CORS middleware", () => {
      expect(app.router.stack.some((r) => r.handle.name === "corsMiddleware")).toBe(true);
    });

    it("Should respect CORS origins", async () => {
      const ORIGIN = "http://localhost:3000";
      const response = await request.options("/").set("Origin", ORIGIN);

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
      expect(response.headers["access-control-allow-origin"]).toBe(ORIGIN);
    });

    it("Should return ok response on server health check", async () => {
      const response = await request.get("/health");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data.uptime");
      expect(response.body).toHaveProperty("error", null);
      expect(response.body).toHaveProperty("message");
    });

    it("Should return 404 if route does not exist", async () => {
      const response = await request.get("/non-existent-route");

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("data", null);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
    });

    it("Should register Error handler middleware", async () => {
      expect(app.router.stack.some((r) => r.name === httpErrorHandlerMiddleware.name)).toBe(true);
    });
  });
});
