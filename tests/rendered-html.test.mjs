import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readOutput = (route = "") =>
  readFile(new URL(`../out/${route ? `${route}/` : ""}index.html`, import.meta.url), "utf8");

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

const readExportedCss = async () => {
  const chunks = new URL("../out/_next/static/chunks/", import.meta.url);
  const files = (await readdir(chunks)).filter((file) => file.endsWith(".css"));
  return (await Promise.all(files.map((file) => readFile(new URL(file, chunks), "utf8")))).join("\n");
};

test("homepage exports the intended typography and motion hooks", async () => {
  const [html, css, packageJson] = await Promise.all([
    readOutput(),
    readExportedCss(),
    readSource("package.json"),
  ]);

  assert.match(html, /rel="preload"[^>]+\/fonts\/nunito-latin\.woff2/);
  assert.match(html, /rel="preload"[^>]+\/fonts\/noto-sans-sc-site\.woff2/);
  assert.match(css, /font-family:\s*(?:"Nunito"|Nunito)/);
  assert.match(css, /font-family:\s*(?:"Noto Sans SC"|Noto Sans SC)/);
  assert.match(css, /PingFang SC/);
  assert.ok(
    css.indexOf("Nunito") < css.indexOf("Noto Sans SC"),
    "Nunito must precede Noto Sans SC",
  );
  assert.doesNotMatch(css, /HarmonyOS Sans|MiSans|OPPO Sans|David Yuan Round Web|Chiron GoRound TC WS|font-display:swap|fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.match(css, /font-display:block/);
  assert.match(html, /data-font="noto"/);
  assert.match(html, /article-anchor-return/);
  assert.doesNotMatch(html, /david-site-font-v1|fontParameter|fontVersion|harmonyos-sans|misans-site/);
  assert.match(css, /:root[^}]*--font-cjk:"Noto Sans SC"[^}]*--cjk-body-weight:500[^}]*--cjk-ui-weight:700[^}]*--cjk-heading-weight:700[^}]*--cjk-strong-weight:700/);
  assert.match(css, /html\[data-lang=(?:"zh"|zh)\] \.article-body p/);
  assert.equal(
    JSON.parse(packageJson).dependencies["chiron-go-round-tc-webfont-truetype"],
    undefined,
  );
  assert.match(html, /maximum-scale=2/);
  assert.match(html, /david-site-language-v2/);
  assert.ok(
    html.indexOf("david-site-language-v2") < html.indexOf("</head><body>"),
    "saved language must be restored before the body is painted",
  );
  assert.match(css, /text-size-adjust:100%/);
  assert.match(css, /--app-viewport-height:100svh/);
  assert.ok((html.match(/data-wickret-pointer/g) ?? []).length >= 1);
  assert.ok((html.match(/data-char-story/g) ?? []).length >= 2);
  assert.match(html, /story-reveal-beat/);
  assert.doesNotMatch(html, /char-reveal-glyph/);
  assert.ok(
    Buffer.byteLength(html, "utf8") < 200_000,
    "homepage HTML must stay below 200 KB so text motion does not delay parsing",
  );
  assert.match(html, /data-feature-scroll/);
  assert.doesNotMatch(html, /data-scroll-wave/);
  assert.match(html, /ppt-agent-mac-composite\.webp/);
  assert.match(html, />Agent</);
  assert.match(html, />Article</);
  assert.match(html, />About me</);
  assert.doesNotMatch(html, />Experience</);
  assert.doesNotMatch(html, /Explore my GitHub projects/);
});

