/**
 * Mood-aware recommendations.
 *
 * Phase 1 reads from the curated catalog in PostgreSQL (`CatalogProvider`).
 * Phase 2 can add Spotify / TMDB providers implementing `RecommendationProvider`;
 * API keys stay on the server and the response contract stays the same.
 */
import type { Recommendation } from "../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";
import { serializeRecommendation } from "../utils/serializers.ts";
import { activitiesWithProgress } from "./activity.service.ts";
import { latestMood } from "./mood.service.ts";

export const FOR_YOU = "for_you";
const MIN_FOR_YOU_ITEMS = 4;

export type RecommendationType = "music" | "movie";

export interface RecommendationProvider {
  name: string;
  fetch(input: { type: RecommendationType; userId: number }): Promise<Recommendation[]>;
}

class CatalogProvider implements RecommendationProvider {
  name = "catalog";

  fetch({ type, userId }: { type: RecommendationType; userId: number }) {
    return prisma.recommendation.findMany({
      where: { type, OR: [{ userId: null }, { userId }] },
      orderBy: [{ isFeatured: "desc" }, { id: "asc" }],
    });
  }
}

function getProvider(_type: RecommendationType): RecommendationProvider {
  // Phase 2: return a SpotifyProvider for music / TMDBProvider for movies when configured.
  return new CatalogProvider();
}

function categoriesOf(item: Recommendation): Set<string> {
  const extra = (item.extra ?? {}) as { categories?: string[] };
  return new Set([item.category, ...(extra.categories ?? [])]);
}

function matchesQuery(item: Recommendation, query: string): boolean {
  const haystack = [item.title, item.subtitle, item.description, item.category].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/** Items suited to the user's mood first; pad with the rest so the page is never sparse. */
function personalise(items: Recommendation[], mood: string | null): Recommendation[] {
  if (!mood) return items;
  const matching = items.filter((i) => i.moods.includes(mood));
  if (matching.length >= MIN_FOR_YOU_ITEMS) return matching;
  return [...matching, ...items.filter((i) => !matching.includes(i))];
}

export async function getFeed(
  userId: number,
  { type, category = FOR_YOU, query }: { type: RecommendationType; category?: string; query?: string },
) {
  let items = await getProvider(type).fetch({ type, userId });
  if (query) items = items.filter((i) => matchesQuery(i, query));

  const mood = (await latestMood(userId))?.mood ?? null;
  items = category === FOR_YOU ? personalise(items, mood) : items.filter((i) => categoriesOf(i).has(category));

  const featured = items.find((i) => i.isFeatured) ?? items[0] ?? null;
  return {
    type,
    category,
    mood_context: category === FOR_YOU ? mood : null,
    featured: featured ? serializeRecommendation(featured) : null,
    items: items.filter((i) => i !== featured).map(serializeRecommendation),
  };
}

export async function getAll(userId: number, type?: RecommendationType) {
  const items = await prisma.recommendation.findMany({
    where: { OR: [{ userId: null }, { userId }], ...(type && { type }) },
    orderBy: [{ type: "asc" }, { isFeatured: "desc" }, { id: "asc" }],
  });
  return items.map(serializeRecommendation);
}

export async function getExerciseFeed(userId: number) {
  const mood = (await latestMood(userId))?.mood ?? null;
  const activities = await activitiesWithProgress(userId);
  // This feed backs the "All" tab, so nothing is dropped: activities suited to the
  // latest mood are ranked first (stable sort keeps featured-first order), then the rest.
  if (mood) activities.sort((a, b) => Number(!a.moods.includes(mood)) - Number(!b.moods.includes(mood)));
  return { mood_context: mood, items: activities };
}
