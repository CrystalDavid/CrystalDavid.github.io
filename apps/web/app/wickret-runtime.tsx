"use client";

import { SCROLL_WAVE } from "@david/site-contract";
import { useEffect } from "react";
import type {
  Controller as ScrollMagicController,
  EnterEvent,
  LeaveEvent,
  ProgressEvent,
  Scene as ScrollMagicScene,
} from "scrollmagic";
import type {
  ScrollRuntimeReadyDetail,
} from "./scroll-runtime-events";

type TweenTarget = Element | Element[] | Record<string, number>;
type TweenVars = Record<string, unknown>;
type TweenLiteRuntime = {
  set: (target: TweenTarget, vars: TweenVars) => unknown;
  to: (
    target: TweenTarget,
    duration: number,
    vars: TweenVars,
  ) => unknown;
  killTweensOf: (target: TweenTarget) => unknown;
};
type Gsap2Runtime = {
  TweenLite: TweenLiteRuntime;
  Power2: { easeOut: unknown };
};
type ScrollMagicRuntime = typeof import("scrollmagic");

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const moduleCandidates = (module: unknown) => {
  const record = module as Record<string, unknown>;
  const firstDefault = record.default as Record<string, unknown> | undefined;
  return [
    module,
    record.default,
    record["module.exports"],
    firstDefault?.default,
    firstDefault?.["module.exports"],
  ].filter(Boolean);
};

const resolveGsap = (module: unknown): Gsap2Runtime => {
  const runtime = moduleCandidates(module).find(
    (candidate) =>
      typeof (candidate as Partial<Gsap2Runtime>).TweenLite?.set ===
      "function",
  );
  if (!runtime) throw new Error("GSAP 2 runtime could not be resolved");
  return runtime as Gsap2Runtime;
};

const resolveScrollMagic = (module: unknown): ScrollMagicRuntime => {
  const runtime = moduleCandidates(module).find(
    (candidate) =>
      typeof (candidate as Partial<ScrollMagicRuntime>).Controller ===
        "function" &&
      typeof (candidate as Partial<ScrollMagicRuntime>).Scene === "function",
  );
  if (!runtime) throw new Error("ScrollMagic runtime could not be resolved");
  return runtime as ScrollMagicRuntime;
};

