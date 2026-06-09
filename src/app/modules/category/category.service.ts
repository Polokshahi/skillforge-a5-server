import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppError";
import { slugify } from "../../utils/slugify";

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { courses: true } } },
    });
  }

  static async create(name: string, description?: string) {
    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new AppError("Category already exists", 409);

    return prisma.category.create({ data: { name, slug, description } });
  }

  static async update(id: string, data: { name?: string; description?: string }) {
    const updateData: { name?: string; slug?: string; description?: string } = { ...data };
    if (data.name) updateData.slug = slugify(data.name);

    return prisma.category.update({ where: { id }, data: updateData });
  }

  static async delete(id: string) {
    const count = await prisma.course.count({ where: { categoryId: id } });
    if (count > 0) throw new AppError("Cannot delete category with courses", 400);
    await prisma.category.delete({ where: { id } });
    return { message: "Category deleted" };
  }
}
