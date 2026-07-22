import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readOutput = (route = "") =>
  readFile(new URL(`../out/${route ? `${route}/` : ""}index.html`, import.meta.url), "utf8");

test("homepage exports the intended typography and motion hooks", async () => {
  const html = await readOutput();

  assert.match(html, /\/fonts\/nunito-latin\.woff2/);
  assert.ok(
    (html.match(/data-wickret-pointer/g) ?? []).length >= 3,
    "Experience, Agent and Article should all expose the pointer-motion hook",
  );
  assert.match(html, /ppt-agent-mac-composite\.webp/);
  assert.match(html, />Agent</);
  assert.match(html, />Article</);
});

test("article gallery stays simple and title-only", async () => {
  const html = await readOutput();

  assert.equal((html.match(/<a class="article-work-card"/g) ?? []).length, 6);
  assert.doesNotMatch(html, /article-work-meta/);
  assert.doesNotMatch(html, /gallery-motion-active/);
  assert.match(html, /Notes on Using AI Tools/);
  assert.match(html, /How I Built PPT-Agent/);
});

test("both Agent motion comparison pages are exported", async () => {
  const [agent1, agent2] = await Promise.all([readOutput("agent1"), readOutput("agent2")]);

  assert.match(agent1, /Agent/);
  assert.match(agent2, /agent-lab-stage/);
  assert.match(agent2, /Wickret method/);
  assert.match(agent2, /Agent/);
});
