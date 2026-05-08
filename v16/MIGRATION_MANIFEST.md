# v16 Migration Manifest

This manifest maps the current v15 single-file regions to v16 modules. It is the
working checklist for the split.

## Source File

- Current production source: `../ROV_Task_Manager_v15.html`
- Current size: about 1 MB
- Risk: high coupling through globals, inline HTML, inline CSS, and many
  progressively wrapped render functions.

## Module Ownership

| Target | Owns | Extract From v15 |
|---|---|---|
| `styles/app.css` | Global tokens, nav, cards, tables, responsive layout | `<style>` block |
| `src/data/defaults.js` | Default tasks, members, checklist, mission data | `DEFAULT_*` constants |
| `src/data/state.js` | `state`, current mode/page/season, dirty flags | `STATE` section |
| `src/data/supabase.js` | Supabase client, schema detection, load/save | `SUPABASE CONFIG`, `SUPABASE LOAD` |
| `src/features/navigation.js` | mode switching, page rendering dispatcher | `NAVIGATION` section |
| `src/features/prep.js` | prep center, standup, training loop | `PREP CENTER` and later prep wrappers |
| `src/features/tasks.js` | task table, filters, detail modal, daily focus | task functions and task wrapper layer |
| `src/features/competition.js` | CCC, timer, quick score, snapshots | `COMPETITION DAY MODE` and opt3 |
| `src/features/intel.js` | notes, intel, strategy CRUD | notes and strategy wrappers |
| `src/features/settings.js` | settings hub, settings pack, master data | settings scripts |
| `src/features/health.js` | system health, data health, smoke test | health, backup, diagnostics |
| `src/utils/dom.js` | escape helpers, selectors, modal helpers | shared helpers |
| `src/utils/date.js` | due date, week, countdown helpers | date utilities |

## Extraction Status

| Step | Status | Notes |
|---|---|---|
| CSS scaffold | Ready | `styles/app.css` placeholder created |
| JS module scaffold | Ready | feature/data/utils entry files created |
| CSS extraction | Done | Full v15 `<style>` block copied to `styles/app.css`; v15 remains unchanged |
| Utility extraction | Done | Extracted DOM escaping, safe JSON parsing, date input, week, due-date, overdue, and mission timer helpers |
| App shell / navigation | Done | Local-first SPA shell with dashboard action summary, prep and intel gap lists, this-week focus, member workload, unassigned tasks, run score summary, task filter/focus/member workload/data health/prep gap/intel gap/latest-run edit jump-throughs, quick handoff export, prep, tasks, members, intel, competition, and settings |
| Settings extraction | Done | Settings hub, overview cards, master data editing, persistence, and settings pack import/export |
| Smoke test extraction | Done | Smoke engine, log persistence, visible panel, rerun control, assignment health, and data health checks |
| Tasks extraction | Done | Local task create/edit, status update, delete, notes, member owner suggestions, search, health filters, health summary, stable shortcut filters, removable active filter chips, clear filters, row health badges, sorting, stats, due/overdue display, and persistence |
| Prep extraction | Done | Build, pre-dive checklist, and gear workflow with add/edit/delete maintenance, packed toggles, dashboard focus highlighting, focus clearing, completed-item focus auto-clear, stable search/status filters, removable active filter chips, visible/total section counts, clear filters, and persistence |
| Competition extraction | Done | Mission timer, score/note capture, editable run history, run search, run sorting, active run filter chips, clear filters, deletion, and persistence |
| Intel extraction | Done | Team notes, intel items, and strategy items with local add/edit/delete, search, status filters, stable in-session filter state, removable active filter chips, visible/total list counts, clear filters, sorting, dashboard focus highlighting, focus clearing, Ready-state focus auto-clear, and persistence |
| Members extraction | Done | Members route with add/edit/delete, search, role/group filters, stable in-session filter state, removable active filter chips, clear filters, sorting, role view, member task lists, and handoff cards |
| v15 backup migration | Done | Imports v15 system backup JSON into normalized v16 local data |
| Supabase read-only adapter | Done | Reads production Supabase tables into normalized v16 local state without DB writes |
| Supabase sync preview | Done | Dry-run local vs read-only DB diff; no Supabase writes |
| Supabase sync detail view | Done | Shows affected rows and update fields per table in preview |
| Supabase guarded write sync | Done | Manual create/update-only upsert with confirmation, backup, table whitelist, deletes disabled, and post-write verification |
| Supabase schema-safe mapping | Done | Filters guarded write payloads through table/field whitelist before upsert |
| Supabase schema probe | Done | Read-only column probes display existing/missing fields per table |
| Schema-aware guarded sync | Done | Guarded write payloads shrink to probed existing columns when schema probe is available |
| Write audit log | Done | Saves guarded write preview/result/drop/post-write summaries to localStorage |
| v16 local rollback | Done | Restores v16 local state from guarded-write backup JSON without Supabase writes |
| Safe Traditional Chinese UI | Done | Locale toggle and Unicode-escaped zh strings added for navigation, dashboard, settings sync panels, tasks, prep, competition, diagnostics, readiness, and backup controls |
| Zero-dependency smoke script | Done | `node smoke-v16.mjs` checks module wiring, actions, i18n keys, and sync safety guards |
| Server smoke script | Done | `node smoke-server.mjs` fetches the local URL and module graph without Playwright |
| Playwright e2e scaffold | Done | Optional desktop/mobile browser checks for load, navigation, locale, tasks, and settings safety panels |
| E2E readiness checker | Done | Checks local server, Playwright package, and Node child-process spawn capability |
| In-app workflow smoke | Done | Smoke button renders each route, checks critical controls, saves result, and restores current page |
| Smoke report upgrade | Done | Smoke panel shows type, pass/fail totals, and grouped check badges |
| Diagnostics export | Done | Settings can export smoke, DB, schema, sync, audit, and data health state as JSON |
| Diagnostics import/viewer | Done | Settings can show current data health, import diagnostics JSON, and show summary plus smoke, health, sync, DB/schema, and audit detail |
| Manual v16 backup export | Done | Settings can export a full `rov_v16_local_backup` JSON on demand |
| Reset v16 local data | Done | Requires `RESET V16`, downloads backup first, clears v16 localStorage, and reloads defaults |
| Release readiness panel | Done | Settings overview shows a local handoff checklist based on smoke, data health, schema, sync, backup, safety, diagnostics, and operational summary |
| Handoff report export | Done | Settings can export readiness, health issues, operational gaps, focus tasks, member workload, unassigned tasks, run summary, and sync status as JSON |

