import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppError";
import { getParam } from "../../utils/getParam";

const updateRoleSchema = z.object({ role: z.enum(["ADMIN", "USER"]) });

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: { select: { enrollments: true, payments: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(res, { users, meta: { total, page, limit } }, "Users retrieved");
  })
);

router.patch(
  "/:id/role",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateRoleSchema),
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true },
    });
    sendSuccess(res, updated, "User role updated");
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", 404);
    if (user.role === Role.ADMIN) throw new AppError("Cannot delete admin user", 400);

    await prisma.user.delete({ where: { id } });
    sendSuccess(res, null, "User deleted");
  })
);

export default router;
