const L = require('./_lib');
const okName = (u) => /^[a-z0-9._-]{3,32}$/.test(u);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.guard(res)) return;
  try {
    const a = await L.auth(req);
    if (!a) return res.status(401).json({ error: 'Chưa đăng nhập' });
    const me = a.u, adm = me.role === 'admin';

    if (req.method === 'GET') {
      if (!adm) return res.status(200).json({ users: [L.pub(me)] });
      const list = (await L.listUsers()).map(L.pub).sort((x, y) => (x.username < y.username ? -1 : 1));
      return res.status(200).json({ users: list });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const b = L.body(req), act = b.action, uname = String(b.username || '').trim().toLowerCase();
    const adminCount = async () => (await L.listUsers()).filter((u) => u.role === 'admin').length;

    if (act === 'create') {
      if (!adm) return res.status(403).json({ error: 'Chỉ quản trị viên được tạo tài khoản' });
      const name = String(b.name || '').trim().slice(0, 60);
      if (!name || !okName(uname) || String(b.password || '').length < 6) {
        return res.status(400).json({ error: 'Cần tên, tên đăng nhập (3-32 ký tự a-z 0-9 . _ -) và mật khẩu từ 6 ký tự' });
      }
      if (await L.getUser(uname)) return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
      const salt = L.newSalt();
      const u = { username: uname, name, role: b.role === 'admin' ? 'admin' : 'user', perms: L.cleanPerms(b.perms), av: L.cleanAv(b.av), salt, hash: L.hash(b.password, salt) };
      await L.saveUser(u);
      await L.redis(['SADD', 'ls:users', uname]);
      return res.status(200).json({ user: L.pub(u) });
    }

    if (act === 'update') {
      const t = await L.getUser(uname);
      if (!t) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
      if (!adm && uname !== me.username) return res.status(403).json({ error: 'Không có quyền' });
      if (b.name != null) { const n = String(b.name).trim().slice(0, 60); if (n) t.name = n; }
      if (b.av != null) t.av = L.cleanAv(b.av);
      if (adm) {
        if (b.role != null) {
          if (t.role === 'admin' && b.role !== 'admin' && (await adminCount()) <= 1) return res.status(400).json({ error: 'Phải còn ít nhất một quản trị viên' });
          t.role = b.role === 'admin' ? 'admin' : 'user';
        }
        if (b.perms != null) t.perms = L.cleanPerms(b.perms);
      }
      if (b.password != null) {
        if (String(b.password).length < 6) return res.status(400).json({ error: 'Mật khẩu mới cần từ 6 ký tự' });
        if (uname === me.username && !L.same(L.hash(String(b.currentPassword || ''), t.salt), t.hash)) {
          return res.status(403).json({ error: 'Mật khẩu hiện tại không đúng' });
        }
        t.salt = L.newSalt();
        t.hash = L.hash(b.password, t.salt);
      }
      await L.saveUser(t);
      return res.status(200).json({ user: L.pub(t) });
    }

    if (act === 'delete') {
      if (!adm) return res.status(403).json({ error: 'Chỉ quản trị viên được xoá tài khoản' });
      if (uname === me.username) return res.status(400).json({ error: 'Không thể xoá chính mình' });
      const t = await L.getUser(uname);
      if (!t) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
      if (t.role === 'admin' && (await adminCount()) <= 1) return res.status(400).json({ error: 'Phải còn ít nhất một quản trị viên' });
      await L.redis(['DEL', 'ls:user:' + uname]);
      await L.redis(['DEL', 'ls:data:' + uname]);
      await L.redis(['SREM', 'ls:users', uname]);
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'Yêu cầu không hợp lệ' });
  } catch (e) {
    return res.status(500).json({ error: 'Lỗi máy chủ: ' + e.message });
  }
};