## Smoke Checklist

Current v16 smoke/behavior checklist:

- Main pages exist: dashboard, prep, tasks, members, intel, competition, settings.
- Core controls exist: nav, task form/table/edit/search/filter/sort controls, checklist toggles/add/edit/delete, gear add/edit/packed/delete, mission timer, run history edit/delete, settings overview.
- Filtered empty states distinguish no saved data from no rows matching the current filters across Tasks, Members, Prep, Intel, and Competition.
- Task filter state is held in the app shell so health shortcuts and filter controls survive route re-render.
- Tasks show a visible/total task count after filtering.
- Task health shortcut cards apply clean health presets, show active state, and preserve the current sort.
- Task filters can be cleared in one action while preserving the current sort.
- Active task filters are summarized as removable chips under the filter controls.
- Dashboard task actions can open Tasks with preset search or health filters.
- Dashboard week-focus rows can open Tasks with a preset search for that task.
- Dashboard member workload cards can open Tasks with a preset owner filter.
- Dashboard data health task issues can open Tasks with preset health filters.
- Dashboard prep gaps can open Prep with a focused checklist or gear row.
- Dashboard prep focus presets also align Prep search/status filters so the focused row is visible even after previous filters.
- Prep filters are held in the app shell so search and completion status survive route re-render.
- Prep filters can be cleared in one action and active prep filters are summarized as removable chips.
- Prep checklist, pre-dive, and gear sections show visible/total counts after filtering.
- Prep focus auto-clears, including matching focus-applied search, when the focused checklist row is checked or the focused gear row is packed.
- Prep focus can be cleared without changing checklist or gear data, and clears the dashboard-applied search when it still matches the focused row.
- Dashboard intel gaps can open Intel with a focused intel or strategy row.
- Dashboard intel focus presets also align Intel/Strategy search/status filters so the focused row is visible even after previous filters.
- Intel filter state is held in the app shell so search, status, and sort survive route re-render.
- Intel and strategy filters can be cleared per list and active filters are summarized as removable chips.
- Intel and strategy sections show visible/total counts after filtering.
- Intel focus auto-clears, including matching focus-applied search, when the focused intel or strategy item is updated to Ready.
- Intel focus can be cleared without changing intel or strategy data, and clears the dashboard-applied list search when it still matches the focused row.
- Dashboard latest run can open Competition directly in run edit mode and clears run search so the edited run remains visible.
- Route changes clear edit forms from non-active pages while preserving destination-page dashboard presets.
- Competition run history supports search, sorting, clear filters, and removable active filter chips.
- Members controls exist: member form, search, role/group filters, sort, edit/delete, visible/total member count, filtered role view, member task lists, and filtered handoff cards.
- Member filter state is held in the app shell so search, role, group, and sort survive route re-render.
- Member filters can be cleared in one action and active member filters are summarized as removable chips.
- Local storage keys can be read/write tested.
- Settings pack export/import supports v16 packs and v15 master data.
- v15 system backup JSON import maps tasks, members, checklist, pre-dive, runs, gear, notes, and strategy.
- Supabase read-only load maps tasks, members, checklist, pre-dive, intel, notes, strategy, and mission runs.
- Supabase sync preview reports create/update/remove counts before any future write path exists.
- Guarded write sync requires `SYNC V16`, downloads a local backup, whitelists tables/fields, skips deletes, and reloads DB for post-write diff verification.
- Schema probe uses read-only select(column).limit(1) checks to show field coverage before write sync.
- Guarded write sync uses schema probe results to drop fields not confirmed by the current DB schema.
- Write audit log keeps the latest 20 guarded write attempts locally.
- Rollback imports `rov_v16_local_backup` JSON into local state only.
- Manual backup export downloads a full v16 local backup without Supabase writes.
- Reset local data requires `RESET V16`, downloads a backup first, and only clears v16 localStorage.
- Diagnostics import shows detailed smoke, health, sync, DB/schema, and audit views.
- Release Readiness and Handoff Report summarize handoff state and operational gaps inside Settings.
- Smoke report renders in settings.
- v15 remains unchanged and production-safe.
