import { HTTP_STATUS } from "@/constants/common";
import { createTestServer } from "@/test/test-server";
import { ApiError } from "@/utils/api-error";

import authRoutes from "../auth.routes";

jest.mock("../auth.service", () => {
  const signup = jest.fn().mockResolvedValue({ token: "testToken", userId: "testUserId" });
  const login = jest.fn().mockResolvedValue({ token: "testToken", userId: "testUserId" });

  class AuthServiceImpl {
    signup = signup;
    login = login;
  }

  return { AuthServiceImpl, __mocks: { signup, login } };
});

const getAuthServiceMocks = () => {
  const { __mocks } = jest.requireMock("../auth.service") as {
    __mocks: { signup: jest.Mock; login: jest.Mock };
  };
  return __mocks;
};

const request = createTestServer(authRoutes);

describe("AuthRoutes /auth", () => {
  const authBody = {
    email: "email@email.com",
    password: "password123",
  };

  const mockServerError = new ApiError("Server error", {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

  describe("[POST] /register", () => {
    it("Registers a new user", async () => {
      const response = await request.post("/register").send({
        ...authBody,
        confirmPassword: "password123",
      });

      expect(response.statusCode).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toHaveProperty("success", true);
    });

    it("Throws 400 Bad Request for invalid input", async () => {
      const response = await request.post("/register").send({
        email: "invalid-email",
        password: "short",
        confirmPassword: "mismatch",
      });

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error.email");
      expect(response.body).toHaveProperty("error.password");
      expect(response.body).toHaveProperty("error.confirmPassword");
    });

    it("Throws 500 Internal Server Error for server issues", async () => {
      const { signup } = getAuthServiceMocks();
      signup.mockRejectedValueOnce(mockServerError);

      const response = await request.post("/register").send({
        ...authBody,
        confirmPassword: authBody.password,
      });
      expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("[POST] /auth/login", () => {
    it("Logs in an existing user", async () => {
      const response = await request.post("/login").send(authBody);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty("success", true);
    });

    it("Throws 400 Bad Request for invalid input", async () => {
      const response = await request.post("/login").send({
        email: "invalid-email",
        password: "short",
      });

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error.email");
      expect(response.body).toHaveProperty("error.password");
    });

    it("Throws 500 Internal Server Error for server issues", async () => {
      const { login } = getAuthServiceMocks();

      login.mockRejectedValue(mockServerError);

      const response = await request.post("/login").send(authBody);
      expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty("success", false);
    });
  });
});
