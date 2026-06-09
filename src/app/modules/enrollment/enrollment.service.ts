import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppError";

export class EnrollmentService {
  static async enroll(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Course not found", 404);

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new AppError("Already enrolled in this course", 409);

    return prisma.enrollment.create({
      data: { userId, courseId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, avatar: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
    });
  }

  static async getMyEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          include: {
            category: true,
            instructor: { select: { id: true, name: true, avatar: true } },
            lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, duration: true, order: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
    });
  }

  static async updateProgress(
    userId: string,
    courseId: string,
    lessonId: string
  ) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new AppError("Not enrolled in this course", 403);

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });
    if (!lesson) throw new AppError("Lesson not found", 404);

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: true, watchedAt: new Date() },
      update: { completed: true, watchedAt: new Date() },
    });

    const completedLessons = enrollment.completedLessons.includes(lessonId)
      ? enrollment.completedLessons
      : [...enrollment.completedLessons, lessonId];

    const totalLessons = await prisma.lesson.count({ where: { courseId } });
    const progress = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

    return prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { completedLessons, progress },
    });
  }

  static async getAllEnrollments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        skip,
        take: limit,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, thumbnail: true } },
        },
      }),
      prisma.enrollment.count(),
    ]);
    return { enrollments, meta: { total, page, limit } };
  }
}
