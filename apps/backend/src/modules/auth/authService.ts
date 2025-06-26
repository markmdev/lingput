import { AuthError } from "@/errors/auth/AuthError";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRepository } from "./authRepository";
import { EnvError } from "@/errors/EnvError";

export class AuthService {
  jwtSecret: string;

  constructor(private authRepository: AuthRepository) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new EnvError("Missing required environment variable: JWT_SECRET");
    }
    this.jwtSecret = secret;
  }
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  // new functions

  verifyAccessToken(token: string) {
    return jwt.verify(token, this.jwtSecret) as JwtPayload & { userId: number };
  }

  generateAccessToken(userId: number) {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: "15m" });
  }

  async generateRefreshToken(userId: number) {
    const refreshToken = jwt.sign({ userId }, this.jwtSecret, { expiresIn: "7d" });
    await this.authRepository.saveRefreshToken(
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      userId
    );
    return refreshToken;
  }

  async verifyRefreshToken(token: string) {
    try {
      jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new AuthError("Invalid refresh token", { token });
    }

    const record = await this.authRepository.getRefreshTokenRecord(token);
    if (!record) {
      throw new AuthError("Invalid refresh token", { token, record });
    }
    return record;
  }

  async rotateRefreshToken(oldToken: string) {
    const record = await this.verifyRefreshToken(oldToken);
    if (!record.userId) {
      throw new AuthError("Invalid refresh token", { oldToken, record });
    }
    const newToken = await this.generateRefreshToken(record.userId);
    await this.authRepository.revokeToken(oldToken);
    return { refreshToken: newToken, record };
  }

  async issueTokens(userId: number) {
    const refreshToken = await this.generateRefreshToken(userId);
    const accessToken = this.generateAccessToken(userId);
    return { refreshToken, accessToken };
  }

  async revokeToken(oldToken: string) {
    await this.verifyRefreshToken(oldToken);
    await this.authRepository.revokeToken(oldToken);
  }
}
