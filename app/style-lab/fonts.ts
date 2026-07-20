export const fontOptions = [
  { slug: "nunito", label: "Nunito", css: "var(--font-nunito)" },
] as const;

export type FontSlug = (typeof fontOptions)[number]["slug"];

export function getFontOption(slug: string) {
  return fontOptions.find((font) => font.slug === slug);
}
