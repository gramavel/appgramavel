import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface SectionHeadingProps {
  icon?: ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ icon: Icon, children, className }: SectionHeadingProps) {
  return (
    <p className={cn("text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5", className)}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </p>
  );
}
