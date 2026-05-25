const kv = await Deno.openKv();

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://crystaldavid.github.io";
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
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
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
  };

  await kv.set(["comments", page, comment.created_at, comment.id], comment);
  return json({ ok: true, comment });
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

  return json({ ok: false, error: "Not Found" }, 404);
});
