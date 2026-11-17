const L = require('./_lib');
const okName = (u) => /^[a-z0-9._-]{3,32}$/.test(u);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.guard(res)) return;
  try {
    if (req.method === 'GET') {
      const a = await L.auth(req);
      if (a) return res.status(200).json({ user: L.pub(a.u) });
      const n = await L.redis(['SCARD', 'ls:users']);
      return res.status(401).json({ needsSetup: Number(n) === 0 });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const b = L.body(req);
    const act = b.action;

    if (act === 'logout') {
      const a = await L.auth(req);
      if (a) await L.redis(['DEL', 'ls:sess:' + a.t]);
      return res.status(200).json({ ok: true });
    }

    const uname = String(b.username || '').trim().toLowerCase();

    if (act === 'setup') {
      const n = await L.redis(['SCARD', 'ls:users']);
      if (Number(n) > 0) return res.status(403).json({ error: 'Đã có tài khoản, không thể khởi tạo lại' });
      if (!L.same(b.setupCode || '', L.SETUP)) return res.status(403).json({ error: 'Sai mã khởi tạo' });
      const name = String(b.name || '').trim().slice(0, 60);
      if (!name || !okName(uname) || String(b.password || '').length < 6) {
        return res.status(400).json({ error: 'Cần tên, tên đăng nhập (3-32 ký tự a-z 0-9 . _ -) và mật khẩu từ 6 ký tự' });
      }
      const salt = L.newSalt();
      const u = { username: uname, name, role: 'admin', perms: L.ALL_PAGES, av: '', salt, hash: L.hash(b.password, salt) };
      await L.saveUser(u);
      await L.redis(['SADD', 'ls:users', uname]);
      let init = b.initial && typeof b.initial === 'object' ? b.initial : null;
      if (!init) {
        // data saved by the earlier single-key sync version (life-system:data), if any
        const legacy = await L.redis(['GET', 'life-system:data']);
        if (legacy) { try { init = JSON.parse(legacy).data || null; } catch (e) { init = null; } }
      }
      if (init) {
        const s = JSON.stringify({ ts: Date.now(), data: init });
        if (s.length <= L.MAX) await L.redis(['SET', 'ls:data:' + uname, s]);
      }
      return res.status(200).json({ token: await L.newSession(uname), user: L.pub(u) });
    }

    if (act === 'login') {
      const fk = 'ls:fail:' + uname;
      const f = Number((await L.redis(['GET', fk])) || 0);
      if (f >= 8) return res.status(429).json({ error: 'Đăng nhập sai quá nhiều lần, hãy thử lại sau 15 phút' });
      const u = okName(uname) ? await L.getUser(uname) : null;
      const salt = u ? u.salt : 'x'.repeat(32);
      const h = L.hash(b.password || '', salt); // always hash, to keep timing similar
      if (!u || !L.same(h, u.hash)) {
        await L.redis(['INCR', fk]);
        await L.redis(['EXPIRE', fk, 900]);
        return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }
      await L.redis(['DEL', fk]);
      return res.status(200).json({ token: await L.newSession(uname), user: L.pub(u) });
    }
    return res.status(400).json({ error: 'Yêu cầu không hợp lệ' });
  } catch (e) {
    return res.status(500).json({ error: 'Lỗi máy chủ: ' + e.message });
  }
};
