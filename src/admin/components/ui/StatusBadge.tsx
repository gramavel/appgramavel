import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant = "success" | "destructive" | "warning" | "info" | "muted";

const STYLES: Record<Variant, string> = {
  success: "bg-success/10 text-success border-success/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-muted text-muted-foreground border-muted",
};

interface Props {
  label: string;
  variant: Variant;
  className?: string;
}

export function StatusBadge({ label, variant, className }: Props) {
  return (
    <Badge variant="outline" className={cn("font-medium", STYLES[variant], className)}>
      {label}
    </Badge>
  );
}
