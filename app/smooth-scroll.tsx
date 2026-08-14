"use client";

import { type ReactNode, useEffect, useRef } from "react";
import type { Scrollbar as ScrollbarInstance } from "smooth-scrollbar/scrollbar";
import type { ScrollRuntimeReadyDetail } from "./scroll-runtime-events";

type VirtualScrollStatus = {
  offset: { x: number; y: number };
};

export function SmoothScroll({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const compactLayout = window.matchMedia("(max-width: 720px)");
    const coarsePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    );
    const navigatorWithHints = navigator as Navigator & {
      userAgentData?: { mobile?: boolean };
    };
    const mobileUserAgent =
      navigatorWithHints.userAgentData?.mobile === true ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const useNativeScroll =
      reducedMotion.matches ||
      compactLayout.matches ||
      coarsePointer.matches ||
      mobileUserAgent;
    const container = containerRef.current;
    let scrollbar: ScrollbarInstance | null = null;
    let disposed = false;
    const virtualScrollListeners = new Set<(y: number) => void>();

    const dispatchRuntimeReady = (detail: ScrollRuntimeReadyDetail) => {
      window.__davidScrollRuntimeReady = detail;
      window.dispatchEvent(
        new CustomEvent<ScrollRuntimeReadyDetail>("david:scroll-ready", {
          detail,
        }),
      );
    };

    const handleVirtualScroll = (status: VirtualScrollStatus) => {
      virtualScrollListeners.forEach((listener) =>
        listener(status.offset.y),
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
          if (!scrollToHash(window.location.hash, "auto")) return;
          // The virtual offset changes after ScrollMagic has measured its
          // scenes. Re-measure from the restored position so repeatable
          // reveals (especially Article) cannot inherit stale document bounds.
          window.requestAnimationFrame(() =>
            window.dispatchEvent(new Event("david:layout")),
          );
        });
      });
    };

    document.addEventListener("click", handleAnchor);

    const initialize = async () => {
      // Wickret measures one transformed scroll surface. Wait until the
      // self-hosted faces have settled so the virtual limit is never built
      // from fallback-font line breaks and corrected a frame later.
      await document.fonts?.ready;
      if (disposed) return;

      if (!container || useNativeScroll) {
        root.classList.add("native-scroll");
        if (container) {
          dispatchRuntimeReady({
            mode: "native",
            container,
            getScrollY: () => window.scrollY,
          });
        }
        restoreInitialAnchor();
        void document.fonts?.ready.then(restoreInitialAnchor);
        return;
      }

      const { default: Scrollbar } = await import("smooth-scrollbar");
      if (disposed) return;

      scrollbar = Scrollbar.init(container, {
        // Wickret's actual runtime overrides. Its bundled library defaults
        // are different, but the live site uses these values.
        damping: 0.06,
        renderByPixels: false,
        continuousScrolling: false,
        alwaysShowTracks: false,
        delegateTo: container,
      });
      scrollbar.addListener(handleVirtualScroll);
      root.classList.remove("native-scroll");
      root.classList.add("virtual-scroll");
      dispatchRuntimeReady({
        mode: "virtual",
        container,
        getScrollY: () => scrollbar?.offset.y ?? 0,
        subscribe: (listener) => {
          virtualScrollListeners.add(listener);
          return () => virtualScrollListeners.delete(listener);
        },
      });
      restoreInitialAnchor();
      window.dispatchEvent(new Event("david:layout"));
    };

    void initialize();

    return () => {
      disposed = true;
      scrollbar?.removeListener(handleVirtualScroll);
      scrollbar?.destroy();
      scrollbar = null;
      virtualScrollListeners.clear();
      delete window.__davidScrollRuntimeReady;
      root.classList.remove("native-scroll", "virtual-scroll");
      document.removeEventListener("click", handleAnchor);
    };
  }, []);

  return <div className="smooth-scroll-content" ref={containerRef}>{children}</div>;
}
