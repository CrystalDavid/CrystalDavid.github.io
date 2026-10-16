# David personal website

This branch contains David's Astro redesign. The legacy Next.js site and its
deployment remain on `main`. The current user instructions supersede the old
site's bilingual, animation and monorepo requirements.

## Before changing the site

- Read `README.md`, `docs/implementation.md`, and `docs/verification.md`.
- Check Git status and preserve existing user edits.
- Update the relevant documentation whenever appearance, behavior, architecture,
  content, routes or verification commands change.

## Product and content

- Keep the restrained two-column desktop layout and native scrolling. Use a
  single column on small screens. Do not add decorative animations or emojis.
- Render English only, including metadata, alternative text and accessibility
  labels. Original bilingual article data may remain as source material; do not
  render the Chinese fields or restore a language preference/switch.
- Follow the browser's `prefers-color-scheme` through CSS, including live changes.
  Do not force a light theme or introduce a stored theme override.
- Preserve Nunito typography, `(Dawei HUANG)`, the two rounded Email/GitHub icons,
  and the capsule-shaped resource links. Do not restore the removed footer.
- Keep verified article text, conclusions, limitations, citations and author
  order. Do not invent credentials, accepted papers or unavailable code links.
- Keep article slugs and the `/#article-card-<slug>` return anchors stable.
- Source PDFs and the CV are read-only references. Do not publish the CV.

## Architecture and checks

- Astro pages, components and scripts live in `src/`; static resources in
  `public/`; build output is `dist/`. Use UnoCSS and the existing ClientRouter.
- Use self-hosted fonts and native scrolling. Respect reduced motion. The
  complete page must remain readable without JavaScript.
- Run `npm run check`, `npm run build`, and `npm test` after relevant changes.
- Verify desktop/mobile layouts, light/dark appearance (including a live switch),
  article navigation, images and horizontal overflow in a real browser.
- Do not commit dependencies, build output, credentials, private source files,
  browser profiles, scratch scripts or screenshots.
- Push this redesign to its own branch. Do not change `main`, the Pages source,
  or deploy over the existing site without the user's explicit instruction.
