"use client";

import { useEffect } from "react";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function ArticleScrollRuntime() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const compactLayout = window.matchMedia("(max-width: 720px)").matches;
    const coarsePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    const mobileUserAgent =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (reducedMotion || compactLayout || coarsePointer || mobileUserAgent) {
      return;
    }

    const root = document.documentElement;
    let currentY = window.scrollY;
    let targetY = currentY;
    let frame = 0;
    let previousTime = 0;

    const maximumScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      currentY = window.scrollY;
      targetY = currentY;
      root.classList.remove("article-scroll-active");
    };

    const render = (time: number) => {
      const elapsed = previousTime
        ? Math.min(32, Math.max(8, time - previousTime))
        : 16.667;
      previousTime = time;
      // Match Wickret's 0.06 damping, but move the native document scroll
      // position instead of transforming the long article container.
      const response = 1 - Math.pow(0.94, elapsed / 16.667);
      currentY += (targetY - currentY) * response;

      if (Math.abs(targetY - currentY) <= 0.2) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        frame = 0;
        previousTime = 0;
        root.classList.remove("article-scroll-active");
        return;
      }

      window.scrollTo(0, currentY);
      frame = window.requestAnimationFrame(render);
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        event.deltaY === 0
      ) {
        return;
      }

      event.preventDefault();
      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const delta = event.deltaY * multiplier;
      if (!frame) {
        currentY = window.scrollY;
        targetY = currentY;
      }
      targetY = clamp(targetY + delta, 0, maximumScroll());
      root.classList.add("article-scroll-active");
      if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const handleNativeScroll = () => {
      if (frame) return;
      currentY = window.scrollY;
      targetY = currentY;
    };
    const handleResize = () => {
      targetY = clamp(targetY, 0, maximumScroll());
      currentY = clamp(currentY, 0, maximumScroll());
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("keydown", stop, { passive: true });
    window.addEventListener("pointerdown", stop, { passive: true });

    return () => {
      stop();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleNativeScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
    };
  }, []);

  return null;
}
