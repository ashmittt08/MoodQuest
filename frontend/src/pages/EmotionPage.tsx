import { Camera, CameraOff, ChartSpline, Cpu, ScanFace, Settings, Video } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, InlineError } from "@/components/ui/States";
import { useToast } from "@/contexts/ToastContext";
import { useAsync } from "@/hooks/useAsync";
import { useCamera } from "@/hooks/useCamera";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { emotionService } from "@/services/emotionService";

const EMOTIONS = ["Happy", "Neutral", "Sad", "Angry", "Fear", "Surprise"];

function FaceFrame({ active }: { active: boolean }) {
  const corner = cn("absolute size-10 border-[3px] transition-colors", active ? "border-emerald-400" : "border-white/30");
  return (
    <div className="pointer-events-none absolute inset-[14%_16%]" aria-hidden>
      <span className={cn(corner, "top-0 left-0 rounded-tl-2xl border-r-0 border-b-0")} />
      <span className={cn(corner, "top-0 right-0 rounded-tr-2xl border-b-0 border-l-0")} />
      <span className={cn(corner, "bottom-0 left-0 rounded-bl-2xl border-t-0 border-r-0")} />
      <span className={cn(corner, "right-0 bottom-0 rounded-br-2xl border-t-0 border-l-0")} />
    </div>
  );
}

export function EmotionPage() {
  const toast = useToast();
  const camera = useCamera();
  const status = useAsync(() => emotionService.getStatus(), []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisNote, setAnalysisNote] = useState<string | null>(null);

  const active = camera.status === "active";
  const modelAvailable = status.data?.available ?? false;

  async function analyzeFrame() {
    const frame = await camera.captureFrame();
    if (!frame) {
      toast.error("Couldn't capture a frame from the camera.");
      return;
    }
    setAnalyzing(true);
    setAnalysisNote(null);
    try {
      await emotionService.analyzeFrame(frame);
    } catch (error) {
      setAnalysisNote(getErrorMessage(error));
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Emotion Detection"
        actions={
          <IconButton label="Camera settings" onClick={() => setSettingsOpen(true)}>
            <Settings className="size-4.5" />
          </IconButton>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-100">
        <Cpu className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <strong className="font-semibold">Preview only.</strong>{" "}
          {status.data?.message ??
            "Emotion analysis isn't enabled yet, so nothing is detected or stored. The camera preview works."}
        </p>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="glass relative aspect-[3/4] overflow-hidden p-0 sm:aspect-[4/3]">
          <video
            ref={camera.videoRef}
            playsInline
            muted
            className={cn("absolute inset-0 size-full -scale-x-100 object-cover", !active && "hidden")}
          />
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              {camera.status === "starting" ? (
                <p className="text-sm text-slate-300">Requesting camera access…</p>
              ) : (
                <>
                  <span className="flex size-14 items-center justify-center rounded-full bg-white/5 text-slate-400">
                    <CameraOff className="size-6" aria-hidden />
                  </span>
                  <p className="text-sm text-slate-400">Camera is off</p>
                </>
              )}
            </div>
          )}
          <FaceFrame active={active} />
          {active && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <span className="size-2 animate-pulse rounded-full bg-rose-500" aria-hidden /> Live preview
            </span>
          )}
        </div>

        <div className="glass flex flex-col gap-1 p-2.5 sm:p-3" aria-label="Emotion probabilities">
          {EMOTIONS.map((emotion) => (
            <div key={emotion} className="flex items-center justify-between rounded-xl px-2 py-2 text-xs sm:text-sm">
              <span className="text-slate-300">{emotion}</span>
              <span className="text-slate-500 tabular-nums" title="Shown when emotion analysis is enabled">
                —
              </span>
            </div>
          ))}
          <p className="mt-auto px-2 pb-1 text-[10px] text-slate-500">Scores appear when emotion analysis is enabled.</p>
        </div>
      </div>

      <Card>
        <p className="text-xs text-slate-400">Detected Emotion</p>
        <div className="mt-1 flex items-center gap-3">
          <ScanFace className="size-9 text-slate-500" aria-hidden />
          <p className="flex-1 text-lg font-semibold text-slate-300">
            {modelAvailable ? "Waiting for analysis" : "Not available yet"}
          </p>
          <span className="text-2xl font-bold text-slate-600">—%</span>
        </div>
        <ProgressBar value={0} className="mt-3" label="Detection confidence" />
        {active && (
          <div className="mt-4 space-y-2">
            <Button variant="outline" size="sm" onClick={() => void analyzeFrame()} loading={analyzing}>
              Send frame to analyzer
            </Button>
            {analysisNote && <p className="text-xs text-slate-400">Server response: {analysisNote}</p>}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-1 text-sm font-semibold text-white">Emotion Trend (Live)</p>
        <EmptyState
          compact
          icon={ChartSpline}
          title="No live data yet"
          message="A live emotion trend will appear here when emotion analysis is enabled."
        />
      </Card>

      <InlineError message={camera.error} />

      {active ? (
        <Button variant="danger" size="lg" fullWidth icon={<Video className="size-5" />} onClick={camera.stop}>
          Stop Camera
        </Button>
      ) : (
        <Button
          size="lg"
          fullWidth
          icon={<Camera className="size-5" />}
          onClick={() => void camera.start()}
          loading={camera.status === "starting"}
        >
          {camera.status === "error" ? "Try Camera Again" : "Start Camera"}
        </Button>
      )}

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Camera settings">
        {camera.devices.length > 0 ? (
          <SelectField
            label="Camera"
            value={camera.deviceId ?? ""}
            onChange={(e) => {
              void camera.start(e.target.value);
              setSettingsOpen(false);
            }}
          >
            {camera.devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </SelectField>
        ) : (
          <p className="text-sm text-slate-400">Start the camera once to choose between available cameras.</p>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Video stays in your browser and nothing is recorded. A frame is only sent to the server when you press
          "Send frame to analyzer".
        </p>
      </Modal>
    </div>
  );
}
