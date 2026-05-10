import { getLocale, t } from '../utils/i18n.js';

export function showPage(state, pageId) {
  state.currentPage = pageId;
  return state;
}

export function showMode(state, modeId) {
  state.currentMode = modeId;
  return state;
}

export const V16_PAGES = [
  { id: 'dashboard', labelKey: 'dashboard' },
  { id: 'student', labelKey: 'studentWorkspaceShort' },
  { id: 'prep', labelKey: 'prep' },
  { id: 'tasks', labelKey: 'tasks' },
  { id: 'members', labelKey: 'members' },
  { id: 'intel', labelKey: 'intel' },
  { id: 'presentation', labelKey: 'presentation' },
  { id: 'gantt', labelKey: 'gantt' },
  { id: 'float', labelKey: 'float' },
  { id: 'competition', labelKey: 'competition' },
  { id: 'settings', labelKey: 'settings' },
];

export function renderNavigation(currentPage, syncStatus = null, visiblePageIds = null) {
  const locale = getLocale();
  const nextLocale = locale === 'zh' ? 'en' : 'zh';
  const visible = new Set(Array.isArray(visiblePageIds) && visiblePageIds.length
    ? [...visiblePageIds, 'dashboard', 'settings']
    : V16_PAGES.map(page => page.id));
  const pages = V16_PAGES.filter(page => visible.has(page.id));
  const status = syncStatus || { state: 'idle', label: 'Supabase', detail: '' };
  const statusClass = status.state === 'error'
    ? 'error'
    : status.state === 'syncing'
      ? 'syncing'
      : status.state === 'pending'
        ? 'pending'
        : 'ok';
  return `
    <nav style="position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;padding:10px 16px;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <strong>${t('appTitle')}</strong>
          <span class="sync-status ${statusClass}" title="${status.detail || status.label}">
            <span class="sync-status-dot"></span>${status.label}
          </span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${pages.map(page => `
            <button class="btn btn-sm ${page.id === currentPage ? 'btn-primary' : ''}" type="button" data-page="${page.id}">${t(page.labelKey)}</button>
          `).join('')}
          <button class="btn btn-sm btn-primary" type="button" data-locale-toggle data-next-locale="${nextLocale}" title="${locale === 'zh' ? 'Switch to English' : 'Switch to Chinese'}">ZH / EN</button>
        </div>
      </div>
    </nav>`;
}
