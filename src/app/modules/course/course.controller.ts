import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { getParam } from "../../utils/getParam";
import { CourseService } from "./course.service";

export class CourseController {
  static async getCourses(req: AuthRequest, res: Response) {
    const publishedOnly = req.user?.role !== "ADMIN";
    const query = (res.locals.validated?.query ?? req.query) as Record<string, unknown>;
    const result = await CourseService.getCourses(query as never, publishedOnly);
    sendSuccess(res, result, "Courses retrieved");
  }

  static async getCourseById(req: AuthRequest, res: Response) {
    const includeUnpublished = req.user?.role === "ADMIN";
    const course = await CourseService.getCourseById(getParam(req.params.id), includeUnpublished);
    sendSuccess(res, course, "Course retrieved");
  }

  static async createCourse(req: AuthRequest, res: Response) {
    const course = await CourseService.createCourse(req.user!.userId, req.body);
    sendSuccess(res, course, "Course created", 201);
  }

  static async updateCourse(req: AuthRequest, res: Response) {
    const course = await CourseService.updateCourse(getParam(req.params.id), req.body);
    sendSuccess(res, course, "Course updated");
  }

  static async deleteCourse(req: AuthRequest, res: Response) {
    const result = await CourseService.deleteCourse(getParam(req.params.id));
    sendSuccess(res, result, result.message);
  }

  static async addLesson(req: AuthRequest, res: Response) {
    const lesson = await CourseService.addLesson(getParam(req.params.id), req.body);
    sendSuccess(res, lesson, "Lesson added", 201);
  }

  static async updateLesson(req: AuthRequest, res: Response) {
    const lesson = await CourseService.updateLesson(getParam(req.params.lessonId), req.body);
    sendSuccess(res, lesson, "Lesson updated");
  }

  static async deleteLesson(req: AuthRequest, res: Response) {
    const result = await CourseService.deleteLesson(getParam(req.params.lessonId));
    sendSuccess(res, result, result.message);
  }
}