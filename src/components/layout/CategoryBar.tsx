import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/data/mock";
import { cn } from "@/lib/utils";

interface CategoryBarProps {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastScrollY.current || y < 64);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-14 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/50 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}
    >
      <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-hide -mx-0">
        <div className="flex gap-2 px-4 py-2.5">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
              selected === null
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-primary/30 text-foreground hover:border-primary"
            )}
          >
            Todos
          </button>
          {CATEGORIES.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => onSelect(selected === label ? null : label)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                selected === label
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-primary/30 text-foreground hover:border-primary"
              )}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
