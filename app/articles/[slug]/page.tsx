import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLanguageToggle } from "../article-language-toggle";
import { articles, getArticle } from "../data";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: `${article.titleEn} — David`, description: article.summaryEn } : {};
}

function LanguagePair({ zh, en, as: Tag = "span", className }: { zh: string; en: string; as?: "span" | "p" | "h1" | "h2"; className?: string }) {
  return <><Tag className={`lang lang-en ${className ?? ""}`}>{en}</Tag><Tag className={`lang lang-zh ${className ?? ""}`}>{zh}</Tag></>;
}

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.3 5.2 3.5 12l6.8 6.8 1.4-1.4-4.4-4.4H21v-2H7.3l4.4-4.4-1.4-1.4Z" />
    </svg>
  );
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <main className="article-page">
      <header className="article-page-header">
        <a href={`/#article-card-${article.slug}`} className="article-back" aria-label="Back to this article in the article list">
          <BackArrow />
          <span className="lang lang-en">Article</span>
          <span className="lang lang-zh">文章</span>
        </a>
        <nav aria-label="Article preferences">
          <ArticleLanguageToggle />
        </nav>
      </header>

      <article>
        <LanguagePair zh={article.titleZh} en={article.titleEn} as="h1" />
        <LanguagePair zh={article.summaryZh} en={article.summaryEn} as="p" className="article-lede" />
        <p className="article-source">
          <a className="article-source-link" href={article.sourceHref} target="_blank" rel="noreferrer">
            <span className="lang lang-en">{article.sourceLabelEn}</span>
            <span className="lang lang-zh">{article.sourceLabelZh}</span>
          </a>
        </p>

        <div className="article-body">
          {article.sections.map((section, index) => (
            <section key={section.headingEn}>
              <p className="section-number">{String(index + 1).padStart(2, "0")}</p>
              <LanguagePair zh={section.headingZh} en={section.headingEn} as="h2" />
              <div className="article-section-content">
                {section.blocks.map((block, blockIndex) => {
                  if (block.type === "code") {
                    return <pre className="article-code" data-language={block.language} key={`${block.language}-${blockIndex}`}><code>{block.code}</code></pre>;
                  }
                  if (block.type === "list") {
                    const List = block.ordered ? "ol" : "ul";
                    return (
                      <List key={`list-${blockIndex}`}>
                        {block.items.map((item) => (
                          <li key={item.zh}><LanguagePair zh={item.zh} en={item.en} /></li>
                        ))}
                      </List>
                    );
                  }
                  if (block.type === "subheading") {
                    return <LanguagePair zh={block.zh} en={block.en} as="h2" className="article-subheading" key={block.zh} />;
                  }
                  return <LanguagePair zh={block.zh} en={block.en} as="p" key={block.zh} />;
                })}
              </div>
            </section>
          ))}
        </div>
      </article>

      <footer className="article-page-footer">
        <span>© 2026 DAVID</span>
      </footer>
    </main>
  );
}
