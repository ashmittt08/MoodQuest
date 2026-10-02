import { NavLink } from "react-router-dom";

import { cn } from "@/lib/cn";

import { PRIMARY_NAV } from "./navItems";

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-ink-900/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5 px-2">
        {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary-300" : "text-slate-400 hover:text-slate-200",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute top-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-400 to-cyan-300 transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                      isActive && "bg-primary-500/20 shadow-[0_0_20px_-2px_rgb(139_92_246/0.7)]",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
