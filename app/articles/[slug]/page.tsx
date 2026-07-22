import type { Metadata } from "next";
import Link from "next/link";
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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <main className="article-page">
      <header className="article-page-header">
        <Link href="/" className="article-brand">David</Link>
        <nav aria-label="Article navigation">
          <Link href="/#articles"><span className="lang lang-en">Articles</span><span className="lang lang-zh">文章</span></Link>
          <ArticleLanguageToggle />
        </nav>
      </header>

      <article>
        <LanguagePair zh={article.metaZh} en={article.metaEn} as="p" className="eyebrow" />
        <LanguagePair zh={article.titleZh} en={article.titleEn} as="h1" />
        <LanguagePair zh={article.summaryZh} en={article.summaryEn} as="p" className="article-lede" />

        <div className="article-body">
          {article.sections.map((section, index) => (
            <section key={section.headingEn}>
              <p className="section-number">{String(index + 1).padStart(2, "0")}</p>
              <LanguagePair zh={section.headingZh} en={section.headingEn} as="h2" />
              <LanguagePair zh={section.bodyZh} en={section.bodyEn} as="p" />
            </section>
          ))}
        </div>
      </article>

      <footer className="article-page-footer">
        <Link href="/#articles"><span className="lang lang-en">Read more articles</span><span className="lang lang-zh">阅读更多文章</span></Link>
        <span>© 2026 DAVID</span>
      </footer>
    </main>
  );
}
