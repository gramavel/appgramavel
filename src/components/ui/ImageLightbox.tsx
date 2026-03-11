import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  titles?: string[];
  captions?: string[];
}

export default function ImageLightbox({ images, initialIndex = 0, open, onClose, titles, captions }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, currentIndex]);

  const prev = useCallback(() => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0)), [images.length]);

  if (!open || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center w-full px-12"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
          }
          setTouchStart(null);
        }}
      >
        <img
          src={images[currentIndex]}
          alt={titles?.[currentIndex] || `Imagem ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>

      {/* Caption card */}
      {(titles?.[currentIndex] || captions?.[currentIndex]) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 max-w-sm text-center">
          {titles?.[currentIndex] && <p className="text-white font-semibold text-sm">{titles[currentIndex]}</p>}
          {captions?.[currentIndex] && <p className="text-white/70 text-xs mt-0.5">{captions[currentIndex]}</p>}
        </div>
      )}

      {/* Dots */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-white w-4" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
