# HR Department Portal — Setup Guide

A role-gated HR management portal for Roblox Café staff, deployable to GitHub Pages with Firebase as the persistent backend.

---

## File Structure

```
hr-portal/
├── index.html          ← Login page (Discord OAuth)
├── callback.html       ← OAuth redirect handler
├── css/
│   └── global.css
├── js/
│   ├── config.js       ← ⚠️ EDIT THIS FIRST
│   ├── auth.js
│   ├── firebase.js
│   ├── layout.js
│   └── toast.js
└── pages/
    ├── dashboard.html
    ├── transcripts.html
    └── disciplinary.html
```

---

## Step 1 — Discord Application Setup

1. Go to [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → give it a name
3. Go to **OAuth2 → General**
4. Copy the **Client ID**
5. Under **Redirects**, add:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/callback.html
   ```
6. Save changes

> ⚠️ The redirect URI must match **exactly** — no trailing slash.

---

## Step 2 — Firebase Setup

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Add a **Web App** (click `</>` icon) — copy the config object
4. Go to **Firestore Database** → Create database → **Native mode**
5. Set Firestore rules (for development — tighten for production):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
Firebase Storage is not required. Transcript files are committed to the GitHub repository instead.

---

## Step 3 — Edit `js/config.js`

Open `js/config.js` and fill in:

```js
export const DISCORD_CLIENT_ID = 'YOUR_CLIENT_ID';
export const SITE_BASE = 'https://YOUR-USERNAME.github.io/YOUR-REPO-NAME';
export const REDIRECT_URI = `${SITE_BASE}/callback.html`;
export const GUILD_ID = 'YOUR_DISCORD_SERVER_ID';

export const FIREBASE_CONFIG = {
  apiKey: '...',
  authDomain: '...',
  // etc.
};

export const GITHUB_UPLOAD_ENDPOINT = 'https://YOUR-WORKER-URL.workers.dev';
```

**How to find your Guild ID:** Right-click your server icon in Discord → Copy Server ID  
(You need Developer Mode on: Settings → Advanced → Developer Mode)

---

## Step 4 — Deploy to GitHub Pages

1. Push all files to a GitHub repository
2. Go to **Settings → Pages**
3. Source: **Deploy from branch** → `main` / `root`
4. Your site will be at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## Step 5 — GitHub Transcript Uploads

The public website must not contain a GitHub token. Use the included `github-upload-worker.js` as a private upload endpoint, then set `GITHUB_UPLOAD_ENDPOINT` in `js/config.js`.

Deploy the worker with these environment variables:

| Variable | Value |
|----------|-------|
| `GITHUB_TOKEN` | Fine-grained GitHub token with **Contents: Read and write** for this repository |
| `GITHUB_OWNER` | Your GitHub username or organization |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | Usually `main` |
| `PUBLIC_BASE` | `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME` |
| `ALLOWED_ORIGIN` | `https://YOUR-USERNAME.github.io` |
| `GITHUB_COMMIT_EMAIL` | Email used for upload commits |
| `DISCORD_GUILD_ID` | Your Discord server ID |
| `HR_ROLE` | Human Resources role ID |
| `ALLOWED_UPLOAD_ROLES` | Comma-separated role IDs allowed to upload/delete transcripts |

Uploaded transcript files will be committed under:

```
transcripts/
```

---

## Permissions Reference

| Feature                     | President | Vice President | Exec. Director | Exec. Officer | Exec. Assistant |
|-----------------------------|:---------:|:--------------:|:--------------:|:-------------:|:---------------:|
| View transcripts            | ✅         | ✅              | ✅              | ✅             | ✅               |
| Upload transcripts          | ✅         | ✅              | ✅              | ❌             | ❌               |
| Delete transcripts          | ✅         | ✅              | ✅              | ❌             | ❌               |
| Submit disciplinary case    | ✅         | ✅              | ✅              | ✅             | ✅               |
| Delete disciplinary case    | ✅         | ✅              | ❌              | ❌             | ❌               |

---

## Role IDs (pre-configured in config.js)

| Role                | ID                    |
|---------------------|-----------------------|
| President           | 1448499081717743678   |
| Vice President      | 1448499105755304019   |
| Executive Director  | 1448500020625281085   |
| Executive Officer   | 1448500129140314122   |
| Executive Assistant | 1448500158617747466   |
| Human Resources     | 1455280224412631094   |

All users **must** have both a rank role AND the HR role to access the portal.

---

## Security Notes

- Discord's implicit grant (`response_type=token`) works on static sites — no server needed
- The access token is stored in `sessionStorage` only (cleared on tab close)
- Firebase rules should be tightened in production (e.g., validate by Discord user ID stored in Firestore after first login)
- Case IDs are generated client-side using timestamp + random chars — format: `CASE-XXXX-XXXXXX`
- Once a Case ID is generated and displayed, it cannot be edited by the user (readonly field)

---

## Case ID Format

```
CASE-{4-char timestamp base36}-{6-char random alphanumeric}
Example: CASE-M3K9-AB7XQP
```
