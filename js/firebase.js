// firebase.js — Initialize Firebase app + Firestore + Storage
import { FIREBASE_CONFIG } from './config.js';

// Load Firebase from CDN (compat version for simpler usage)
const loadScript = (src) => new Promise((res, rej) => {
  const s = document.createElement('script');
  s.src = src; s.onload = res; s.onerror = rej;
  document.head.appendChild(s);
});

let _db = null;
let _storage = null;
let _initialized = false;

export async function initFirebase() {
  if (_initialized) return { db: _db, storage: _storage };

  await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js');

  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  _db      = firebase.firestore();
  _storage = firebase.storage();
  _initialized = true;

  return { db: _db, storage: _storage };
}

export function getDb()      { return _db; }
export function getStorage() { return _storage; }
