import dotenv from "dotenv";
dotenv.config();
import app from "./app";

import { prisma } from "./app/config/database";
import { env } from "./app/config/env";


const PORT = parseInt(env.PORT, 10);

async function main() {
  await prisma.$connect();
  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`SkillForge API running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
