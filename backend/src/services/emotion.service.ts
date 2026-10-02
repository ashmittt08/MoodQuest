export const ANALYSIS_UNAVAILABLE_MESSAGE =
  "Emotion analysis isn't enabled yet. The camera preview works, but no emotions are detected or stored.";

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
  return null;
}

export function getStatus() {
  const analyzer = getEmotionAnalyzer();
  return analyzer
    ? { available: true, provider: analyzer.name, message: "Emotion analysis is enabled." }
    : { available: false, provider: null, message: ANALYSIS_UNAVAILABLE_MESSAGE };
}
