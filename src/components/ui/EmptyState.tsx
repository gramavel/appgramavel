import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mb-4 shadow-sm shadow-secondary/20">
        <Icon className="w-10 h-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[240px] mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full px-8">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
