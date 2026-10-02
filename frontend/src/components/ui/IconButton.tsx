import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  tone?: "default" | "primary" | "danger";
}

const TONES = {
  default: "glass-strong text-slate-200 hover:text-white hover:border-white/20",
  primary: "bg-gradient-to-br from-primary-500 to-indigo-500 text-white shadow-lg shadow-violet-900/40 hover:brightness-110",
  danger: "bg-rose-500/15 text-rose-300 border border-rose-400/30 hover:bg-rose-500/25",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, tone = "default", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
