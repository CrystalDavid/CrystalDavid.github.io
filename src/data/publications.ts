import content from './publications.json';
import type { ArticleText } from './articles';

export type Publication = {
  slug: string;
  name: string;
  title: string;
  coverImage: string;
  coverAlt: string;
  notesAvailable: boolean;
  authors: string[];
  status: ArticleText;
  description: ArticleText;
  preprint?: string;
};

export const publications = content as Publication[];
