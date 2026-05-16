// auth.js — Discord OAuth + Role Validation
import { DISCORD_CLIENT_ID, GUILD_ID, ROLES, ROLE_NAMES, RANK_ROLES, ROLE_TIER } from './config.js';

const SESSION_KEY = 'hr_session';

// ---- SESSION ----
export function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('oauth_state');
}
export function isLoggedIn() { return !!getSession(); }

// ---- DISCORD API ----
async function discordFetch(endpoint, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const res = await fetch(`https://discord.com/api/v10${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) throw new Error(`Discord API error ${res.status}`);
  return res.json();
}

// ---- ROLE HELPERS ----
export function getUserRoleInfo(memberRoles) {
  const hasHR = memberRoles.includes(ROLES.HR_ROLE);
  const rankRole = RANK_ROLES.find(r => memberRoles.includes(r));
  return { hasHR, rankRole, roleName: rankRole ? ROLE_NAMES[rankRole] : null };
}

export function hasPermission(session, allowedRoles) {
  if (!session?.rankRole) return false;
  return allowedRoles.includes(session.rankRole);
}

export function getRoleTier(session) {
  return ROLE_TIER[session?.rankRole] ?? 0;
}

// ---- FETCH & VALIDATE ----
export async function fetchAndValidate(accessToken) {
  const [user, member] = await Promise.all([
    discordFetch('/users/@me', accessToken),
    discordFetch(`/users/@me/guilds/${GUILD_ID}/member`, accessToken)
  ]);

  const memberRoles = member.roles || [];
  const { hasHR, rankRole, roleName } = getUserRoleInfo(memberRoles);

  if (!hasHR) throw new Error('NO_HR_ROLE');
  if (!rankRole) throw new Error('NO_RANK_ROLE');

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || 0) % 5}.png`;

  return {
    id:          user.id,
    username:    user.global_name || user.username,
    discriminator: user.discriminator,
    avatar,
    rankRole,
    roleName,
    accessToken,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
}

// ---- REQUIRE AUTH (call on protected pages) ----
export async function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = '../index.html';
    return null;
  }
  if (Date.now() > session.expiresAt) {
    clearSession();
    window.location.href = '../index.html';
    return null;
  }
  return session;
}

// ---- LOGOUT ----
export function logout() {
  clearSession();
  window.location.href = '../index.html';
}
