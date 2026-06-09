import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { AuthController } from "./auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(AuthController.register));
router.post("/login", validate(loginSchema), asyncHandler(AuthController.login));
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  asyncHandler(AuthController.refreshToken)
);
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(AuthController.forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(AuthController.resetPassword));
router.post("/logout", authenticate, asyncHandler(AuthController.logout));
router.get("/profile", authenticate, asyncHandler(AuthController.getProfile));
router.patch("/profile", authenticate, validate(updateProfileSchema), asyncHandler(AuthController.updateProfile));

export default router;
