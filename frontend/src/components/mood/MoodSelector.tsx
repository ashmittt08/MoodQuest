import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";
import type { Mood } from "@/types";
import { MOODS } from "@/utils/moods";

import { MoodFace } from "./MoodFace";

interface MoodSelectorProps {
  selected: Mood | null;
  saving: Mood | null;
  onSelect: (mood: Mood) => void;
  disabled?: boolean;
}

/** The six-mood check-in row from the dashboard. Selection is persisted by the parent. */
export function MoodSelector({ selected, saving, onSelect, disabled }: MoodSelectorProps) {
  return (
    <div role="radiogroup" aria-label="How are you feeling today?" className="grid grid-cols-6 gap-1 sm:gap-3">
      {MOODS.map((mood) => {
        const active = selected === mood.key;
        const isSaving = saving === mood.key;
        return (
          <button
            key={mood.key}
            role="radio"
            aria-checked={active}
            disabled={disabled || saving !== null}
            onClick={() => onSelect(mood.key)}
            className="group flex flex-col items-center gap-1.5 rounded-2xl py-1 transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:hover:translate-y-0"
          >
            <span
              className={cn(
                "relative flex size-12 items-center justify-center rounded-full border transition-all duration-300 sm:size-14",
                active ? "scale-105 border-transparent" : "border-white/10 bg-white/[0.03] group-hover:border-white/25",
              )}
              style={
                active
                  ? { background: `radial-gradient(circle, ${mood.color}55, ${mood.color}10 70%)`, boxShadow: `0 0 24px -2px ${mood.color}aa, inset 0 0 0 2px ${mood.color}` }
                  : undefined
              }
            >
              {isSaving ? (
                <LoaderCircle className="size-6 animate-spin" style={{ color: mood.color }} aria-hidden />
              ) : (
                <MoodFace mood={mood.key} filled={active} className="size-8 sm:size-9" />
              )}
            </span>
            <span className={cn("text-[11px] font-medium sm:text-xs", active ? "text-white" : "text-slate-400")}>
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
