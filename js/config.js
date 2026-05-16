// ============================================================
// CONFIGURATION — Fill in your values before deploying
// ============================================================

// ------- DISCORD OAUTH -------
// 1. Go to https://discord.com/developers/applications
// 2. Create/select your application
// 3. OAuth2 > General > copy Client ID
// 4. Add your GitHub Pages URL + /callback.html to Redirects
export const DISCORD_CLIENT_ID = '1505290476343787651';

// Your GitHub Pages URL, e.g. 'https://yourusername.github.io/hr-portal'
export const SITE_BASE = 'https://ereinis.github.io/hrdbujina';
export const REDIRECT_URI = `${SITE_BASE}/callback.html`;

// Discord Guild (Server) ID — right-click server icon > Copy Server ID
export const GUILD_ID = '1446923448822665380';

// ------- FIREBASE -------
// 1. Go to https://console.firebase.google.com
// 2. Create project → Web app → copy config below
// 3. Enable Firestore (Native mode)
// 4. Firestore Rules: allow read, write: if true; (for dev; tighten for prod)
export const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyDv3ZTsZF2uv1k23ZoTVxeZCY_4nvbKUPQ',
  authDomain:        'hrdbujina-51c19.firebaseapp.com',
  projectId:         'hrdbujina-51c19',
  messagingSenderId: '378360844659',
  appId:             '1:378360844659:web:6c71d185498ceaf5d1f506'
};

// ------- GITHUB REPOSITORY STORAGE -------
// Transcript files are committed to your GitHub repository through a private
// upload endpoint. Do not put a GitHub token in this public website.
// Example: 'https://hrdb-github-uploader.yourname.workers.dev'
export const GITHUB_UPLOAD_ENDPOINT = 'https://hrdb-upload-worker.ereinishaxhia74.workers.dev';

// ------- ROLES -------
export const ROLES = {
  PRESIDENT:           '1448499081717743678',
  VICE_PRESIDENT:      '1448499105755304019',
  EXECUTIVE_DIRECTOR:  '1448500020625281085',
  EXECUTIVE_OFFICER:   '1448500129140314122',
  EXECUTIVE_ASSISTANT: '1448500158617747466',
  HR_ROLE:             '1455280224412631094',
};

export const ROLE_NAMES = {
  [ROLES.PRESIDENT]:           'President',
  [ROLES.VICE_PRESIDENT]:      'Vice President',
  [ROLES.EXECUTIVE_DIRECTOR]:  'Executive Director',
  [ROLES.EXECUTIVE_OFFICER]:   'Executive Officer',
  [ROLES.EXECUTIVE_ASSISTANT]: 'Executive Assistant',
};

// Role hierarchy (higher = more privilege)
export const ROLE_TIER = {
  [ROLES.PRESIDENT]:           5,
  [ROLES.VICE_PRESIDENT]:      4,
  [ROLES.EXECUTIVE_DIRECTOR]:  3,
  [ROLES.EXECUTIVE_OFFICER]:   2,
  [ROLES.EXECUTIVE_ASSISTANT]: 1,
};

// All valid rank roles
export const RANK_ROLES = Object.values(ROLES).filter(r => r !== ROLES.HR_ROLE);

// ---- PERMISSIONS ----
export const CAN_MANAGE_TRANSCRIPTS = [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.EXECUTIVE_DIRECTOR];
export const CAN_DELETE_CASES       = [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT];
