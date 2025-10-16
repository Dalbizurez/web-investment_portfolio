import { useState, useEffect } from "react";

interface UseCarouselReturn {
  currentIndex: number;
  nextItem: () => void;
  prevItem: () => void;
  goToItem: (index: number) => void;
}

export default function useCarousel(totalItems: number, autoPlayDelay: number = 5000): UseCarouselReturn {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const nextItem = () => {
    setCurrentIndex(prev => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const prevItem = () => {
    setCurrentIndex(prev => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const goToItem = (index: number) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  };

  // Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      nextItem();
    }, autoPlayDelay);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlayDelay]);

  return { currentIndex, nextItem, prevItem, goToItem };
}
