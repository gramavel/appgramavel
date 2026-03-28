import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/data/mock";
import { cn } from "@/lib/utils";
import { FilterChip } from "@/components/ui/FilterChips";

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
      <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2.5">
          <FilterChip
            label="Todos"
            active={selected === null}
            onClick={() => onSelect(null)}
          />
          {CATEGORIES.map(({ label, icon }) => (
            <FilterChip
              key={label}
              label={label}
              icon={icon}
              active={selected === label}
              onClick={() => onSelect(selected === label ? null : label)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
