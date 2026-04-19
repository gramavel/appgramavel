import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  totalReviews: number;
  /** "pill" = como na página do estabelecimento (com fundo arredondado). "inline" = sem fundo, para usar em listas/cards */
  variant?: "pill" | "inline";
  /** Tamanho das estrelas e textos */
  size?: "sm" | "md";
  /** Texto exibido quando não há avaliações */
  emptyLabel?: string;
  /** Mostrar a palavra "avaliações" após o número */
  showReviewsLabel?: boolean;
  className?: string;
}

/**
 * Exibição global de avaliações.
 * Padrão visual: nota + 5 estrelas (primary) + (total de avaliações)
 * Mesma identidade da página do estabelecimento.
 */
export function RatingDisplay({
  rating,
  totalReviews,
  variant = "inline",
  size = "sm",
  emptyLabel = "Novo",
  showReviewsLabel = false,
  className,
}: RatingDisplayProps) {
  const hasReviews = totalReviews > 0;
  const rounded = Math.round(Number(rating));
  const starSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const numberSize = size === "md" ? "text-sm" : "text-xs";

  const wrapperClass =
    variant === "pill"
      ? "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border"
      : "inline-flex items-center gap-1.5";

  if (!hasReviews) {
    return (
      <div className={cn(wrapperClass, className)}>
        <span className="text-xs text-muted-foreground/80">{emptyLabel}</span>
      </div>
    );
  }

  const formattedRating = Number(rating).toFixed(1).replace(".", ",");
  const formattedTotal = totalReviews.toLocaleString("pt-BR");

  return (
    <div className={cn(wrapperClass, className)} aria-label={`Avaliação ${formattedRating} de 5, ${formattedTotal} avaliações`}>
      <span className={cn("font-semibold text-foreground", numberSize)}>{formattedRating}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              starSize,
              s <= rounded ? "fill-primary text-primary" : "fill-primary/30 text-primary/30"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        ({formattedTotal}{showReviewsLabel ? " avaliações" : ""})
      </span>
    </div>
  );
}
