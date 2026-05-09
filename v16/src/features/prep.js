import { escapeHtml } from '../utils/index.js';
import { labelFor, t } from '../utils/i18n.js';
import { getTaskStats } from './tasks.js';

function clean(value) {
  return String(value || '').trim();
}

export function normalizePrepFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    status: clean(filters.status),
  };
}

export function toggleChecklistItem(state, listName, id) {
  const item = state.data[listName]?.find(row => row.id === Number(id));
  if (!item) return false;
  item.done = !item.done;
  state.dirtyFlags[listName] = true;
  return true;
}

export function addChecklistItem(state, listName, label) {
  const list = state.data[listName];
  const text = clean(label);
  if (!Array.isArray(list) || !text) return false;
  list.push({
    id: Date.now(),
    label: text,
    done: false,
  });
  state.dirtyFlags[listName] = true;
  return true;
}

export function updateChecklistItem(state, listName, id, label) {
  const item = state.data[listName]?.find(row => Number(row.id) === Number(id));
  const text = clean(label);
  if (!item || !text) return false;
  item.label = text;
  state.dirtyFlags[listName] = true;
  return true;
}

export function deleteChecklistItem(state, listName, id) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const before = list.length;
  state.data[listName] = list.filter(item => Number(item.id) !== Number(id));
  state.dirtyFlags[listName] = before !== state.data[listName].length;
  return state.dirtyFlags[listName];
}

export function addGearItem(state, payload = {}) {
  const name = clean(payload.name);
  if (!name) return false;
  state.data.gearItems.push({
    id: Date.now(),
    name,
    category: clean(payload.category) || 'Required',
    qty: Math.max(1, Number(payload.qty || 1)),
    packed: false,
  });
  state.dirtyFlags.gearItems = true;
  return true;
}

export function updateGearItem(state, id, payload = {}) {
  const item = state.data.gearItems.find(row => Number(row.id) === Number(id));
  const name = clean(payload.name);
  if (!item || !name) return false;
  item.name = name;
  item.category = clean(payload.category) || 'Required';
  item.qty = Math.max(1, Number(payload.qty || 1));
  state.dirtyFlags.gearItems = true;
  return true;
}

export function toggleGearItem(state, id) {
  const item = state.data.gearItems.find(row => Number(row.id) === Number(id));
  if (!item) return false;
  item.packed = !item.packed;
  state.dirtyFlags.gearItems = true;
  return true;
}

export function deleteGearItem(state, id) {
  const before = state.data.gearItems.length;
  state.data.gearItems = state.data.gearItems.filter(item => Number(item.id) !== Number(id));
  state.dirtyFlags.gearItems = before !== state.data.gearItems.length;
  return state.dirtyFlags.gearItems;
}

export function getGearPayloadFromDom(root = document) {
  return {
    name: root.querySelector('[data-gear-name]')?.value,
    category: root.querySelector('[data-gear-category]')?.value,
    qty: root.querySelector('[data-gear-qty]')?.value,
  };
}

function isPrepFocusMatch(focus = {}, section = '', label = '') {
  if (!focus) return false;
  return focus.section === section && clean(focus.query).toLowerCase() === clean(label).toLowerCase();
}

function filterChecklistItems(items = [], filters = {}) {
  return items.filter((item) => {
    const haystack = clean(item.label).toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.status === 'open' && item.done) return false;
    if (filters.status === 'done' && !item.done) return false;
    return true;
  });
}

