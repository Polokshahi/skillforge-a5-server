import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./app/config/env";
import routes from "./app/routes";
import { errorHandler } from "./app/errors/errorHandler";
import { AppError } from "./app/errors/AppError";

const app = express();

// Stripe webhook requires raw body (must be before express.json)
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000",
    "https://skillforge-a5-client.netlify.app/"
    ],
    
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use(limiter);

app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

export default app;