export function WickretRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const diagnostics = new URLSearchParams(window.location.search).has("qa");
    let disposed = false;
    let started = false;
    let controller: ScrollMagicController | null = null;
    let scenes: ScrollMagicScene[] = [];
    let currentScrollY = window.scrollY;
    let pendingWaveDelta = 0;
    let renderedWaveSkew = 0;
    let waveFrame = 0;
    let scrollIdleFrame = 0;
    let lastScrollActivity = 0;
    let waveObserver: IntersectionObserver | null = null;
    const activeWaveTargets = new Set<HTMLElement>();
    const pointerCleanups: Array<() => void> = [];
    const pointerResets: Array<() => void> = [];

    const modulesPromise = Promise.all([
      import("scrollmagic"),
      import("gsap"),
    ]).then(([scrollMagicModule, gsapModule]) => ({
      ScrollMagic: resolveScrollMagic(scrollMagicModule),
      gsap: resolveGsap(gsapModule),
    }));

    const finishScrolling = (timestamp: number) => {
      if (disposed) {
        scrollIdleFrame = 0;
        return;
      }
      if (timestamp - lastScrollActivity < 140) {
        scrollIdleFrame = window.requestAnimationFrame(finishScrolling);
        return;
      }
      root.classList.remove("is-scrolling");
      scrollIdleFrame = 0;
    };

    const markScrolling = () => {
      lastScrollActivity = performance.now();
      if (!root.classList.contains("is-scrolling")) {
        root.classList.add("is-scrolling");
        // A pointer reset creates GSAP tweens. Run it once at the start of a
        // scroll burst rather than rebuilding the same tweens on every frame.
        pointerResets.forEach((reset) => reset());
      }
      if (!scrollIdleFrame) {
        scrollIdleFrame = window.requestAnimationFrame(finishScrolling);
      }
    };

    const startRuntime = async (ready: ScrollRuntimeReadyDetail) => {
      if (disposed || started) return;
      started = true;

      const { ScrollMagic, gsap } = await modulesPromise;
      if (disposed) return;
      const { TweenLite, Power2 } = gsap;
      const virtual = ready.mode === "virtual";
      const desktopEffects = virtual && window.innerWidth > 720 && !reducedMotion;
      currentScrollY = ready.getScrollY();

      controller = new ScrollMagic.Controller({
        ...(virtual ? { container: ready.container } : {}),
        refreshInterval: virtual ? 0 : 80,
      });
      controller.scrollPos(() => currentScrollY);

      let syncArticleVisibility = () => {};
      const updateController = () => {
        controller?.update(true);
      };

      const resetAboutGlyphs = (opacity: number) => {
        document
          .querySelectorAll<HTMLElement>(".char-reveal-glyph")
          .forEach((glyph) => {
            glyph.style.opacity = String(opacity);
          });
      };

      let activeStory: HTMLElement | null = null;
      let activeGlyphs: HTMLElement[] = [];
      let glyphOpacity = new Float32Array();
      let completedGlyphIndex = -1;
      let previousAboutProgress = -1;
      let aboutProgress = 0;
      const aboutTweenState = { progress: 0 };

      const selectActiveStory = () => {
        const language = root.dataset.lang === "zh" ? "zh" : "en";
        const story = document.querySelector<HTMLElement>(
          `.char-reveal-story.lang-${language}`,
        );
        if (story === activeStory) return;
        activeStory = story;
        activeGlyphs = story
          ? Array.from(
              story.querySelectorAll<HTMLElement>(".char-reveal-glyph"),
            )
          : [];
        glyphOpacity = new Float32Array(activeGlyphs.length);
        activeGlyphs.forEach((glyph, index) => {
          glyph.style.opacity = "0.2";
          glyphOpacity[index] = 0.2;
        });
        completedGlyphIndex = -1;
        previousAboutProgress = -1;
      };

      const writeGlyphOpacity = (index: number, opacity: number) => {
        if (Math.abs(glyphOpacity[index] - opacity) < 0.005) return;
        activeGlyphs[index].style.opacity = opacity.toFixed(3);
        glyphOpacity[index] = opacity;
      };

      const resetActiveGlyphs = () => {
        activeGlyphs.forEach((glyph, index) => {
          if (Math.abs(glyphOpacity[index] - 0.2) >= 0.005) {
            glyph.style.opacity = "0.2";
            glyphOpacity[index] = 0.2;
          }
        });
        completedGlyphIndex = -1;
      };

      const renderAbout = (progress: number) => {
        aboutProgress = reducedMotion ? 1 : clamp(progress, 0, 1);
        if (diagnostics) {
          root.dataset.qaAboutProgress = aboutProgress.toFixed(4);
        }
        selectActiveStory();
        const count = activeGlyphs.length;
        if (!count) return;

        if (
          previousAboutProgress >= 0 &&
          aboutProgress + 0.0001 < previousAboutProgress
        ) {
          resetActiveGlyphs();
        }
        if (aboutProgress <= 0) {
          resetActiveGlyphs();
          previousAboutProgress = 0;
          return;
        }
        if (aboutProgress >= 1) {
          for (
            let index = completedGlyphIndex + 1;
            index < count;
            index += 1
          ) {
            writeGlyphOpacity(index, 1);
          }
          completedGlyphIndex = count - 1;
          previousAboutProgress = 1;
          return;
        }

        // English contains substantially more glyph nodes than Chinese. Move
        // only the reveal frontier on each tick; completed and future glyphs
        // are written once instead of scanning the whole story every frame.
        const fadeWindow = Math.max(12, Math.round(count * 0.035));
        const cursor = aboutProgress * (count + fadeWindow);
        const completeThrough = Math.max(
          -1,
          Math.min(count - 1, Math.floor(cursor - fadeWindow)),
        );
        for (
          let index = completedGlyphIndex + 1;
          index <= completeThrough;
          index += 1
        ) {
          writeGlyphOpacity(index, 1);
        }
        completedGlyphIndex = completeThrough;

        const frontierStart = Math.max(0, completeThrough + 1);
        const frontierEnd = Math.min(count - 1, Math.ceil(cursor));
        for (let index = frontierStart; index <= frontierEnd; index += 1) {
          const reveal = clamp((cursor - index) / fadeWindow, 0, 1);
          writeGlyphOpacity(index, 0.2 + reveal * 0.8);
        }
        previousAboutProgress = aboutProgress;
      };

      const playAbout = (reset = true) => {
        selectActiveStory();
        TweenLite.killTweensOf(aboutTweenState);
        if (reset) {
          aboutTweenState.progress = 0;
          renderAbout(0);
        }
        TweenLite.to(aboutTweenState, 1.05, {
          progress: 1,
          ease: Power2.easeOut,
          overwrite: true,
          onUpdate: () => renderAbout(aboutTweenState.progress),
          onComplete: () => {
            aboutTweenState.progress = 1;
            renderAbout(1);
          },
        });
      };

      resetAboutGlyphs(reducedMotion ? 1 : 0.2);
      const aboutSection = document.querySelector<HTMLElement>(
        ".experience-profile-section",
      );
      if (aboutSection) {
        const aboutScene = new ScrollMagic.Scene({
          triggerElement: aboutSection,
          triggerHook: 0.82,
          duration: () =>
            aboutSection.offsetHeight + window.innerHeight,
        })
          .on<EnterEvent>("enter", () => playAbout(true))
          .on<LeaveEvent>("leave", (event) => {
            TweenLite.killTweensOf(aboutTweenState);
            if (event.state === "BEFORE") {
              aboutTweenState.progress = 0;
              renderAbout(0);
            } else {
              aboutTweenState.progress = 1;
              renderAbout(1);
            }
          })
          .addTo(controller);
        scenes.push(aboutScene);
        if (reducedMotion || aboutScene.state() === "AFTER") {
          aboutTweenState.progress = 1;
          renderAbout(1);
        } else if (aboutScene.state() === "DURING") {
          playAbout(true);
        } else {
          renderAbout(0);
        }
      }

      const featureSection = document.querySelector<HTMLElement>(
        "[data-feature-scroll]",
      );
      const featureMedia = featureSection?.querySelector<HTMLElement>(
        ".feature-media-motion",
      );
      if (featureSection && featureMedia && desktopEffects) {
        const featureScene = new ScrollMagic.Scene({
          triggerElement: featureSection,
          triggerHook: 1,
          duration: "200%",
        })
          .on<ProgressEvent>("progress", (event) => {
            TweenLite.set(featureMedia, {
              y: -80 + event.progress * 160,
              force3D: true,
            });
          })
          .addTo(controller);
        scenes.push(featureScene);
        TweenLite.set(featureMedia, {
          y: -80 + featureScene.progress() * 160,
          force3D: true,
        });
      } else if (featureMedia) {
        TweenLite.set(featureMedia, { y: 0, force3D: false });
      }

      const articleSection = document.querySelector<HTMLElement>(
        ".article-gallery-section",
      );
      if (articleSection) {
        const articleScene = new ScrollMagic.Scene({
          triggerElement: articleSection,
          triggerHook: 1,
          duration: () =>
            articleSection.offsetHeight + window.innerHeight,
        })
          .on<EnterEvent>("enter", () =>
            articleSection.classList.add("is-visible"),
          )
          .on<LeaveEvent>("leave", () =>
            articleSection.classList.remove("is-visible"),
          )
          .addTo(controller);
        scenes.push(articleScene);
        syncArticleVisibility = () => {
          const rect = articleSection.getBoundingClientRect();
          articleSection.classList.toggle(
            "is-visible",
            rect.bottom > 0 && rect.top < window.innerHeight,
          );
        };
        syncArticleVisibility();
      }

      const waveTargets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-wave]"),
      );
      const renderWave = () => {
        waveFrame = 0;
        if (disposed || !activeWaveTargets.size) return;
        const delta = pendingWaveDelta;
        pendingWaveDelta = 0;
        const targetSkew = desktopEffects
          ? clamp(
              delta * SCROLL_WAVE.deltaToDegrees,
              -SCROLL_WAVE.maxDegrees,
              SCROLL_WAVE.maxDegrees,
            )
          : 0;
        const response =
          Math.abs(targetSkew) > Math.abs(renderedWaveSkew)
            ? SCROLL_WAVE.attack
            : SCROLL_WAVE.release;
        renderedWaveSkew += (targetSkew - renderedWaveSkew) * response;
        if (
          Math.abs(targetSkew) < SCROLL_WAVE.epsilon &&
          Math.abs(renderedWaveSkew) < SCROLL_WAVE.epsilon
        ) {
          renderedWaveSkew = 0;
        }
        TweenLite.set(Array.from(activeWaveTargets), {
          skewY: renderedWaveSkew,
          force3D: renderedWaveSkew !== 0,
        });
        if (targetSkew !== 0 || renderedWaveSkew !== 0) {
          waveFrame = window.requestAnimationFrame(renderWave);
        }
      };
      const beginWave = () => {
        if (waveFrame || !activeWaveTargets.size) return;
        waveFrame = window.requestAnimationFrame(renderWave);
      };

      if (
        desktopEffects &&
        waveTargets.length &&
        "IntersectionObserver" in window
      ) {
        waveObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              activeWaveTargets.add(target);
            } else {
              activeWaveTargets.delete(target);
              TweenLite.set(target, { skewY: 0, force3D: false });
              if (!activeWaveTargets.size) {
                window.cancelAnimationFrame(waveFrame);
                waveFrame = 0;
                pendingWaveDelta = 0;
                renderedWaveSkew = 0;
              }
            }
          });
        });
        waveTargets.forEach((target) => waveObserver?.observe(target));
      }

      if (finePointer && desktopEffects) {
        document
          .querySelectorAll<HTMLElement>("[data-wickret-pointer]")
          .forEach((panel) => {
            const title = panel.querySelector<HTMLElement>(".chapter-title");
            const orbit = panel.querySelector<HTMLElement>(".chapter-orbit");
            if (!title) return;
            let settleTimer = 0;
            const targets = orbit ? [title, orbit] : [title];

            const reset = () => {
              TweenLite.to(title, 0.5, {
                x: 0,
                y: 0,
                rotationY: 0,
                ease: Power2.easeOut,
                force3D: true,
                overwrite: true,
              });
              if (orbit) {
                TweenLite.to(orbit, 0.5, {
                  x: 0,
                  y: 0,
                  ease: Power2.easeOut,
                  force3D: true,
                  overwrite: true,
                });
              }
              window.clearTimeout(settleTimer);
              settleTimer = window.setTimeout(
                () => panel.classList.remove("pointer-active"),
                540,
              );
            };

            const move = (event: PointerEvent) => {
              if (root.classList.contains("is-scrolling")) return;
              const rect = panel.getBoundingClientRect();
              const x = 2 * ((event.clientX - rect.left) / rect.width - 0.5);
              const y = 2 * ((event.clientY - rect.top) / rect.height - 0.5);
              panel.classList.add("pointer-active");
              window.clearTimeout(settleTimer);
              TweenLite.to(title, 0.5, {
                x: -20 * x,
                y: -10 * y,
                rotationY: 2 * x,
                ease: Power2.easeOut,
                force3D: true,
                overwrite: true,
              });
              if (orbit) {
                TweenLite.to(orbit, 0.5, {
                  x: -30 * x,
                  y: -20 * y,
                  ease: Power2.easeOut,
                  force3D: true,
                  overwrite: true,
                });
              }
            };

            panel.addEventListener("pointermove", move, { passive: true });
            panel.addEventListener("pointerleave", reset, { passive: true });
            panel.addEventListener("pointercancel", reset, { passive: true });
            pointerResets.push(reset);
            pointerCleanups.push(() => {
              panel.removeEventListener("pointermove", move);
              panel.removeEventListener("pointerleave", reset);
              panel.removeEventListener("pointercancel", reset);
              window.clearTimeout(settleTimer);
              TweenLite.killTweensOf(targets);
            });
          });
      }

      const handleVirtualScroll = (y: number, deltaY: number) => {
        currentScrollY = y;
        if (Math.abs(deltaY) < 0.001) return;
        pendingWaveDelta += deltaY;
        if (diagnostics) {
          root.dataset.qaScrollY = currentScrollY.toFixed(3);
        }
        markScrolling();
        beginWave();
        updateController();
      };
      const handleNativeScroll = () => {
        currentScrollY = window.scrollY;
        markScrolling();
        updateController();
      };
      const handleLayout = () => {
        selectActiveStory();
        renderAbout(aboutProgress);
        scenes.forEach((scene) => scene.refresh());
        updateController();
        syncArticleVisibility();
      };
      const handleResize = () => handleLayout();

      if (ready.mode === "virtual") {
        pointerCleanups.push(ready.subscribe(handleVirtualScroll));
      } else {
        window.addEventListener("scroll", handleNativeScroll, {
          passive: true,
        });
      }
      window.addEventListener("david:layout", handleLayout);
      window.addEventListener("resize", handleResize, { passive: true });

      pointerCleanups.push(() => {
        TweenLite.killTweensOf(aboutTweenState);
        if (!virtual) {
          window.removeEventListener("scroll", handleNativeScroll);
        }
        window.removeEventListener("david:layout", handleLayout);
        window.removeEventListener("resize", handleResize);
      });

      updateController();
      syncArticleVisibility();
    };

    const handleReady = (event: Event) => {
      void startRuntime(
        (event as CustomEvent<ScrollRuntimeReadyDetail>).detail,
      );
    };
    window.addEventListener("david:scroll-ready", handleReady);
    if (window.__davidScrollRuntimeReady) {
      void startRuntime(window.__davidScrollRuntimeReady);
    }

    return () => {
      disposed = true;
      window.removeEventListener("david:scroll-ready", handleReady);
      window.cancelAnimationFrame(scrollIdleFrame);
      window.cancelAnimationFrame(waveFrame);
      waveObserver?.disconnect();
      pointerCleanups.forEach((cleanup) => cleanup());
      scenes.forEach((scene) => scene.destroy(true));
      scenes = [];
      controller?.destroy(true);
      controller = null;
      root.classList.remove("is-scrolling");
    };
  }, []);

  return null;
}
