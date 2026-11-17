const L = require('./_lib');

// Each account has its own data under ls:data:<username>. The whole app state is one JSON document.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.guard(res)) return;
  try {
    const a = await L.auth(req);
    if (!a) return res.status(401).json({ error: 'Chưa đăng nhập' });
    const key = 'ls:data:' + a.u.username;

    if (req.method === 'GET') {
      const v = await L.redis(['GET', key]);
      if (!v) return res.status(200).json({ ts: 0, data: null });
      return res.status(200).json(JSON.parse(v));
    }
    if (req.method === 'PUT') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!b || typeof b.data !== 'object' || b.data === null) return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
      const cur = await L.redis(['GET', key]);
      const c = cur ? JSON.parse(cur) : { ts: 0 };
      if (c.ts && b.base !== c.ts) return res.status(409).json({ error: 'Dữ liệu đã được cập nhật từ thiết bị khác', ts: c.ts });
      const out = { ts: Date.now(), data: b.data };
      const s = JSON.stringify(out);
      if (s.length > L.MAX) return res.status(413).json({ error: 'Dữ liệu quá lớn (trên 900KB). Hãy xoá bớt ảnh tải lên và dùng URL ảnh.' });
      await L.redis(['SET', key, s]);
      return res.status(200).json({ ts: out.ts });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Lỗi máy chủ: ' + e.message });
  }
};
