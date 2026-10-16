import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const articles = JSON.parse(await readFile(path.join(root, 'src/data/articles.json'), 'utf8'));
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const documents = ['index.html', '404.html', ...articles.map(article => `articles/${article.slug}/index.html`)];

test('all three public English articles are statically rendered, with their sources and return anchors', async () => {
  assert.equal(articles.length, 3);
  let sectionCount = 0;
  let blockCount = 0;
  for (const article of articles) {
    const html = await readFile(path.join(dist, 'articles', article.slug, 'index.html'), 'utf8');
    for (const key of ['titleEn', 'summaryEn', 'coverAltEn']) assert.ok(html.includes(escape(article[key])), `${article.slug}: missing ${key}`);
    assert.ok(html.includes(`<title>${escape(article.titleEn)} — David</title>`));
    assert.ok(html.includes(`name="description" content="${escape(article.summaryEn)}"`));
    assert.ok(!html.includes(escape(article.titleZh)), `${article.slug}: Chinese title still rendered`);
    assert.ok(html.includes(article.sourceHref));
    assert.ok(html.includes(`/#article-card-${article.slug}`));
    assert.ok(home.includes(`id="article-card-${article.slug}"`));
    for (const section of article.sections) {
      sectionCount++;
      assert.ok(html.includes(escape(section.headingEn)));
      for (const block of section.blocks) {
        blockCount++;
        if (block.type === 'code') assert.ok(html.includes(escape(block.code)), `${article.slug}: missing code`);
        else if (block.type === 'list') for (const item of block.items) assert.ok(html.includes(escape(item.en)));
        else assert.ok(html.includes(escape(block.en)));
      }
    }
  }
  assert.equal(sectionCount, 18);
  assert.equal(blockCount, 100);
});

test('withheld manuscripts keep their listing but publish neither notes nor downloadable PDFs', async () => {
  const withheld = [
    { slug: 'gra-flow-image-restoration', pdf: 'gra-flow.pdf' },
    { slug: 'recast-image-restoration', pdf: 'recast.pdf' },
  ];
  const publications = JSON.parse(await readFile(path.join(root, 'src/data/publications.json'), 'utf8'));
  const sitemap = await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8');
  for (const paper of withheld) {
    const metadata = publications.find(p => p.slug === paper.slug);
    assert.ok(metadata && !metadata.pdf && !metadata.notesAvailable);
    assert.ok(home.includes(escape(metadata.title)));
    assert.ok(home.includes(`id="article-card-${paper.slug}"`));
    assert.ok(!home.includes(`/articles/${paper.slug}/`));
    assert.ok(!home.includes(`/papers/${paper.pdf}`));
    assert.ok(!sitemap.includes(paper.slug));
    assert.ok(!articles.some(article => article.slug === paper.slug));
    await assert.rejects(access(path.join(dist, 'articles', paper.slug, 'index.html')), { code: 'ENOENT' });
    await assert.rejects(access(path.join(dist, 'papers', paper.pdf)), { code: 'ENOENT' });
  }
  await assert.rejects(access(path.join(dist, '.private')), { code: 'ENOENT' });
  assert.deepEqual((await readdir(path.join(dist, 'papers'))).sort(), ['prome.pdf']);
  assert.ok(home.includes('/papers/prome.pdf') && home.includes('/articles/prome-group-robust-learning/'));
});

test('all local links, images, scripts, fonts, anchor targets and social metadata resolve', async () => {
  for (const document of documents) {
    const html = await readFile(path.join(dist, document), 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${document}: duplicate ids`);
    for (const [, url] of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      if (!url.startsWith('/') && !url.startsWith('#')) continue;
      const [pathname, hash] = url.split('#');
      const destination = !pathname ? path.join(dist, document) : path.join(dist, pathname.replace(/^\//, ''));
      let file = destination;
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await access(file);
      if (hash) assert.ok((await readFile(file, 'utf8')).includes(`id="${hash}"`), `${document}: broken anchor ${url}`);
    }
    assert.doesNotMatch(html, /file:\/\/\/|C:\\Code|C:\\Users|localhost|127\.0\.0\.1/);
    assert.ok(html.includes('rel="canonical"'));
    assert.ok(html.includes('name="description"'));
    assert.match(html, /<html\b[^>]*\blang="en"/);
    assert.doesNotMatch(html, /lang-zh|data-lang|data-alt-zh|language-button|<footer\b|©/);
    assert.ok(html.includes('name="color-scheme" content="light"'));
    assert.ok(html.includes('name="theme-color" content="#ffffff"'));
    assert.doesNotMatch(html, /prefers-color-scheme/);
  }
  await access(path.join(dist, 'social.png'));
  await access(path.join(dist, 'sitemap-index.xml'));
  await access(path.join(dist, 'fonts/noto-sans-sc-license.txt'));
  await access(path.join(dist, 'fonts/nunito-license.txt'));
});

test('the static site keeps the browser JavaScript small and has no React hydration runtime', async () => {
  const assets = path.join(dist, '_astro');
  const scripts = (await readdir(assets)).filter(name => name.endsWith('.js'));
  let raw = 0;
  let compressed = 0;
  for (const name of scripts) {
    const source = await readFile(path.join(assets, name));
    raw += source.length;
    compressed += gzipSync(source).length;
    assert.doesNotMatch(source.toString(), /react-dom|smooth-scrollbar|ScrollMagic|gsap/);
  }
  // Astro inlines small scripts, so count those too instead of just asset files.
  const inlineScripts = new Set();
  for (const document of documents) {
    const html = await readFile(path.join(dist, document), 'utf8');
    for (const [, attributes, source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!attributes.includes('src=') && source.trim()) inlineScripts.add(source);
    }
  }
  for (const source of inlineScripts) {
    raw += Buffer.byteLength(source);
    compressed += gzipSync(source).length;
    assert.doesNotMatch(source, /david-site-language|data-lang-toggle|colorScheme\s*=/);
  }
  assert.ok(raw < 40_000, `Browser JS is ${raw} bytes`);
  assert.ok(compressed < 15_000, `Gzipped browser JS is ${compressed} bytes`);
  console.log(`Browser JavaScript: ${raw} bytes raw / ${compressed} bytes gzip (${scripts.length} files + ${inlineScripts.size} unique inline scripts).`);
});
