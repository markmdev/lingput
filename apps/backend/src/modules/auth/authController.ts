import { Request, Response } from "express";
import { UserRepository } from "../user/userRepository";
import { AuthService } from "./authService";

const userRepository = new UserRepository();
const authService = new AuthService();
export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
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
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    const checkPassword = await authService.comparePassword(password, user.password);
    if (!checkPassword) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
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
}
