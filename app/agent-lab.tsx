"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siAlibabacloud,
  siAnthropic,
  siBytedance,
  siDeepseek,
  siNvidia,
} from "simple-icons";

type AgentLabMode = "native" | "wickret";

type AgentLabMark = {
  name: string;
  x: string;
  y: string;
  icon?: SimpleIcon;
  image?: string;
};

const marks: AgentLabMark[] = [
  { name: "OpenAI", image: "/media/openai-logo.png", x: "26%", y: "38%" },
  { name: "Google", image: "/media/google-g.png", x: "41%", y: "27%" },
  { name: "NVIDIA", icon: siNvidia, x: "59%", y: "27%" },
  { name: "Anthropic", icon: siAnthropic, x: "74%", y: "38%" },
  { name: "DeepSeek", icon: siDeepseek, x: "26%", y: "66%" },
  { name: "Alibaba Cloud", icon: siAlibabacloud, x: "41%", y: "77%" },
  { name: "Doubao", image: "/media/doubao-logo.png", x: "59%", y: "77%" },
  { name: "ByteDance", icon: siBytedance, x: "74%", y: "66%" },
];

function MarkGraphic({ mark }: { mark: AgentLabMark }) {
  if (mark.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mark.image} width="44" height="44" alt="" decoding="async" />
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={mark.icon?.path} />
    </svg>
  );
}

export function AgentLab({ mode }: { mode: AgentLabMode }) {
  const stageRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const title = titleRef.current;
    const orbit = orbitRef.current;
    if (!stage || !title || !orbit) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const readPointer = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    };

    if (mode === "native") {
      const render = () => {
        frame = 0;
        title.style.transform = `translate3d(${(pointerX * 28).toFixed(2)}px, ${(pointerY * 18).toFixed(2)}px, 0)`;
        orbit.style.transform = `translate3d(${(pointerX * 46).toFixed(2)}px, ${(pointerY * 28).toFixed(2)}px, 0)`;
      };

      const onMove = (event: PointerEvent) => {
        readPointer(event);
        if (!frame) frame = requestAnimationFrame(render);
      };

      const onLeave = () => {
        pointerX = 0;
        pointerY = 0;
        if (!frame) frame = requestAnimationFrame(render);
      };

      stage.addEventListener("pointermove", onMove, { passive: true });
      stage.addEventListener("pointerleave", onLeave, { passive: true });

      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    let disposed = false;
    let removeWickretListeners = () => {};

    void import("gsap").then(({ gsap }) => {
      if (disposed) return;

      const tweenToPointer = () => {
        frame = 0;
        gsap.to(title, {
          x: pointerX * 28,
          y: pointerY * 18,
          duration: 0.3,
          overwrite: true,
          force3D: true,
          ease: "power1.out",
        });
        gsap.to(orbit, {
          x: pointerX * 46,
          y: pointerY * 28,
          duration: 0.3,
          overwrite: true,
          force3D: true,
          ease: "power1.out",
        });
      };

      const onMove = (event: PointerEvent) => {
        readPointer(event);
        if (!frame) frame = requestAnimationFrame(tweenToPointer);
      };

      const onLeave = () => {
        pointerX = 0;
        pointerY = 0;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          frame = 0;
          gsap.to([title, orbit], {
            x: 0,
            y: 0,
            duration: 0.7,
            overwrite: true,
            force3D: true,
            ease: "power1.out",
          });
        });
      };

      stage.addEventListener("pointermove", onMove, { passive: true });
      stage.addEventListener("pointerleave", onLeave, { passive: true });

      removeWickretListeners = () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        if (frame) cancelAnimationFrame(frame);
        gsap.killTweensOf([title, orbit]);
      };
    });

    return () => {
      disposed = true;
      removeWickretListeners();
    };
  }, [mode]);

  const isNative = mode === "native";

  return (
    <main className="agent-lab-page">
      <header className="agent-lab-header">
        <Link className="brand" href="/">
          David
        </Link>
        <nav aria-label="Agent motion comparison">
          <Link className={isNative ? "is-current" : ""} href="/agent1/">
            Agent 1
          </Link>
          <Link className={!isNative ? "is-current" : ""} href="/agent2/">
            Agent 2
          </Link>
          <Link href="/">Back</Link>
        </nav>
      </header>

      <section ref={stageRef} className="agent-lab-stage" aria-labelledby="agent-lab-title">
        <div ref={orbitRef} className="agent-lab-orbit">
          {marks.map((mark) => (
            <span
              className="agent-lab-mark"
              key={mark.name}
              role="img"
              aria-label={mark.name}
              style={
                {
                  "--lab-x": mark.x,
                  "--lab-y": mark.y,
                  "--lab-color": mark.icon ? `#${mark.icon.hex}` : "#2229bd",
                } as CSSProperties
              }
            >
              <MarkGraphic mark={mark} />
            </span>
          ))}
        </div>

        <h1 ref={titleRef} id="agent-lab-title">
          Agent
        </h1>

        <p className="agent-lab-caption">
          {isNative ? "Agent 1 · Native rAF · direct frame" : "Agent 2 · Wickret method · rAF + GSAP"}
        </p>
      </section>
    </main>
  );
}
