# David personal website

This repository contains David's Astro personal website. The user authorized
production publication at https://crystaldavid.github.io on 2026-10-17.
The `main` branch builds and deploys the current Astro site through GitHub Pages.
Keep the legacy Next.js implementation in Git history, not in the active site.

## Before changing the site

- Read `README.md`, `docs/typography.md`, `docs/implementation.md`, and
  `docs/verification.md`. The complete visual specification lives only in
  `docs/typography.md`; keep it synchronized with `src/styles/global.css`.
- Check Git status and preserve existing user edits.
- Update the relevant documentation whenever appearance, behavior, architecture,
  content, routes or verification commands change.

## Product and content

- Keep the restrained two-column desktop layout and native scrolling. Use a
  single column on small screens. Do not add decorative animations or emojis.
- Render English only, including metadata, alternative text and accessibility
  labels. Original bilingual article data may remain as source material; do not
  render the Chinese fields or restore a language preference/switch.
- Keep the site light-only with a white background and the original blue palette.
  Use CSS `color-scheme: only light` and light metadata. Do not add automatic
  dark-mode adaptation or a stored theme override.
- Preserve Nunito typography, `(Dawei HUANG)`, the two solid Email/GitHub icons,
  and the capsule-shaped resource links. Do not restore the removed footer.
- Keep publication thumbnails free of overlaid badges and omit the extra paper
  descriptions on the homepage, including PPT-Agent and Evidence Tracker project
  summaries. Use one real interface screenshot for PPT-Agent
  and the documented workflow figure for Evidence Tracker.
- GRA-Flow and RECAST are listing-only until the user explicitly republishes them.
  Do not expose their PDFs, Notes pages, title/image links or sitemap entries.
  Keep drafts in the ignored local `.private/` directory, outside public resources
  and tracked article data. Never copy that directory to a hosted checkout.
- Keep every author list on one line without reducing its 16px type. Allow it to
  extend into the desktop right margin; scroll only the author line when the
  viewport cannot fit it. Preserve author order and the bold personal name.
- Use the five shared text sizes in global.css: 16px auxiliary text and
  metadata, 18px body/listing titles, 22px subheadings, 26px section headings and
  32px page titles/name. Keep the same scale on mobile and desktop.
- Buttons are the sole smaller exception: use --text-button (14px) for resource
  capsules and Copy, all in Nunito. Code and its language label use Ubuntu Mono.
  Keep navigation and other auxiliary text at 16px.
- Homepage and article 26px headings share --line-heading (1.3 / 33.8px).
  Authors and submission metadata share --line-meta (1.65 / 26.4px).
- Use --paragraph-gap (18px) between prose paragraphs, --auxiliary-gap (16px)
  after article summaries/status, and --subheading-gap (24px) above article h3.
- Sidebar navigation matches the school text: Nunito 16px/1.7, weight 400.
- Text uses three default colors: #043361, #3399cc and #444444.
  All gray text uses #444444; do not restore #595959, #333333 or #777777.
- Section gaps are 48px, or 40px up to 1000px. Give image-led publication/project
  sections 8px extra space before the next heading to compensate for the image
  shadow; up to 520px, cards stack and all section gaps are 40px.
- Keep verified article text, conclusions, limitations, citations and author
  order. Do not invent credentials, accepted papers or unavailable code links.
- Keep public article slugs and all `/#article-card-<slug>` listing anchors stable.
- Source PDFs and the CV are read-only references. Do not publish the CV.

## Architecture and checks

- Astro pages, components and scripts live in `src/`; static resources in
  `public/`; build output is `dist/`. Use UnoCSS and the existing ClientRouter.
- Use self-hosted fonts and native scrolling. Respect reduced motion. The
  complete page must remain readable without JavaScript.
- Run `npm run check`, `npm run build`, and `npm test` after relevant changes.
- Verify desktop/mobile layouts remain light under both browser color preferences,
  including live preference changes, article navigation, images and overflow.
- Do not commit dependencies, build output, credentials, private source files,
  browser profiles, scratch scripts or screenshots.
- Production deployment uses `.github/workflows/pages.yml` on `main`, Node.js
  24, and the checked `dist/` artifact. Read `docs/deployment.md` before release.
  Preserve remote history and unrelated changes; never force-push the main branch.
- The Sites comparison preview is independent; a GitHub Pages release does not
  automatically update it. Do not confuse its URL with the production website.
