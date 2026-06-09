import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { ReviewService } from "./review.service";
import { getParam } from "../../utils/getParam";

const createSchema = z.object({
  courseId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const review = await ReviewService.createReview(
      req.user!.userId,
      req.body.courseId,
      req.body.rating,
      req.body.comment
    );
    sendSuccess(res, review, "Review submitted", 201);
  })
);

router.get(
  "/:courseId",
  asyncHandler(async (req, res) => {
    const reviews = await ReviewService.getCourseReviews(getParam(req.params.courseId));
    sendSuccess(res, reviews, "Reviews retrieved");
  })
);

export default router;
