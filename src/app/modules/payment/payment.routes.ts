import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { sendSuccess } from "../../utils/apiResponse";
import { PaymentService } from "./payment.service";
import { getParam } from "../../utils/getParam";

const checkoutSchema = z.object({ courseId: z.string().cuid() });

const router = Router();

router.post(
  "/checkout",
  authenticate,
  validate(checkoutSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await PaymentService.createCheckoutSession(
      req.user!.userId,
      req.body.courseId
    );
    sendSuccess(res, session, "Checkout session created");
  })
);

router.get(
  "/verify/:sessionId",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const payment = await PaymentService.verifySession(
      getParam(req.params.sessionId),
      req.user!.userId
    );
    sendSuccess(res, payment, "Payment verified");
  })
);

router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    const result = await PaymentService.handleWebhook(req.body as Buffer, signature);
    res.json(result);
  })
);

router.get(
  "/my-payments",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const payments = await PaymentService.getMyPayments(req.user!.userId);
    sendSuccess(res, payments, "Payment history retrieved");
  })
);

router.get(
  "/orders",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const result = await PaymentService.getAllOrders(page);
    sendSuccess(res, result, "Orders retrieved");
  })
);

export default router;
