import content from './articles.json';

export type ArticleText = { zh: string; en: string };
export type ArticleBlock =
  | ({ type: 'paragraph' | 'subheading' } & ArticleText)
  | { type: 'list'; ordered?: boolean; items: ArticleText[] }
  | { type: 'code'; language: string; code: string };
export type ArticleSection = { headingZh: string; headingEn: string; blocks: ArticleBlock[] };
export type Article = {
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  sourceLabelZh: string;
  sourceLabelEn: string;
  sourceHref: string;
  coverImage: string;
  coverAltZh: string;
  coverAltEn: string;
  sections: ArticleSection[];
};
export const articles = content as Article[];
export function readingMinutes(article: Article) {
  const text = article.sections.flatMap(section => section.blocks.map(block => {
    if (block.type === 'code') return '';
    if (block.type === 'list') return block.items.map(item => item.en).join(' ');
    return block.en;
  })).join(' ');
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}
