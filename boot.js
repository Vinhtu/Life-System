// Runs before the app. Checks the login with the server, loads the signed-in account's data from the
// server into the browser, then starts the app. Without a server (API missing) the app starts in local mode.
(function () {
  var TK = 'ls-token', KEYS = /^(ls|ar|lg)-/, SKIP = /^ls-(token|sess|users|synckey|syncmeta)$/;
  var tok = function () { try { return localStorage.getItem(TK) || ''; } catch (e) { return ''; } };
  async function api(m, u, b) {
    try {
      var h = { 'Content-Type': 'application/json' };
      if (tok()) h.Authorization = 'Bearer ' + tok();
      var r = await fetch(u, { method: m, headers: h, body: b ? JSON.stringify(b) : undefined });
      var j = {};
      try { j = await r.json(); } catch (e) {}
      return { s: r.status, j: j };
    } catch (e) { return { s: 0, j: {} }; }
  }
  function snap() {
    var d = {};
    Object.keys(localStorage).forEach(function (k) { if (KEYS.test(k) && !SKIP.test(k)) d[k] = localStorage.getItem(k); });
    return d;
  }
  function box(html) {
    var o = document.getElementById('lgn');
    if (!o) { o = document.createElement('div'); o.id = 'lgn'; o.className = 'ovl lg'; document.body.appendChild(o); }
    o.innerHTML = '<div class="ovb" style="max-width:380px">' + html + '</div>';
    return o;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function loadApp() { var s = document.createElement('script'); s.src = 'app.js'; document.body.appendChild(s); }

  async function start(user) {
    box('<p>Đang tải dữ liệu của bạn…</p>');
    var d = await api('GET', '/api/data');
    if (d.s === 401) { try { localStorage.removeItem(TK); } catch (e) {} return gate(); }
    if (d.s !== 200) {
      box('<h3 style="margin:0 0 8px">Không tải được dữ liệu</h3><p class="nt">' + esc(d.j.error || ('Lỗi ' + d.s)) + '</p><button class="bt" id="rt">Thử lại</button>');
      document.getElementById('rt').onclick = function () { start(user); };
      return;
    }
    // the browser only keeps a cache: always replace it with this account's data from the server
    Object.keys(localStorage).forEach(function (k) { if (KEYS.test(k) && k !== TK) localStorage.removeItem(k); });
    if (d.j.data) for (var k in d.j.data) localStorage.setItem(k, d.j.data[k]);
    window.__API = true; window.__USER = user; window.__TS = d.j.ts || 0;
    var o = document.getElementById('lgn'); if (o) o.remove();
    loadApp();
  }

  function login(msg) {
    box('<h3 style="margin:0 0 12px">Đăng nhập Life System</h3><div class="fm bf"><input id="lu" placeholder="Tên đăng nhập" autocomplete="username"><input id="lp" type="password" placeholder="Mật khẩu" autocomplete="current-password"><button class="bt" id="lb">Đăng nhập</button></div><p class="nt" id="lm" style="color:var(--bad)">' + esc(msg || '') + '</p>');
    var go = async function () {
      var m = document.getElementById('lm'); m.textContent = '';
      var r = await api('POST', '/api/auth', { action: 'login', username: document.getElementById('lu').value, password: document.getElementById('lp').value });
      if (r.s === 200 && r.j.token) { localStorage.setItem(TK, r.j.token); start(r.j.user); }
      else m.textContent = r.j.error || 'Không đăng nhập được (' + r.s + ')';
    };
    document.getElementById('lb').onclick = go;
    document.getElementById('lp').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    document.getElementById('lu').focus();
  }

  function setup() {
    var has = Object.keys(snap()).length > 0;
    box('<h3 style="margin:0 0 6px">Tạo tài khoản quản trị đầu tiên</h3><p class="nt" style="margin:0 0 10px">Chưa có tài khoản nào trên máy chủ.' + (has ? ' Dữ liệu đang có trong trình duyệt này sẽ được chuyển vào tài khoản này.' : '') + '</p><div class="fm bf"><input id="sn" placeholder="Tên hiển thị"><input id="su" placeholder="Tên đăng nhập (a-z, 0-9, . _ -)" autocomplete="off"><input id="sp" type="password" placeholder="Mật khẩu (từ 6 ký tự)" autocomplete="new-password"><input id="sc" type="password" placeholder="Mã khởi tạo (SETUP_CODE hoặc SYNC_PASSWORD trên Vercel)" autocomplete="off"><button class="bt" id="sb">Tạo tài khoản</button></div><p class="nt" id="lm" style="color:var(--bad)"></p>');
    document.getElementById('sb').onclick = async function () {
      var m = document.getElementById('lm'); m.textContent = '';
      var body = { action: 'setup', name: document.getElementById('sn').value, username: document.getElementById('su').value, password: document.getElementById('sp').value, setupCode: document.getElementById('sc').value };
      if (has) body.initial = snap();
      var r = await api('POST', '/api/auth', body);
      if (r.s === 200 && r.j.token) { localStorage.setItem(TK, r.j.token); start(r.j.user); }
      else m.textContent = r.j.error || 'Không tạo được tài khoản (' + r.s + ')';
    };
  }

  async function gate() {
    box('<p>Đang kiểm tra đăng nhập…</p>');
    var me = await api('GET', '/api/auth');
    if (me.s === 200 && me.j.user) return start(me.j.user);
    if (me.s === 503 && me.j.error) return box('<h3 style="margin:0 0 8px">Chưa cấu hình máy chủ</h3><p class="nt">' + esc(me.j.error) + '</p>');
    if (me.s === 401 && typeof me.j.needsSetup === 'boolean') return me.j.needsSetup ? setup() : login('');
    var o = document.getElementById('lgn'); if (o) o.remove();
    loadApp(); // no API here (preview or local file): run in local mode
  }
  gate();
})();
