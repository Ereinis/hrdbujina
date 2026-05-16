// firebase.js — Initialize Firebase app + Firestore + Storage
import { FIREBASE_CONFIG } from './config.js';

// Load Firebase from CDN (compat version for simpler usage)
const loadScript = (src) => new Promise((res, rej) => {
  const s = document.createElement('script');
  s.src = src; s.onload = res; s.onerror = rej;
  document.head.appendChild(s);
});

let _db = null;
let _initialized = false;

export async function initFirebase() {
  if (_initialized) return { db: _db };

  await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');

  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  _db = firebase.firestore();
  _initialized = true;

  return { db: _db };
}

export function getDb() { return _db; }
