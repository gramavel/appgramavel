import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

export function useScrollRestore() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Restore scroll position for this route
    const saved = scrollPositions.get(pathname);
    if (saved !== undefined) {
      window.scrollTo(0, saved);
    } else {
      window.scrollTo(0, 0);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      scrollPositions.set(pathname, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      // Save final position before unmount
      scrollPositions.set(pathname, window.scrollY);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);
}
