import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AgeScrollPickerProps {
  value: number | null;
  onChange: (age: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

const ITEM_HEIGHT = 40;

export function AgeScrollPicker({ value, onChange, min = 13, max = 99, disabled = false, className }: AgeScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ages = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (value !== null && value >= min && value <= max) return value - min;
    return 12; // default ~25
  });

  // Scroll to selected on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = selectedIndex * ITEM_HEIGHT;
  }, []);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, ages.length - 1));
    if (clamped !== selectedIndex) {
      setSelectedIndex(clamped);
      onChange(ages[clamped]);
    }
  }

  function snapTo(idx: number) {
    const el = containerRef.current;
    if (!el || disabled) return;
    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
  }

  return (
    <div className={cn("relative h-[120px] w-full overflow-hidden rounded-lg border border-border bg-background", disabled && "opacity-50 pointer-events-none", className)}>
      {/* Selection highlight */}
      <div className="absolute top-[40px] left-0 right-0 h-[40px] bg-primary/10 border-y border-primary/20 pointer-events-none z-10" />
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory", paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}
      >
        {ages.map((age, idx) => (
          <div
            key={age}
            onClick={() => snapTo(idx)}
            className={cn(
              "h-[40px] flex items-center justify-center cursor-pointer transition-all snap-center select-none",
              idx === selectedIndex
                ? "text-foreground font-bold text-lg"
                : "text-muted-foreground text-sm"
            )}
            style={{ scrollSnapAlign: "center" }}
          >
            {age} anos
          </div>
        ))}
      </div>
    </div>
  );
}
