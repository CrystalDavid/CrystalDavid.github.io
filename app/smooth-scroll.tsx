"use client";

import { type ReactNode, useEffect, useRef } from "react";

const STORAGE_EPSILON = 0.08;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const content = contentRef.current;
    if (!content) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const desktop = window.matchMedia("(min-width: 901px) and (pointer: fine)");

    let enabled = false;
    let current = window.scrollY;
    let target = current;
    let frame = 0;

    const measure = () => {
      if (!enabled) return;
      document.body.style.height = `${Math.ceil(content.scrollHeight)}px`;
    };

    const render = () => {
      frame = 0;
      const difference = target - current;
      current += difference * 0.16;

      if (Math.abs(difference) <= STORAGE_EPSILON) {
        current = target;
      }

      content.style.transform = `translate3d(0, ${-current}px, 0)`;
      root.style.setProperty("--smooth-scroll-y", `${current}px`);

      if (current !== target) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const requestRender = () => {
      if (!enabled) return;
      target = window.scrollY;
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      current = window.scrollY;
      target = current;
      root.classList.add("smooth-scroll-enabled");
      measure();
      content.style.transform = `translate3d(0, ${-current}px, 0)`;
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      root.classList.remove("smooth-scroll-enabled");
      root.style.removeProperty("--smooth-scroll-y");
      document.body.style.removeProperty("height");
      content.style.removeProperty("transform");
    };

    const syncMode = () => {
      if (desktop.matches && !reducedMotion.matches) enable();
      else disable();
    };

    const handleAnchor = (event: MouseEvent) => {
      if (!enabled) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const id = anchor.hash.slice(1);
      const destination = id ? document.getElementById(id) : null;
      if (!destination) return;

      event.preventDefault();
      const y = destination.getBoundingClientRect().top + current;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.replaceState(null, "", anchor.hash);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      requestRender();
    });
    resizeObserver.observe(content);

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", syncMode, { passive: true });
    document.addEventListener("click", handleAnchor);
    desktop.addEventListener("change", syncMode);
    reducedMotion.addEventListener("change", syncMode);
    document.fonts?.ready.then(measure);
    syncMode();

    return () => {
      disable();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", syncMode);
      document.removeEventListener("click", handleAnchor);
      desktop.removeEventListener("change", syncMode);
      reducedMotion.removeEventListener("change", syncMode);
    };
  }, []);

  return (
    <div className="smooth-scroll-content" ref={contentRef}>
      {children}
    </div>
  );
}
