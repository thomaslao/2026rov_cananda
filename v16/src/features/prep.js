import { escapeHtml } from '../utils/index.js';
import { labelFor, t } from '../utils/i18n.js';
import { getTaskStats } from './tasks.js';

function clean(value) {
  return String(value || '').trim();
}

function checklistItemId(item = {}, index = -1) {
  const candidates = [item.id, item.item_id, item.itemId]
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0);
  return candidates[0] || (index >= 0 ? index + 1 : '');
}

export function normalizePrepFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    status: clean(filters.status),
  };
}

export function toggleChecklistItem(state, listName, id) {
  const item = state.data[listName]?.find((row, index) => Number(checklistItemId(row, index)) === Number(id));
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
  const item = state.data[listName]?.find((row, index) => Number(checklistItemId(row, index)) === Number(id));
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
  state.data[listName] = list.filter((item, index) => Number(checklistItemId(item, index)) !== Number(id));
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
    <div class="prep-list">
      ${items.map((item, index) => {
        const itemId = checklistItemId(item, index);
        return `
        <div class="prep-item-row ${isPrepFocusMatch(options.prepFocus, listName, item.label) ? 'focus' : ''}" data-prep-focus-row="${escapeHtml(listName)}">
          <label class="prep-item-main">
            <input type="checkbox" data-checklist="${listName}" data-check-id="${escapeHtml(itemId)}" ${item.done ? 'checked' : ''}>
            <span>${escapeHtml(item.label)}</span>
          </label>
          <button class="badge ${item.done ? 'done' : 'mid'} prep-status-badge" type="button" data-checklist-toggle="${listName}" data-check-id="${escapeHtml(itemId)}" title="${escapeHtml(t('toggleComplete'))}">${escapeHtml(item.done ? t('prepComplete') : t('prepIncomplete'))}</button>
          <div class="prep-row-actions">
            <button class="btn btn-sm" type="button" onclick="event.stopPropagation(); window.rovOpenPrepEdit && window.rovOpenPrepEdit('checklist','${escapeHtml(listName)}','${escapeHtml(itemId)}')" data-prep-edit="checklist" data-prep-list="${escapeHtml(listName)}" data-prep-id="${escapeHtml(itemId)}" data-checklist-edit="${listName}" data-check-id="${escapeHtml(itemId)}">${escapeHtml(t('edit'))}</button>
            <button class="btn btn-sm btn-danger" type="button" data-checklist-delete="${listName}" data-check-id="${escapeHtml(itemId)}">${escapeHtml(t('delete'))}</button>
          </div>
        </div>
      `; }).join('') || `<div style="color:var(--muted);font-weight:900">${escapeHtml(totalCount ? t('noMatchingItems') : t('noItemsYet'))}</div>`}
    </div>`;
}

function renderChecklistAddForm(listName) {
  return `
    <div class="prep-entry-row" data-checklist-add-form="${escapeHtml(listName)}">
      <label>${escapeHtml(t('newChecklistItem'))}<input data-checklist-input="${escapeHtml(listName)}" value="" placeholder="${escapeHtml(t('newChecklistItem'))}" autofocus></label>
      <button class="btn btn-primary" type="button" data-checklist-add="${escapeHtml(listName)}">${escapeHtml(t('addItem'))}</button>
      <button class="btn" type="button" data-prep-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
    </div>`;
}

function renderChecklistEditForm(listName, editingItem) {
  if (!editingItem) return '';
  const itemId = checklistItemId(editingItem);
  return `
    <div class="prep-entry-row" data-checklist-edit-form="${escapeHtml(listName)}" data-check-id="${escapeHtml(itemId)}">
      <label>${escapeHtml(t('newChecklistItem'))}<input data-checklist-input="${listName}" value="${escapeHtml(editingItem.label || '')}" placeholder="${escapeHtml(t('newChecklistItem'))}"></label>
      <button class="btn btn-primary" type="button" data-checklist-update="${listName}" data-check-id="${escapeHtml(itemId)}">${escapeHtml(t('updateChecklistItem'))}</button>
      <button class="btn" type="button" data-checklist-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
    </div>
    <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('editingChecklistItem'))}: ${escapeHtml(editingItem.label)}</div>`;
}

export function renderGearItems(items = [], categories = [], options = {}) {
  const totalCount = (options.allItems || items).length;
  return `
    <div class="prep-list">
      ${items.map(item => `
        <div class="prep-item-row prep-gear-row ${isPrepFocusMatch(options.prepFocus, 'gearItems', item.name) ? 'focus' : ''}" data-prep-focus-row="gearItems">
          <label class="prep-item-main">
            <input type="checkbox" data-gear-packed="${escapeHtml(item.id)}" ${item.packed ? 'checked' : ''}>
            <span>${escapeHtml(item.name)}</span>
          </label>
          <button class="badge ${item.packed ? 'done' : 'mid'} prep-status-badge" type="button" data-gear-toggle="${escapeHtml(item.id)}" title="${escapeHtml(t('togglePacked'))}">${escapeHtml(item.packed ? t('prepComplete') : t('prepIncomplete'))}</button>
          <span class="badge ${item.packed ? 'done' : 'mid'} prep-meta-badge">${escapeHtml(labelFor(item.category || 'Required'))} x${escapeHtml(item.qty || 1)}</span>
          <div class="prep-row-actions">
            <button class="btn btn-sm" type="button" onclick="event.stopPropagation(); window.rovOpenPrepEdit && window.rovOpenPrepEdit('gear','gearItems','${escapeHtml(item.id)}')" data-prep-edit="gear" data-prep-id="${escapeHtml(item.id)}" data-gear-edit="${escapeHtml(item.id)}">${escapeHtml(t('edit'))}</button>
            <button class="btn btn-sm btn-danger" type="button" data-gear-delete="${escapeHtml(item.id)}">${escapeHtml(t('delete'))}</button>
          </div>
        </div>
      `).join('') || `<div style="color:var(--muted);font-weight:900">${escapeHtml(totalCount ? t('noMatchingItems') : t('noGearYet'))}</div>`}
      <datalist id="gear-category-list">${categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('')}</datalist>
    </div>`;
}

function renderGearAddForm(categories = []) {
  return `
    <div class="prep-gear-entry-row" data-gear-add-form>
      <label>${escapeHtml(t('gearName'))}<input data-gear-name value="" placeholder="${escapeHtml(t('gearName'))}" autofocus></label>
      <label>${escapeHtml(t('category'))}<input data-gear-category list="gear-category-list-modal" value="" placeholder="${escapeHtml(t('category'))}"></label>
      <label>${escapeHtml(t('qty'))}<input data-gear-qty type="number" min="1" value="1"></label>
      <button class="btn btn-primary" type="button" data-gear-add>${escapeHtml(t('addItem'))}</button>
      <button class="btn" type="button" data-prep-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
    </div>
    <datalist id="gear-category-list-modal">${categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('')}</datalist>`;
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
    ? (state.data[options.editingChecklist.listName] || []).find((item, index) => Number(checklistItemId(item, index)) === Number(options.editingChecklist.id))
    : null;
  const editingGear = state.data.gearItems.find(item => Number(item.id) === Number(options.editingGearId));
  const activeTab = ['checklist', 'prediveChecklist', 'gearItems'].includes(options.activeTab) ? options.activeTab : 'checklist';
  const addingPrepItem = ['checklist', 'prediveChecklist', 'gearItems'].includes(options.addingPrepItem) ? options.addingPrepItem : null;
  const prepAddLabels = {
    checklist: t('buildChecklist'),
    prediveChecklist: t('preDiveChecklist'),
    gearItems: t('gearItems'),
  };
  const isPrepModalOpen = Boolean(editingChecklistItem || editingGear || addingPrepItem);
  const prepModalTitle = editingGear
    ? t('editingGear')
    : editingChecklistItem
      ? t('editingChecklistItem')
      : `${t('addItem')} - ${prepAddLabels[addingPrepItem || activeTab] || t('prepCenter')}`;
  const prepModalBody = editingGear
    ? renderGearEditForm(editingGear, gearCategories)
    : editingChecklistItem
      ? renderChecklistEditForm(options.editingChecklist?.listName, editingChecklistItem)
      : addingPrepItem === 'gearItems'
        ? renderGearAddForm(gearCategories)
        : renderChecklistAddForm(addingPrepItem || activeTab);
  const prepTabs = [
    ['checklist', t('buildChecklist'), visibleChecklist.length, state.data.checklist.length],
    ['prediveChecklist', t('preDiveChecklist'), visiblePredive.length, state.data.prediveChecklist.length],
    ['gearItems', t('gearItems'), visibleGear.length, state.data.gearItems.length],
  ];
  const activePanel = activeTab === 'prediveChecklist'
    ? `${renderPrepSectionHeading(t('preDiveChecklist'), visiblePredive.length, state.data.prediveChecklist.length, prediveDone)}
          <div class="prep-tab-scroll">${renderChecklist('prediveChecklist', visiblePredive, { editingChecklist: options.editingChecklist, prepFocus, allItems: state.data.prediveChecklist })}</div>`
    : activeTab === 'gearItems'
      ? `${renderPrepSectionHeading(t('gearItems'), visibleGear.length, state.data.gearItems.length, gearPacked)}
          <div class="prep-tab-scroll">${renderGearItems(visibleGear, gearCategories, { editingGearId: options.editingGearId, prepFocus, allItems: state.data.gearItems })}</div>`
      : `${renderPrepSectionHeading(t('buildChecklist'), visibleChecklist.length, state.data.checklist.length, checklistDone)}
          <div class="prep-tab-scroll">${renderChecklist('checklist', visibleChecklist, { editingChecklist: options.editingChecklist, prepFocus, allItems: state.data.checklist })}</div>`;
  return `
    <section id="page-prep" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('prepCenter'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('prepSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('openTasks'))} ${taskStats.open} | ${escapeHtml(t('blocked'))} ${taskStats.blocked}</div>
      </div>
      <div class="prep-summary-row">
        ${[
          [t('tasksOpen'), taskStats.open],
          [t('checklist'), `${checklistDone}/${state.data.checklist.length}`],
          [t('preDive'), `${prediveDone}/${state.data.prediveChecklist.length}`],
          [t('gearItems'), `${gearPacked}/${state.data.gearItems.length}`],
        ].map(([label, value]) => `
          <button class="prep-summary-pill" type="button" data-prep-open-only><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></button>
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
      <div class="card prep-control-card">
        <div class="prep-control-row">
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
          <div data-prep-active-filters class="prep-active-filters">
            ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-prep-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
          </div>
        </div>
      </div>
      <div class="card prep-tab-card">
        <div class="prep-tab-row" role="tablist" aria-label="${escapeHtml(t('prepCenter'))}">
          ${prepTabs.map(([key, label, visible, total]) => `
            <button class="prep-tab-button ${activeTab === key ? 'active' : ''}" type="button" role="tab" aria-selected="${activeTab === key ? 'true' : 'false'}" data-prep-tab="${escapeHtml(key)}">
              <span>${escapeHtml(label)}</span><strong>${escapeHtml(visible)}/${escapeHtml(total)}</strong>
            </button>
          `).join('')}
        </div>
        <div class="prep-tab-tools">
          <button class="btn btn-primary btn-sm" type="button" data-prep-open-add="${escapeHtml(activeTab)}">${escapeHtml(t('addItem'))}</button>
        </div>
        <div class="prep-tab-panel">${activePanel}</div>
      </div>

      <div class="modal-bg ${isPrepModalOpen ? 'open' : ''}" data-prep-modal-bg>
        <div class="modal wide prep-modal" role="dialog" aria-modal="true" aria-labelledby="prep-modal-title" data-prep-modal>
          <div class="prep-modal-head">
            <h3 id="prep-modal-title">${escapeHtml(prepModalTitle)}</h3>
            <button class="btn btn-sm" type="button" data-prep-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
          </div>
          ${prepModalBody}
        </div>
      </div>
    </section>`;
}
