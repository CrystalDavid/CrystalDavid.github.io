import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const publications = JSON.parse(await readFile(path.join(root, 'src/data/publications.json'), 'utf8'));
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const documents = ['index.html', '404.html'];

test('the single-page profile preserves education, publications and section navigation', () => {
  const headings = [...home.matchAll(/<h2\b[^>]*>([^<]+)<\/h2>/g)].map(match => match[1]);
  assert.deepEqual(headings, ['About Me', 'Education', 'Research Interests', 'Publications', 'Projects']);
  const education = home.match(/<section\b[^>]*id="education"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(education, 'Missing Education section');
  assert.match(education, />Southern University of Science and Technology</);
  assert.match(education, /Bachelor’s degree in Data Science and Big Data Technology/);
  assert.match(home, /Southern University of Science and Technology/);
  assert.match(home, /2023 - 2027/);
  for (const id of ['about', 'education', 'interests', 'publications', 'projects']) {
    assert.ok(home.includes(`href="#${id}"`), `Missing section link: ${id}`);
    assert.ok(home.includes(`id="${id}"`), `Missing section: ${id}`);
  }
  const numbers = [...home.matchAll(/<span class="nav-number"[^>]*>(\d{2})<\/span>/g)].map(match => match[1]);
  assert.deepEqual(numbers, ['01', '02', '03', '04', '05']);
  assertResponsiveImage('ppt-agent-welcome.png');
  assert.equal(publications.length, 3);
  for (const publication of publications) {
    assert.ok(home.includes(escape(publication.title)));
    assert.ok(home.includes(`alt="${escape(publication.coverAlt)}"`));
    assertResponsiveImage(publication.coverImage);
    for (const author of publication.authors) assert.ok(home.includes(escape(author)));
  }
  assert.match(home, /href="mailto:g2811459442@gmail.com"/);
  assert.match(home, /href="https:\/\/github.com\/CrystalDavid\/PPT-Agent"/);
  assert.match(home, /href="https:\/\/github.com\/CrystalDavid\/OpenClaw-Evidence-Tracker"/);
  assert.doesNotMatch(home, /Beyond Research|Publications &amp; Manuscripts|profile-school|profile-major/);
});

function assertResponsiveImage(filename) {
  const stem = path.parse(filename).name;
  assert.match(home, new RegExp(`srcset="[^\"]*${stem}[^\"]+240w[^\"]+480w[^\"]+720w`), `${filename}: missing responsive image sizes`);
}

test('only the homepage and 404 ship, with external research links and no publication status or PDFs', async () => {
  const files = await readdir(dist, { recursive: true });
  assert.deepEqual(files.filter(file => file.endsWith('.html')).sort(), [...documents].sort());
  assert.ok(!files.some(file => /(^|[\\/])articles([\\/]|$)|\.pdf$/i.test(file)));
  await assert.rejects(access(path.join(dist, '.private')), { code: 'ENOENT' });
  const sitemap = await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /\/articles\/|404/);
  assert.match(sitemap, /https:\/\/crystaldavid.github.io\//);
  assert.ok(publications.every(publication => !('pdf' in publication) && !('status' in publication) && !('notesAvailable' in publication)));
  for (const document of documents) {
    const html = await readFile(path.join(dist, document), 'utf8');
    assert.doesNotMatch(html, /\/articles\/|>\s*(Notes|Article|PDF)\s*<\/a>|Submitted to|In preparation for submission|data-copy-code/i);
  }
  assert.ok(home.includes('href="https://arxiv.org/abs/2608.13190"'));
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
    for (const [, srcset] of html.matchAll(/srcset="([^"<>]+)"/g)) {
      for (const candidate of srcset.split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        assert.ok(url.startsWith('/_astro/'), `${document}: unexpected responsive image source ${url}`);
        await access(path.join(dist, url.slice(1)));
      }
    }
    assert.doesNotMatch(html, /file:\/\/\/|C:\\Code|C:\\Users|localhost|127\.0\.0\.1/);
    assert.doesNotMatch(html, /href="[^"<>]*\.pdf(?:[?#][^"<>]*)?"/i);
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
  assert.ok(raw < 4_000, `Browser JS is ${raw} bytes`);
  assert.ok(compressed < 2_000, `Gzipped browser JS is ${compressed} bytes`);
  console.log(`Browser JavaScript: ${raw} bytes raw / ${compressed} bytes gzip (${scripts.length} files + ${inlineScripts.size} unique inline scripts).`);
});
