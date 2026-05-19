# 🚀 Guide de déploiement — KinkList sur Vercel

## Ce que tu vas avoir au final
- ✅ Site en ligne sur une vraie URL (ex: `kinklist-ton-nom.vercel.app`)
- ✅ Chaque participant entre son pseudo → tout est sauvegardé
- ✅ En admin tu vois TOUT : pseudo, réponses, hésitations, changements
- ✅ Emails PDF via Resend (optionnel)
- ✅ Gratuit à 100%

---

## ÉTAPE 1 — Créer ton projet Supabase (base de données)

1. Va sur **https://supabase.com** → créer un compte gratuit
2. Clique **"New project"** → donne un nom (ex: `kinklist`)
3. Choisis un mot de passe → attends ~2 min que ça s'installe
4. Va dans **SQL Editor** (menu gauche)
5. Colle **tout le contenu** du fichier `SUPABASE_SETUP.sql` → clique **Run**
6. Tu verras "Success" → les 3 tables sont créées ✅

### Récupérer tes clés Supabase
- Menu gauche → **Project Settings** → **API**
- Copie :
  - **Project URL** → ressemble à `https://abcdefgh.supabase.co`
  - **anon public key** → longue chaîne qui commence par `eyJ...`

---

## ÉTAPE 2 — Mettre le projet sur GitHub

1. Va sur **https://github.com** → créer un compte si pas encore fait
2. Clique **"New repository"** → nom : `kinklist` → **Private** → Create
3. Sur ton ordinateur, installe **GitHub Desktop** (https://desktop.github.com)
4. Clone ton repo → copie les fichiers du dossier `kinklist/` dedans :
   ```
   kinklist/
   ├── public/
   │   └── index.html        ← l'app principale
   ├── api/
   │   └── send-email.js     ← pour les emails
   ├── package.json
   ├── vercel.json
   └── SUPABASE_SETUP.sql    ← garde-le mais pas obligatoire de pusher
   ```
5. Commit → Push → c'est sur GitHub ✅

> **Alternative sans GitHub Desktop** : va sur github.com, dans ton repo, clique "uploading an existing file" et glisse-dépose les fichiers un par un.

---

## ÉTAPE 3 — Déployer sur Vercel

1. Va sur **https://vercel.com** → créer un compte (connecte avec GitHub)
2. Clique **"Add New Project"**
3. Sélectionne ton repo `kinklist`
4. Clique **"Deploy"** → attends 1 min

### Configurer les variables d'environnement
Une fois déployé, va dans **Settings → Environment Variables** et ajoute :

| Nom | Valeur |
|-----|--------|
| `RESEND_API_KEY` | ta clé Resend (optionnel, pour les emails) |
| `RESEND_DOMAIN` | ton domaine vérifié Resend (optionnel) |

---

## ÉTAPE 4 — Configurer l'app en ligne

1. Ouvre ton URL Vercel (ex: `https://kinklist-xxx.vercel.app`)
2. Clique sur **⚙ Config Supabase / Resend** (bouton en bas de la page d'accueil)
3. Entre :
   - **URL Supabase** : `https://abcdefgh.supabase.co`
   - **Clé anon** : `eyJ...`
   - **Mot de passe admin** : choisis quelque chose de secret (ex: `MonAdmin2024!`)
4. Clique **Sauvegarder** ✅

> ⚠️ Ces clés sont sauvegardées dans le navigateur. Chaque personne qui utilise l'app doit les entrer une fois. Tu peux les mettre dans le HTML directement si tu veux (voir ci-dessous).

---

## ÉTAPE 5 — Mettre les clés directement dans le code (recommandé)

Pour que personne n'ait à configurer quoi que ce soit, ouvre `public/index.html` et remplace les lignes :

```javascript
let SB_URL = localStorage.getItem('sb_url') || '';
let SB_KEY = localStorage.getItem('sb_key') || '';
let ADMIN_PWD = localStorage.getItem('admin_pwd') || 'admin1234';
```

Par :

```javascript
let SB_URL = 'https://TONID.supabase.co';
let SB_KEY = 'eyJTACLEANON...';
let ADMIN_PWD = 'TonMotDePasseAdmin';
```

Puis retire le bouton `⚙ Config Supabase / Resend` de la page d'accueil (c'est plus propre).

---

## COMMENT ÇA MARCHE pour tes amis

1. Tu envoies le lien : `https://kinklist-xxx.vercel.app`
2. Ils entrent leur **pseudo** → commencent à remplir
3. Chaque clic est **sauvegardé automatiquement** dans Supabase
4. Toi en admin :
   - Ouvre l'app → onglet **🛡 Admin**
   - Mot de passe admin → tu vois TOUS les participants
   - Pour chaque personne : toutes ses réponses + tout son historique de changements

---

## CE QUE TU VOIS EN ADMIN

Pour chaque participant :
- ✅ Son pseudo
- ✅ Son email (s'il l'a mis)
- ✅ Son % de complétion
- ✅ Toutes ses réponses actuelles
- ✅ **L'historique complet** : "il avait mis 'Peut-être' sur X, puis a changé pour 'Oui'"
- ✅ Les dates et heures de chaque changement

---

## TARIFS (tout gratuit)

| Service | Plan gratuit |
|---------|-------------|
| Vercel | Gratuit (illimité pour sites statiques) |
| Supabase | Gratuit jusqu'à 500 MB + 50k requêtes/jour |
| Resend | Gratuit jusqu'à 3000 emails/mois |

Pour un usage entre amis, tu ne dépasseras jamais ces limites.

---

## EN CAS DE PROBLÈME

**"Supabase requis pour voir les profils"** → tu n'as pas entré les clés Supabase dans ⚙ Config

**"⚠ Erreur cloud"** → vérifie que les tables existent (refais l'étape 1)

**Les réponses ne se sauvegardent pas** → ouvre la console (F12) → regarde les erreurs en rouge

**Besoin d'aide** → reviens sur Claude avec le message d'erreur exact 😊
