import { HTTP_STATUS } from "@/constants/common";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { AuthSchema } from "./auth.schemas";
import { AuthService } from "./auth.service";

export interface AuthController {
  /**
   * Handles user signup requests.
   * @param isAdmin - A boolean indicating if the signup is for an admin user.
   * @returns A promise that resolves to void.
   */
  signup: (isAdmin: boolean) => ControllerMethod<unknown, AuthSchema>;
  /**
   * Handles admin signup requests.
   * @returns A promise that resolves to void.
   */
  /**
   * Handles user login requests.
   * @returns A promise that resolves to void.
   */
  login: ControllerMethod<unknown, AuthSchema>;
}

export class AuthControllerImpl implements AuthController {
  constructor(private service: AuthService) {}

  public signup: AuthController["signup"] = (isAdmin: boolean) => async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const token = await this.service.signup({
        email,
        password,
        isAdmin,
      });

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
      const token = await this.service.login({ email, password });

      res
        .status(HTTP_STATUS.OK)
        .json(new ApiSuccessResponse("Login successful", { token }).toJSON());
    } catch (error) {
      next(error);
    }
  };
}
