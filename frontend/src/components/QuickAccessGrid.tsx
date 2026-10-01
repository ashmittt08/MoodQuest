import { Clapperboard, Dumbbell, Flower2, Gamepad2, MessageCircle, Music, NotebookPen, Phone, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Tile {
  to: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const TILES: Tile[] = [
  { to: "/chat", label: "Chat with AI", icon: MessageCircle, color: "#6366f1" },
  { to: "/music", label: "Music", icon: Music, color: "#f43f5e" },
  { to: "/games", label: "Mini Games", icon: Gamepad2, color: "#14b8a6" },
  { to: "/meditation", label: "Meditation", icon: Flower2, color: "#a855f7" },
  { to: "/movies", label: "Movies", icon: Clapperboard, color: "#3b82f6" },
  { to: "/meditation?tab=yoga", label: "Exercises", icon: Dumbbell, color: "#06b6d4" },
  { to: "/journal", label: "Journal", icon: NotebookPen, color: "#f59e0b" },
  { to: "/emergency", label: "Emergency", icon: Phone, color: "#ef4444" },
];

export function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
      {TILES.map(({ to, label, icon: Icon, color }, index) => (
        <Link
          key={label}
          to={to}
          style={{
            background: `linear-gradient(160deg, ${color}38, ${color}10 70%)`,
            borderColor: `${color}40`,
            animationDelay: `${index * 30}ms`,
          }}
          className="group flex aspect-[0.92] animate-slide-up flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_var(--tile)] sm:aspect-[1.15]"
        >
          <span
            className="flex size-11 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-200 group-hover:scale-110 sm:size-12"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, boxShadow: `0 6px 20px -6px ${color}` }}
          >
            <Icon className="size-5.5" aria-hidden />
          </span>
          <span className="text-[11px] leading-tight font-medium text-slate-100 sm:text-sm">{label}</span>
        </Link>
      ))}
    </div>
  );
}
