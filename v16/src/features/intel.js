import { escapeHtml } from '../utils/index.js';
import { labelFor, t } from '../utils/i18n.js';

function clean(value) {
  return String(value || '').trim();
}

function nextId() {
  return Date.now();
}

function normalizeItem(item = {}, fallbackTitle = '') {
  return {
    id: item.id || nextId(),
    title: clean(item.title || item.name || fallbackTitle),
    content: clean(item.content || item.note || item.notes || item.detail),
    status: clean(item.status) || 'Draft',
  };
}

export function normalizeKnowledgeFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    status: clean(filters.status),
    sort: clean(filters.sort) || 'newest',
  };
}

function filterKnowledgeItems(items = [], filters = {}) {
  return items.filter((raw) => {
    const item = normalizeItem(raw);
    const haystack = `${item.title} ${item.content} ${item.status}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.status && item.status !== filters.status) return false;
    return true;
  });
}

function sortKnowledgeItems(items = [], sort = 'newest') {
  const statusRank = { Draft: 0, Review: 1, Ready: 2 };
  const withIndex = items.map((item, index) => ({ item, index }));
  return withIndex.sort((a, b) => {
    const aItem = normalizeItem(a.item);
    const bItem = normalizeItem(b.item);
    let result = 0;
    if (sort === 'title') result = aItem.title.localeCompare(bItem.title, 'en');
    else if (sort === 'status') result = (statusRank[aItem.status] ?? 9) - (statusRank[bItem.status] ?? 9) || aItem.title.localeCompare(bItem.title, 'en');
    else if (sort === 'oldest') result = Number(aItem.id || 0) - Number(bItem.id || 0);
    else result = Number(bItem.id || 0) - Number(aItem.id || 0);
    return result || a.index - b.index;
  }).map(row => row.item);
}

function isIntelFocusMatch(focus = {}, listName = '', title = '') {
  if (!focus) return false;
  return focus.listName === listName && clean(focus.query).toLowerCase() === clean(title).toLowerCase();
}

export function updateNotes(state, notes) {
  state.data.notes = String(notes || '');
  state.dirtyFlags.notes = true;
  return true;
}

export function createKnowledgeItemFromForm(form, fallbackTitle = '') {
  return normalizeItem({
    id: nextId(),
    title: form.get('title'),
    content: form.get('content'),
    status: form.get('status'),
  }, fallbackTitle);
}

export function addKnowledgeItem(state, listName, item) {
  if (!Array.isArray(state.data[listName])) return false;
  const normalized = normalizeItem(item, t('untitledItem'));
  if (!normalized.title && !normalized.content) return false;
  state.data[listName].unshift(normalized);
  state.dirtyFlags[listName] = true;
  return true;
}

export function updateKnowledgeItem(state, listName, id, item) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const index = list.findIndex(row => Number(row.id) === Number(id));
  if (index < 0) return false;
  const normalized = normalizeItem(item, t('untitledItem'));
  if (!normalized.title && !normalized.content) return false;
  list[index] = {
    ...list[index],
    ...normalized,
    id: list[index].id,
  };
  state.dirtyFlags[listName] = true;
  return true;
}

export function getNextKnowledgeStatus(status = 'Draft') {
  const statuses = ['Draft', 'Review', 'Ready'];
  const index = statuses.indexOf(status);
  return statuses[(index + 1) % statuses.length] || statuses[0];
}

export function updateKnowledgeStatus(state, listName, id, status) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const item = list.find(row => Number(row.id) === Number(id));
  if (!item) return false;
  item.status = status;
  state.dirtyFlags[listName] = true;
  return true;
}

export function deleteKnowledgeItem(state, listName, id) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const before = list.length;
  state.data[listName] = list.filter(row => Number(row.id) !== Number(id));
  state.dirtyFlags[listName] = before !== state.data[listName].length;
  return state.dirtyFlags[listName];
}

function renderKnowledgeForm(listName, editingItem = null) {
  const action = editingItem ? 'update' : 'add';
  const formAttr = listName === 'intel'
    ? 'data-knowledge-form="intel"'
    : 'data-knowledge-form="strategy"';
  return `
    <form ${formAttr} data-knowledge-action="${action}" style="display:grid;grid-template-columns:1fr 140px auto auto;gap:8px;align-items:end">
      <label>${escapeHtml(t('title'))}<input name="title" value="${escapeHtml(editingItem?.title || '')}" placeholder="${escapeHtml(t('title'))}"></label>
      <label>${escapeHtml(t('status'))}<select name="status">${['Draft', 'Review', 'Ready'].map(status => `<option value="${status}" ${editingItem?.status === status ? 'selected' : ''}>${escapeHtml(labelFor(status))}</option>`).join('')}</select></label>
      <button class="btn btn-primary" type="submit">${escapeHtml(editingItem ? t('updateItem') : t('addItem'))}</button>
      ${editingItem ? `<button class="btn" type="button" data-knowledge-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
      <label style="grid-column:1/-1">${escapeHtml(t('content'))}<textarea name="content" rows="3" placeholder="${escapeHtml(t('content'))}">${escapeHtml(editingItem?.content || '')}</textarea></label>
    </form>
    ${editingItem ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('editingItem'))}: ${escapeHtml(editingItem.title || t('untitledItem'))}</div>` : ''}`;
}

function renderKnowledgeList(listName, items = [], options = {}) {
  if (!items.length) {
    return `<div style="color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingItems') : t('noItemsYet'))}</div>`;
  }
  return `
    <div style="display:grid;gap:8px">
      ${items.map((raw, index) => {
        const item = normalizeItem(raw, `${t('item')} ${index + 1}`);
        return `
          <div data-intel-focus-row="${escapeHtml(listName)}" style="border:1px solid ${isIntelFocusMatch(options.intelFocus, listName, item.title) ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${isIntelFocusMatch(options.intelFocus, listName, item.title) ? 'var(--orange)' : 'var(--border)'};border-radius:8px;background:var(--input-bg);padding:9px;display:grid;gap:6px">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:start">
              <div>
                <strong style="color:var(--navy)">${escapeHtml(item.title || t('untitledItem'))}</strong>
                <button class="badge ${item.status === 'Ready' ? 'done' : item.status === 'Review' ? 'mid' : ''}" type="button" data-knowledge-next-status="${escapeHtml(listName)}" data-knowledge-id="${escapeHtml(raw.id)}" title="${escapeHtml(t('nextStatus'))}" style="cursor:pointer;border:1px solid var(--border);margin-top:4px">${escapeHtml(labelFor(item.status))}</button>
              </div>
              <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
                <button class="btn btn-sm" type="button" data-knowledge-edit="${listName}" data-knowledge-id="${escapeHtml(raw.id)}">${escapeHtml(t('edit'))}</button>
                <button class="btn btn-sm btn-danger" type="button" data-knowledge-delete="${listName}" data-knowledge-id="${escapeHtml(raw.id)}">${escapeHtml(t('delete'))}</button>
              </div>
            </div>
            <div style="font-size:.82rem;white-space:pre-wrap">${escapeHtml(item.content || '-')}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderKnowledgeSectionHeading(label, visibleCount, totalCount) {
  return `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
      <h2 style="margin:0">${escapeHtml(label)}</h2>
      <span class="badge mid" data-knowledge-visible-count>${escapeHtml(visibleCount)}/${escapeHtml(totalCount)}</span>
    </div>`;
}

function getActiveKnowledgeFilterChips(filters = {}) {
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.status ? { key: 'status', label: t('status'), value: labelFor(filters.status) } : null,
  ].filter(Boolean);
}

function renderKnowledgeFilters(listName, filters = {}) {
  const activeFilterChips = getActiveKnowledgeFilterChips(filters);
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:10px 0">
      <label>${escapeHtml(t('search'))}<input data-knowledge-search="${listName}" value="${escapeHtml(filters.search || '')}" placeholder="${escapeHtml(t('searchIntel'))}"></label>
      <label>${escapeHtml(t('status'))}<select data-knowledge-status-filter="${listName}">
        <option value="">${escapeHtml(t('allStatuses'))}</option>
        ${['Draft', 'Review', 'Ready'].map(status => `<option value="${status}" ${filters.status === status ? 'selected' : ''}>${escapeHtml(labelFor(status))}</option>`).join('')}
      </select></label>
      <label>${escapeHtml(t('sort'))}<select data-knowledge-sort="${listName}">
        ${[
          ['newest', t('sortNewest')],
          ['oldest', t('sortOldest')],
          ['title', t('sortTitle')],
          ['status', t('sortStatus')],
        ].map(([value, label]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
      </select></label>
      <button class="btn btn-sm" type="button" data-knowledge-clear-filters="${escapeHtml(listName)}">${escapeHtml(t('clearFilters'))}</button>
    </div>
    <div data-knowledge-active-filters="${escapeHtml(listName)}" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;min-height:24px">
      ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-knowledge-remove-filter="${escapeHtml(chip.key)}" data-knowledge-filter-list="${escapeHtml(listName)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
    </div>`;
}

export function renderIntelPage(state, options = {}) {
  const intel = state.data.intel || [];
  const strategy = state.data.strategy || [];
  const intelFilters = normalizeKnowledgeFilters(options.filters?.intel);
  const strategyFilters = normalizeKnowledgeFilters(options.filters?.strategy);
  const visibleIntel = sortKnowledgeItems(filterKnowledgeItems(intel, intelFilters), intelFilters.sort);
  const visibleStrategy = sortKnowledgeItems(filterKnowledgeItems(strategy, strategyFilters), strategyFilters.sort);
  const editingIntel = intel.find(item => Number(item.id) === Number(options.editingIntelId));
  const editingStrategy = strategy.find(item => Number(item.id) === Number(options.editingStrategyId));
  const intelFocus = options.intelFocus || null;
  return `
    <section id="page-intel" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('intel'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('intelSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('intel'))} ${visibleIntel.length}/${intel.length} | ${escapeHtml(t('strategy'))} ${visibleStrategy.length}/${strategy.length}</div>
      </div>

      <div class="card">
        <h2>${escapeHtml(t('teamNotes'))}</h2>
        <label>${escapeHtml(t('notes'))}<textarea data-notes-input rows="5" placeholder="${escapeHtml(t('notes'))}">${escapeHtml(state.data.notes || '')}</textarea></label>
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-primary" type="button" data-notes-save>${escapeHtml(t('saveNotes'))}</button>
        </div>
      </div>

      ${intelFocus?.listName ? `<div class="card" data-intel-focus-summary>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">${escapeHtml(t('intelFocus'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:4px">${escapeHtml(intelFocus.query || '-')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <span class="badge mid">${escapeHtml(intelFocus.listName)}</span>
            <button class="btn btn-sm" type="button" data-intel-clear-focus>${escapeHtml(t('clearFocus'))}</button>
          </div>
        </div>
      </div>` : ''}

      <div class="card">
        ${renderKnowledgeSectionHeading(t('intel'), visibleIntel.length, intel.length)}
        ${renderKnowledgeForm('intel', editingIntel)}
        ${renderKnowledgeFilters('intel', intelFilters)}
        <div style="margin-top:10px">${renderKnowledgeList('intel', visibleIntel, { intelFocus, totalCount: intel.length })}</div>
      </div>

      <div class="card">
        ${renderKnowledgeSectionHeading(t('strategy'), visibleStrategy.length, strategy.length)}
        ${renderKnowledgeForm('strategy', editingStrategy)}
        ${renderKnowledgeFilters('strategy', strategyFilters)}
        <div style="margin-top:10px">${renderKnowledgeList('strategy', visibleStrategy, { intelFocus, totalCount: strategy.length })}</div>
      </div>
    </section>`;
}
