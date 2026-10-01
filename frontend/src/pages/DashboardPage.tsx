import { useState } from "react";
import { Link } from "react-router-dom";

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
          <p className="mt-1 text-slate-300">How are you feeling today?</p>
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

      <section aria-label="Quick Access">
        <SectionHeader title="Quick Access" />
        <QuickAccessGrid />
      </section>
    </div>
  );
}
