import content from './publications.json';
import type { ImageMetadata } from 'astro';

export type Publication = {
  slug: string;
  name: string;
  title: string;
  coverImage: string;
  coverAlt: string;
  authors: string[];
  preprint?: string;
};

const covers = import.meta.glob<ImageMetadata>('../assets/*.webp', { eager: true, import: 'default' });
export const publications = (content as Publication[]).map(publication => {
  const cover = covers[`../assets/${publication.coverImage}`];
  if (!cover) throw new Error(`Missing publication image: ${publication.coverImage}`);
  return { ...publication, cover };
});
