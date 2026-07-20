import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import {
  siAlibabacloud,
  siAnthropic,
  siBytedance,
  siDeepseek,
  siGithub,
  siNvidia,
  siQq,
  siReddit,
  siTiktok,
} from "simple-icons";
import { articles } from "./articles/data";
import { FloatingDecor } from "./floating-decor";
import { MotionController } from "./motion-controller";

export const metadata: Metadata = {
  title: "David — Independent Developer",
  description: "David builds AI agents, products and research.",
};

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

type Mark = {
  name: string;
  x: string;
  y: string;
  delay: string;
  scale?: number;
  icon?: SimpleIcon;
  label?: string;
  image?: string;
  emoji?: string;
};

const agentMarks: Mark[] = [
  { name: "OpenAI", image: "/media/openai-logo.png", x: "37%", y: "38%", delay: "150ms" },
  { name: "Google", image: "/media/google-g.png", x: "43%", y: "21%", delay: "185ms" },
  { name: "NVIDIA", icon: siNvidia, x: "57%", y: "21%", delay: "220ms" },
  { name: "Anthropic", icon: siAnthropic, x: "63%", y: "38%", delay: "255ms" },
  { name: "DeepSeek", icon: siDeepseek, x: "37%", y: "62%", delay: "290ms" },
  { name: "Alibaba Cloud", icon: siAlibabacloud, x: "43%", y: "79%", delay: "325ms" },
  { name: "Doubao", image: "/media/doubao-logo.png", x: "57%", y: "79%", delay: "360ms" },
  { name: "ByteDance", icon: siBytedance, x: "63%", y: "62%", delay: "395ms" },
];

const socialLinks = [
  {
    label: "QQ",
    href: "https://wpa.qq.com/msgrd?v=3&uin=2811459442&site=qq&menu=yes",
    icon: siQq,
    kind: "qq",
  },
  { label: "GitHub", href: "https://github.com/CrystalDavid", icon: siGithub, kind: "github" },
  { label: "Reddit", href: "https://www.reddit.com/", icon: siReddit, kind: "reddit" },
  { label: "抖音", href: "https://www.douyin.com/", icon: siTiktok, kind: "douyin" },
];

function Bilingual({
  zh,
  en,
  as: Tag = "span",
}: {
  zh: string;
  en: string;
  as?: "span" | "p";
}) {
  return (
    <>
      <Tag className="lang lang-zh">{zh}</Tag>
      <Tag className="lang lang-en">{en}</Tag>
    </>
  );
}

