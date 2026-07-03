export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) return res.status(500).json({ error: 'SITE_PASSWORD not configured' });

  if (password === sitePassword) {
    // Set httpOnly cookie, 30 days
    res.setHeader('Set-Cookie', `auth=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Wrong password' });
}
