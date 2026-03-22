import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface FilterChipProps {
  label: string;
  icon?: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export function FilterChip({ label, icon: Icon, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 active:scale-95",
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-card border border-primary/30 text-foreground hover:border-primary"
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

interface FilterChipsBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterChipsBar({ children, className }: FilterChipsBarProps) {
  return (
    <div className={cn("overflow-x-auto scrollbar-hide -mx-4 px-4", className)}>
      <div className="flex gap-2 pb-1">
        {children}
      </div>
    </div>
  );
}
