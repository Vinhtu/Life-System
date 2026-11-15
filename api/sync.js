// Vercel serverless function: stores the whole Life System data set in one Redis key.
// Needs: a Redis store from the Vercel Marketplace (Upstash) connected to the project
// (it injects KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
// and an environment variable SYNC_PASSWORD that you choose.
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const PASSWORD = process.env.SYNC_PASSWORD;
const KEY = 'life-system:data';
const MAX = 900000; // keep under typical 1 MB request limits

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

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!PASSWORD || !URL_ || !TOKEN) {
    return res.status(503).json({ error: 'Máy chủ chưa cấu hình: cần SYNC_PASSWORD và Redis (Upstash) trong Vercel' });
  }
  if (!same(req.headers['x-sync-key'] || '', PASSWORD)) {
    return res.status(401).json({ error: 'Sai mã đồng bộ' });
  }
  try {
    if (req.method === 'GET') {
      const v = await redis(['GET', KEY]);
      if (!v) return res.status(200).json({ ts: 0, data: null });
      return res.status(200).json(JSON.parse(v));
    }
    if (req.method === 'PUT') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!b || typeof b.data !== 'object' || b.data === null) return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
      const cur = await redis(['GET', KEY]);
      const c = cur ? JSON.parse(cur) : { ts: 0 };
      if (b.base !== '*' && c.ts && b.base !== c.ts) return res.status(409).json({ error: 'Xung đột', ts: c.ts });
      const out = { ts: Date.now(), data: b.data };
      const s = JSON.stringify(out);
      if (s.length > MAX) return res.status(413).json({ error: 'Dữ liệu quá lớn (trên 900KB). Hãy xoá bớt ảnh tải lên và dùng URL ảnh.' });
      await redis(['SET', KEY, s]);
      return res.status(200).json({ ts: out.ts });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Lỗi máy chủ: ' + e.message });
  }
};
