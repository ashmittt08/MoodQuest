import { execSync } from "node:child_process";

import { useTestDatabase } from "./testEnv.ts";

/** Bring the test database schema up to date once per run. */
export default function setup() {
  useTestDatabase();
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: process.env });
}
