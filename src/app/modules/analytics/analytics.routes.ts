import { Router } from "express";
import { Role, PaymentStatus } from "@prisma/client";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/database";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      completedPayments,
      revenueAgg,
      recentPayments,
      enrollmentsByMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: PaymentStatus.COMPLETED },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
      prisma.enrollment.groupBy({
        by: ["enrolledAt"],
        _count: true,
        orderBy: { enrolledAt: "desc" },
        take: 30,
      }),
    ]);

    const topCourses = await prisma.course.findMany({
      take: 5,
      orderBy: { enrollments: { _count: "desc" } },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        _count: { select: { enrollments: true } },
      },
    });

    sendSuccess(
      res,
      {
        stats: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          completedPayments,
          totalRevenue: revenueAgg._sum.amount ?? 0,
        },
        recentPayments,
        topCourses,
        enrollmentsTrend: enrollmentsByMonth,
      },
      "Analytics retrieved"
    );
  })
);

export default router;
