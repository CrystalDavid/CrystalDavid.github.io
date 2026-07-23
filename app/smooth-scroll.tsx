"use client";

import { type ReactNode, useEffect, useRef } from "react";
import type { Scrollbar as ScrollbarInstance } from "smooth-scrollbar/scrollbar";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const desktop = window.matchMedia("(min-width: 721px)");
    const container = containerRef.current;
    let scrollbar: ScrollbarInstance | null = null;
    let disposed = false;

    const dispatchVirtualScroll = (y: number) => {
      window.dispatchEvent(
        new CustomEvent("david:virtual-scroll", { detail: { y } }),
      );
    };

    const scrollToHash = (
      hash: string,
      behavior: ScrollBehavior = "smooth",
    ) => {
      const id = hash.replace(/^#/, "");
      const destination = id ? document.getElementById(id) : null;
      if (!destination) return false;
      if (scrollbar) {
        const target =
          destination.getBoundingClientRect().top + scrollbar.offset.y;
        scrollbar.scrollTo(
          0,
          target,
          reducedMotion.matches || behavior === "auto" ? 0 : 650,
        );
      } else {
        destination.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : behavior,
          block: "start",
        });
      }
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

    const initialize = async () => {
      if (!container || reducedMotion.matches || !desktop.matches) {
        root.classList.add("native-scroll");
        restoreInitialAnchor();
        void document.fonts?.ready.then(restoreInitialAnchor);
        return;
      }

      const { default: Scrollbar } = await import("smooth-scrollbar");
      if (disposed) return;

      scrollbar = Scrollbar.init(container, {
        damping: 0.1,
        renderByPixels: true,
        continuousScrolling: true,
        alwaysShowTracks: false,
      });
      const handleVirtualScroll = (status: { offset: { y: number } }) => {
        dispatchVirtualScroll(status.offset.y);
      };
      scrollbar.addListener(handleVirtualScroll);
      root.classList.remove("native-scroll");
      root.classList.add("virtual-scroll");
      dispatchVirtualScroll(scrollbar.offset.y);
      restoreInitialAnchor();

      void document.fonts?.ready.then(() => {
        if (!scrollbar || disposed) return;
        scrollbar.update();
        restoreInitialAnchor();
      });
    };

    void initialize();

    return () => {
      disposed = true;
      scrollbar?.destroy();
      scrollbar = null;
      root.classList.remove("native-scroll", "virtual-scroll");
      document.removeEventListener("click", handleAnchor);
    };
  }, []);

  return <div className="smooth-scroll-content" ref={containerRef}>{children}</div>;
}
