// Shared helpers for the Life System API (Vercel serverless functions, Node).
// Needs a Redis store from the Vercel Marketplace (Upstash) connected to the project
// (injects KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
// and an environment variable SETUP_CODE (or SYNC_PASSWORD) that you choose: the secret code
// that is required once to create the first administrator account.
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SETUP = process.env.SETUP_CODE || process.env.SYNC_PASSWORD;
const MAX = 900000;            // max size of one user's data (JSON string)
const SESSION_SECONDS = 30 * 24 * 3600;
const ALL_PAGES = ['today', 'goal', 'stats', 'legd', 'biz', 'eng', 'pf', 'per', 'fin', 'acc', 'sys'];

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'redis ' + r.status);
  return j.result;
}

const hash = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
const newSalt = () => crypto.randomBytes(16).toString('hex');

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const pub = (u) => ({ username: u.username, name: u.name, role: u.role, perms: u.perms || [], av: u.av || '' });
const cleanPerms = (p) => (Array.isArray(p) ? p.filter((x) => ALL_PAGES.includes(x)) : []);
const cleanAv = (a) => (typeof a === 'string' && a.length <= 40000 && (a.length <= 8 || a.startsWith('data:image/')) ? a : '');

async function getUser(name) {
  const v = await redis(['GET', 'ls:user:' + name]);
  return v ? JSON.parse(v) : null;
}
async function saveUser(u) { await redis(['SET', 'ls:user:' + u.username, JSON.stringify(u)]); }
async function listUsers() {
  const names = await redis(['SMEMBERS', 'ls:users']);
  if (!names.length) return [];
  const vals = await redis(['MGET', ...names.map((n) => 'ls:user:' + n)]);
  return vals.filter(Boolean).map((v) => JSON.parse(v));
}
async function newSession(username) {
  const t = crypto.randomBytes(32).toString('hex');
  await redis(['SET', 'ls:sess:' + t, username, 'EX', SESSION_SECONDS]);
  return t;
}
async function auth(req) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!/^[a-f0-9]{64}$/.test(t)) return null;
  const n = await redis(['GET', 'ls:sess:' + t]);
  if (!n) return null;
  const u = await getUser(n);
  return u ? { u, t } : null;
}
const body = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});
function guard(res) {
  if (!URL_ || !TOKEN || !SETUP) {
    res.status(503).json({ error: 'Máy chủ chưa cấu hình: cần Redis (Upstash) và biến môi trường SETUP_CODE (hoặc SYNC_PASSWORD) trong Vercel' });
    return false;
  }
  return true;
}

module.exports = { redis, hash, newSalt, same, pub, cleanPerms, cleanAv, getUser, saveUser, listUsers, newSession, auth, body, guard, MAX, SETUP, ALL_PAGES };
