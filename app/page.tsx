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
} from "simple-icons";
import { articles } from "./articles/data";
import { FloatingDecor } from "./floating-decor";
import { MotionController } from "./motion-controller";
import { SmoothScroll } from "./smooth-scroll";
import { WickretRuntime } from "./wickret-runtime";

export const metadata: Metadata = {
  title: "David — Independent Developer",
  description: "David builds AI agents, products and research.",
};

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;
type Mark = { name: string; x: string; y: string; delay: string; icon?: SimpleIcon; image?: string };

const agentMarks: Mark[] = [
  { name: "OpenAI", image: "/media/openai-logo.png", x: "25%", y: "39%", delay: "120ms" },
  { name: "Google", image: "/media/google-g.png", x: "41%", y: "27%", delay: "160ms" },
  { name: "NVIDIA", icon: siNvidia, x: "59%", y: "27%", delay: "200ms" },
  { name: "Anthropic", icon: siAnthropic, x: "75%", y: "39%", delay: "240ms" },
  { name: "DeepSeek", icon: siDeepseek, x: "25%", y: "65%", delay: "280ms" },
  { name: "Alibaba Cloud", icon: siAlibabacloud, x: "41%", y: "77%", delay: "320ms" },
  { name: "Doubao", image: "/media/doubao-logo.png", x: "59%", y: "77%", delay: "360ms" },
  { name: "ByteDance", icon: siBytedance, x: "75%", y: "65%", delay: "400ms" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/CrystalDavid", icon: siGithub, kind: "github" },
];

function Bilingual({ zh, en, as: Tag = "span" }: { zh: string; en: string; as?: "span" | "p" | "h2" }) {
  return <><Tag className="lang lang-zh">{zh}</Tag><Tag className="lang lang-en">{en}</Tag></>;
}

function CharacterStory({ paragraphs, language }: { paragraphs: string[]; language: "zh" | "en" }) {
  let characterIndex = 0;
  const renderCharacters = (value: string) => Array.from(value).map((character) => {
    const index = characterIndex++;
    return (
      <span
        className="char-reveal-glyph"
        aria-hidden="true"
        key={`${character}-${index}`}
      >
        {character}
      </span>
    );
  });

  return (
    <div className={`lang lang-${language} char-reveal-story`} data-char-story>
      {paragraphs.map((text, paragraphIndex) => (
        <p aria-label={text} key={text}>
          {language === "en"
            ? text.split(/(\s+)/).map((part, partIndex) => (
              /\s/.test(part)
                ? <span aria-hidden="true" key={`space-${paragraphIndex}-${partIndex}`}>{part}</span>
                : <span className="char-reveal-word" aria-hidden="true" key={`${part}-${paragraphIndex}-${partIndex}`}>{renderCharacters(part)}</span>
            ))
            : renderCharacters(text)}
        </p>
      ))}
    </div>
  );
}

function ChapterTitle({ id, zh, en }: { id: string; zh: string; en: string }) {
  return (
    <h2 id={id} className="chapter-title" data-top-flip data-scroll-wave>
      <span className="lang lang-zh" data-flip-label={zh}>{zh}</span>
      <span className="lang lang-en" data-flip-label={en}>{en}</span>
    </h2>
  );
}

function IconPath({ icon }: { icon: SimpleIcon }) {
  return <svg className="brand-logo" viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} /></svg>;
}

function SocialBrand({ icon, kind }: { icon: SimpleIcon; kind: string }) {
  return <span className={`social-reveal social-${kind}`} aria-hidden="true"><IconPath icon={icon} />{kind === "qq" ? <span className="qq-scarf" /> : null}</span>;
}

