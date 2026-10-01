import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Allowed browser origin(s), comma-separated. */
  FRONTEND_URL: z.string().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(60),

  // Emergency page resources — configuration, not code. Set them for your region.
  EMERGENCY_NUMBER: z.string().default("112"),
  HELPLINE_NAME: z.string().default("Tele-MANAS National Mental Health Helpline"),
  HELPLINE_NUMBER: z.string().default("14416"),
  HELPLINE_AVAILABILITY: z.string().default("Available 24/7"),

  // Phase 2 integration switches.
  ASSISTANT_PROVIDER: z.string().default("rule_based"),
  EMOTION_PROVIDER: z.string().default("none"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  console.error(`Invalid environment configuration (see backend/.env.example):\n${problems}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  frontendOrigins: parsed.data.FRONTEND_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  isTest: parsed.data.NODE_ENV === "test",
};
