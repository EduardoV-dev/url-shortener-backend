import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { ENVS } from "@/config/env";
import { HTTP_STATUS } from "@/constants/common";
import { User } from "@/generated/prisma";
import { MockInterface } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";

import { UserService } from "../user";
import { AuthSchema } from "./auth.schemas";

export interface AuthService {
  /**
   * Handles user signup requests.
   * @param params - The authentication parameters containing email and password.
   * @returns A promise that resolves to the created user's ID.
   * @throws ApiError if user creation fails.
   */
  login: (params: AuthSchema) => Promise<string>;
  /**
   * Handles user signup requests.
   * @param param - The authentication parameters containing email and password.
   * @returns A promise that resolves to the created user's ID.
   * @throws ApiError if user creation fails.
   */
  signup: (param: AuthSchema) => Promise<User>;
}

const JWT_EXPIRES_IN = "1h";

export class AuthServiceImpl implements AuthService {
  constructor(private userService: UserService) {}

  public signup: AuthService["signup"] = (params) => this.userService.create(params);

  public login: AuthService["login"] = async (params) => {
    const user = await this.userService.findByEmail(params.email);
    if (!user) throw new ApiError("User not found").setStatus(HTTP_STATUS.NOT_FOUND);

    const isPasswordValid = await bcrypt.compare(params.password, user.password);
    if (!isPasswordValid)
      throw new ApiError("Invalid password").setStatus(HTTP_STATUS.UNAUTHORIZED);

    const token = jwt.sign({ userId: user.id }, ENVS.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
  };
}

// === For testing purposes ===

export type MockAuthService = MockInterface<AuthService>;

export const MOCK_AUTH_SERVICE: MockAuthService = {
  signup: jest.fn(),
  login: jest.fn(),
};
