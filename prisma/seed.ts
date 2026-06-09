import { PrismaClient, Role, CourseLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Web Development", description: "Build modern web applications" },
  { name: "Data Science", description: "Analytics, ML, and data engineering" },
  { name: "Mobile Development", description: "iOS and Android apps" },
  { name: "Design", description: "UI/UX and visual design" },
  { name: "DevOps", description: "CI/CD, cloud, and infrastructure" },
];

const slugify = (t: string) =>
  t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

async function main() {
  console.log("Seeding SkillForge Academy...");

  const adminPassword = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    12
  );
  const userPassword = await bcrypt.hash("Student@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || "admin@skillforge.academy" },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL || "admin@skillforge.academy",
      name: "Alex Morgan",
      password: adminPassword,
      role: Role.ADMIN,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      bio: "Platform administrator and lead instructor.",
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: "sarah.chen@skillforge.academy" },
    update: {},
    create: {
      email: "sarah.chen@skillforge.academy",
      name: "Sarah Chen",
      password: userPassword,
      role: Role.USER,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      bio: "Senior full-stack engineer with 10+ years teaching experience.",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@skillforge.academy" },
    update: {},
    create: {
      email: "student@skillforge.academy",
      name: "Jordan Lee",
      password: userPassword,
      role: Role.USER,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const categories = [];
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: {},
      create: { name: cat.name, slug: slugify(cat.name), description: cat.description },
    });
    categories.push(c);
  }

  const coursesData = [
    {
      title: "Complete Next.js Masterclass",
      description:
        "Master Next.js 14+ with App Router, Server Components, authentication, and deployment. Build production-grade apps from scratch.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      previewVideo: "https://www.youtube.com/embed/Sklc_fQBmcs",
      price: 89.99,
      level: CourseLevel.INTERMEDIATE,
      duration: 1200,
      featured: true,
      categorySlug: "web-development",
      lessons: [
        { title: "Introduction to Next.js", videoUrl: "https://www.youtube.com/embed/Sklc_fQBmcs", duration: 600, order: 0 },
        { title: "App Router Deep Dive", videoUrl: "https://www.youtube.com/embed/wm5gMKuwSYk", duration: 900, order: 1 },
        { title: "Authentication Patterns", videoUrl: "https://www.youtube.com/embed/2jqok-WYJhQ", duration: 780, order: 2 },
      ],
    },
    {
      title: "TypeScript for Professionals",
      description:
        "Go beyond basics: generics, utility types, strict mode, and architectural patterns for large-scale TypeScript codebases.",
      thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800",
      price: 59.99,
      level: CourseLevel.INTERMEDIATE,
      duration: 900,
      featured: true,
      categorySlug: "web-development",
      lessons: [
        { title: "Type System Fundamentals", videoUrl: "https://www.youtube.com/embed/BwuLxPH8IDs", duration: 720, order: 0 },
        { title: "Advanced Generics", videoUrl: "https://www.youtube.com/embed/ahCs8-CPeKo", duration: 840, order: 1 },
      ],
    },
    {
      title: "Python Data Science Bootcamp",
      description:
        "Learn pandas, NumPy, matplotlib, and scikit-learn. Analyze real datasets and build predictive models.",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
      price: 79.99,
      level: CourseLevel.BEGINNER,
      duration: 1500,
      featured: true,
      categorySlug: "data-science",
      lessons: [
        { title: "Python for Data Analysis", videoUrl: "https://www.youtube.com/embed/r-uOLx7lqhw", duration: 900, order: 0 },
        { title: "Machine Learning Basics", videoUrl: "https://www.youtube.com/embed/aircAruvnKk", duration: 1020, order: 1 },
      ],
    },
    {
      title: "React Native Mobile Apps",
      description:
        "Build cross-platform mobile apps with React Native, Expo, and native device APIs.",
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
      price: 69.99,
      level: CourseLevel.INTERMEDIATE,
      duration: 1100,
      categorySlug: "mobile-development",
      lessons: [
        { title: "Getting Started with Expo", videoUrl: "https://www.youtube.com/embed/0-S5a0WKFUU", duration: 660, order: 0 },
      ],
    },
    {
      title: "UI/UX Design Principles",
      description:
        "Create beautiful, accessible interfaces. Learn color theory, typography, Figma workflows, and design systems.",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      price: 49.99,
      level: CourseLevel.BEGINNER,
      duration: 800,
      categorySlug: "design",
      lessons: [
        { title: "Design Thinking", videoUrl: "https://www.youtube.com/embed/_aJTYXjBfKs", duration: 540, order: 0 },
      ],
    },
    {
      title: "Docker & Kubernetes DevOps",
      description:
        "Containerize applications, orchestrate with Kubernetes, and implement CI/CD pipelines on cloud platforms.",
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d0fe9a?w=800",
      price: 99.99,
      level: CourseLevel.ADVANCED,
      duration: 1400,
      categorySlug: "devops",
      lessons: [
        { title: "Docker Fundamentals", videoUrl: "https://www.youtube.com/embed/3c-iBn73dDE", duration: 720, order: 0 },
      ],
    },
  ];

  for (const data of coursesData) {
    const category = categories.find((c) => c.slug === data.categorySlug)!;
    const slug = slugify(data.title);

    const course = await prisma.course.upsert({
      where: { slug },
      update: {},
      create: {
        title: data.title,
        slug,
        description: data.description,
        thumbnail: data.thumbnail,
        previewVideo: data.previewVideo,
        price: data.price,
        level: data.level,
        duration: data.duration,
        isPublished: true,
        featured: data.featured ?? false,
        instructorId: instructor.id,
        categoryId: category.id,
      },
    });

    const lessonCount = await prisma.lesson.count({ where: { courseId: course.id } });
    if (lessonCount === 0) {
      for (const lesson of data.lessons) {
        await prisma.lesson.create({
          data: { ...lesson, courseId: course.id },
        });
      }
    }
  }

  const firstCourse = await prisma.course.findFirst({ where: { slug: slugify(coursesData[0].title) } });
  if (firstCourse) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: firstCourse.id } },
      update: {},
      create: { userId: student.id, courseId: firstCourse.id, progress: 33 },
    });

    await prisma.review.upsert({
      where: { userId_courseId: { userId: student.id, courseId: firstCourse.id } },
      update: {},
      create: {
        userId: student.id,
        courseId: firstCourse.id,
        rating: 5,
        comment: "Excellent course! Clear explanations and practical projects.",
      },
    });
  }

  console.log("Seed completed!");
  console.log("Admin:", admin.email, "| Password: Admin@12345");
  console.log("Student:", student.email, "| Password: Student@12345");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
