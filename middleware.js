const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Login</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .card { width: 360px; padding: 48px 36px; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; background: rgba(255,255,255,0.03); }
  h1 { font-size: 18px; color: #e2e2e8; font-weight: 500; margin-bottom: 6px; letter-spacing: -0.02em; }
  p { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 28px; }
  input { width: 100%; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.04); color: #e2e2e8; font-size: 14px; font-family: 'SF Mono', 'Fira Code', monospace; outline: none; transition: border-color 0.2s; }
  input:focus { border-color: rgba(255,255,255,0.25); }
  input::placeholder { color: rgba(255,255,255,0.2); }
  button { width: 100%; margin-top: 14px; padding: 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; background: rgba(255,255,255,0.06); color: #e2e2e8; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  button:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }
  .err { color: #ef4444; font-size: 12px; margin-top: 12px; display: none; }
</style>
</head>
<body>
<div class="card">
  <h1>AI Infrastructure Economics</h1>
  <p>Enter code</p>
  <form id="f">
    <input id="pw" type="password" placeholder="Access code" autocomplete="off" autofocus />
    <button type="submit">Enter</button>
    <p class="err" id="err">Incorrect code</p>
  </form>
</div>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pw = document.getElementById('pw').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pw }),
  });
  if (res.ok) {
    window.location.href = '/';
  } else {
    document.getElementById('err').style.display = 'block';
    document.getElementById('pw').value = '';
    document.getElementById('pw').focus();
  }
});
</script>
</body>
</html>`;

export default function middleware(request) {
  const url = new URL(request.url);

  // Let API routes pass through
  if (url.pathname.startsWith('/api')) return;

  // Check auth cookie
  const cookies = request.headers.get('cookie') || '';
  const hasAuth = cookies.split(';').some(c => c.trim().startsWith('auth=1'));

  if (hasAuth) return; // pass through to static files

  return new Response(LOGIN_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
