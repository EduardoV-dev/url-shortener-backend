import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { UserService } from "../user";
import { AuthCreationSchema } from "./auth.schemas";

export interface AuthController {
  signup: ControllerMethod<AuthCreationSchema>;
}

export class AuthControllerImpl implements AuthController {
  constructor(private userService: UserService) {}

  public signup: AuthController["signup"] = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user: User = await this.userService.createUser({ email, password });

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("User created successfully", user).toJSON());
    } catch (error) {
      const err = error as ApiError;
      res.status(err.status).json(new ApiErrorResponse(err.message).toJSON());
    }
  };
}
