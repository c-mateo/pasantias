import React, { useState, useEffect } from "react";

export function useIntersectionObserver<T extends HTMLElement>(ref: React.RefObject<T | null>, onVisible: () => void, options: IntersectionObserverInit = {}): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref?.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onVisible();
      }
      setIsVisible(entry.isIntersecting);
    }, options);

    const el = ref.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, [ref, options, onVisible]);

  return isVisible;
}
