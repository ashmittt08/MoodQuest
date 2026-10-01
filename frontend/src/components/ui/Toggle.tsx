import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-center justify-between gap-4 py-2", disabled && "opacity-60")}>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {description && <span className="block text-xs text-slate-400">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200",
          checked ? "border-primary-400/50 bg-gradient-to-r from-primary-500 to-indigo-500" : "border-white/10 bg-white/10",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5.5 rounded-full bg-white shadow transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </button>
    </label>
  );
}
