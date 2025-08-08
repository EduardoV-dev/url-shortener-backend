import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { AuthSchema } from "./auth.schemas";
import { AuthService } from "./auth.service";

export interface AuthController {
  /**
   * Handles user signup requests.
   * @returns A promise that resolves to void.
   */
  signup: ControllerMethod<AuthSchema>;
  /**
   * Handles user login requests.
   * @returns A promise that resolves to void.
   */
  login: ControllerMethod<AuthSchema>;
}

export class AuthControllerImpl implements AuthController {
  constructor(private service: AuthService) {}

  public signup: AuthController["signup"] = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user: User = await this.service.signup({ email, password });

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("User created successfully", user).toJSON());
    } catch (error) {
      const err = error as ApiError;
      res.status(err.status).json(new ApiErrorResponse(err.message).toJSON());
    }
  };

  public login: AuthController["login"] = async (req, res) => {
    const { email, password } = req.body;

    try {
      const jwtToken: string = await this.service.login({ email, password });

      res
        .status(HTTP_STATUS.OK)
        .json(new ApiSuccessResponse("Login successful", { token: jwtToken }).toJSON());
    } catch (error) {
      const err = error as ApiError;
      res.status(err.status).json(new ApiErrorResponse(err.message).toJSON());
    }
  };
}
