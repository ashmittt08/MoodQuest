import { Flame, Leaf } from "lucide-react";

import { Skeleton } from "@/components/ui/States";
import type { MoodLog, Streak } from "@/types";
import { timeAgo } from "@/utils/date";
import { moodMeta } from "@/utils/moods";

import { MoodFace } from "./MoodFace";

export function CurrentMoodCard({ latest, loading }: { latest: MoodLog | null; loading: boolean }) {
  if (loading) return <Skeleton className="h-32" />;
  const meta = moodMeta(latest?.mood);

  return (
    <div
      className="glass relative h-full overflow-hidden p-4 sm:p-5"
      style={meta ? { background: `linear-gradient(135deg, ${meta.color}26, rgb(11 17 41 / 0.75) 65%)` } : undefined}
    >
      {meta && latest ? (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full blur-xl" style={{ background: `${meta.color}66` }} aria-hidden />
            <MoodFace mood={latest.mood} filled className="relative size-14" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-300">Current Mood</p>
            <p className="text-2xl font-bold text-white">{meta.label}</p>
            <p className="text-xs text-slate-300">{meta.message}</p>
            <p className="mt-1 text-[11px] text-slate-500">Checked in {timeAgo(latest.created_at)}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
            <Leaf className="size-7" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-white">How are you feeling today?</p>
            <p className="text-sm text-slate-400">Add your first mood check-in above.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function StreakCard({ streak, loading }: { streak: Streak | null; loading: boolean }) {
  if (loading) return <Skeleton className="h-32" />;
  const days = streak?.current ?? 0;

  return (
    <div className="glass flex h-full flex-col justify-between p-4 sm:p-5">
      <p className="text-xs text-slate-300">Streak</p>
      <div className="my-1 flex items-center gap-2">
        <Flame
          className={days > 0 ? "size-8 text-orange-400 drop-shadow-[0_0_10px_rgb(251_146_60/0.7)]" : "size-8 text-slate-600"}
          aria-hidden
        />
        <p className="text-2xl font-bold text-white">
          {days} <span className="text-base font-semibold">{days === 1 ? "day" : "days"}</span>
        </p>
      </div>
      <p className="text-xs text-slate-400">
        {days === 0
          ? "Check in today to start a streak"
          : streak?.active_today
            ? "Keep going!"
            : "Check in today to keep it alive"}
      </p>
    </div>
  );
}
