import { Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types";
import { formatTime } from "@/utils/date";

export function CompanionAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-primary-500 to-fuchsia-500 text-white shadow-[0_0_20px_-4px_rgb(139_92_246/0.9)]",
        size === "md" ? "size-11" : "size-8",
      )}
      aria-hidden
    >
      <Sparkles className={size === "md" ? "size-5" : "size-4"} />
    </span>
  );
}

export interface DisplayMessage extends Pick<ChatMessage, "sender" | "content" | "created_at"> {
  key: string;
  pending?: boolean;
}

export function MessageBubble({ message }: { message: DisplayMessage }) {
  const mine = message.sender === "user";
  return (
    <div className={cn("flex animate-slide-up items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && <CompanionAvatar size="sm" />}
      <div className={cn("max-w-[80%] sm:max-w-[65%]", mine && "items-end")}>
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-lg",
            mine
              ? "rounded-2xl rounded-br-md bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-violet-950/50"
              : "glass-strong rounded-2xl rounded-bl-md text-slate-100",
            message.pending && "opacity-70",
          )}
        >
          {message.content}
        </div>
        <p className={cn("mt-1 px-1 text-[10px] text-slate-500", mine && "text-right")}>
          {message.pending ? "Sending…" : formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="AI Companion is typing">
      <CompanionAvatar size="sm" />
      <div className="glass-strong flex gap-1 rounded-2xl rounded-bl-md px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-primary-300"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
