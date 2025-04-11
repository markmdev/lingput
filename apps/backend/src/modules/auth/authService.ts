import { AuthError } from "@/errors/auth/AuthError";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export class AuthService {
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  generateToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
  }

  verifyToken(token: string) {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      throw new AuthError("Invalid token");
    }

    const user = decoded as JwtPayload & { userId: number };
    return user;
  }
}
