import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { CourseController } from "./course.controller";
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  createLessonSchema,
  updateLessonSchema,
} from "./course.validation";

const router = Router();

router.get("/", validate(courseQuerySchema, "query"), asyncHandler(CourseController.getCourses));
router.get("/:id", asyncHandler(CourseController.getCourseById));

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createCourseSchema),
  asyncHandler(CourseController.createCourse)
);
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateCourseSchema),
  asyncHandler(CourseController.updateCourse)
);
router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(CourseController.deleteCourse)
);

router.post(
  "/:id/lessons",
  authenticate,
  authorize(Role.ADMIN),
  validate(createLessonSchema),
  asyncHandler(CourseController.addLesson)
);
router.patch(
  "/:id/lessons/:lessonId",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateLessonSchema),
  asyncHandler(CourseController.updateLesson)
);
router.delete(
  "/:id/lessons/:lessonId",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(CourseController.deleteLesson)
);

export default router;
