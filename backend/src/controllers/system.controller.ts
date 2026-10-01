/** Emotion (Phase 2 placeholder), emergency resources and health. */
import type { Request, Response } from "express";

import { env } from "../config/env.ts";
import { prisma } from "../lib/prisma.ts";
import * as emotionService from "../services/emotion.service.ts";
import { HttpError } from "../utils/httpError.ts";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function emotionStatus(_req: Request, res: Response) {
  res.json(emotionService.getStatus());
}

export async function analyzeEmotion(req: Request, res: Response) {
  const image = req.file;
  if (!image) throw new HttpError(422, "Image: an image file is required");
  if (!ALLOWED_IMAGE_TYPES.has(image.mimetype)) throw new HttpError(415, "Image must be JPEG, PNG or WebP");
  if (!image.size) throw new HttpError(400, "Image is empty");

  const analyzer = emotionService.getEmotionAnalyzer();
  if (!analyzer) throw new HttpError(501, emotionService.PHASE_2_MESSAGE);
  res.json(await analyzer.analyze(image.buffer, image.mimetype));
}

// Public on purpose: support information must be reachable even when logged out.
export function emergencyResources(_req: Request, res: Response) {
  res.json({
    emergency_number: env.EMERGENCY_NUMBER,
    helplines: [{ name: env.HELPLINE_NAME, number: env.HELPLINE_NUMBER, availability: env.HELPLINE_AVAILABILITY }],
    disclaimer:
      "MoodQuest is a wellness companion, not a medical or crisis service. If you or someone else is in danger, call your local emergency number now.",
  });
}

export async function health(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", database: "unavailable" });
  }
}
