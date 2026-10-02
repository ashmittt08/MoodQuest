import { Gamepad2, Mail, MessageCircle, Sprout, Wind } from "lucide-react";
import { Link } from "react-router-dom";

import { LotusMark } from "@/components/ui/Logo";
import { AuthLayout } from "@/layouts/AuthLayout";

const FEATURES = [
  { label: "Chat", icon: MessageCircle },
  { label: "Play", icon: Gamepad2 },
  { label: "Relax", icon: Wind },
  { label: "Grow", icon: Sprout },
];

export function WelcomePage() {
  return (
    <AuthLayout>
      <div className="flex min-h-[80dvh] flex-col items-center text-center">
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 animate-breathe rounded-full bg-primary-500/50 blur-2xl" aria-hidden />
            <LotusMark className="relative size-20 drop-shadow-[0_0_18px_rgb(167_139_250/0.8)]" />
          </div>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-gradient sm:text-6xl">MoodQuest</h1>
          <p className="mt-3 text-lg leading-snug text-slate-100">
            Your AI Companion
            <br />
            for a Happier You
          </p>
        </div>

        <div className="flex-1" />

        <ul className="mb-6 flex items-center justify-center gap-5 text-sm text-slate-100" aria-label="What you can do">
          {FEATURES.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-4 text-amber-300" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <div className="w-full space-y-3">
          <Link
            to="/register"
            className="flex h-13 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500 font-semibold text-white shadow-[0_10px_30px_-8px_rgb(168_85_247/0.9)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <Mail className="size-5" />
            Sign up with Email
          </Link>
          <Link
            to="/login"
            className="flex h-13 w-full items-center justify-center rounded-full border border-white/20 bg-ink-950/60 font-semibold text-white backdrop-blur transition hover:bg-ink-950/80 active:scale-[0.99]"
          >
            Log in
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-300">A safe space. Anytime. Anywhere.</p>
        <Link to="/emergency" className="mt-2 text-xs text-rose-300/90 underline-offset-4 hover:underline">
          Need help right now?
        </Link>
      </div>
    </AuthLayout>
  );
}
