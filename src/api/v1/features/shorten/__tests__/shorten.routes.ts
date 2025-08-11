import { NextFunction, Request as ExpressRequest } from "express";

import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { HTTP_STATUS } from "@/constants/common";
import { createTestServer, type Response } from "@/test/test-server";

import routes from "../shorten.routes";

const request = createTestServer(routes);

// TODO: Move this mock to a shared place if needed in other tests
jest.mock("../../../middlewares/auth", () => ({
  bypassAuthenticationMiddleware: (req: ExpressRequest, _res: Response, next: NextFunction) => {
    if (req.header("Authorization") === "validToken") req.userId = MOCK_URL.userId || "";
    else req.userId = undefined;

    next();
  },
}));

// TODO: Move this mock to a shared place if needed in other tests
jest.mock("../shorten.service", () => ({
  ShortenServiceImpl: jest.fn().mockImplementation(() => ({
    createShortUrl: jest.fn().mockImplementation((_url: string, userId?: string) => {
      if (userId) return Promise.resolve({ ...MOCK_URL, userId });
      else return Promise.resolve({ ...MOCK_URL, userId: null });
    }),
  })),
}));

describe("/shorten", () => {
  describe("[POST] /", () => {
    it("Should create a url anonymously", async () => {
      const response = await request.post("").send({ url: "https://github.com/" });
      expect(response.statusCode).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toHaveProperty("data.userId", null);
    });

    it("Should create an url with userId", async () => {
      const response = await request
        .post("")
        .set("Authorization", "validToken")
        .send({ url: "https://github.com/this-was-done-by-supertest" });

      expect(response.statusCode).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toHaveProperty("data.userId", MOCK_URL.userId);
    });

    it("Should return 400 if url is not provided", async () => {
      const response = await request.post("").send({});
      assertUrlValidationError(response);
    });

    it("Should return 400 if url is empty", async () => {
      const response = await request.post("").send({ url: "" });
      assertUrlValidationError(response);
    });

    it("Should return 400 if url is not valid", async () => {
      const response = await request.post("").send({ url: "invalid-url" });
      assertUrlValidationError(response);
    });
  });
});

// === Utils

const assertUrlValidationError = (response: Response) => {
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("success", false);
  expect(response.body).toHaveProperty("data", null);
  expect(response.body).toHaveProperty("error.url");
};
