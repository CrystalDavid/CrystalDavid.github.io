import content from './publications.json';
import type { ArticleText } from './articles';

export type Publication = {
  slug: string;
  name: string;
  authors: string[];
  status: ArticleText;
  description: ArticleText;
  pdf: string;
  preprint?: string;
};

export const publications = content as Publication[];
