"use client";

import { type ReactNode, useEffect } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    root.classList.add("native-scroll");

    const scrollToHash = (
      hash: string,
      behavior: ScrollBehavior = "smooth",
    ) => {
      const id = hash.replace(/^#/, "");
      const destination = id ? document.getElementById(id) : null;
      if (!destination) return false;
      destination.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : behavior,
        block: "start",
      });
      return true;
    };

    const handleAnchor = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor || !scrollToHash(anchor.hash)) return;
      event.preventDefault();
      window.history.replaceState(null, "", anchor.hash);
    };

    const restoreInitialAnchor = () => {
      if (!window.location.hash) return;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToHash(window.location.hash, "auto");
        });
      });
    };

    document.addEventListener("click", handleAnchor);
    restoreInitialAnchor();
    void document.fonts?.ready.then(restoreInitialAnchor);

    return () => {
      root.classList.remove("native-scroll");
      document.removeEventListener("click", handleAnchor);
    };
  }, []);

  return <div className="smooth-scroll-content">{children}</div>;
}
