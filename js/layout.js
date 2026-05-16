// layout.js — Injects sidebar, topbar, and toast container into protected pages
import { requireAuth, logout, hasPermission } from '../js/auth.js';
import { CAN_MANAGE_TRANSCRIPTS } from '../js/config.js';

export async function initLayout(pageTitle, activeNav) {
  // Show loader
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="page-loader" id="page-loader">
      <div class="spinner"></div>
      <p>Loading…</p>
    </div>
  `);

  const session = await requireAuth();
  if (!session) return null;

  document.getElementById('page-loader')?.remove();

  // Build sidebar nav links conditionally
  const canManageFiles = hasPermission(session, CAN_MANAGE_TRANSCRIPTS);

  const layout = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="icon">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke="#0d0f0a" stroke-width="2"/>
              <circle cx="7.5" cy="10.5" r="2" stroke="#0d0f0a" stroke-width="2"/>
              <path d="M11 8.5h5M11 10.5h4M11 12.5h5" stroke="#0d0f0a" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="brand">
            <span class="brand-name">HR Portal</span>
            <span class="brand-sub">Ujina</span>
          </div>
        </div>

        <div class="sidebar-user">
          <img src="${session.avatar}" alt="avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"/>
          <div class="user-info">
            <span class="user-name">${escapeHtml(session.username)}</span>
            <span class="user-role">${session.roleName}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <span class="nav-section-label">Navigation</span>
          <a href="dashboard.html" class="nav-item ${activeNav === 'dashboard' ? 'active' : ''}">
            <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
            Dashboard
          </a>
          <a href="transcripts.html" class="nav-item ${activeNav === 'transcripts' ? 'active' : ''}">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M5 5h6M5 8h6M5 11h4" stroke-linecap="round"/></svg>
            Ticket Transcripts
          </a>
          <a href="disciplinary.html" class="nav-item ${activeNav === 'disciplinary' ? 'active' : ''}">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L2 5v4c0 3 2.5 5.2 6 6 3.5-.8 6-3 6-6V5L8 2z"/><path d="M5.5 8l2 2 3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Disciplinary Actions
          </a>
          <a href="interviews.html" class="nav-item ${activeNav === 'interviews' ? 'active' : ''}">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h10v10H3z"/><path d="M5 6h6M5 9h4M2 13h12" stroke-linecap="round"/></svg>
            Interviews
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" id="logoutBtn">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Logout
          </button>
        </div>
      </aside>

      <div class="main-content">
        <div class="topbar">
          <span class="topbar-title">${pageTitle}</span>
          <div class="topbar-right">
            <span class="topbar-badge">${session.roleName}</span>
          </div>
        </div>
        <div class="page-body" id="page-content"></div>
      </div>
    </div>
    <div id="toast-container"></div>
  `;

  document.body.innerHTML = layout;
  document.getElementById('logoutBtn').addEventListener('click', logout);

  return session;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}
