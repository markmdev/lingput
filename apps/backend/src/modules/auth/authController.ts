import { Request, Response } from "express";
import { UserRepository } from "../user/userRepository";
import { AuthService } from "./authService";
import { RegisterError } from "@/errors/auth/RegisterError";
import { LoginError } from "@/errors/auth/LoginError";
const userRepository = new UserRepository();
const authService = new AuthService();

export class AuthController {
  constructor() {}

  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new RegisterError("Email already exists");
    }

    const hashedPassword = await authService.hashPassword(password);
    const user = await userRepository.createUser(email, hashedPassword);
    const token = authService.generateToken(user.id);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .send();
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new LoginError("Invalid email or password");
    }

    const checkPassword = await authService.comparePassword(password, user.password);
    if (!checkPassword) {
      throw new LoginError("Invalid email or password");
    }

    const token = authService.generateToken(user.id);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .send();
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.send();
  }
}
