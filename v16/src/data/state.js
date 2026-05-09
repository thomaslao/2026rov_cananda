import { DEFAULT_STATE } from './defaults.js';
import { safeJsonParse } from '../utils/index.js';

export const APP_STATE_STORAGE_KEY = 'rov_v16_app_state';

export function createInitialState() {
  return {
    data: structuredClone(DEFAULT_STATE),
    currentPage: 'dashboard',
    currentMode: 'review',
    currentSeason: '2025-2026',
    savedAt: '',
    dirtyFlags: {},
  };
}

export function loadAppState(storage = localStorage) {
  const state = createInitialState();
  const saved = safeJsonParse(storage.getItem(APP_STATE_STORAGE_KEY), null);
  if (!saved) return state;
  return {
    ...state,
    currentPage: saved.currentPage || state.currentPage,
    currentMode: saved.currentMode || state.currentMode,
    currentSeason: saved.currentSeason || state.currentSeason,
    savedAt: saved.savedAt || '',
    dirtyFlags: {},
  };
}

export function saveAppState(state, storage = localStorage) {
  const savedAt = new Date().toISOString();
  storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({
    currentPage: state.currentPage,
    currentMode: state.currentMode,
    currentSeason: state.currentSeason,
    savedAt,
  }));
  state.savedAt = savedAt;
  state.dirtyFlags = {};
}
