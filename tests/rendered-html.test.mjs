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
  assert.match(css, /font-family:\s*(?:"Nunito"|Nunito)/);
  assert.match(css, /font-family:\s*"OPPO Sans 4\.0"/);
  assert.match(css, /font-family:\s*(?:"MiSans VF"|MiSans VF)/);
  assert.match(css, /PingFang SC/);
  assert.ok(
    css.indexOf("Nunito") < css.indexOf("OPPO Sans 4.0"),
    "Nunito must precede both Chinese comparison fonts",
  );
  assert.doesNotMatch(css, /David Yuan Round Web|Chiron GoRound TC WS|font-display:swap|fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.match(css, /font-display:block/);
  assert.match(html, /data-font="oppo"/);
  assert.match(html, /david-site-font-v1/);
  assert.match(html, /fontParameter === "mi" \|\| fontParameter === "oppo"/);
  assert.match(html, /\/fonts\/oppo-sans-4\.0-site\.woff2/);
  assert.match(html, /\/fonts\/misans-site\.woff2/);
  assert.doesNotMatch(html, /rel="preload"[^>]+(?:oppo-sans-4\.0-site|misans-site)\.woff2/);
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
  assert.match(html, /data-feature-scroll/);
  assert.match(html, /data-scroll-wave/);
  assert.match(html, /ppt-agent-mac-composite\.webp/);
  assert.match(html, />Agent</);
  assert.match(html, />Article</);
  assert.match(html, />About me</);
  assert.doesNotMatch(html, />Experience</);
  assert.doesNotMatch(html, /Explore my GitHub projects/);
});

test("font comparison assets are compact variable web subsets", async () => {
  const [oppo, miSans, oppoLicense] = await Promise.all([
    readFile(new URL("../public/fonts/oppo-sans-4.0-site.woff2", import.meta.url)),
    readFile(new URL("../public/fonts/misans-site.woff2", import.meta.url)),
    readSource("public/fonts/oppo-sans-4.0-license.txt"),
  ]);
  const sha256 = (data) => createHash("sha256").update(data).digest("hex").toUpperCase();

  assert.equal(oppo.length, 270_148);
  assert.equal(miSans.length, 259_144);
  assert.equal(sha256(oppo), "E9B25E337A389C1F1F2583BE9641D76FF3F5F2351D97F695F5FDF2839A89F9D9");
  assert.equal(sha256(miSans), "495C72920152DF665C03865F2CE9CC91CCC8BECEFDD9ACCAFDF034AB42D3BA3F");
  assert.match(oppoLicense, /OPPO Sans Fonts License Agreement/);
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
  assert.match(wickretRuntime, /new ScrollMagic\.Controller/);
  assert.match(wickretRuntime, /refreshInterval:\s*virtual \? 0 : 80/);
  assert.match(wickretRuntime, /controller\.scrollPos\(\(\) => currentScrollY\)/);
  assert.match(wickretRuntime, /TweenLite\.set/);
  assert.match(wickretRuntime, /triggerHook:\s*0\.82/);
  assert.match(wickretRuntime, /TweenLite\.to\(aboutTweenState,\s*1\.05/);
  assert.match(wickretRuntime, /aboutProgress\s*>=\s*1\s*\?\s*1/);
  assert.match(wickretRuntime, /rect\.bottom > 0 && rect\.top < window\.innerHeight/);
  assert.doesNotMatch(articlePage, /ArticleScrollRuntime|window\.scrollTo|preventDefault/);
  assert.doesNotMatch(globalCss, /article-scroll-active/);
  assert.doesNotMatch(globalCss, /html\.is-scrolling \[data-scroll-wave\][^{]*\{[^}]*will-change/s);
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
