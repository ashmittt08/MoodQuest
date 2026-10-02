import { Mic, SendHorizontal, Square } from "lucide-react";
import { useLayoutEffect, useRef, type FormEvent, type RefObject } from "react";

import { IconButton } from "@/components/ui/IconButton";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/cn";

export const MAX_MESSAGE_LENGTH = 2000;
const SILENCE_MS = 1500;

function joinText(base: string, spoken: string): string {
  return base && spoken ? `${base} ${spoken}` : base || spoken;
}

interface ChatComposerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  error: string | null;
  sendDisabled?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  onVoiceStart?: () => void;
  className?: string;
}

export function ChatComposer({
  id,
  value,
  onChange,
  onSend,
  error,
  sendDisabled,
  inputRef,
  onVoiceStart,
  className,
}: ChatComposerProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const baseTextRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  const speech = useSpeechRecognition({
    silenceMs: SILENCE_MS,
    onTranscript: (transcript) => onChange(joinText(baseTextRef.current, transcript)),
    onEnd: (transcript, { error: failed }) => {
      if (!failed && transcript) onSend(joinText(baseTextRef.current, transcript));
    },
  });

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function toggleMic() {
    if (!speech.listening) {
      baseTextRef.current = valueRef.current.trim();
      onVoiceStart?.();
    }
    speech.toggle();
  }

  function send() {
    if (speech.listening) speech.stop();
    else onSend(value);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    send();
  }

  const helpText = speech.listening ? null : (error ?? speech.error);

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-end gap-2", className)}>
      <IconButton
        label={speech.listening ? "Stop and send voice message" : "Start voice input"}
        aria-pressed={speech.listening}
        onClick={toggleMic}
        type="button"
        className={cn(
          speech.listening &&
            "border-rose-400/60 bg-rose-500/20 text-rose-200 shadow-[0_0_0_4px_rgb(244_63_94/0.15),0_0_20px_-2px_rgb(244_63_94/0.7)]",
        )}
      >
        {speech.listening ? <Square className="size-4 fill-current" /> : <Mic className="size-4.5" />}
      </IconButton>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">
          Message
        </label>
        <textarea
          id={id}
          ref={(el) => {
            localRef.current = el;
            if (inputRef) inputRef.current = el;
          }}
          rows={1}
          value={value}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(e) => {
            if (speech.error) speech.clearError();
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={speech.listening ? "Listening… speak now" : "Type a message…"}
          aria-invalid={!!error || undefined}
          aria-describedby={helpText || speech.listening ? `${id}-help` : undefined}
          className={cn(
            "scrollbar-none block max-h-32 min-h-11 w-full resize-none overflow-y-auto rounded-[1.375rem] border bg-ink-850/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/20",
            error ? "border-rose-400/60" : speech.listening ? "border-rose-400/40" : "border-white/10",
          )}
        />
        {speech.listening ? (
          <p id={`${id}-help`} role="status" className="mt-1 flex items-center gap-1.5 px-3 text-xs text-rose-200">
            <span className="size-2 animate-pulse rounded-full bg-rose-400" aria-hidden />
            Listening… pause when you're done and it sends automatically.
          </p>
        ) : (
          helpText && (
            <p
              id={`${id}-help`}
              role={error ? "alert" : "status"}
              className={cn("mt-1 px-3 text-xs", error ? "text-rose-300" : "text-amber-200")}
            >
              {helpText}
            </p>
          )
        )}
      </div>
      <IconButton label="Send message" tone="primary" type="submit" disabled={sendDisabled} className="size-11">
        <SendHorizontal className="size-5" />
      </IconButton>
    </form>
  );
}
