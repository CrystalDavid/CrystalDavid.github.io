import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingDecor } from "../../floating-decor";
import { fontOptions, getFontOption } from "../fonts";

type FontStyle = CSSProperties & { "--lab-font": string };

export function generateStaticParams() {
  return fontOptions.map((font) => ({ font: font.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ font: string }>;
}): Promise<Metadata> {
  const { font: slug } = await params;
  const font = getFontOption(slug);

  return {
    title: font ? `David — ${font.label} Preview` : "David — Font Preview",
    robots: { index: false, follow: false },
  };
}

export default async function FontPreview({
  params,
}: {
  params: Promise<{ font: string }>;
}) {
  const { font: slug } = await params;
  const font = getFontOption(slug);

  if (!font) {
    notFound();
  }

  return (
    <main
      className="font-preview"
      style={{ "--lab-font": font.css } as FontStyle}
      data-font={font.slug}
    >
      <header className="font-preview-header">
        <Link href="/style-lab" aria-label="Back to font options">
          David
        </Link>
        <nav aria-label="Preview navigation">
          <span>Agent</span>
          <span>Article</span>
          <span className="preview-language">中文</span>
        </nav>
      </header>

      <section className="font-preview-hero" aria-labelledby="preview-title">
        <FloatingDecor />
        <h1 id="preview-title">
          <span>David</span>
          <strong>Independent Developer</strong>
        </h1>
      </section>

      <nav className="font-preview-switcher" aria-label="Choose another font">
        {fontOptions.map((option) => (
          <Link
            href={`/style-lab/${option.slug}`}
            aria-current={option.slug === font.slug ? "page" : undefined}
            key={option.slug}
          >
            {option.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
