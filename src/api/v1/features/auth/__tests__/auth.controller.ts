import { Request, Response } from "express";

import { MOCK_USER } from "@/api/v1/test/mocks";
import { HTTP_STATUS } from "@/constants/common";
import { MOCK_RESPONSE_EXPRESS } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { AuthControllerImpl } from "../auth.controller";
import { MOCK_AUTH_SERVICE, MockAuthService } from "../auth.service";

describe("AuthController", () => {
  let service: MockAuthService;
  let controller: AuthControllerImpl;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    res = MOCK_RESPONSE_EXPRESS;
    service = MOCK_AUTH_SERVICE;
    controller = new AuthControllerImpl(service);
  });

  describe("signup", () => {
    const req = { body: { email: MOCK_USER.email, password: MOCK_USER.password } } as Request;

    it("res.status and res.json are being called once", async () => {
      await controller.signup(req, res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("Creates a new user successfully", async () => {
      service.signup.mockResolvedValue(MOCK_USER);
      await controller.signup(req, res);

      const { data, success } = new ApiSuccessResponse("", MOCK_USER).toJSON();

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data, success }));
    });

    it("Returns error response in case something fails", async () => {
      const errorMessage = "Failed to create user";

      service.signup.mockRejectedValue(
        new ApiError(errorMessage).setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      await controller.signup(req, res);

      const { success, error } = new ApiErrorResponse(errorMessage).toJSON();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success, error, message: errorMessage }),
      );
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe("login", () => {
    const req = { body: { email: MOCK_USER.email, password: MOCK_USER.password } } as Request;

    it("res.status and res.json are being called once", async () => {
      await controller.signup(req, res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("Returns a success response with JWT token", async () => {
      const token = "jwt_token";
      service.login.mockResolvedValue(token);
      await controller.login(req, res);

      const { success, data } = new ApiSuccessResponse("", { token }).toJSON();

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success,
          data,
        }),
      );
    });

    it("Returns error response in case something fails", async () => {
      service.login.mockRejectedValue(
        new ApiError("Login failed").setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