function IconPath({ icon }: { icon: SimpleIcon }) {
  return (
    <svg className="brand-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}

function SocialBrand({ icon, kind }: { icon: SimpleIcon; kind: string }) {
  return (
    <span className={`social-reveal social-${kind}`} aria-hidden="true">
      <IconPath icon={icon} />
      {kind === "qq" ? <span className="qq-scarf" /> : null}
    </span>
  );
}

function OrbitMark({ mark, kind }: { mark: Mark; kind: string }) {
  let content: ReactNode = null;

  if (mark.icon) {
    content = <IconPath icon={mark.icon} />;
  } else if (mark.image) {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mark.image} width="48" height="48" alt="" loading="lazy" decoding="async" />
    );
  } else if (mark.emoji) {
    content = <span className="emoji-mark">{mark.emoji}</span>;
  } else {
    content = <strong className="word-mark">{mark.label}</strong>;
  }

  return (
    <span
      className={`orbit-object ${kind}-mark`}
      role="img"
      aria-label={mark.name}
      style={
        {
          "--x": mark.x,
          "--y": mark.y,
          "--scale": mark.scale ?? 1,
          "--delay": mark.delay,
          "--brand-color": mark.icon ? `#${mark.icon.hex}` : "#2128bd",
        } as CSSVars
      }
    >
      {content}
      {mark.label && kind === "experience" ? (
        <small className="experience-label">{mark.label}</small>
      ) : null}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <MotionController />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header" aria-label="Site navigation">
        <a className="brand" href="#home" aria-label="David home">
          David
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#experience">Experience</a>
          <a href="#agent">Agent</a>
          <a href="#article">Article</a>
          <button type="button" data-lang-toggle aria-label="切换到中文">
            <span className="lang lang-en">中文</span>
            <span className="lang lang-zh">EN</span>
          </button>
        </nav>
      </header>

      <main id="main">
        <section
          className="screen hero-screen is-visible"
          id="home"
          data-reveal-section
          aria-labelledby="hero-title"
        >
          <FloatingDecor />
          <h1 id="hero-title" className="hero-title">
            <span className="hero-line hero-name" data-center-magnet>
              David
            </span>
            <span className="lang lang-zh" data-center-magnet>
              个人开发者
            </span>
            <span className="lang lang-en" data-center-magnet>
              Independent Developer
            </span>
          </h1>
        </section>

        <section
          className="screen chapter-screen experience-chapter"
          id="experience"
          data-reveal-section
          data-pointer-depth
          aria-labelledby="experience-title"
        >
          <h2 id="experience-title" className="chapter-title" data-top-flip>
            Experience
          </h2>
        </section>

        <section
          className="screen chapter-screen agent-chapter"
          id="agent"
          data-reveal-section
          data-pointer-depth
          aria-labelledby="agent-title"
        >
          <div className="chapter-orbit agent-orbit" aria-label="Leading AI company logos">
            {agentMarks.map((mark) => (
              <OrbitMark kind="agent" key={mark.name} mark={mark} />
            ))}
          </div>
          <h2 id="agent-title" className="chapter-title" data-top-flip>
            Agent
          </h2>
        </section>

        <section
          className="screen feature-screen ppt-screen"
          id="ppt-agent"
          data-reveal-section
          data-feature-parallax
          aria-labelledby="ppt-title"
        >
          <div className="feature-grid">
            <div className="product-visual reveal-visual">
              <div className="product-backdrop">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img
                   src="/media/ppt-agent-mac-composite.webp"
                   alt="Two overlapping Mac browser windows showing the PPT-Agent home and editing interfaces"
                   width="1536"
                   height="1024"
                   loading="lazy"
                   decoding="async"
                 />
              </div>
              <span className="visual-dot visual-dot-one" aria-hidden="true" />
              <span className="visual-dot visual-dot-two" aria-hidden="true" />
            </div>

            <div className="feature-copy">
              <h2 id="ppt-title" className="feature-title">
                PPT-Agent
              </h2>
              <Bilingual
                as="p"
                zh="从需求到可编辑的演示文稿。"
                en="From brief to polished, fully editable slides."
              />
              <a
                className="outline-button"
                href="https://github.com/CrystalDavid"
                target="_blank"
                rel="noreferrer"
              >
                <Bilingual zh="使用 PPT-Agent" en="Try PPT-Agent" />
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section
          className="screen chapter-screen article-chapter"
          id="article"
          data-reveal-section
          data-pointer-depth
          aria-labelledby="article-title"
        >
          <h2 id="article-title" className="chapter-title" data-top-flip>
            Article
          </h2>
        </section>

        <section
           className="article-gallery-section"
           id="articles"
           data-reveal-section
           aria-label="Articles"
         >
           <div className="article-gallery-inner">
             <div className="article-gallery" aria-label="Article list">
               {articles.map((article) => (
                   <Link
                     className="article-work-card"
                     href={`/articles/${article.slug}`}
                     key={article.slug}
                     prefetch={false}
                   >
                     <span className="article-work-copy">
                       <small>{article.meta}</small>
                       <strong>
                         <Bilingual zh={article.titleZh} en={article.titleEn} />
                       </strong>
                     </span>
                   </Link>
               ))}
             </div>
           </div>
        </section>
      </main>

      <footer className="site-footer" aria-label="Footer">
        <div className="footer-grid">
          <section>
            <h2>Sitemap</h2>
            <nav className="footer-nav sitemap-nav" aria-label="Sitemap">
              {[
                ["Home", "#home"],
                ["Experience", "#experience"],
                ["Agent", "#agent"],
                ["Article", "#article"],
              ].map(([label, href]) => (
                <a href={href} key={label}>
                  <span className="sitemap-arrow" aria-hidden="true">
                    ↗
                  </span>
                  <span className="sitemap-label">{label}</span>
                </a>
              ))}
            </nav>
          </section>

          <section>
            <h2>Follow me</h2>
            <nav className="footer-nav social-nav" aria-label="Social links">
              {socialLinks.map((social) => (
                <a href={social.href} key={social.label} target="_blank" rel="noreferrer">
                  <span>{social.label}</span>
                  <SocialBrand icon={social.icon} kind={social.kind} />
                </a>
              ))}
            </nav>
          </section>

          <section className="footer-contact">
            <h2>Work with me</h2>
            <a href="mailto:g2811459442@mail.com">g2811459442@mail.com</a>
          </section>
        </div>
      </footer>
    </>
  );
}
