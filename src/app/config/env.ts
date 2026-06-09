import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });




const result = dotenv.config();





import { z } from "zod";



const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // ✅ FIXED (no regex crash)
  PORT: z.coerce.string().default("5000"),

  CLIENT_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // 🔥 REQUIRED (strict)
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  STRIPE_SUCCESS_URL: z.string().url().optional().or(z.literal("")),
  STRIPE_CANCEL_URL: z.string().url().optional().or(z.literal("")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;