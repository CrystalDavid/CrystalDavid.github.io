# David personal website

This repository contains the English personal website at
https://crystaldavid.github.io/. The `main` branch publishes through GitHub Pages.

## Before making changes

- Read [README.md](README.md) and the relevant current documentation:
  [visual specification](docs/typography.md),
  [implementation](docs/implementation.md),
  [deployment](docs/deployment.md), and
  [research sources](docs/research-sources.md).
- Check Git status and preserve existing user edits.
- Keep numerical visual rules only in `docs/typography.md`, synchronized with
  `src/styles/global.css`.
- Update documentation to describe current behavior and maintenance rules;
  do not add change logs or historical operation records.

## Product and content

- Keep the restrained two-column desktop layout, sticky sidebar and native
  scrolling. Use one column on small screens.
- Render English only, including metadata, alternative text and accessibility
  labels. Bilingual source fields may remain, but only English fields render.
- Keep a white background with the blue palette, CSS `color-scheme: only light`
  and light metadata. No theme or language controls.
- Preserve Nunito throughout the interface and code, `(Dawei HUANG)`, the two
  solid Email/GitHub icons, capsule resource links and the transparent blue
  rounded lightning favicon.
- Keep the homepage free of emojis, image badges, a footer and extra paper or
  project descriptions. Article summaries and full text remain visible.
- Order the homepage as About Me, Education, Research Interests, Publications &
  Manuscripts and Projects. Store English education details in `src/data/site.ts`.
  The homepage sidebar shows the avatar, name and social icons; the article
  sidebar also includes the school and section navigation.
- Use one real interface screenshot for PPT-Agent and the documented workflow
  figure for Evidence Tracker.
- Keep author lists on one line, in the verified order, with the personal name
  bold. Allow desktop overflow into the right margin and local horizontal
  scrolling when needed; do not shrink, truncate or wrap the names.
- Follow the visual specification for fonts, colors, sizes, line heights,
  spacing and responsive behavior. Preserve code characters, whitespace,
  newlines and local horizontal scrolling.
- Preserve verified claims, conclusions, limitations, citations and attribution.
  Do not invent credentials, acceptance decisions or unavailable code links.
- Keep public article slugs and `/#article-card-<slug>` anchors stable.
- GRA-Flow and RECAST are listing-only. Do not expose their PDFs, full Notes,
  title/image links or sitemap entries without an explicit publication request.
- Do not host paper PDFs or render PDF download buttons. ProME has arXiv and
  Notes links. Source papers and the CV are read-only references; the CV is not
  public website content.

## Architecture and verification

- Astro pages, components, data and scripts live in `src/`; static resources
  live in `public/`. Use the existing UnoCSS and ClientRouter setup.
- Keep fonts self-hosted and preserve their files and loading strategy.
  Respect reduced motion; all reading content must work without JavaScript.
- For relevant source or configuration changes, run `npm run check`,
  `npm run build` and `npm test`.
- For interface changes, verify desktop and mobile, both browser color
  preferences, live preference changes, navigation, images and overflow.
- For documentation-only edits, verify current facts and local references;
  no dependency installation or site build is needed.
- Keep `tests/site.test.mjs` and its release checks. The workflow runs
  `npm test` before uploading the build.
- Do not commit dependencies, build output, credentials, private source files,
  browser profiles, scratch scripts or screenshots.

## Local workspace and publishing

- Keep the local checkout shallow, with only the latest synchronized snapshot.
  Do not fetch full history or old branches by default; fetch additional
  history only when needed to integrate remote changes.
- Preserve the GitHub connection and normal push workflow. Do not force-push
  `main` or rewrite remote history.
- Install with `npm ci` only when local checks or preview are needed.
  `node_modules/`, `dist/` and `.astro/` are generated local directories;
  respect the user's preference to save local space.
- Keep package manifests, the lockfile, configuration, resources, licenses,
  tests and `.github/workflows/pages.yml`.
- Production uses Node.js 24 and publishes the checked `dist/` artifact.
  Follow [deployment.md](docs/deployment.md); verify Actions and the live site
  before reporting a website release as complete.
