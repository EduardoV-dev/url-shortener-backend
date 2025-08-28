import bcrypt from "bcrypt";

import { HTTP_STATUS } from "@/constants/common";
import { MockInterface } from "@/test/__mocks__/common";
import { ApiError } from "@/utils/api-error";

import { MOCK_USER, MOCK_USER_SERVICE, MockUserService } from "../../user/__tests__/mocks";
import { AuthSchema } from "../auth.schemas";
import { AuthService, AuthServiceImpl } from "../auth.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("jwt_token"),
}));

describe("Auth Service", () => {
  let userService: MockUserService;
  let authService: AuthService;
  const jwtToken = "jwt_token";

  beforeEach(() => {
    userService = MOCK_USER_SERVICE;
    authService = new AuthServiceImpl(userService);
  });

  const AUTH_PARAMS: AuthSchema = {
    email: MOCK_USER.email,
    password: MOCK_USER.password,
  };

  describe("signup", () => {
    it("should create an user", async () => {
      userService.create.mockResolvedValue(MOCK_USER);
      const response = await authService.signup(AUTH_PARAMS);
      expect(response).toEqual({ token: jwtToken, userId: MOCK_USER.id });
    });
  });

  describe("login", () => {
    it("Should login an user and return JWT token", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(MOCK_USER);
      const response = await authService.login(AUTH_PARAMS);
      expect(response).toEqual({ token: jwtToken, userId: MOCK_USER.id });
    });

    it("Should throw if user is not found", async () => {
      userService.findByEmail.mockResolvedValue(null);
      const response = authService.login(AUTH_PARAMS);
      expect(response).rejects.toThrow(ApiError);
      expect(response).rejects.toHaveProperty("status", HTTP_STATUS.NOT_FOUND);
    });

    it("Should throw if password is invalid", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      userService.findByEmail.mockResolvedValue(MOCK_USER);

      AUTH_PARAMS.password = "invalid_password";
      const response = authService.login(AUTH_PARAMS);

      expect(response).rejects.toThrow(ApiError);
      expect(response).rejects.toHaveProperty("status", HTTP_STATUS.UNAUTHORIZED);
    });
  });
});

// === For sharing purposes

export type MockAuthService = MockInterface<AuthService>;

export const MOCK_AUTH_SERVICE: MockAuthService = {
  signup: jest.fn(),
  login: jest.fn(),
};
