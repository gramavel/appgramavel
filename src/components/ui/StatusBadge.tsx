import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

type StatusVariant = "success" | "warning" | "info" | "destructive" | "default";

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  destructive: "bg-destructive/10 text-destructive",
  default: "bg-primary/10 text-primary",
};

interface StatusBadgeProps {
  variant?: StatusVariant;
  icon?: ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant = "default", icon: Icon, children, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border-0", variantStyles[variant], className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
