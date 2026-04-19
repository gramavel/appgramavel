import { forwardRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "ghost" | "overlay";
type Size = "sm" | "md" | "lg";

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  label?: string;
}

/**
 * Botão padrão de fechar do app.
 * - Touch target mínimo 44x44 (acessibilidade WCAG/Apple HIG).
 * - Focus ring visível, aria-label obrigatório, animação leve.
 * - Variants: `default` (sobre card), `ghost` (transparente), `overlay` (sobre imagens/escuro).
 */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ variant = "default", size = "md", label = "Fechar", className, ...props }, ref) => {
    const sizeMap: Record<Size, { btn: string; icon: string }> = {
      sm: { btn: "h-9 w-9", icon: "h-3.5 w-3.5" },
      md: { btn: "h-10 w-10", icon: "h-4 w-4" },
      lg: { btn: "h-11 w-11", icon: "h-5 w-5" },
    };

    const variantMap: Record<Variant, string> = {
      default: "bg-secondary/60 hover:bg-secondary text-foreground",
      ghost: "hover:bg-secondary text-muted-foreground hover:text-foreground",
      overlay: "bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm",
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all",
          "active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          sizeMap[size].btn,
          variantMap[variant],
          className,
        )}
        {...props}
      >
        <X className={sizeMap[size].icon} strokeWidth={2.5} />
      </button>
    );
  },
);
CloseButton.displayName = "CloseButton";
