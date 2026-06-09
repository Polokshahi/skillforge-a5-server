import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import courseRoutes from "../modules/course/course.routes";
import categoryRoutes from "../modules/category/category.routes";
import enrollmentRoutes from "../modules/enrollment/enrollment.routes";
import reviewRoutes from "../modules/review/review.routes";
import paymentRoutes from "../modules/payment/payment.routes";
import userRoutes from "../modules/user/user.routes";
import analyticsRoutes from "../modules/analytics/analytics.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "SkillForge API is running" });
});

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/categories", categoryRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
