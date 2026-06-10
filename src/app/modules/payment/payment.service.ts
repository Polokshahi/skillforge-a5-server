import Stripe from "stripe";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { EnrollmentService } from "../enrollment/enrollment.service";

// ✅ SAFE STRIPE INIT (FIXED)
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
 apiVersion: "2025-08-27.basil",
});

export class PaymentService {
  static async createCheckoutSession(userId: string, courseId: string) {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || !course.isPublished) {
        throw new AppError("Course not found", 404);
      }

      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (existing) {
        throw new AppError("Already enrolled in this course", 409);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const payment = await prisma.payment.create({
        data: {
          userId,
          courseId,
          amount: course.price,
          status: PaymentStatus.PENDING,
        },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,

        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.title,
                description: (course.description || "").slice(0, 200),
                images: course.thumbnail ? [course.thumbnail] : [],
              },
              unit_amount: Math.round(course.price * 100),
            },
            quantity: 1,
          },
        ],

        metadata: {
          paymentId: payment.id,
          userId,
          courseId,
        },

        success_url: `${env.STRIPE_SUCCESS_URL || "http://localhost:3001/payment/success"
          }?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: env.STRIPE_CANCEL_URL || "http://localhost:3001/courses",
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripeSessionId: session.id,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  }

  static async handleWebhook(rawBody: Buffer, signature: string) {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError("Webhook secret not configured", 503);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err);
      throw new AppError("Invalid webhook signature", 400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.completePayment(session);
    }

    return { received: true };
  }

  static async verifySession(sessionId: string, userId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new AppError("Payment not completed", 400);
    }

    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: sessionId,
        userId,
      },
    });

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      await this.markPaymentComplete(
        payment.id,
        session.payment_intent as string
      );
    }

    return payment;
  }

  private static async completePayment(session: Stripe.Checkout.Session) {
    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: session.id,
      },
    });

    if (!payment || payment.status === PaymentStatus.COMPLETED) return;

    await this.markPaymentComplete(
      payment.id,
      session.payment_intent as string | undefined
    );
  }

  private static async markPaymentComplete(
    paymentId: string,
    stripePaymentId?: string
  ) {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        stripePaymentId: stripePaymentId ?? undefined,
      },
    });

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      },
    });

    if (!existing) {
      await EnrollmentService.enroll(
        payment.userId,
        payment.courseId
      );
    }
  }

  static async getMyPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            slug: true,
          },
        },
      },
    });
  }

  static async getAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.payment.count(),
    ]);

    return {
      payments,
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}