test("the fixed Noto Sans SC subset is compact, complete and licensed", async () => {
  const [notoSans, notoLicense, fontFiles] = await Promise.all([
    readFile(new URL("../public/fonts/noto-sans-sc-site.woff2", import.meta.url)),
    readSource("public/fonts/noto-sans-sc-license.txt"),
    readdir(new URL("../public/fonts/", import.meta.url)),
  ]);
  const sha256 = (data) => createHash("sha256").update(data).digest("hex").toUpperCase();

  assert.equal(notoSans.length, 202_372);
  assert.equal(sha256(notoSans), "1D6F47ADC649BA39F7F45915A43F63386667B7D143DFD8F29FDB1249216B2633");
  assert.match(notoLicense, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.equal(
    fontFiles.some((file) => /harmony|misans|oppo/i.test(file)),
    false,
  );
});

test("desktop scrolling uses Wickret's live fractional runtime settings", async () => {
  const [smoothScroll, wickretRuntime, articlePage, globalCss, packageJson] = await Promise.all([
    readSource("app/smooth-scroll.tsx"),
    readSource("app/wickret-runtime.tsx"),
    readSource("app/articles/[slug]/page.tsx"),
    readSource("app/globals.css"),
    readSource("package.json"),
  ]);

  assert.match(smoothScroll, /damping:\s*0\.06/);
  assert.match(smoothScroll, /renderByPixels:\s*false/);
  assert.match(smoothScroll, /continuousScrolling:\s*false/);
  assert.match(smoothScroll, /delegateTo:\s*container/);
  assert.match(
    smoothScroll,
    /scrollToHash\(window\.location\.hash, "auto"\)[\s\S]*david:layout/,
  );
  assert.match(wickretRuntime, /new ScrollMagic\.Controller/);
  assert.match(wickretRuntime, /refreshInterval:\s*virtual \? 0 : 80/);
  assert.match(wickretRuntime, /controller\.scrollPos\(\(\) => currentScrollY\)/);
  assert.match(wickretRuntime, /TweenLite\.set/);
  assert.match(wickretRuntime, /triggerHook:\s*0\.82/);
  assert.match(wickretRuntime, /if \(!scrolling\)/);
  assert.match(wickretRuntime, /setAbout\(true\)/);
  assert.match(wickretRuntime, /ready\.subscribe\(handleVirtualScroll\)/);
  assert.match(wickretRuntime, /currentScrollY \+ window\.innerHeight > articleTop/);
  assert.match(globalCss, /html\.article-anchor-return \.article-work-card/);
  assert.doesNotMatch(wickretRuntime, /glyph\.style\.opacity|offsetWidth|aboutPending|data-scroll-wave|renderWave|activeWaveTargets/);
  assert.match(globalCss, /\.char-reveal-story\.is-revealed \.story-reveal-beat/);
  assert.doesNotMatch(globalCss, /char-reveal-glyph/);
  assert.match(smoothScroll, /virtualScrollListeners/);
  assert.doesNotMatch(smoothScroll, /david:virtual-scroll|new CustomEvent\("david:virtual-scroll"/);
  assert.match(globalCss, /contain:\s*layout style/);
  assert.doesNotMatch(articlePage, /ArticleScrollRuntime|window\.scrollTo|preventDefault/);
  assert.doesNotMatch(globalCss, /article-scroll-active/);
  assert.doesNotMatch(globalCss, /data-scroll-wave/);
  assert.doesNotMatch(globalCss, /--char-progress/);
  assert.doesNotMatch(globalCss, /--char-offset/);
  assert.doesNotMatch(globalCss, /--feature-media-y/);
  const dependencies = JSON.parse(packageJson).dependencies;
  assert.equal(dependencies["smooth-scrollbar"], "8.4.0");
  assert.equal(dependencies.scrollmagic, "2.0.6");
  assert.equal(dependencies.gsap, "2.1.3");
});

test("article gallery stays simple and title-only", async () => {
  const html = await readOutput();

  assert.equal((html.match(/<a class="article-work-card"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /article-work-meta/);
  assert.doesNotMatch(html, /gallery-motion-active/);
  assert.match(html, /PPT-Agent Report/);
  assert.match(html, /Research Evidence Tracker: Implementation and Evolution/);
});

test("the two PDF reports export as bilingual canonical articles", async () => {
  const [pptAgent, evidenceTracker] = await Promise.all([
    readOutput("articles/ppt-agent-report"),
    readOutput("articles/openclaw-evidence-tracker"),
  ]);

  for (const html of [pptAgent, evidenceTracker]) {
    assert.match(html, /article-language-toggle/);
    assert.match(html, /article-back/);
    assert.match(html, /lang-en/);
    assert.match(html, /lang-zh/);
    assert.doesNotMatch(html, /Read more articles/);
    assert.doesNotMatch(html, /class="[^"]*eyebrow/);
  }

  assert.match(pptAgent, /Content-driven, not template-driven/i);
  assert.match(pptAgent, /research_brief/);
  assert.match(evidenceTracker, /IDENTITY_CONFLICT/);
  assert.match(evidenceTracker, /24\.06%/);
});
