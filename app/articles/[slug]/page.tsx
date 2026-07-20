import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "../data";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article
    ? {
        title: `${article.titleEn} — David`,
        description: article.summaryEn,
      }
    : {};
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="article-page">
      <header className="article-page-header">
        <Link href="/#articles">← Back to articles</Link>
        <Link href="/" className="article-brand">
          David
        </Link>
      </header>

      <article>
        <p className="eyebrow">{article.meta}</p>
        <h1>{article.titleEn}</h1>
        <p className="article-english-title">{article.titleZh}</p>
        <p className="article-lede">{article.summaryEn}</p>

        <div className="article-body">
          {article.sections.map((section) => (
            <section key={section.headingZh}>
              <p className="section-number">
                {String(
                  article.sections.findIndex(
                    (item) => item.headingZh === section.headingZh,
                  ) + 1,
                ).padStart(2, "0")}
              </p>
              <h2>{section.headingEn}</h2>
              <p>{section.bodyEn}</p>
              <p className="article-translation">{section.bodyZh}</p>
            </section>
          ))}
        </div>
      </article>

      <footer className="article-page-footer">
        <Link href="/#articles">Read more articles →</Link>
        <span>© 2026 DAVID</span>
      </footer>
    </main>
  );
}
