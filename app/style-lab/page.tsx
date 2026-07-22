import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "../articles/data";
import { fontOptions } from "./fonts";

export const metadata: Metadata = {
  title: "David — Style Lab",
  robots: { index: false, follow: false },
};

type FontStyle = CSSProperties & { "--lab-font": string };

const cardSizes = [
  { id: "A", name: "Small", className: "is-compact" },
  { id: "B", name: "Balanced", className: "is-balanced" },
  { id: "C", name: "Large", className: "is-airy" },
];

const labImages = [
  "/media/article-openclaw.webp",
  "/media/ppt-agent-1.webp",
  "/media/article-openclaw.webp",
  "/media/ppt-agent-1.webp",
];

export default function StyleLab() {
  return (
    <main className="style-lab">
      <header className="lab-header">
        <Link href="/">David</Link>
        <span>Style Lab</span>
      </header>

      <section className="lab-section" aria-labelledby="font-lab-title">
        <div className="lab-section-heading">
          <p>Homepage options</p>
          <h1 id="font-lab-title">Choose the typeface</h1>
        </div>

        <div className="font-option-grid">
          {fontOptions.map((font) => (
            <Link
              href={`/style-lab/${font.slug}`}
              className="font-option"
              key={font.slug}
              style={{ "--lab-font": font.css } as FontStyle}
            >
              <span>{font.label}</span>
              <strong>David</strong>
              <em>Independent Developer</em>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="lab-section card-size-lab" aria-labelledby="card-lab-title">
        <div className="lab-section-heading">
          <p>Article card options</p>
          <h2 id="card-lab-title">Choose the featured-work size</h2>
        </div>

        <div className="card-size-options">
          {cardSizes.map((size) => (
            <article className={`card-size-option ${size.className}`} key={size.id}>
              <header>
                <span>{size.id}</span>
                <strong>{size.name}</strong>
              </header>
              <div className="lab-article-grid">
                {articles.slice(0, 4).map((article, index) => (
                  <span className="lab-article-card" key={article.slug}>
                    <span className="lab-card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={labImages[index]}
                        alt=""
                        width="1200"
                        height="800"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="lab-card-copy">
                      <small>{article.metaEn}</small>
                      <b>{article.titleEn}</b>
                      <i>↗</i>
                    </span>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
