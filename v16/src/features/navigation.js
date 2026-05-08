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

export function renderNavigation(currentPage) {
  const locale = getLocale();
  const nextLocale = locale === 'zh' ? 'en' : 'zh';
  return `
    <nav style="position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;padding:10px 16px;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
        <strong>${t('appTitle')}</strong>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${V16_PAGES.map(page => `
            <button class="btn btn-sm ${page.id === currentPage ? 'btn-primary' : ''}" type="button" data-page="${page.id}">${t(page.labelKey)}</button>
          `).join('')}
          <button class="btn btn-sm btn-primary" type="button" data-locale-toggle data-next-locale="${nextLocale}" title="${locale === 'zh' ? 'Switch to English' : '切換到繁中'}">繁中 / EN</button>
        </div>
      </div>
    </nav>`;
}
