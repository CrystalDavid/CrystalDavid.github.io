const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});
const db = app.database();
const _ = db.command;

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ||
  'da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551';
const MAX_NICKNAME_LENGTH = 24;
const MAX_CONTENT_LENGTH = 600;
const MAX_VISIT_FIELD_LENGTH = 240;
const PAGE_SIZE = 200;
const VISIT_PAGE_SIZE = 500;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ensuredCollections = {};
const ALLOWED_ORIGINS = [
  'https://crystaldavid.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

function corsHeaders(event) {
  const origin = event.headers && (event.headers.origin || event.headers.Origin);
  const allowOrigin = ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
}

function httpResponse(event, statusCode, data) {
  return {
    statusCode,
    headers: corsHeaders(event),
    body: JSON.stringify(data)
  };
}

function isHttpEvent(event) {
  return !!(event && (event.httpMethod || event.requestContext || event.headers));
}

function parseHttpBody(event) {
  if (!event || !event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function ok(data) {
  return Object.assign({ ok: true }, data || {});
}

function fail(error, code) {
  return { ok: false, error: error || '请求失败', code: code || 'BAD_REQUEST' };
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizeKey(value) {
  return String(value || '/').trim().slice(0, 180) || '/';
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanMultilineText(value, maxLength) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .split('\n')
    .map(function(line) {
      return line.replace(/[ \t]+/g, ' ').trimEnd();
    })
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, maxLength);
}

function getActor(event) {
  const context = cloudbase.getCloudbaseContext ? cloudbase.getCloudbaseContext() : {};
  const headers = event.headers || {};
  const ip = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-IP'];
  return context.OPENID || context.UNIONID || event.openId || event.userInfo && event.userInfo.openId || ip || 'anonymous';
}

function getClientIp(event) {
  const headers = event.headers || {};
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  const ip = forwarded.split(',')[0].trim() ||
    headers['x-real-ip'] ||
    headers['X-Real-IP'] ||
    headers['x-client-ip'] ||
    headers['X-Client-IP'] ||
    '';
  return String(ip || '').replace(/^::ffff:/, '').slice(0, 64);
}

function isPrivateIp(ip) {
  return /^10\./.test(ip) ||
    /^127\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip === '::1' ||
    ip.indexOf('fc') === 0 ||
    ip.indexOf('fd') === 0;
}

async function ensureCollection(name) {
  if (ensuredCollections[name]) return;
  try {
    await db.createCollection(name);
  } catch (e) {
    // Collection already exists, or the runtime has no create permission. In either case
    // we still try the real read/write below so the error path stays accurate.
  }
  ensuredCollections[name] = true;
}

async function resolveIpLocation(ip) {
  if (!ip) return '未知 IP';
  if (isPrivateIp(ip)) return '本地/内网';
  const controller = new AbortController();
  const timeout = setTimeout(function() { controller.abort(); }, 1200);
  try {
    const res = await fetch('http://ip-api.com/json/' + encodeURIComponent(ip) + '?lang=zh-CN&fields=status,country,regionName,city,isp,query', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    if (!res.ok) return '待解析';
    const data = await res.json();
    if (!data || data.status !== 'success') return '待解析';
    return [data.country, data.regionName, data.city, data.isp].filter(Boolean).join(' / ') || '待解析';
  } catch (e) {
    return '待解析';
  } finally {
    clearTimeout(timeout);
  }
}

async function checkRateLimit(event, bucketName, maxCount) {
  const actor = getActor(event);
  const bucket = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
  const id = sha256([bucketName, actor, bucket].join('|'));
  const ref = db.collection('rate_limits').doc(id);
  try {
    const updated = await ref.update({
      count: _.inc(1),
      updatedAt: Date.now()
    });
    if (!updated.updated) {
      await ref.set({
        bucketName,
        actorHash: sha256(actor),
        bucket,
        count: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return true;
    }
  } catch (e) {
    try {
      await ref.set({
        bucketName,
        actorHash: sha256(actor),
        bucket,
        count: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return true;
    } catch (ignored) {
      await ref.update({ count: _.inc(1), updatedAt: Date.now() });
    }
  }
  const current = await ref.get();
  const count = current.data && current.data[0] ? current.data[0].count || 0 : 1;
  return count <= maxCount;
}

async function listComments(event) {
  const pages = Array.isArray(event.pages) && event.pages.length
    ? event.pages.map(normalizeKey)
    : [normalizeKey(event.page)];
  const query = pages.length === 1 ? { page: pages[0], status: 'visible' } : {
    page: _.in(pages),
    status: 'visible'
  };
  const res = await db.collection('comments')
    .where(query)
    .orderBy('createdAt', 'desc')
    .limit(PAGE_SIZE)
    .get();
  return ok({
    comments: (res.data || []).map(function(item) {
      return {
        id: item._id,
        page: item.page,
        nickname: item.nickname,
        content: item.content,
        parent_id: item.parentId || '',
        reply_to_nickname: item.replyToNickname || '',
        created_at: new Date(item.createdAt || Date.now()).toISOString()
      };
    })
  });
}

async function createComment(event) {
  if (!await checkRateLimit(event, 'comment', 6)) {
    return fail('发布太频繁，请稍后再试。', 'RATE_LIMITED');
  }
  const page = normalizeKey(event.page);
  const nickname = cleanText(event.nickname, MAX_NICKNAME_LENGTH);
  const content = cleanMultilineText(event.content, MAX_CONTENT_LENGTH);
  const parentId = cleanText(event.parentId || event.parent_id, 128);
  const replyToNickname = cleanText(event.replyToNickname || event.reply_to_nickname, MAX_NICKNAME_LENGTH);
  if (!nickname) return fail('请输入昵称。');
  if (!content) return fail('请输入留言内容。');

  const now = Date.now();
  const record = {
    page,
    nickname,
    content,
    parentId,
    replyToNickname,
    status: 'visible',
    createdAt: now,
    updatedAt: now,
    actorHash: sha256(getActor(event))
  };
  const created = await db.collection('comments').add(record);
  return ok({
    comment: {
      id: created.id,
      page,
      nickname,
      content,
      parent_id: parentId,
      reply_to_nickname: replyToNickname,
      created_at: new Date(now).toISOString()
    }
  });
}

async function deleteComment(event) {
  if (sha256(event.adminPassword || '') !== ADMIN_PASSWORD_HASH) {
    return fail('Unauthorized', 'UNAUTHORIZED');
  }
  const id = cleanText(event.id, 128);
  if (!id) return fail('Missing comment id');
  await db.collection('comments').doc(id).update({
    status: 'deleted',
    updatedAt: Date.now()
  });
  return ok();
}

async function getReactions(event) {
  const target = normalizeKey(event.target || event.page);
  const res = await db.collection('reactions').where({ target }).get();
  const reactions = {};
  (res.data || []).forEach(function(item) {
    reactions[item.reaction] = item.count || 0;
  });
  return ok({ reactions });
}

async function addReaction(event) {
  if (!await checkRateLimit(event, 'reaction', 60)) {
    return fail('操作太频繁，请稍后再试。', 'RATE_LIMITED');
  }
  const target = normalizeKey(event.target || event.page);
  const reaction = cleanText(event.reaction, 20);
  if (!reaction) return fail('请指定表情类型。');

  const id = sha256([target, reaction].join('|'));
  const ref = db.collection('reactions').doc(id);
  const now = Date.now();
  try {
    const updated = await ref.update({
      count: _.inc(1),
      updatedAt: now
    });
    if (!updated.updated) {
      await ref.set({ target, reaction, count: 1, createdAt: now, updatedAt: now });
    }
  } catch (e) {
    try {
      await ref.set({ target, reaction, count: 1, createdAt: now, updatedAt: now });
    } catch (duplicate) {
      await ref.update({ count: _.inc(1), updatedAt: now });
    }
  }
  const current = await ref.get();
  const data = current.data && current.data[0] ? current.data[0] : {};
  return ok({ count: data.count || 1 });
}

async function recordVisit(event) {
  if (!await checkRateLimit(event, 'visit', 120)) {
    return ok({ skipped: true });
  }
  await ensureCollection('visit_logs');
  const ip = getClientIp(event);
  const now = Date.now();
  const location = await resolveIpLocation(ip);
  await db.collection('visit_logs').add({
    actionType: cleanText(event.actionType || 'pageview', 40),
    path: normalizeKey(event.path || '/'),
    pageKind: cleanText(event.pageKind || 'page', 40),
    title: cleanText(event.title, MAX_VISIT_FIELD_LENGTH),
    target: cleanText(event.target, MAX_VISIT_FIELD_LENGTH),
    targetText: cleanText(event.targetText, 100),
    referrer: cleanText(event.referrer, MAX_VISIT_FIELD_LENGTH),
    language: cleanText(event.language, 40),
    timezone: cleanText(event.timezone, 80),
    screen: cleanText(event.screen, 40),
    userAgent: cleanText(event.userAgent, MAX_VISIT_FIELD_LENGTH),
    ip,
    ipHash: sha256(ip || getActor(event)),
    location,
    createdAt: now
  });
  return ok({ recorded: true });
}

async function listVisitLogs(event) {
  if (sha256(event.adminPassword || '') !== ADMIN_PASSWORD_HASH) {
    return fail('Unauthorized', 'UNAUTHORIZED');
  }
  await ensureCollection('visit_logs');
  const res = await db.collection('visit_logs')
    .orderBy('createdAt', 'desc')
    .limit(VISIT_PAGE_SIZE)
    .get();
  return ok({
    logs: (res.data || []).map(function(item) {
      return {
        id: item._id,
        action_type: item.actionType || 'pageview',
        path: item.path || '/',
        page_kind: item.pageKind || 'page',
        title: item.title || '',
        target: item.target || '',
        target_text: item.targetText || '',
        referrer: item.referrer || '',
        language: item.language || '',
        timezone: item.timezone || '',
        screen: item.screen || '',
        user_agent: item.userAgent || '',
        ip: item.ip || '',
        location: item.location || '待解析',
        created_at: new Date(item.createdAt || Date.now()).toISOString()
      };
    })
  });
}

async function route(event) {
  try {
    switch (event.action) {
      case 'listComments':
        return listComments(event);
      case 'createComment':
        return createComment(event);
      case 'deleteComment':
        return deleteComment(event);
      case 'getReactions':
        return getReactions(event);
      case 'addReaction':
        return addReaction(event);
      case 'recordVisit':
        return recordVisit(event);
      case 'listVisitLogs':
        return listVisitLogs(event);
      case 'health':
        return ok({ service: 'cloudbase-comment-api', time: new Date().toISOString() });
      default:
        return fail('Unknown action');
    }
  } catch (e) {
    return fail(e && e.message ? e.message : 'Server error', 'SERVER_ERROR');
  }
}

exports.main = async function(event) {
  if (isHttpEvent(event)) {
    if (event.httpMethod === 'OPTIONS') {
      return httpResponse(event, 204, {});
    }
    const payload = parseHttpBody(event);
    const result = await route(Object.assign({}, payload, { headers: event.headers || {} }));
    return httpResponse(event, result.ok === false ? 400 : 200, result);
  }
  return route(event || {});
};
