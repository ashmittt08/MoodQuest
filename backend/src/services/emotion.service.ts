/**
 * Facial emotion analysis — Phase 2 integration point.
 *
 * Phase 1 deliberately ships NO emotion model. `getEmotionAnalyzer()` returns
 * null and the API answers 501 Not Implemented instead of inventing results.
 *
 * Phase 2: implement `EmotionAnalyzer` (e.g. a Python OpenCV + FER2013/DeepFace
 * microservice called over HTTP), register it below and set EMOTION_PROVIDER.
 */
import { env } from "../config/env.ts";

export const PHASE_2_MESSAGE =
  "Facial emotion analysis is not enabled yet. The camera preview works, and the AI model will be connected in Phase 2.";

export interface EmotionAnalysis {
  dominant_emotion: string;
  confidence: number;
  emotions: { emotion: string; probability: number }[];
  face_detected: boolean;
}

export interface EmotionAnalyzer {
  name: string;
  analyze(image: Buffer, contentType: string): Promise<EmotionAnalysis>;
}

export function getEmotionAnalyzer(): EmotionAnalyzer | null {
  if (env.EMOTION_PROVIDER === "none") return null;
  // Phase 2: map env.EMOTION_PROVIDER to a concrete analyzer here.
  return null;
}

export function getStatus() {
  const analyzer = getEmotionAnalyzer();
  return analyzer
    ? { available: true, provider: analyzer.name, phase: 2, message: "Emotion analysis is enabled." }
    : { available: false, provider: null, phase: 2, message: PHASE_2_MESSAGE };
}
