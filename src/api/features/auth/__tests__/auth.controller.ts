import { Request, Response } from "express";

import { HTTP_STATUS } from "@/constants/common";
import { MOCK_USER } from "@/test/__fixtures__/user";
import { MOCK_RESPONSE_EXPRESS } from "@/test/__mocks__/common";

import { AuthControllerImpl } from "../auth.controller";
import { MOCK_AUTH_SERVICE, MockAuthService } from "./auth.service";

describe("AuthController", () => {
  let service: MockAuthService;
  let controller: AuthControllerImpl;
  let res: jest.Mocked<Response>;
  let next: jest.Mock;

  const jwtToken = "jwt_token";

  beforeEach(() => {
    jest.clearAllMocks();

    res = MOCK_RESPONSE_EXPRESS;
    next = jest.fn();
    service = MOCK_AUTH_SERVICE;
    controller = new AuthControllerImpl(service);
  });

  describe("signup", () => {
    const req = { body: { email: MOCK_USER.email, password: MOCK_USER.password } } as Request;

    it("res.status and res.json are being called once", async () => {
      service.signup.mockResolvedValue(jwtToken);
      await controller.signup(false)(req, res, next);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalled();
    });

    it("Creates a user and returns a success response with JWT token", async () => {
      service.signup.mockResolvedValue(jwtToken);
      await controller.signup(false)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { token: jwtToken },
        }),
      );
    });

    it("Returns error response in case something fails", async () => {
      const error = new Error("Failed to create user");
      service.signup.mockRejectedValue(error);

      await controller.signup(true)(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const req = { body: { email: MOCK_USER.email, password: MOCK_USER.password } } as Request;

    it("res.status and res.json are being called once", async () => {
      service.login.mockResolvedValue(jwtToken);
      await controller.login(req, res, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("Returns a success response with JWT token", async () => {
      service.login.mockResolvedValue(jwtToken);
      await controller.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { token: jwtToken },
        }),
      );
    });

    it("Returns error response in case something fails", async () => {
      const error = new Error("Login failed");
      service.login.mockRejectedValue(error);

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
