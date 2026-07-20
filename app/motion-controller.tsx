"use client";

import { useEffect } from "react";

type Language = "zh" | "en";

type MagneticLine = {
  element: HTMLElement;
  words: HTMLElement[];
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    root.classList.add("js");

    const syncViewportHeight = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty(
        "--app-viewport-height",
        `${Math.ceil(viewportHeight)}px`,
      );
    };
    syncViewportHeight();

    const toggles = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-lang-toggle]"),
    );

    const applyLanguage = (language: Language) => {
      root.dataset.lang = language;
      root.lang = language === "zh" ? "zh-CN" : "en";
      toggles.forEach((toggle) => {
        toggle.setAttribute(
          "aria-label",
          language === "zh" ? "Switch to English" : "切换到中文",
        );
      });
      try {
        window.localStorage.setItem("david-site-language-v2", language);
      } catch {
        // The site remains usable when storage is unavailable.
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

    const topFlipTitles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-top-flip]"),
    );

    topFlipTitles.forEach((title) => {
      const text = title.textContent?.trim() ?? "";
      title.setAttribute("aria-label", text);
      title.textContent = "";

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

    const magneticLines: MagneticLine[] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-center-magnet]"),
    ).map((element) => {
      const text = element.textContent?.trim() ?? "";
      element.setAttribute("aria-label", text);
      element.textContent = "";

      const words = text.split(/\s+/).map((word) => {
        const span = document.createElement("span");
        span.className = "magnet-word";
        span.setAttribute("aria-hidden", "true");
        span.textContent = word;
        element.append(span);
        return span;
      });

      element.classList.add("center-magnet-ready");
      return { element, words };
    });

    let magnetFrame = 0;
    const stageMagneticLines = (animate: boolean) => {
      if (magnetFrame) {
        window.cancelAnimationFrame(magnetFrame);
      }

      magnetFrame = window.requestAnimationFrame(() => {
        magnetFrame = 0;
        magneticLines.forEach(({ element, words }) => {
          const visible = window.getComputedStyle(element).display !== "none";
          if (!visible) {
            element.classList.remove("text-motion-entered");
            return;
          }

          const wasEntered = element.classList.contains("text-motion-entered");
          element.classList.add("motion-calibrating");
          element.classList.remove("text-motion-entered");

          const lineRect = element.getBoundingClientRect();
          const centerX = lineRect.left + lineRect.width * 0.5;
          const centerY = lineRect.top + lineRect.height * 0.52;
          const wordCenter = (words.length - 1) / 2;

          words.forEach((word, index) => {
            const rect = word.getBoundingClientRect();
            const distanceFromCenter = Math.abs(index - wordCenter);
            word.style.setProperty(
              "--magnet-x",
              `${centerX - (rect.left + rect.width * 0.5)}px`,
            );
            word.style.setProperty(
              "--magnet-y",
              `${centerY - (rect.top + rect.height * 0.5)}px`,
            );
            word.style.setProperty(
              "--magnet-rotate",
              `${index % 2 === 0 ? -9 - index * 1.2 : 8 + index * 1.1}deg`,
            );
            word.style.setProperty(
              "--magnet-delay",
              `${Math.round(distanceFromCenter * 58 + 70)}ms`,
            );
          });

          window.requestAnimationFrame(() => {
            element.classList.remove("motion-calibrating");
            if (animate || reducedMotion || wasEntered) {
              element.classList.add("text-motion-entered");
            }
          });
        });
      });
    };

    stageMagneticLines(true);

    const toggleLanguage = () => {
      applyLanguage(root.dataset.lang === "en" ? "zh" : "en");
      stageMagneticLines(true);
    };
    toggles.forEach((toggle) => toggle.addEventListener("click", toggleLanguage));

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-section]"),
    );

    let revealObserver: IntersectionObserver | null = null;
    let textObserver: IntersectionObserver | null = null;
    let ambientObserver: IntersectionObserver | null = null;
    const settleTimers: number[] = [];

    if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "32% 0px 32%", threshold: 0.01 },
      );

      sections.forEach((section) => revealObserver?.observe(section));

      textObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            if (!entry.isIntersecting) return;

            target.classList.add("text-motion-entered");

            const agentChapter = target.closest<HTMLElement>(".agent-chapter");
            if (agentChapter) {
              agentChapter.classList.add("title-motion-entered");
            }

            settleTimers.push(
              window.setTimeout(() => {
                target.classList.add("motion-settled");
                agentChapter?.classList.add("motion-settled");
              }, 920),
            );
            textObserver?.unobserve(target);
          });
        },
        { rootMargin: "34% 0px 34%", threshold: 0.01 },
      );

      topFlipTitles.forEach((title) => textObserver?.observe(title));
      magneticLines.forEach(({ element }) => textObserver?.observe(element));

      const hero = document.querySelector<HTMLElement>(".hero-screen");
      if (hero) {
        hero.classList.add("motion-active");
        ambientObserver = new IntersectionObserver(
          ([entry]) => {
            hero.classList.toggle("motion-active", entry.isIntersecting);
          },
          { rootMargin: "120px 0px", threshold: 0.01 },
        );
        ambientObserver.observe(hero);
      }
    } else {
      sections.forEach((section) => section.classList.add("is-visible"));
      topFlipTitles.forEach((title) =>
        title.classList.add("text-motion-entered"),
      );
      document
        .querySelector<HTMLElement>(".agent-chapter")
        ?.classList.add("title-motion-entered");
      magneticLines.forEach(({ element }) =>
        element.classList.add("text-motion-entered"),
      );
    }

    const featurePanel = document.querySelector<HTMLElement>(
      "[data-feature-parallax]",
    );
    let scrollMotionFrame = 0;
    let resizeFrame = 0;
    let featureTop = 0;
    let featureHeight = 0;
    let featureWasActive = false;

    const measureFeaturePanel = () => {
      if (!featurePanel) return;
      const rect = featurePanel.getBoundingClientRect();
      featureTop = window.scrollY + rect.top;
      featureHeight = rect.height;
    };

    const updateScrollMotion = () => {
      scrollMotionFrame = 0;
      const viewportHeight = window.innerHeight;
      const compactLayout = window.innerWidth <= 720;

      if (featurePanel) {
        if (reducedMotion || compactLayout) {
          featurePanel.style.setProperty("--feature-copy-y", "0px");
          featurePanel.style.setProperty("--feature-media-y", "0px");
          featurePanel.classList.remove("parallax-active");
          featureWasActive = false;
        } else {
          const panelTop = featureTop - window.scrollY;
          const panelBottom = panelTop + featureHeight;
          const isActive =
            panelBottom > -viewportHeight * 0.2 &&
            panelTop < viewportHeight * 1.2;

          if (!isActive && !featureWasActive) return;

          const copyOffset =
            clamp(panelTop / viewportHeight, -1, 1) * 142;
          const mediaOffset =
            clamp(panelTop / viewportHeight, -1, 1) * -34;

          featurePanel.style.setProperty(
            "--feature-copy-y",
            `${copyOffset.toFixed(2)}px`,
          );
          featurePanel.style.setProperty(
            "--feature-media-y",
            `${mediaOffset.toFixed(2)}px`,
          );
          featurePanel.classList.toggle("parallax-active", isActive);
          featureWasActive = isActive;
        }
      }
    };

    const requestScrollMotion = () => {
      if (!scrollMotionFrame) {
        scrollMotionFrame = window.requestAnimationFrame(updateScrollMotion);
      }
    };
    const restageMagneticLines = () => stageMagneticLines(false);
    const requestResize = () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        syncViewportHeight();
        measureFeaturePanel();
        restageMagneticLines();
        updateScrollMotion();
      });
    };

    measureFeaturePanel();
    requestScrollMotion();
    window.addEventListener("scroll", requestScrollMotion, { passive: true });
    window.addEventListener("resize", requestResize);
    window.visualViewport?.addEventListener("resize", syncViewportHeight);
    document.fonts?.ready.then(() => {
      measureFeaturePanel();
      requestScrollMotion();
    });

    return () => {
      if (magnetFrame) window.cancelAnimationFrame(magnetFrame);
      if (scrollMotionFrame) window.cancelAnimationFrame(scrollMotionFrame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      revealObserver?.disconnect();
      textObserver?.disconnect();
      ambientObserver?.disconnect();
      window.removeEventListener("scroll", requestScrollMotion);
      window.removeEventListener("resize", requestResize);
      window.visualViewport?.removeEventListener("resize", syncViewportHeight);
      toggles.forEach((toggle) =>
        toggle.removeEventListener("click", toggleLanguage),
      );
    };
  }, []);

  return null;
}