function filterGearItems(items = [], filters = {}) {
  return items.filter((item) => {
    const haystack = `${item.name || ''} ${item.category || ''} ${item.qty || ''}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.status === 'open' && item.packed) return false;
    if (filters.status === 'done' && !item.packed) return false;
    return true;
  });
}

function getActivePrepFilterChips(filters = {}) {
  const statusLabels = {
    open: t('prepIncomplete'),
    done: t('prepComplete'),
  };
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.status ? { key: 'status', label: t('status'), value: statusLabels[filters.status] || filters.status } : null,
  ].filter(Boolean);
}

function renderPrepSectionHeading(label, visibleCount, totalCount, completedCount = 0) {
  const percent = totalCount ? Math.round((Number(completedCount || 0) / totalCount) * 100) : 0;
  return `
    <div class="prep-section-heading">
      <h2 style="margin:0">${escapeHtml(label)}</h2>
      <div class="prep-progress-wrap">
        <div class="prep-progress-meta">
          <span class="badge mid" data-prep-visible-count>${escapeHtml(visibleCount)}/${escapeHtml(totalCount)}</span>
          <strong>${escapeHtml(percent)}%</strong>
        </div>
        <div class="prep-progress-track" aria-hidden="true"><span style="width:${escapeHtml(percent)}%"></span></div>
      </div>
    </div>`;
}

export function renderChecklist(listName, items = [], options = {}) {
  const totalCount = (options.allItems || items).length;
  return `
    <div style="display:grid;gap:6px">
      ${items.map(item => `
        <div data-prep-focus-row="${escapeHtml(listName)}" style="display:flex;gap:8px;align-items:center;border:1px solid ${isPrepFocusMatch(options.prepFocus, listName, item.label) ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${isPrepFocusMatch(options.prepFocus, listName, item.label) ? 'var(--orange)' : 'var(--border)'};border-radius:8px;background:var(--input-bg);padding:8px;font-weight:800">
          <label style="display:flex;gap:8px;align-items:center;flex:1">
            <input type="checkbox" data-checklist="${listName}" data-check-id="${item.id}" ${item.done ? 'checked' : ''}>
            <span>${escapeHtml(item.label)}</span>
          </label>
          <button class="badge ${item.done ? 'done' : 'mid'}" type="button" data-checklist-toggle="${listName}" data-check-id="${item.id}" title="${escapeHtml(t('toggleComplete'))}" style="cursor:pointer;border:1px solid var(--border)">${escapeHtml(item.done ? t('prepComplete') : t('prepIncomplete'))}</button>
          <button class="btn btn-sm" type="button" data-checklist-edit="${listName}" data-check-id="${item.id}">${escapeHtml(t('edit'))}</button>
          <button class="btn btn-sm btn-danger" type="button" data-checklist-delete="${listName}" data-check-id="${item.id}">${escapeHtml(t('delete'))}</button>
        </div>
      `).join('') || `<div style="color:var(--muted);font-weight:900">${escapeHtml(totalCount ? t('noMatchingItems') : t('noItemsYet'))}</div>`}
      <div class="prep-entry-row">
        <label>${escapeHtml(t('newChecklistItem'))}<input data-checklist-input="${listName}" value="" placeholder="${escapeHtml(t('newChecklistItem'))}"></label>
        <button class="btn btn-primary" type="button" data-checklist-add="${listName}">${escapeHtml(t('addItem'))}</button>
      </div>
    </div>`;
}

function renderChecklistEditForm(listName, editingItem) {
  if (!editingItem) return '';
  return `
    <div class="prep-entry-row" data-checklist-edit-form="${escapeHtml(listName)}" data-check-id="${escapeHtml(editingItem.id)}">
      <label>${escapeHtml(t('newChecklistItem'))}<input data-checklist-input="${listName}" value="${escapeHtml(editingItem.label || '')}" placeholder="${escapeHtml(t('newChecklistItem'))}"></label>
      <button class="btn btn-primary" type="button" data-checklist-update="${listName}" data-check-id="${escapeHtml(editingItem.id)}">${escapeHtml(t('updateChecklistItem'))}</button>
      <button class="btn" type="button" data-checklist-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
    </div>
    <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('editingChecklistItem'))}: ${escapeHtml(editingItem.label)}</div>`;
}

export function renderGearItems(items = [], categories = [], options = {}) {
  const totalCount = (options.allItems || items).length;
  return `
    <div style="display:grid;gap:8px">
      ${items.map(item => `
        <div data-prep-focus-row="gearItems" style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;border:1px solid ${isPrepFocusMatch(options.prepFocus, 'gearItems', item.name) ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${isPrepFocusMatch(options.prepFocus, 'gearItems', item.name) ? 'var(--orange)' : 'var(--border)'};border-radius:8px;background:var(--input-bg);padding:8px">
          <label style="display:flex;gap:8px;align-items:center;font-weight:900">
            <input type="checkbox" data-gear-packed="${escapeHtml(item.id)}" ${item.packed ? 'checked' : ''}>
            <span>${escapeHtml(item.name)}</span>
          </label>
          <button class="badge ${item.packed ? 'done' : 'mid'}" type="button" data-gear-toggle="${escapeHtml(item.id)}" title="${escapeHtml(t('togglePacked'))}" style="cursor:pointer;border:1px solid var(--border)">${escapeHtml(item.packed ? t('prepComplete') : t('prepIncomplete'))}</button>
          <span class="badge ${item.packed ? 'done' : 'mid'}">${escapeHtml(labelFor(item.category || 'Required'))} x${escapeHtml(item.qty || 1)}</span>
          <button class="btn btn-sm" type="button" data-gear-edit="${escapeHtml(item.id)}">${escapeHtml(t('edit'))}</button>
          <button class="btn btn-sm btn-danger" type="button" data-gear-delete="${escapeHtml(item.id)}">${escapeHtml(t('delete'))}</button>
        </div>
      `).join('') || `<div style="color:var(--muted);font-weight:900">${escapeHtml(totalCount ? t('noMatchingItems') : t('noGearYet'))}</div>`}
      <div class="prep-gear-entry-row">
        <label>${escapeHtml(t('gearName'))}<input data-gear-name value="" placeholder="${escapeHtml(t('gearName'))}"></label>
        <label>${escapeHtml(t('category'))}<input data-gear-category list="gear-category-list" value="" placeholder="${escapeHtml(t('category'))}"></label>
        <label>${escapeHtml(t('qty'))}<input data-gear-qty type="number" min="1" value="1"></label>
        <button class="btn btn-primary" type="button" data-gear-add>${escapeHtml(t('addItem'))}</button>
      </div>
      <datalist id="gear-category-list">${categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('')}</datalist>
    </div>`;
}

function renderGearEditForm(editingGear, categories = []) {
  if (!editingGear) return '';
  return `
    <div class="prep-gear-entry-row" data-gear-edit-form="${escapeHtml(editingGear.id)}">
      <label>${escapeHtml(t('gearName'))}<input data-gear-name value="${escapeHtml(editingGear.name || '')}" placeholder="${escapeHtml(t('gearName'))}"></label>
      <label>${escapeHtml(t('category'))}<input data-gear-category list="gear-category-list-modal" value="${escapeHtml(editingGear.category || '')}" placeholder="${escapeHtml(t('category'))}"></label>
      <label>${escapeHtml(t('qty'))}<input data-gear-qty type="number" min="1" value="${escapeHtml(editingGear.qty || 1)}"></label>
      <button class="btn btn-primary" type="button" data-gear-update="${escapeHtml(editingGear.id)}">${escapeHtml(t('updateGear'))}</button>
      <button class="btn" type="button" data-gear-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
    </div>
    <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('editingGear'))}: ${escapeHtml(editingGear.name)}</div>
    <datalist id="gear-category-list-modal">${categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('')}</datalist>`;
}

export function renderPrepCenter(state, options = {}) {
  const taskStats = getTaskStats(state.data.tasks);
  const checklistDone = state.data.checklist.filter(item => item.done).length;
  const prediveDone = state.data.prediveChecklist.filter(item => item.done).length;
  const gearPacked = state.data.gearItems.filter(item => item.packed).length;
  const gearCategories = state.data.masterData?.gearCats || [];
  const prepFocus = options.prepFocus || null;
  const filters = normalizePrepFilters(options.filters);
  const visibleChecklist = filterChecklistItems(state.data.checklist, filters);
  const visiblePredive = filterChecklistItems(state.data.prediveChecklist, filters);
  const visibleGear = filterGearItems(state.data.gearItems, filters);
  const activeFilterChips = getActivePrepFilterChips(filters);
  const editingChecklistItem = options.editingChecklist?.listName
    ? (state.data[options.editingChecklist.listName] || []).find(item => Number(item.id) === Number(options.editingChecklist.id))
    : null;
  const editingGear = state.data.gearItems.find(item => Number(item.id) === Number(options.editingGearId));
  return `
    <section id="page-prep" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('prepCenter'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('prepSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('openTasks'))} ${taskStats.open} | ${escapeHtml(t('blocked'))} ${taskStats.blocked}</div>
      </div>
      <div class="card-grid">
        ${[
          [t('tasksOpen'), taskStats.open],
          [t('checklist'), `${checklistDone}/${state.data.checklist.length}`],
          [t('preDive'), `${prediveDone}/${state.data.prediveChecklist.length}`],
          [t('gearItems'), `${gearPacked}/${state.data.gearItems.length}`],
        ].map(([label, value]) => `
          <div class="card"><div style="font-size:.78rem;color:var(--muted);font-weight:900">${label}</div><div style="font-size:1.6rem;font-weight:900;color:var(--navy)">${value}</div></div>
        `).join('')}
      </div>
      ${prepFocus?.section ? `<div class="card" data-prep-focus-summary>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">${escapeHtml(t('prepFocus'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:4px">${escapeHtml(prepFocus.query || '-')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <span class="badge mid">${escapeHtml(prepFocus.section)}</span>
            <button class="btn btn-sm" type="button" data-prep-clear-focus>${escapeHtml(t('clearFocus'))}</button>
          </div>
        </div>
      </div>` : ''}
      <div class="card">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;align-items:end;margin-bottom:10px">
          <label>${escapeHtml(t('search'))}<input data-prep-search value="${escapeHtml(filters.search)}" placeholder="${escapeHtml(t('searchPrep'))}"></label>
          <label>${escapeHtml(t('status'))}<select data-prep-status-filter>
            ${[
              ['', t('allPrepStatuses')],
              ['open', t('prepIncomplete')],
              ['done', t('prepComplete')],
            ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${filters.status === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select></label>
          <button class="btn btn-primary btn-sm" type="button" data-prep-open-only>${escapeHtml(t('prepOpenOnly'))}</button>
          <button class="btn btn-sm" type="button" data-prep-clear-filters>${escapeHtml(t('clearFilters'))}</button>
        </div>
        <div data-prep-active-filters style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;min-height:24px">
          ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-prep-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
        </div>
      </div>
      <div class="card">
        ${renderPrepSectionHeading(t('buildChecklist'), visibleChecklist.length, state.data.checklist.length, checklistDone)}
        ${renderChecklist('checklist', visibleChecklist, { editingChecklist: options.editingChecklist, prepFocus, allItems: state.data.checklist })}
      </div>
      <div class="card">
        ${renderPrepSectionHeading(t('preDiveChecklist'), visiblePredive.length, state.data.prediveChecklist.length, prediveDone)}
        ${renderChecklist('prediveChecklist', visiblePredive, { editingChecklist: options.editingChecklist, prepFocus, allItems: state.data.prediveChecklist })}
      </div>
      <div class="card">
        ${renderPrepSectionHeading(t('gearItems'), visibleGear.length, state.data.gearItems.length, gearPacked)}
        ${renderGearItems(visibleGear, gearCategories, { editingGearId: options.editingGearId, prepFocus, allItems: state.data.gearItems })}
      </div>

      <div class="modal-bg ${editingChecklistItem || editingGear ? 'open' : ''}" data-prep-modal-bg>
        <div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="prep-modal-title" data-prep-modal>
          <h3 id="prep-modal-title">${escapeHtml(editingGear ? t('editingGear') : t('editingChecklistItem'))}</h3>
          ${editingGear ? renderGearEditForm(editingGear, gearCategories) : renderChecklistEditForm(options.editingChecklist?.listName, editingChecklistItem)}
        </div>
      </div>
    </section>`;
}
