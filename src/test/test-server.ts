import express from "express";
import supertest from "supertest";

import { httpErrorHandlerMiddleware } from "@/middlewares/http-error-handler";

export function createTestServer(router: express.Router) {
  const app = express();

  app.use(express.json());
  app.use(router);
  app.use(httpErrorHandlerMiddleware);

  return supertest(app);
}

export type TestServer = ReturnType<typeof createTestServer>;

export type { Request, Response } from "supertest";