function OrbitMark({ mark }: { mark: Mark }) {
  const content: ReactNode = mark.icon ? <IconPath icon={mark.icon} /> : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mark.image} width="48" height="48" alt="" loading="lazy" decoding="async" />
  );
  return (
    <span className="orbit-object agent-mark" role="img" aria-label={mark.name} style={{ "--x": mark.x, "--y": mark.y, "--scale": 1, "--delay": mark.delay, "--brand-color": mark.icon ? `#${mark.icon.hex}` : "#2128bd" } as CSSVars}>
      {content}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <MotionController />
      <WickretRuntime />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header" aria-label="Site navigation">
        <a className="brand" href="#home" aria-label="David home">David</a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#about"><Bilingual zh="关于我" en="About me" /></a>
          <a href="#agent"><Bilingual zh="智能体" en="Agent" /></a>
          <a href="#article"><Bilingual zh="文章" en="Article" /></a>
          <button type="button" data-lang-toggle aria-label="切换语言"><span className="lang lang-en">中文</span><span className="lang lang-zh">EN</span></button>
        </nav>
      </header>

      <SmoothScroll>
        <main id="main">
          <section className="screen hero-screen is-visible" id="home" data-reveal-section aria-labelledby="hero-title">
            <FloatingDecor />
            <h1 id="hero-title" className="hero-title" data-scroll-wave>
              <span className="hero-line hero-name" data-center-magnet>David</span>
              <span className="lang lang-zh" data-center-magnet>个人开发者</span>
              <span className="lang lang-en" data-center-magnet>Independent Developer</span>
            </h1>
          </section>

          <section className="experience-profile-section" id="about" data-reveal-section aria-labelledby="about-title">
            <div className="experience-profile-inner" data-scroll-wave>
              <h2 id="about-title"><span className="lang lang-zh">关于我</span><span className="lang lang-en">About me</span></h2>
              <div className="experience-profile-copy">
                <CharacterStory
                  language="zh"
                  paragraphs={[
                    "我叫 David，是深圳南方科技大学数据科学与大数据技术专业的大四学生。目前我专注于智能体开发，喜欢把复杂流程整理成清晰、精美而高效的产品。",
                    "我希望自己制作的每一个智能体都能带来耳目一新的体验，也真正帮助人们减少重复劳动、提高工作效率。我的 GitHub 记录着这些想法如何逐渐变成可以使用的开源项目。",
                    "离开屏幕后，我喜欢跑步和打羽毛球。我的 1000 米个人最好成绩是 3 分 5 秒。对我来说，写代码和训练很像：都需要持续打磨、保持节奏，也都让每一点进步变得清晰可见。",
                  ]}
                />
                <CharacterStory
                  language="en"
                  paragraphs={[
                    "I’m David, a senior studying Data Science and Big Data Technology at Southern University of Science and Technology in Shenzhen. I currently focus on building AI agents and turning complex workflows into clear, polished and efficient products.",
                    "I want every agent I build to feel fresh while genuinely reducing repetitive work and improving how people get things done. My GitHub is where those ideas gradually become practical open-source projects.",
                    "Away from the screen, I run and play badminton. My personal best for 1,000 metres is 3:05. Coding and training feel similar to me: both reward steady practice, good rhythm and small improvements that become visible over time.",
                  ]}
                />
              </div>
            </div>
          </section>

          <section className="screen chapter-screen agent-chapter" id="agent" data-reveal-section data-wickret-pointer aria-labelledby="agent-title">
            <div className="chapter-orbit agent-orbit" aria-label="Leading AI company logos">{agentMarks.map((mark) => <OrbitMark key={mark.name} mark={mark} />)}</div>
            <ChapterTitle id="agent-title" zh="智能体" en="Agent" />
          </section>

          <section className="feature-screen ppt-screen" id="ppt-agent" data-reveal-section data-feature-scroll aria-labelledby="ppt-title">
            <div className="feature-grid" data-scroll-wave>
              <div className="feature-media-motion"><div className="product-visual reveal-visual"><div className="product-backdrop">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/media/ppt-agent-mac-composite.webp" alt="Two overlapping Mac browser windows showing the PPT-Agent interfaces" width="1536" height="1024" loading="lazy" decoding="async" />
              </div><span className="visual-dot visual-dot-one" aria-hidden="true" /><span className="visual-dot visual-dot-two" aria-hidden="true" /></div></div>
              <div className="feature-copy-motion"><div className="feature-copy">
                <h2 id="ppt-title" className="feature-title">PPT-Agent</h2>
                <Bilingual as="p" zh="从需求到可编辑的演示文稿" en="From brief to polished, fully editable slides" />
                <a className="outline-button" href="https://lambent-zabaione-8eab6b.netlify.app/" target="_blank" rel="noreferrer"><Bilingual zh="使用 PPT-Agent" en="Try PPT-Agent" /></a>
              </div></div>
            </div>
          </section>

          <section className="article-gallery-section" id="article" data-reveal-section data-reveal-repeat aria-labelledby="article-title">
            <div className="article-gallery-inner" data-scroll-wave>
              <header className="article-gallery-header">
                <h2 id="article-title"><span className="lang lang-zh">文章</span><span className="lang lang-en">Article</span></h2>
              </header>
              <div className="article-gallery">
              {articles.map((article, index) => <Link className="article-work-card" id={`article-card-${article.slug}`} href={`/articles/${article.slug}`} key={article.slug} prefetch={false} style={{ "--card-index": index } as CSSVars}>
                <span className="article-work-placeholder">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.coverImage} alt={article.coverAltEn} width="1280" height="720" loading="lazy" decoding="async" />
                </span>
                <span className="article-work-copy"><strong><Bilingual zh={article.titleZh} en={article.titleEn} /></strong></span>
              </Link>)}
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer" aria-label="Footer"><div className="footer-grid">
          <section><Bilingual as="h2" zh="网站地图" en="Sitemap" /><nav className="footer-nav sitemap-nav" aria-label="Sitemap">
            {[
              { en: "Home", zh: "首页", href: "#home" },
              { en: "About me", zh: "关于我", href: "#about" },
              { en: "Agent", zh: "智能体", href: "#agent" },
              { en: "Article", zh: "文章", href: "#article" },
            ].map((item) => <a href={item.href} key={item.en}><span className="sitemap-arrow" aria-hidden="true">↗</span><span className="sitemap-label"><Bilingual zh={item.zh} en={item.en} /></span></a>)}
          </nav></section>
          <section><Bilingual as="h2" zh="关注我" en="Follow me" /><nav className="footer-nav social-nav" aria-label="Social links">
            {socialLinks.map((social) => <a href={social.href} key={social.label} target="_blank" rel="noreferrer"><span>{social.label}</span><SocialBrand icon={social.icon} kind={social.kind} /></a>)}
          </nav></section>
          <section className="footer-contact"><Bilingual as="h2" zh="联系合作" en="Work with me" /><a href="mailto:h2811459442@gmail.com">h2811459442@gmail.com</a></section>
        </div></footer>
      </SmoothScroll>
    </>
  );
}
