const kv = await Deno.openKv();

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://crystaldavid.github.io";
const GITHUB_OWNER = Deno.env.get("GITHUB_OWNER") || "CrystalDavid";
const GITHUB_REPO = Deno.env.get("GITHUB_REPO") || "CrystalDavid.github.io";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") || "";
const ADMIN_PASSWORD_HASH = Deno.env.get("ADMIN_PASSWORD_HASH") ||
  "da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551";
const MAX_NICKNAME_LENGTH = 24;
const MAX_CONTENT_LENGTH = 600;
const PAGE_SIZE = 80;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;

type CommentRecord = {
  id: string;
  page: string;
  nickname: string;
  content: string;
  created_at: string;
  reactions?: Record<string, number>;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": ALLOWED_ORIGIN,
    "access-control-allow-methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "authorization, content-type, x-admin-password",
    "access-control-max-age": "86400",
  };
}

function normalizePage(value: string | null): string {
  const page = (value || "/").trim();
  if (!page.startsWith("/")) return "/" + page;
  return page.slice(0, 180);
}

function cleanText(value: unknown, maxLength: number): string {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
}

async function checkRateLimit(req: Request): Promise<boolean> {
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  const key = ["rate", ip, bucket];
  const current = await kv.get<number>(key);
  const next = (current.value || 0) + 1;
  await kv.set(key, next, { expireIn: RATE_LIMIT_WINDOW_MS * 2 });
  return next <= RATE_LIMIT_MAX;
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isAdminRequest(req: Request): Promise<boolean> {
  const password = req.headers.get("x-admin-password") || "";
  if (!password) return false;
  return await sha256(password) === ADMIN_PASSWORD_HASH;
}

async function githubHeaders(req: Request, contentType = true, allowAdminToken = false): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers.authorization = auth;
  else if (allowAdminToken && await isAdminRequest(req) && GITHUB_TOKEN) {
    headers.authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  if (contentType) headers["content-type"] = "application/json";
  return headers;
}

async function githubJson(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status === 204) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  const text = await res.text();
  return new Response(text || "{}", {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

function githubApi(path: string): string {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`;
}

async function listComments(page: string): Promise<CommentRecord[]> {
  const comments: CommentRecord[] = [];
  const iter = kv.list<CommentRecord>({ prefix: ["comments", page] }, { reverse: true, limit: PAGE_SIZE });
  for await (const entry of iter) {
    comments.push(entry.value);
  }
  return comments;
}

async function createComment(req: Request): Promise<Response> {
  if (!await checkRateLimit(req)) {
    return json({ ok: false, error: "发布太频繁，请稍后再试。" }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "请求格式不正确。" }, 400);
  }

  const page = normalizePage(String(body.page || "/"));
  const nickname = cleanText(body.nickname, MAX_NICKNAME_LENGTH);
  const content = cleanText(body.content, MAX_CONTENT_LENGTH);

  if (!nickname) return json({ ok: false, error: "请输入昵称。" }, 400);
  if (!content) return json({ ok: false, error: "请输入留言内容。" }, 400);

  const comment: CommentRecord = {
    id: crypto.randomUUID(),
    page,
    nickname,
    content,
    created_at: new Date().toISOString(),
    reactions: {},
  };

  await kv.set(["comments", page, comment.created_at, comment.id], comment);
  return json({ ok: true, comment });
}

async function deleteComment(req: Request): Promise<Response> {
  if (!await isAdminRequest(req)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad Request" }, 400);
  }
  const page = normalizePage(String(body.page || "/"));
  const createdAt = cleanText(body.created_at, 80);
  const id = cleanText(body.id, 80);
  if (!createdAt || !id) return json({ ok: false, error: "Missing comment id" }, 400);
  await kv.delete(["comments", page, createdAt, id]);
  return json({ ok: true });
}

async function reactComment(req: Request): Promise<Response> {
  if (!await checkRateLimit(req)) {
    return json({ ok: false, error: "Too many requests" }, 429);
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad Request" }, 400);
  }
  const page = normalizePage(String(body.page || "/"));
  const createdAt = cleanText(body.created_at, 80);
  const id = cleanText(body.id, 80);
  const reaction = cleanText(body.reaction, 24);
  if (!createdAt || !id || !reaction) return json({ ok: false, error: "Missing reaction target" }, 400);

  const key = ["comments", page, createdAt, id];
  const current = await kv.get<CommentRecord>(key);
  if (!current.value) return json({ ok: false, error: "Comment not found" }, 404);

  const comment = current.value;
  const reactions = comment.reactions || {};
  reactions[reaction] = (reactions[reaction] || 0) + 1;
  comment.reactions = reactions;
  await kv.set(key, comment);
  return json({ ok: true, reactions });
}

async function handleGithub(req: Request, url: URL): Promise<Response> {
  const path = url.pathname.replace(/^\/github/, "");

  if (path === "/issues" && req.method === "GET") {
    const label = url.searchParams.get("label") || "";
    const state = url.searchParams.get("state") || "open";
    const perPage = url.searchParams.get("per_page") || "50";
    const target = githubApi(`/issues?labels=${encodeURIComponent(label)}&state=${encodeURIComponent(state)}&per_page=${encodeURIComponent(perPage)}`);
    return githubJson(target, { headers: await githubHeaders(req, false) });
  }

  if (path === "/issues" && req.method === "POST") {
    return githubJson(githubApi("/issues"), {
      method: "POST",
      headers: await githubHeaders(req, true, true),
      body: await req.text(),
    });
  }

  const issueMatch = path.match(/^\/issues\/(\d+)$/);
  if (issueMatch && req.method === "PATCH") {
    return githubJson(githubApi(`/issues/${issueMatch[1]}`), {
      method: "PATCH",
      headers: await githubHeaders(req, true, true),
      body: await req.text(),
    });
  }

  const reactionMatch = path.match(/^\/issues\/(\d+)\/reactions$/);
  if (reactionMatch && req.method === "GET") {
    return githubJson(githubApi(`/issues/${reactionMatch[1]}/reactions`), {
      headers: await githubHeaders(req, false),
    });
  }

  if (reactionMatch && req.method === "POST") {
    return githubJson(githubApi(`/issues/${reactionMatch[1]}/reactions`), {
      method: "POST",
      headers: await githubHeaders(req, true, true),
      body: await req.text(),
    });
  }

  if (path === "/content") {
    const repoPath = url.searchParams.get("path") || "";
    if (!repoPath) return json({ ok: false, error: "Missing path" }, 400);
    const encodedPath = repoPath.split("/").map(encodeURIComponent).join("/");
    const ref = url.searchParams.get("ref") || "main";
    const target = githubApi(`/contents/${encodedPath}`);
    if (req.method === "GET") {
      return githubJson(`${target}?ref=${encodeURIComponent(ref)}`, { headers: await githubHeaders(req, false) });
    }
    if (req.method === "DELETE") {
      const headers = await githubHeaders(req, true, true);
      let body: Record<string, unknown> = {};
      try {
        body = await req.json();
      } catch {
        body = {};
      }
      const branch = String(body.branch || "main");
      const message = String(body.message || `Delete file: ${repoPath}`);
      for (let attempt = 0; attempt < 3; attempt++) {
        const current = await fetch(`${target}?ref=${encodeURIComponent(branch)}&t=${Date.now()}`, {
          headers: await githubHeaders(req, false, true),
          cache: "no-store",
        });
        if (current.status === 404) return json({ deleted: false, path: repoPath }, 200);
        if (!current.ok) return githubJson(`${target}?ref=${encodeURIComponent(branch)}`, { headers: await githubHeaders(req, false, true) });
        const currentData = await current.json();
        const sha = currentData.sha;
        const deleted = await fetch(target, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ message, sha, branch }),
          cache: "no-store",
        });
        if (deleted.status === 404) return json({ deleted: false, path: repoPath }, 200);
        if (deleted.ok || deleted.status !== 409 || attempt === 2) {
          if (deleted.status === 204) return new Response(null, { status: 204, headers: corsHeaders() });
          const text = await deleted.text();
          return new Response(text || "{}", {
            status: deleted.status,
            headers: {
              "content-type": deleted.headers.get("content-type") || "application/json; charset=utf-8",
              ...corsHeaders(),
            },
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 450 + attempt * 450));
      }
    }
    if (req.method === "PUT") {
      return githubJson(target, {
        method: req.method,
        headers: await githubHeaders(req, true, true),
        body: await req.text(),
      });
    }
  }

  if (path === "/dispatch-pages" && req.method === "POST") {
    return githubJson(githubApi("/actions/workflows/pages.yml/dispatches"), {
      method: "POST",
      headers: await githubHeaders(req, true, true),
      body: await req.text(),
    });
  }

  return json({ ok: false, error: "GitHub proxy route not found" }, 404);
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (url.pathname === "/health") {
    return json({ ok: true, service: "david-comment-api", time: new Date().toISOString() });
  }

  if (url.pathname === "/comments" && req.method === "GET") {
    const page = normalizePage(url.searchParams.get("page"));
    const comments = await listComments(page);
    return json({ ok: true, comments });
  }

  if (url.pathname === "/comments" && req.method === "POST") {
    return createComment(req);
  }

  if (url.pathname === "/comments" && req.method === "DELETE") {
    return deleteComment(req);
  }

  if (url.pathname === "/comments/reaction" && req.method === "POST") {
    return reactComment(req);
  }

  if (url.pathname.startsWith("/github/")) {
    return handleGithub(req, url);
  }

  return json({ ok: false, error: "Not Found" }, 404);
});
