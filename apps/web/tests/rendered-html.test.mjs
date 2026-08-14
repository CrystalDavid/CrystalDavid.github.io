import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readOutput = (route = "") =>
  readFile(new URL(`../out/${route ? `${route}/` : ""}index.html`, import.meta.url), "utf8");

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

const readWorkspaceSource = (path) =>
  readFile(new URL(`../../../${path}`, import.meta.url), "utf8");

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
  assert.doesNotMatch(html, /article-anchor-return/);
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
  assert.match(html, /char-reveal-glyph/);
  assert.doesNotMatch(html, /story-reveal-beat/);
  assert.match(html, /data-feature-scroll/);
  assert.match(html, /data-scroll-wave/);
  assert.match(html, /hero-wave-shell/);
  assert.match(html, /chapter-wave-shell/);
  assert.match(html, /ppt-agent-mac-composite\.webp/);
  assert.match(html, /g2811459442@gmail\.com/);
  assert.doesNotMatch(html, /h2811459442@gmail\.com/);
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
  const [smoothScroll, wickretRuntime, articlePage, globalCss, packageJson, siteContract] = await Promise.all([
    readSource("app/smooth-scroll.tsx"),
    readSource("app/wickret-runtime.tsx"),
    readSource("app/articles/[slug]/page.tsx"),
    readSource("app/globals.css"),
    readSource("package.json"),
    readWorkspaceSource("packages/site-contract/src/index.ts"),
  ]);

  assert.match(siteContract, /damping:\s*0\.06/);
  assert.match(siteContract, /renderByPixels:\s*false/);
  assert.match(siteContract, /continuousScrolling:\s*false/);
  assert.match(siteContract, /deltaToDegrees:\s*0\.15/);
  assert.match(siteContract, /maxDegrees:\s*4/);
  assert.match(siteContract, /attack:\s*1/);
  assert.match(siteContract, /release:\s*0\.78/);
  assert.match(smoothScroll, /delegateTo:\s*container/);
  assert.match(wickretRuntime, /new ScrollMagic\.Controller/);
  assert.match(wickretRuntime, /refreshInterval:\s*virtual \? 0 : 80/);
  assert.match(wickretRuntime, /controller\.scrollPos\(\(\) => currentScrollY\)/);
  assert.match(wickretRuntime, /TweenLite\.set/);
  assert.match(wickretRuntime, /triggerHook:\s*0\.82/);
  assert.match(wickretRuntime, /TweenLite\.to\(aboutTweenState,\s*1\.05/);
  assert.match(wickretRuntime, /aboutProgress\s*>=\s*1/);
  assert.match(wickretRuntime, /glyph\.style\.opacity/);
  assert.match(wickretRuntime, /completedGlyphIndex/);
  assert.match(wickretRuntime, /frontierStart/);
  assert.match(wickretRuntime, /if \(!root\.classList\.contains\("is-scrolling"\)\)/);
  assert.match(wickretRuntime, /data-scroll-wave|renderWave|activeWaveTargets/);
  assert.match(wickretRuntime, /rect\.bottom > 0 && rect\.top < window\.innerHeight/);
  assert.match(globalCss, /\.char-reveal-glyph\s*\{/);
  assert.doesNotMatch(globalCss, /story-reveal-beat/);
  assert.match(smoothScroll, /virtualSubscribers/);
  assert.match(wickretRuntime, /ready\.subscribe\(handleVirtualScroll\)/);
  assert.doesNotMatch(smoothScroll, /new CustomEvent\("david:virtual-scroll"/);
  assert.doesNotMatch(wickretRuntime, /addEventListener\(\s*"david:virtual-scroll"/);
  assert.doesNotMatch(articlePage, /ArticleScrollRuntime|window\.scrollTo|preventDefault/);
  assert.doesNotMatch(globalCss, /article-scroll-active/);
  assert.match(globalCss, /\[data-scroll-wave\]/);
  assert.match(globalCss, /\[data-scroll-wave\]\s*\{[^}]*transform-origin:\s*50% 50%/s);
  assert.match(globalCss, /\.outline-button\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(globalCss, /\.chapter-title\s*\{[^}]*font-kerning:\s*none/s);
  assert.doesNotMatch(globalCss, /html\.is-scrolling \[data-scroll-wave\][^{]*\{[^}]*will-change/s);
  assert.doesNotMatch(globalCss, /--char-progress/);
  assert.doesNotMatch(globalCss, /--char-offset/);
  assert.doesNotMatch(globalCss, /--feature-media-y/);
  const dependencies = JSON.parse(packageJson).dependencies;
  assert.equal(dependencies["smooth-scrollbar"], "8.4.0");
  assert.equal(dependencies.scrollmagic, "2.0.6");
  assert.equal(dependencies.gsap, "2.1.3");
});

test("hero entrance waits for visible self-hosted fonts and replays per language", async () => {
  const [layout, motionController, siteContract] = await Promise.all([
    readSource("app/layout.tsx"),
    readSource("app/motion-controller.tsx"),
    readWorkspaceSource("packages/site-contract/src/index.ts"),
  ]);

  assert.match(layout, /root\.classList\.add\("fonts-ready"\)/);
  assert.match(layout, /dispatchEvent\(new Event\("david:fonts-ready"\)\)/);
  assert.match(motionController, /const fontsReady = root\.classList\.contains\("fonts-ready"\)/);
  assert.match(motionController, /void fontsReady\.then/);
  assert.match(motionController, /replayLanguageEntrance/);
  assert.match(siteContract, /settleAfterMs:\s*1180/);
});

test("workspace keeps the runnable app and reusable contract package separate", async () => {
  const [rootPackage, webPackage, nextConfig, workflow] = await Promise.all([
    readWorkspaceSource("package.json"),
    readSource("package.json"),
    readSource("next.config.ts"),
    readWorkspaceSource(".github/workflows/pages.yml"),
  ]);
  const root = JSON.parse(rootPackage);
  const web = JSON.parse(webPackage);

  assert.deepEqual(root.workspaces, ["apps/*", "packages/*"]);
  assert.equal(root.dependencies, undefined);
  assert.equal(web.dependencies["@david/site-contract"], "*");
  assert.match(nextConfig, /transpilePackages:\s*\["@david\/site-contract"\]/);
  assert.match(workflow, /path:\s*apps\/web\/out/);
});

test("article gallery stays simple and title-only", async () => {
  const html = await readOutput();

  assert.equal((html.match(/<a class="article-work-card"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /article-work-meta/);
  assert.doesNotMatch(html, /gallery-motion-active/);
  assert.match(html, /ProME: Prototype-Margin Environments/);
  assert.match(html, /PPT-Agent Report/);
  assert.match(html, /Research Evidence Tracker: Implementation and Evolution/);
});

test("all three sourced reports export as bilingual canonical articles", async () => {
  const [prome, pptAgent, evidenceTracker, promeCover] = await Promise.all([
    readOutput("articles/prome-group-robust-learning"),
    readOutput("articles/ppt-agent-report"),
    readOutput("articles/openclaw-evidence-tracker"),
    readFile(new URL("../public/media/prome-framework.webp", import.meta.url)),
  ]);

  for (const html of [prome, pptAgent, evidenceTracker]) {
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
  assert.match(prome, /arxiv\.org\/abs\/2608\.13190/);
  assert.match(prome, /87\.0%/);
  assert.match(prome, /finite-sample empirical-to-population guarantee/i);
  assert.doesNotMatch(prome, /github\.com[^<]*ProME/i);
  assert.ok(promeCover.length > 100_000 && promeCover.length < 500_000);
});
