import { api } from "@/lib/api";
import type { EmotionStatus } from "@/types";

/**
 * Phase 2 integration point. The backend currently answers /analyze with
 * 501 Not Implemented — no emotion results are produced or faked in Phase 1.
 */
export const emotionService = {
  async getStatus(): Promise<EmotionStatus> {
    const { data } = await api.get<EmotionStatus>("/api/emotion/status");
    return data;
  },
  async analyzeFrame(frame: Blob): Promise<unknown> {
    const form = new FormData();
    form.append("image", frame, "frame.jpg");
    const { data } = await api.post("/api/emotion/analyze", form);
    return data;
  },
};
