import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { CategoryService } from "./category.service";
import { getParam } from "../../utils/getParam";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await CategoryService.getAll();
    sendSuccess(res, categories, "Categories retrieved");
  })
);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const category = await CategoryService.create(req.body.name, req.body.description);
    sendSuccess(res, category, "Category created", 201);
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(createSchema.partial()),
  asyncHandler(async (req, res) => {
    const category = await CategoryService.update(getParam(req.params.id), req.body);
    sendSuccess(res, category, "Category updated");
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const result = await CategoryService.delete(getParam(req.params.id));
    sendSuccess(res, result, result.message);
  })
);

export default router;
