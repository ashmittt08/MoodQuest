import { LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";

import { EXPLORE_NAV, PRIMARY_NAV, type NavItem } from "./navItems";

function SideLink({ item, danger }: { item: NavItem; danger?: boolean }) {
  const { to, label, icon: Icon } = item;
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary-500/25 to-indigo-500/10 text-white shadow-[inset_0_0_0_1px_rgb(167_139_250/0.3),0_0_24px_-8px_rgb(139_92_246/0.8)]"
            : danger
              ? "text-rose-300 hover:bg-rose-500/10"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
        )
      }
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </NavLink>
  );
}

export function SideNav() {
  const { user, logout } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-ink-900/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link to="/" className="mb-8 px-2">
        <Logo />
      </Link>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {PRIMARY_NAV.map((item) => (
          <SideLink key={item.to} item={item} />
        ))}
        <p className="mt-6 mb-2 px-3.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Explore</p>
        {EXPLORE_NAV.map((item) => (
          <SideLink key={item.to} item={item} danger={item.to === "/emergency"} />
        ))}
      </nav>
      {user && (
        <div className="glass mt-4 flex items-center gap-3 p-3">
          <Avatar name={user.name} src={user.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={() => void logout()}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
