import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  static async register(req: AuthRequest, res: Response) {
    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password);
    sendSuccess(res, result, "Registration successful", 201);
  }

  static async login(req: AuthRequest, res: Response) {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    sendSuccess(res, result, "Login successful");
  }

  static async refreshToken(req: AuthRequest, res: Response) {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    sendSuccess(res, result, "Token refreshed");
  }

  static async logout(req: AuthRequest, res: Response) {
    await AuthService.logout(req.user!.userId);
    sendSuccess(res, null, "Logged out successfully");
  }

  static async forgotPassword(req: AuthRequest, res: Response) {
    const result = await AuthService.forgotPassword(req.body.email);
    sendSuccess(res, result, result.message);
  }

  static async resetPassword(req: AuthRequest, res: Response) {
    const result = await AuthService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, result, result.message);
  }

  static async getProfile(req: AuthRequest, res: Response) {
    const user = await AuthService.getProfile(req.user!.userId);
    sendSuccess(res, user, "Profile retrieved");
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    const user = await AuthService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user, "Profile updated");
  }
}
