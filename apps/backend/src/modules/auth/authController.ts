import { Request, Response } from "express";
import { UserRepository } from "../user/userRepository";
import { AuthService } from "./authService";
import { RegisterError } from "@/errors/auth/RegisterError";
import { LoginError } from "@/errors/auth/LoginError";
import { formatResponse } from "@/middlewares/responseFormatter";
import { validateData } from "@/validation/validateData";
import { userCredentialsSchema } from "./authSchemas";
import { AuthError } from "@/errors/auth/AuthError";
import { AuthedRequest } from "@/types/types";

export class AuthController {
  cookieOpts: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    maxAge?: number;
  };
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository,
  ) {
    this.cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
  }

  register = async (req: Request, res: Response) => {
    const validatedData = validateData(userCredentialsSchema, req.body);
    const existingUser = await this.userRepository.getUserByEmail(
      validatedData.email,
    );
    if (existingUser) {
      throw new RegisterError("A user with this email already exists");
    }

    const hashedPassword = await this.authService.hashPassword(
      validatedData.password,
    );
    const user = await this.userRepository.createUser(
      validatedData.email,
      hashedPassword,
    );
    const { refreshToken, accessToken } = await this.authService.issueTokens(
      user.id,
    );
    res
      .cookie("accessToken", accessToken, {
        ...this.cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...this.cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(formatResponse({ id: user.id }));
  };

  login = async (req: Request, res: Response) => {
    const validatedData = validateData(userCredentialsSchema, req.body);
    const user = await this.userRepository.getUserByEmail(validatedData.email);
    if (!user) {
      throw new LoginError("Invalid credentials");
    }

    const checkPassword = await this.authService.comparePassword(
      validatedData.password,
      user.password,
    );
    if (!checkPassword) {
      throw new LoginError("Invalid credentials");
    }

    req.user = { userId: user.id };
    const { refreshToken, accessToken } = await this.authService.issueTokens(
      user.id,
    );
    res
      .cookie("accessToken", accessToken, {
        ...this.cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...this.cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(formatResponse({ id: user.id }));
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AuthError("Refresh token not found", null);
    }
    await this.authService.revokeToken(refreshToken);
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(formatResponse({}));
  };

  refresh = async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      throw new AuthError("Refresh token not found", null);
    }
    const { refreshToken, record } =
      await this.authService.rotateRefreshToken(oldRefreshToken);
    const accessToken = await this.authService.generateAccessToken(
      record.userId,
    );
    res
      .cookie("accessToken", accessToken, {
        ...this.cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...this.cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(formatResponse({ id: record.userId }));
  };

  me = async (req: AuthedRequest, res: Response) => {
    res.status(200).json(formatResponse({ user: { userId: req.user.userId } }));
  };
}
