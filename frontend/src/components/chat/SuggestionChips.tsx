import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/cn";

const SUGGESTION_ROUTES: Record<string, string> = {
  "Open emergency help": "/emergency",
  "Try a breathing exercise": "/meditation?tab=breathing",
  "Start box breathing": "/meditation?tab=breathing",
  "Sleep meditation": "/meditation?tab=mindfulness",
  "Play calming music": "/music",
  "Play Lo-Fi Chill": "/music",
  "Play calm piano": "/music",
  "Play Stress Burst": "/games",
  "Play a relaxing game": "/games",
  "Play a fun game": "/games",
  "Play a focus game": "/games",
  "Write in my journal": "/journal",
  "Suggest a comfort movie": "/movies",
};

interface SuggestionChipsProps {
  suggestions: string[];
  onSend: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SuggestionChips({ suggestions, onSend, disabled, className }: SuggestionChipsProps) {
  const navigate = useNavigate();
  if (!suggestions.length) return null;
  return (
    <div className={cn("scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1", className)} aria-label="Suggested prompts">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => {
            const route = SUGGESTION_ROUTES[text];
            if (route) navigate(route);
            else onSend(text);
          }}
          disabled={disabled}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-primary-400/40 hover:bg-primary-500/10 disabled:opacity-50"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
