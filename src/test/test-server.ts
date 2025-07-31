import express from "express";
import supertest from "supertest";

export function createTestServer(router: express.Router) {
  const app = express();

  app.use(express.json());
  app.use(router);

  return supertest(app);
}

export type { Request, Response } from "supertest";
