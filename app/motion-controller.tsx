"use client";

import { useEffect } from "react";

type Language = "zh" | "en";

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const desktopLayout = window.matchMedia("(min-width: 721px)");
    root.classList.add("js");

    const syncViewportHeight = () => {
      if (!desktopLayout.matches) {
        root.style.removeProperty("--app-viewport-height");
        return;
      }
      root.style.setProperty(
        "--app-viewport-height",
        `${document.documentElement.clientHeight}px`,
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

    const toggleLanguage = () => {
      applyLanguage(root.dataset.lang === "en" ? "zh" : "en");
      window.requestAnimationFrame(() =>
        window.dispatchEvent(new Event("david:layout")),
      );
    };
    toggles.forEach((toggle) => toggle.addEventListener("click", toggleLanguage));

    const topFlipTitles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-top-flip]"),
    );
    const flipTargets = new Map<HTMLElement, HTMLElement[]>();
    const settleTimers: number[] = [];

    topFlipTitles.forEach((title) => {
      const bilingualTargets = Array.from(
        title.querySelectorAll<HTMLElement>("[data-flip-label]"),
      );
      const targets = bilingualTargets.length ? bilingualTargets : [title];
      flipTargets.set(title, targets);

      targets.forEach((target) => {
        const text =
          target.dataset.flipLabel ?? target.textContent?.trim() ?? "";
        target.dataset.flipLabel = text;
        target.replaceChildren();
        Array.from(text).forEach((character, index) => {
          const mask = document.createElement("span");
          const inner = document.createElement("span");
          mask.className =
            character === " "
              ? "flip-char-mask flip-char-space"
              : "flip-char-mask";
          mask.setAttribute("aria-hidden", "true");
          inner.textContent = character === " " ? "\u00a0" : character;
          inner.style.setProperty("--flip-delay", `${index * 14 + 20}ms`);
          mask.append(inner);
          target.append(mask);
        });
      });
      title.classList.add("top-flip-ready");
    });

    const magneticLines = Array.from(
      document.querySelectorAll<HTMLElement>("[data-center-magnet]"),
    );
    const magnetOffsets = [
      { x: "-72px", y: "42px", rotate: "-8deg" },
      { x: "64px", y: "-40px", rotate: "7deg" },
      { x: "-46px", y: "-54px", rotate: "-6deg" },
    ];
    magneticLines.forEach((line, lineIndex) => {
      const text = line.textContent?.trim() ?? "";
      const words = text.split(/\s+/).filter(Boolean);
      line.replaceChildren();
      words.forEach((word, wordIndex) => {
        const span = document.createElement("span");
        const offset = magnetOffsets[(lineIndex + wordIndex) % magnetOffsets.length];
        span.className = "magnet-word";
        span.textContent = word;
        span.style.setProperty("--magnet-x", offset.x);
        span.style.setProperty("--magnet-y", offset.y);
        span.style.setProperty("--magnet-rotate", offset.rotate);
        span.style.setProperty(
          "--magnet-delay",
          `${70 + lineIndex * 55 + wordIndex * 80}ms`,
        );
        line.append(span);
      });
      line.classList.add("center-magnet-ready");
    });

    if (reducedMotion) {
      magneticLines.forEach((line) =>
        line.classList.add("text-motion-entered", "motion-settled"),
      );
    } else {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          magneticLines.forEach((line) =>
            line.classList.add("text-motion-entered"),
          );
          settleTimers.push(
            window.setTimeout(() => {
              magneticLines.forEach((line) =>
                line.classList.add("motion-settled"),
              );
            }, 1180),
          );
        });
      });
    }

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-reveal-section]:not([data-reveal-repeat])",
      ),
    );
    const repeatRevealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-repeat]"),
    );
    let revealObserver: IntersectionObserver | null = null;
    let repeatRevealObserver: IntersectionObserver | null = null;
    let titleObserver: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window && !reducedMotion) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      revealTargets.forEach((target) => revealObserver?.observe(target));

      repeatRevealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      repeatRevealTargets.forEach((target) =>
        repeatRevealObserver?.observe(target),
      );

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
                flipTargets.get(title)?.forEach((target) => {
                  const label = target.dataset.flipLabel;
                  if (label) {
                    target.replaceChildren(document.createTextNode(label));
                  }
                });
                title.classList.remove("top-flip-ready");
                title.classList.add("motion-settled");
                chapter?.classList.add("motion-settled");
              }, 900),
            );
            titleObserver?.unobserve(title);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.18 },
      );
      topFlipTitles.forEach((title) => titleObserver?.observe(title));
    } else {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      repeatRevealTargets.forEach((target) =>
        target.classList.add("is-visible"),
      );
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
    const charRevealStories = Array.from(
      document.querySelectorAll<HTMLElement>("[data-char-story]"),
    );
    const featureScroll = document.querySelector<HTMLElement>("[data-feature-scroll]");
    const scrollWaveTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-wave]"),
    );
    const clamp = (value: number, minimum: number, maximum: number) =>
      Math.min(maximum, Math.max(minimum, value));
    let lastScrollY = window.scrollY;
    let waveSkew = 0;
    let pendingScrollDelta = 0;
    let scrollEffectsFrame = 0;
    const lastCharProgress = new WeakMap<HTMLElement, string>();
    let lastFeatureMediaY = "";
    let lastWaveSkew = "";

    const renderScrollEffects = () => {
      scrollEffectsFrame = 0;
      const viewportHeight = document.documentElement.clientHeight;

      // Read every layout value first, then write styles. This keeps the
      // scroll frame to one layout pass instead of alternating reads/writes.
      const charUpdates = charRevealStories.map((target) => {
        const rect = target.getBoundingClientRect();
        const progress = reducedMotion
          ? 1
          : clamp(
            (viewportHeight * 0.95 - rect.top) /
              Math.max(1, rect.height + viewportHeight * 0.6),
            0,
            1,
          );
        return { target, progress: progress.toFixed(4) };
      });

      let featureMediaY: string | null = null;
      if (featureScroll) {
        const rect = featureScroll.getBoundingClientRect();
        const progress = reducedMotion || window.innerWidth <= 720
          ? 0.5
          : clamp(
            (viewportHeight - rect.top) / Math.max(1, viewportHeight * 2),
            0,
            1,
          );
        featureMediaY = `${(-80 + progress * 160).toFixed(2)}px`;
      }

      if (!reducedMotion && window.innerWidth > 720) {
        // Wickret derives each frame directly from the current damped offset.
        // With no new delta on the following frame, the skew returns to zero
        // immediately instead of adding a second inertial tail.
        const visualTarget = clamp(pendingScrollDelta * 0.15, -5, 5);
        pendingScrollDelta = 0;
        waveSkew = visualTarget;
      } else {
        waveSkew = 0;
        pendingScrollDelta = 0;
      }

      charUpdates.forEach(({ target, progress }) => {
        if (lastCharProgress.get(target) === progress) return;
        target.style.setProperty("--char-progress", progress);
        lastCharProgress.set(target, progress);
      });

      if (
        featureScroll &&
        featureMediaY !== null &&
        lastFeatureMediaY !== featureMediaY
      ) {
        featureScroll.style.setProperty("--feature-media-y", featureMediaY);
        lastFeatureMediaY = featureMediaY;
      }

      const nextWaveSkew = `${waveSkew.toFixed(3)}deg`;
      if (lastWaveSkew !== nextWaveSkew) {
        scrollWaveTargets.forEach((target) => {
          target.style.setProperty("--scroll-wave-skew", nextWaveSkew);
        });
        lastWaveSkew = nextWaveSkew;
      }

      if (Math.abs(waveSkew) > 0.001 || Math.abs(pendingScrollDelta) > 0.001) {
        root.classList.add("scroll-wave-settling");
        scrollEffectsFrame = window.requestAnimationFrame(renderScrollEffects);
      } else {
        root.classList.remove("scroll-wave-settling");
      }
    };

    const scheduleScrollEffects = () => {
      if (scrollEffectsFrame) return;
      scrollEffectsFrame = window.requestAnimationFrame(renderScrollEffects);
    };

    const handleScrollActivity = (event: Event) => {
      const virtualDetail = (
        event as CustomEvent<{ y?: number; deltaY?: number }>
      ).detail;
      const virtualScrollY = virtualDetail?.y;
      const currentScrollY =
        typeof virtualScrollY === "number" ? virtualScrollY : window.scrollY;
      const scrollDelta =
        typeof virtualDetail?.deltaY === "number"
          ? virtualDetail.deltaY
          : currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      if (!reducedMotion && window.innerWidth > 720) {
        pendingScrollDelta = scrollDelta;
      }
      scheduleScrollEffects();
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

    scheduleScrollEffects();
    window.addEventListener("scroll", handleScrollActivity, { passive: true });
    window.addEventListener(
      "david:virtual-scroll",
      handleScrollActivity as EventListener,
    );
    window.addEventListener("david:layout", scheduleScrollEffects);
    const handleResize = () => {
      syncViewportHeight();
      if (!root.classList.contains("virtual-scroll")) {
        lastScrollY = window.scrollY;
      }
      scheduleScrollEffects();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      pointerDisposed = true;
      removePointerMotion();
      heroObserver?.disconnect();
      window.cancelAnimationFrame(scrollEffectsFrame);
      window.clearTimeout(scrollIdleTimer);
      root.classList.remove("is-scrolling", "scroll-wave-settling");
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      revealObserver?.disconnect();
      repeatRevealObserver?.disconnect();
      titleObserver?.disconnect();
      window.removeEventListener("scroll", handleScrollActivity);
      window.removeEventListener(
        "david:virtual-scroll",
        handleScrollActivity as EventListener,
      );
      window.removeEventListener("david:layout", scheduleScrollEffects);
      window.removeEventListener("resize", handleResize);
      toggles.forEach((toggle) =>
        toggle.removeEventListener("click", toggleLanguage),
      );
    };
  }, []);

  return null;
}
