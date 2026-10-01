import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary-500 via-violet-500 to-indigo-500 text-white shadow-[0_8px_24px_-8px_rgb(139_92_246/0.8)] hover:brightness-110 hover:shadow-[0_10px_30px_-6px_rgb(139_92_246/0.9)]",
  secondary: "glass-strong text-slate-100 hover:border-white/20 hover:bg-white/5",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  danger:
    "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_8px_24px_-8px_rgb(244_63_94/0.8)] hover:brightness-110",
  outline: "border border-white/15 bg-white/[0.02] text-slate-100 hover:border-white/30 hover:bg-white/5",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-2xl",
  lg: "h-13 px-6 text-base gap-2.5 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, fullWidth, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});
