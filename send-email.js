// api/send-email.js
// Vercel Serverless Function — Envoi d'emails via Resend
// Variables d'environnement nécessaires dans Vercel :
//   RESEND_API_KEY  → ta clé API Resend
//   ADMIN_EMAIL     → ton email (pour recevoir les alertes)

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY manquant dans Vercel' });
  }

  const { to, subject, html, text } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Paramètres manquants (to, subject, html)' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `KinkList <noreply@${getFromDomain()}>`,
        to: [to],
        subject,
        html,
        text: text || '',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Erreur Resend: ' + err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    console.error('Send email error:', e);
    return res.status(500).json({ error: e.message });
  }
}

function getFromDomain() {
  // Resend exige un domaine vérifié pour l'expéditeur.
  // En test, utilise onboarding@resend.dev (limité à ton propre email).
  // En prod, vérifie ton domaine dans Resend et mets-le ici.
  if (ADMIN_EMAIL) {
    const domain = ADMIN_EMAIL.split('@')[1];
    if (domain) return domain;
  }
  return 'resend.dev';
}
