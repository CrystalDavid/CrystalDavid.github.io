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
    let revealObserver: IntersectionObserver | null = null;
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
      topFlipTitles.forEach((title) => title.classList.add("text-motion-entered"));
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

    const handleResize = () => {
      syncViewportHeight();
      window.dispatchEvent(new Event("david:layout"));
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      heroObserver?.disconnect();
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      revealObserver?.disconnect();
      titleObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      toggles.forEach((toggle) =>
        toggle.removeEventListener("click", toggleLanguage),
      );
    };
  }, []);

  return null;
}
