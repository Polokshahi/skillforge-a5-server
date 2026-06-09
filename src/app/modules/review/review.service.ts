import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppError";

export class ReviewService {
  static async createReview(
    userId: string,
    courseId: string,
    rating: number,
    comment?: string
  ) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new AppError("You must be enrolled to review this course", 403);

    const existing = await prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new AppError("You have already reviewed this course", 409);

    return prisma.review.create({
      data: { userId, courseId, rating, comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  static async getCourseReviews(courseId: string) {
    return prisma.review.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }
}
