/** `npm run db:seed` — load catalog content. The API also does this on startup. */
import { prisma } from "../src/lib/prisma.ts";
import { ACTIVITIES, GAMES, RECOMMENDATIONS, seedCatalog } from "../src/services/catalog.service.ts";

try {
  await seedCatalog(prisma);
  console.log(`Seeded ${GAMES.length} games, ${ACTIVITIES.length} activities and ${RECOMMENDATIONS.length} recommendations.`);
} finally {
  await prisma.$disconnect();
}
