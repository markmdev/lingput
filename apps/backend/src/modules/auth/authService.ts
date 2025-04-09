import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const user = jwt.verify(token, JWT_SECRET);
    return user;
  }
}
