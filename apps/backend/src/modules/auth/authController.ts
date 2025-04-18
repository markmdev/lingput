import { Request, Response } from "express";
import { UserRepository } from "../user/userRepository";
import { AuthService } from "./authService";
import { RegisterError } from "@/errors/auth/RegisterError";
import { LoginError } from "@/errors/auth/LoginError";

export class AuthController {
  cookieOpts: { httpOnly: boolean; secure: boolean; sameSite: "lax"; maxAge?: number };
  constructor(private authService: AuthService, private userRepository: UserRepository) {
    this.cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
  }

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new RegisterError("Email already exists");
    }

    const hashedPassword = await this.authService.hashPassword(password);
    const user = await this.userRepository.createUser(email, hashedPassword);
    const { refreshToken, accessToken } = await this.authService.issueTokens(user.id);
    res
      .cookie("accessToken", accessToken, {
        ...this.cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...this.cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .send();
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new LoginError("Invalid email or password");
    }

    const checkPassword = await this.authService.comparePassword(password, user.password);
    if (!checkPassword) {
      throw new LoginError("Invalid email or password");
    }

    const { refreshToken, accessToken } = await this.authService.issueTokens(user.id);
    res
      .cookie("accessToken", accessToken, {
        ...this.cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...this.cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .send();
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    this.authService.revokeToken(refreshToken);
    res.clearCookie("accessToken").clearCookie("refreshToken").send();
  };

  refresh = async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;
    await this.authService.verifyRefreshToken(oldRefreshToken);
    const { refreshToken, record } = await this.authService.rotateRefreshToken(oldRefreshToken);
    const accessToken = await this.authService.generateAccessToken(record.userId);
    res
      .cookie("accessToken", accessToken, {
        ...this.cookieOpts,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...this.cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .send();
  };
}
