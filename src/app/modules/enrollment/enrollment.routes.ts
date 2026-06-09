import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { EnrollmentService } from "./enrollment.service";

const enrollSchema = z.object({ courseId: z.string().cuid() });
const progressSchema = z.object({
  courseId: z.string().cuid(),
  lessonId: z.string().cuid(),
});

const router = Router();

router.post(
  "/",
  authenticate,
  validate(enrollSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const enrollment = await EnrollmentService.enroll(req.user!.userId, req.body.courseId);
    sendSuccess(res, enrollment, "Enrolled successfully", 201);
  })
);

router.get(
  "/my-enrollments",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const enrollments = await EnrollmentService.getMyEnrollments(req.user!.userId);
    sendSuccess(res, enrollments, "Enrollments retrieved");
  })
);

router.patch(
  "/progress",
  authenticate,
  validate(progressSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const enrollment = await EnrollmentService.updateProgress(
      req.user!.userId,
      req.body.courseId,
      req.body.lessonId
    );
    sendSuccess(res, enrollment, "Progress updated");
  })
);

router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const result = await EnrollmentService.getAllEnrollments(page);
    sendSuccess(res, result, "Enrollments retrieved");
  })
);

export default router;
