import { useTestDatabase } from "./testEnv.ts";

// Runs before any app module is imported, so env.ts/prisma.ts see the test database.
useTestDatabase();
