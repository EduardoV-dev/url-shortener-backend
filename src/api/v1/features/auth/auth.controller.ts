import { HTTP_STATUS } from "@/constants/common";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { AuthSchema } from "./auth.schemas";
import { AuthResponse, AuthService } from "./auth.service";

export interface AuthController {
  /**
   * Handles user signup requests.
   * @returns A promise that resolves to void.
   */
  signup: ControllerMethod<unknown, AuthSchema>;
  /**
   * Handles user login requests.
   * @returns A promise that resolves to void.
   */
  login: ControllerMethod<unknown, AuthSchema>;
}

export class AuthControllerImpl implements AuthController {
  constructor(private service: AuthService) {}

  public signup: AuthController["signup"] = async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const { token, userId }: AuthResponse = await this.service.signup({ email, password });
      req.userId = userId;

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("User created successfully", { token }).toJSON());
    } catch (error) {
      next(error);
    }
  };

  public login: AuthController["login"] = async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const { token, userId }: AuthResponse = await this.service.login({ email, password });
      req.userId = userId;

      res
        .status(HTTP_STATUS.OK)
        .json(new ApiSuccessResponse("Login successful", { token }).toJSON());
    } catch (error) {
      next(error);
    }
  };
}
