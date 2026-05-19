// api/send-email.js
// Vercel Serverless Function — envoie un email avec Resend

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL || '';

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY non configurée' });
  }

  const { to, subject, html, text } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: 'Champs manquants : to, subject' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `KinkList <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
        to: [to],
        subject,
        html: html || '<p>' + (text || '') + '</p>',
        text: text || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({ error: data.message || 'Erreur Resend' });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ error: 'Erreur interne' });
  }
}
