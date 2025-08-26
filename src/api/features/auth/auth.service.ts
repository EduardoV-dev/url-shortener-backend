import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

import { ENVS } from "@/config/env";
import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";

import { UserService } from "../user";
import { AuthSchema } from "./auth.schemas";

export interface AuthResponse {
  /**
   * The JWT token issued upon successful authentication.
   */
  token: string;
  /**
   * The unique identifier of the authenticated user.
   */
  userId: string;
}

export interface AuthService {
  /**
   * Handles user signup requests.
   * @param params - The authentication parameters containing email and password.
   * @returns A promise that resolves to the JWT token.
   * @throws ApiError if user creation fails.
   */
  login: (params: AuthSchema) => Promise<AuthResponse>;
  /**
   * Handles user signup requests.
   * @param param - The authentication parameters containing email and password.
   * @returns A promise that resolves to the JWT token.
   * @throws ApiError if user creation fails.
   */
  signup: (param: AuthSchema) => Promise<AuthResponse>;
}

export class AuthServiceImpl implements AuthService {
  constructor(private userService: UserService) {}

  private createJwtToken = ({ email, id }: User): string =>
    jwt.sign({ email, id }, ENVS.JWT_SECRET, { expiresIn: ENVS.JWT_EXPIRES_IN } as SignOptions);

  public signup: AuthService["signup"] = async (params) => {
    const user = await this.userService.create(params);
    const token = this.createJwtToken(user);
    return { token, userId: user.id };
  };

  public login: AuthService["login"] = async (params) => {
    const user = await this.userService.findByEmail(params.email);
    if (!user) throw new ApiError("User not found", { status: HTTP_STATUS.NOT_FOUND });

    const isPasswordValid = await bcrypt.compare(params.password, user.password);
    if (!isPasswordValid)
      throw new ApiError("Invalid password", { status: HTTP_STATUS.UNAUTHORIZED });

    const token = this.createJwtToken(user);
    return { token, userId: user.id };
  };
}
