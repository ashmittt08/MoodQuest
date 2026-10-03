import { ScanFace } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { HomeChatCard } from "@/components/chat/HomeChatCard";
import { MoodCards } from "@/components/mood/MoodCardsRow";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { NotificationBell } from "@/components/NotificationBell";
import { QuickAccessGrid } from "@/components/QuickAccessGrid";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ErrorState } from "@/components/ui/States";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync } from "@/hooks/useAsync";
import { getErrorMessage } from "@/lib/api";
import { moodService } from "@/services/moodService";
import type { Mood } from "@/types";
import { firstName, greetingFor } from "@/utils/date";
import { MOOD_BY_KEY } from "@/utils/moods";

export function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const stats = useAsync(() => moodService.getMoodStats(7), []);
  const [saving, setSaving] = useState<Mood | null>(null);

  const selected = stats.data?.today_logged ? (stats.data.latest?.mood ?? null) : null;

  async function handleSelect(mood: Mood) {
    setSaving(mood);
    try {
      await moodService.logMood(mood);
      await stats.reload();
      toast.success(`Mood saved: ${MOOD_BY_KEY[mood].label}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save your mood. Please try again."));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex items-center justify-between">
        <Link to="/" className="lg:hidden">
          <Logo />
        </Link>
        <span className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <Link
            to="/emotion"
            aria-label="Emotion detection"
            title="Emotion detection"
            className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-primary-500 to-fuchsia-500 text-white shadow-[0_0_18px_-2px_rgb(139_92_246/0.9)] transition hover:scale-105 hover:brightness-110"
          >
            <ScanFace className="size-5" />
          </Link>
          <NotificationBell stats={stats.data} />
          <Link to="/profile" aria-label="Your profile">
            <Avatar name={user?.name ?? ""} src={user?.avatar_url} size="sm" />
          </Link>
        </div>
      </header>

      <section aria-labelledby="greeting" className="space-y-5">
        <div>
          <p className="text-xl text-slate-200 sm:text-2xl">{greetingFor()},</p>
          <h1 id="greeting" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {firstName(user?.name)} <span aria-hidden>👋</span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-slate-300">How are you feeling today?</p>
            <Link
              to="/emotion"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/40 bg-primary-500/15 px-3 py-1 text-xs font-medium text-primary-200 transition hover:border-primary-300/60 hover:bg-primary-500/25 hover:text-white"
            >
              <ScanFace className="size-3.5" aria-hidden />
              Detect with camera
            </Link>
          </div>
        </div>
        <MoodSelector selected={selected} saving={saving} onSelect={handleSelect} disabled={stats.loading && !stats.data} />
      </section>

      {stats.error && !stats.data ? (
        <div className="glass">
          <ErrorState message={stats.error} onRetry={stats.reload} />
        </div>
      ) : (
        <MoodCards stats={stats.data} loading={stats.loading && !stats.data} />
      )}

      <HomeChatCard />

      <section aria-label="Quick Access">
        <SectionHeader title="Quick Access" />
        <QuickAccessGrid />
      </section>
    </div>
  );
}
