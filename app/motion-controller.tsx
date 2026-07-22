"use client";

import { useEffect } from "react";

type Language = "zh" | "en";

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    root.classList.add("js");

    const syncViewportHeight = () => {
      root.style.setProperty(
        "--app-viewport-height",
        `${Math.ceil(window.visualViewport?.height ?? window.innerHeight)}px`,
      );
    };
    syncViewportHeight();

    const toggles = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-lang-toggle]"),
    );
    const applyLanguage = (language: Language) => {
      root.dataset.lang = language;
      root.lang = language === "zh" ? "zh-CN" : "en";
      try {
        window.localStorage.setItem("david-site-language-v2", language);
      } catch {
        // Storage is an enhancement, not a requirement.
      }
    };

    let preferred: Language = "en";
    try {
      preferred =
        window.localStorage.getItem("david-site-language-v2") === "zh"
          ? "zh"
          : "en";
    } catch {
      preferred = "en";
    }
    applyLanguage(preferred);

    const toggleLanguage = () =>
      applyLanguage(root.dataset.lang === "en" ? "zh" : "en");
    toggles.forEach((toggle) => toggle.addEventListener("click", toggleLanguage));

    const topFlipTitles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-top-flip]"),
    );
    topFlipTitles.forEach((title) => {
      const text = title.textContent?.trim() ?? "";
      title.setAttribute("aria-label", text);
      title.replaceChildren();
      Array.from(text).forEach((character, index) => {
        const mask = document.createElement("span");
        const inner = document.createElement("span");
        mask.className =
          character === " " ? "flip-char-mask flip-char-space" : "flip-char-mask";
        mask.setAttribute("aria-hidden", "true");
        inner.textContent = character === " " ? "\u00a0" : character;
        inner.style.setProperty("--flip-delay", `${index * 14 + 20}ms`);
        mask.append(inner);
        title.append(mask);
      });
      title.classList.add("top-flip-ready");
    });

    const magneticLines = Array.from(
      document.querySelectorAll<HTMLElement>("[data-center-magnet]"),
    );
    magneticLines.forEach((line) => line.classList.add("text-motion-entered"));

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-section]"),
    );
    let revealObserver: IntersectionObserver | null = null;
    let titleObserver: IntersectionObserver | null = null;
    const settleTimers: number[] = [];

    if ("IntersectionObserver" in window && !reducedMotion) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "42% 0px 42%", threshold: 0.001 },
      );
      revealTargets.forEach((target) => revealObserver?.observe(target));

      titleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const title = entry.target as HTMLElement;
            const chapter = title.closest<HTMLElement>(".chapter-screen");
            title.classList.add("text-motion-entered");
            chapter?.classList.add("title-motion-entered");

            settleTimers.push(
              window.setTimeout(() => {
                const label = title.getAttribute("aria-label");
                if (label) title.replaceChildren(document.createTextNode(label));
                title.classList.remove("top-flip-ready");
                title.classList.add("motion-settled");
                chapter?.classList.add("motion-settled");
              }, 900),
            );
            titleObserver?.unobserve(title);
          });
        },
        { rootMargin: "46% 0px 46%", threshold: 0.001 },
      );
      topFlipTitles.forEach((title) => titleObserver?.observe(title));
    } else {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      topFlipTitles.forEach((title) => title.classList.add("text-motion-entered"));
    }

    const pointerPanels = Array.from(
      document.querySelectorAll<HTMLElement>("[data-wickret-pointer]"),
    );
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let pointerDisposed = false;
    let removePointerMotion = () => {};
    let resetPointerMotion = () => {};
    let scrolling = false;
    let scrollIdleTimer = 0;

    const handleScrollActivity = () => {
      scrolling = true;
      root.classList.add("is-scrolling");
      resetPointerMotion();
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        scrolling = false;
        root.classList.remove("is-scrolling");
      }, 160);
    };

    if (!reducedMotion && finePointer && pointerPanels.length) {
      void import("gsap").then(({ gsap }) => {
        if (pointerDisposed) return;
        const cleanups: Array<() => void> = [];
        const resets: Array<() => void> = [];

        pointerPanels.forEach((panel) => {
          const title = panel.querySelector<HTMLElement>(".chapter-title");
          const orbit = panel.querySelector<HTMLElement>(".chapter-orbit");
          if (!title) return;

          const titleX = gsap.quickTo(title, "x", {
            duration: 0.5,
            ease: "power2.out",
          });
          const titleY = gsap.quickTo(title, "y", {
            duration: 0.5,
            ease: "power2.out",
          });
          const titleRotateY = gsap.quickTo(title, "rotationY", {
            duration: 0.5,
            ease: "power2.out",
          });
          const orbitX = orbit
            ? gsap.quickTo(orbit, "x", { duration: 0.5, ease: "power2.out" })
            : null;
          const orbitY = orbit
            ? gsap.quickTo(orbit, "y", { duration: 0.5, ease: "power2.out" })
            : null;
          let settleTimer = 0;

          const reset = () => {
            titleX(0);
            titleY(0);
            titleRotateY(0);
            orbitX?.(0);
            orbitY?.(0);
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(() => {
              panel.classList.remove("pointer-active");
            }, 560);
          };

          const move = (event: PointerEvent) => {
            if (scrolling) return;
            const rect = panel.getBoundingClientRect();
            const x = 2 * ((event.clientX - rect.left) / rect.width - 0.5);
            const y = 2 * ((event.clientY - rect.top) / rect.height - 0.5);
            panel.classList.add("pointer-active");
            window.clearTimeout(settleTimer);

            // Wickret's envelope motion: the body moves opposite the pointer
            // inside a shallow 3D perspective, while surrounding marks travel
            // slightly farther. rotationY creates the perceived left/right
            // size change without reflowing or scaling individual glyphs.
            titleX(-20 * x);
            titleY(-10 * y);
            titleRotateY(2 * x);
            orbitX?.(-30 * x);
            orbitY?.(-20 * y);
          };

          panel.addEventListener("pointermove", move, { passive: true });
          panel.addEventListener("pointerleave", reset, { passive: true });
          panel.addEventListener("pointercancel", reset, { passive: true });
          resets.push(reset);
          cleanups.push(() => {
            panel.removeEventListener("pointermove", move);
            panel.removeEventListener("pointerleave", reset);
            panel.removeEventListener("pointercancel", reset);
            window.clearTimeout(settleTimer);
            gsap.killTweensOf(orbit ? [title, orbit] : title);
          });
        });

        resetPointerMotion = () => resets.forEach((reset) => reset());
        removePointerMotion = () => cleanups.forEach((cleanup) => cleanup());
      });
    }

    const hero = document.querySelector<HTMLElement>(".hero-screen");
    let heroObserver: IntersectionObserver | null = null;
    if (hero && "IntersectionObserver" in window && !reducedMotion) {
      heroObserver = new IntersectionObserver(
        ([entry]) => hero.classList.toggle("motion-active", entry.isIntersecting),
        { threshold: 0.02 },
      );
      heroObserver.observe(hero);
    } else {
      hero?.classList.add("motion-active");
    }

    window.addEventListener("scroll", handleScrollActivity, { passive: true });
    window.addEventListener("resize", syncViewportHeight, { passive: true });
    window.visualViewport?.addEventListener("resize", syncViewportHeight);

    return () => {
      pointerDisposed = true;
      removePointerMotion();
      heroObserver?.disconnect();
      window.clearTimeout(scrollIdleTimer);
      root.classList.remove("is-scrolling");
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      revealObserver?.disconnect();
      titleObserver?.disconnect();
      window.removeEventListener("scroll", handleScrollActivity);
      window.removeEventListener("resize", syncViewportHeight);
      window.visualViewport?.removeEventListener("resize", syncViewportHeight);
      toggles.forEach((toggle) =>
        toggle.removeEventListener("click", toggleLanguage),
      );
    };
  }, []);

  return null;
}
