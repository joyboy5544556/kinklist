// api/admin-data.js
// Vercel Serverless Function — Admin sécurisé côté serveur
// Variables d'environnement nécessaires dans Vercel :
//   SUPABASE_URL        → URL du projet Supabase
//   SUPABASE_SERVICE_KEY → clé service_role (pas la clé anon !)
//   ADMIN_PASSWORD      → ton mot de passe admin

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD;

// Token simple stocké en mémoire pour la session
// (en prod multi-instance, préfère un JWT signé ou Redis)
const VALID_TOKENS = new Set();

function makeToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${err}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Vérifications config
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Variables d\'environnement manquantes dans Vercel.' });
  }

  const { action, password, token } = req.body || {};

  // ── LOGIN ──
  if (action === 'login') {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    const newToken = makeToken();
    VALID_TOKENS.add(newToken);
    // Expiration automatique après 8h
    setTimeout(() => VALID_TOKENS.delete(newToken), 8 * 60 * 60 * 1000);
    return res.status(200).json({ token: newToken });
  }

  // ── AUTH CHECK ──
  if (!token || !VALID_TOKENS.has(token)) {
    return res.status(401).json({ error: 'Non autorisé — reconnecte-toi' });
  }

  // ── GET USERS ──
  if (action === 'getUsers') {
    try {
      const users = await sbFetch(
        'kinklist?select=username,email,answers,compare_token,updated_at&order=updated_at.desc'
      );
      return res.status(200).json({ users });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── GET HISTORY ──
  if (action === 'getHistory') {
    try {
      const history = await sbFetch(
        'kink_history?order=created_at.desc&limit=500'
      );
      return res.status(200).json({ history });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── GET INVITATIONS ──
  if (action === 'getInvitations') {
    try {
      const invitations = await sbFetch(
        'invitations?order=created_at.desc&limit=100'
      );
      return res.status(200).json({ invitations });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Action inconnue' });
}
