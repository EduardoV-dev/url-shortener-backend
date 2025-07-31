import { createTestServer, type Request, type Response } from "@/test/test-server";

import routes from "../routes";

const request = createTestServer(routes);

describe("/shorten", () => {
  describe("[POST] /", () => {
    let req: Request;

    beforeEach(() => {
      req = request.post("");
    });

    it("Should return 201 is created succesfully", async () => {
      const response = await req.send({ url: "https://github.com/this-was-done-by-supertest" });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("error", null);
    });

    it("Should return 400 if url is not provided", async () => {
      const response = await req.send({});
      assertUrlValidationError(response);
    });

    it("Should return 400 if url is empty", async () => {
      const response = await req.send({ url: "" });
      assertUrlValidationError(response);
    });

    it("Should return 400 if url is not valid", async () => {
      const response = await req.send({ url: "invalid-url" });
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
