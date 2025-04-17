import { AuthError } from "@/errors/auth/AuthError";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

export class AuthService {
  jwtSecret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    this.jwtSecret = secret;
  }
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  generateToken(userId: number) {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: "1d" });
  }

  verifyToken(token: string) {
    const decoded = jwt.verify(token, this.jwtSecret);

    if (typeof decoded === "string") {
      throw new AuthError("Invalid token");
    }

    const user = decoded as JwtPayload & { userId: number };
    return user;
  }
}
