import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../../utils/jwt";

const sanitizeUser = (user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  createdAt: user.createdAt,
});

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("Email already registered", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: Role.USER },
    });

    const tokens = await this.generateTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const tokens = await this.generateTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  static async refreshToken(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokens = await this.generateTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: "If that email exists, a reset link was sent" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires },
    });

    // In production: send email. For assignment, return token in dev only.
    return {
      message: "If that email exists, a reset link was sent",
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    };
  }

  static async resetPassword(token: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) throw new AppError("Invalid or expired reset token", 400);

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetExpires: null,
      },
    });

    return { message: "Password reset successful" };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    return sanitizeUser(user);
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; bio?: string; avatar?: string }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return sanitizeUser(user);
  }

  private static async generateTokens(user: {
    id: string;
    email: string;
    role: Role;
  }) {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}
