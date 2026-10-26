import content from './publications.json';

export type Publication = {
  slug: string;
  name: string;
  title: string;
  coverImage: string;
  coverAlt: string;
  authors: string[];
  preprint?: string;
};

export const publications = content as Publication[];
