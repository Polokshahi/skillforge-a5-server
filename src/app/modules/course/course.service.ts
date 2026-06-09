import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppError";
import { slugify } from "../../utils/slugify";

interface CourseQuery {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export class CourseService {
  static async getCourses(query: CourseQuery, publishedOnly = true) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (publishedOnly) where.isPublished = true;
    if (query.featured) where.featured = true;
    if (query.level) where.level = query.level as Prisma.EnumCourseLevelFilter;
    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          instructor: { select: { id: true, name: true, avatar: true, bio: true } },
          _count: { select: { lessons: true, reviews: true, enrollments: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const data = courses.map((c) => ({
      ...c,
      averageRating: c.reviews.length
        ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
        : 0,
      reviews: undefined,
    }));

    return {
      courses: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getCourseById(id: string, includeUnpublished = false) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatar: true, bio: true } },
        lessons: { orderBy: { order: "asc" } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course || (!includeUnpublished && !course.isPublished)) {
      throw new AppError("Course not found", 404);
    }

    const averageRating = course.reviews.length
      ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
      : 0;

    return { ...course, averageRating };
  }

  static async createCourse(
    instructorId: string,
    data: {
      title: string;
      description: string;
      thumbnail: string;
      previewVideo?: string;
      price: number;
      level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
      duration: number;
      categoryId: string;
      isPublished?: boolean;
      featured?: boolean;
    }
  ) {
    let slug = slugify(data.title);
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    return prisma.course.create({
      data: { ...data, slug, instructorId },
      include: { category: true, instructor: { select: { id: true, name: true } } },
    });
  }

  static async updateCourse(id: string, data: Partial<Parameters<typeof CourseService.createCourse>[1]>) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError("Course not found", 404);

    const updateData: Prisma.CourseUpdateInput = { ...data };
    if (data.title) {
      updateData.slug = slugify(data.title);
    }

    return prisma.course.update({
      where: { id },
      data: updateData,
      include: { category: true, lessons: true },
    });
  }

  static async deleteCourse(id: string) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError("Course not found", 404);
    await prisma.course.delete({ where: { id } });
    return { message: "Course deleted" };
  }

  static async addLesson(courseId: string, data: {
    title: string;
    description?: string;
    videoUrl: string;
    duration: number;
    order: number;
  }) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Course not found", 404);

    return prisma.lesson.create({ data: { ...data, courseId } });
  }

  static async updateLesson(lessonId: string, data: Partial<{
    title: string;
    description?: string;
    videoUrl: string;
    duration: number;
    order: number;
  }>) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new AppError("Lesson not found", 404);
    return prisma.lesson.update({ where: { id: lessonId }, data });
  }

  static async deleteLesson(lessonId: string) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new AppError("Lesson not found", 404);
    await prisma.lesson.delete({ where: { id: lessonId } });
    return { message: "Lesson deleted" };
  }
}
