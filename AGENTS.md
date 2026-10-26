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
  labels. Only English fields from bilingual source data render.
- Keep the white background, blue palette, `color-scheme: only light`
  and light metadata, without theme or language controls.
- Preserve Nunito throughout the interface, `(Dawei HUANG)`, the
  solid Email/GitHub icons, capsule resource links and transparent blue rounded
  lightning favicon.
- Keep the homepage free of emojis, image badges, a footer and extra paper or
  project descriptions.
- Keep publication/project titles and the About Me school name as plain text.
  Emphasize sidebar navigation; keep About Me copy and research interests at
  regular weight. Use one blue-black text color and one blue interaction color.
- Order the homepage as About Me, Education, Research Interests, Publications
  and Projects. Store English education details in `src/data/site.ts`.
  The sidebar shows the avatar, name, social icons and matching section links.
  Keep native anchor navigation functional without JavaScript, and accurately
  highlight the current section when scrolling or choosing a destination.
- Preserve both Education and navigation variants. Select them independently
  in `src/data/presentation.ts`; retain the classic markup and styles so either
  layout can be restored without reverting unrelated content changes.
- Use one real interface screenshot for PPT-Agent and the documented workflow
  figure for Evidence Tracker.
- Keep author lists on one line in the verified order, with the personal name
  bold. Allow desktop overflow into the right margin and local scrolling when
  needed; do not shrink, truncate or wrap names.
- Preserve verified claims, conclusions, limitations, citations and attribution.
  Do not invent credentials, acceptance decisions or unavailable code links.
- Publish the single-page profile and 404 only. Keep section IDs and links in
  sync; the sitemap contains only the homepage.
- Do not publish article detail pages, Notes/Article buttons, paper PDFs or
  submission-status information. ProME links to arXiv; projects link to their
  repositories and available demos. GRA-Flow and RECAST remain listing-only.
- Source papers and the CV are read-only references; the CV is not public
  website content.

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
