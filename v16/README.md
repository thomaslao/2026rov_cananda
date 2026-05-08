# ROV Task Manager v16

v16 is the standalone local-first build of ROV Task Manager. It was split out
from `../ROV_Task_Manager_v15.html` so new workflows can be tested without
changing the v15 production fallback.

Direct-open app file:

```text
ROV_Task_Manager_v16.html
```

This single HTML file is the easiest handoff path. It bundles the v16 app, CSS,
and JavaScript so it can be opened directly in a browser without starting the
local server.

Root launcher:

```text
../OPEN_V16.html
```

Double-click this launcher from the project root to open the packaged v16 app
without choosing between `index.html` and `ROV_Task_Manager_v16.html`.

Local app URL:

```bash
http://127.0.0.1:8016
```

If port `8016` is already busy, the local server automatically tries the next
available port and prints the actual URL in the terminal.

Start the local static server:

```bash
npm run serve
```

Start the local server in the background on Windows:

```bash
npm run start:local
```

Stop the background local server:

```bash
npm run stop:local
```

Health check:

```bash
http://127.0.0.1:8016/healthz
```

Quick local status:

```bash
npm run status
```

`status` scans the same local fallback range and prints the active v16 URL when
the app and `/healthz` are reachable.

v15 remains untouched unless explicitly edited.

## What v16 Does

- Dashboard with local data health, assignment health, action summary, prep and intel gap lists,
  this-week focus, member workload, unassigned tasks, prep readiness, intel
  readiness, latest run snapshot, run score summary, task filter jump-throughs,
  focus task/member workload/data health jump-throughs, prep gap focus
  jump-throughs, intel gap focus jump-throughs, latest-run edit jump-through,
  latest-run filter alignment, recent local action log, local action log export,
  local action log clearing, detailed local action labels, dashboard safety
  report export, safety metadata clearing, and quick handoff export.
- Route changes clear edit forms from non-active pages while preserving the
  destination page's dashboard-applied edit preset.
- Filtered empty states distinguish between no saved data and no rows matching
  the current filters across Tasks, Members, Prep, Intel, and Competition.
- Prep, pre-dive checklist, and gear workflows with add/edit/delete item
  maintenance plus dashboard-driven focus highlighting, focus clearing, and
  focus-applied search clearing, completed-item focus auto-clear, stable prep
  search/status filters, removable active filter chips, and clear filters.
  Filtered checklist, pre-dive, and gear sections show visible/total counts.
- Members page with add/edit/delete, search, role/group filters, stable
  in-session filter state, removable active filter chips, clear filters,
  sorting, visible/total member count, filtered role view, member task lists,
  and filtered handoff cards.
- Intel page for team notes, scouting intel, strategy items, search, status
  filters, sorting, stable in-session filter state, removable active filter
  chips, clear filters, dashboard-driven focus highlighting, focus clearing,
  focus-applied search clearing, visible/total list counts, and Ready-state
  focus auto-clear.
- Tasks create/edit/status/delete with notes, member owner suggestions,
  search, owner/status/priority/category filters, health filters, health summary,
  clean health shortcut presets with active shortcut state, stable in-session
  filter state, row health badges, visible/total task count, removable active
  filter chips, clear filters, sorting, and localStorage persistence.
- Competition timer, score/note capture, editable run history, run search,
  run sorting, previous-run duplication into a new draft, active run filter
  chips, clear filters, and run deletion.
- Settings center for master data, settings packs, QA, migration, rollback,
  current data health, diagnostics, health issues, and operational handoff.
- Non-blocking toast feedback for save/export/import/delete/status operations.
- Undo for local data changes through toast, a persistent undo bar, and
  `Ctrl+Z` / `Cmd+Z` outside text inputs.
- Cross-refresh undo snapshots stored in localStorage, with capture time and a
  manual clear control.
- v15 backup JSON import into normalized v16 local data.
- Supabase read-only load into v16 local state.
- Supabase schema probe with read-only column checks.
- Supabase sync preview with detailed create/update/remove diff.
- Guarded Supabase write sync for create/update only.
- Write audit log, post-write verification, and rollback from v16 backup.
- Diagnostics export/import with detailed in-app viewer.
- Release Readiness checklist and Handoff Report export.
- Safe bilingual UI foundation for English and Traditional Chinese.

## Safety Model

v16 is local-first. Most actions only affect browser localStorage.

Supabase write sync is guarded:

- Manual only.
- Requires typing `SYNC V16`.
- Downloads a v16 local backup before writing.
- Allows create/update only.
- Deletes are disabled.
- Uses table and field whitelists.
- Can shrink payloads using schema probe results.
- Saves local write audit entries.
- Reloads Supabase afterward for post-write diff verification.

Rollback and reset actions do not write to Supabase.

## Backup And Handoff

Settings provides:

- `Export v16 Backup`: download full local v16 backup.
- `Restore v16 Backup`: restore from `rov_v16_local_backup` JSON.
- Restore downloads the current v16 backup first and can be undone through the
  local undo snapshot.
- `Reset v16 Local Data`: requires `RESET V16`, downloads backup first, clears
  v16 localStorage, then reloads defaults.
- `Export Diagnostics`: smoke, DB, schema, sync, audit, and health bundle.
- `Import Diagnostics`: view another diagnostics bundle inside Settings.
- `Export Handoff Report`: concise readiness/counts/sync summary JSON.
- Dashboard `Export Log`: download recent local actions as
  `rov_v16_action_log_YYYY-MM-DD.json`.
- Dashboard `Clear Log`: clear only the recent local action log.
- Dashboard `Export Safety`: download saved time, undo metadata, recent local
  actions, local counts, source/context metadata, and health issues as
  `rov_v16_safety_report_YYYY-MM-DD.json`.
- Dashboard `Clear Safety Meta`: clear only the undo snapshot and recent local
  action log. App data and Supabase are not touched.

## Validation

Release summary:

```bash
RELEASE_NOTES.md
```

Recommended handoff validation:

```bash
npm run validate
```

`validate` runs JS syntax checks, static smoke, builds the direct-open single
HTML file, smokes the single HTML, then starts a temporary local server for
server/module graph smoke. It prefers port 8017, automatically tries the next
available port when needed, and does not depend on an already-running server on
port 8016.

Build the direct-open single HTML:

```bash
npm run build:single
```

Smoke the direct-open single HTML:

```bash
npm run smoke:single
```

JS syntax check only:

```bash
npm run check:js
```

`check:js` avoids nested Node process spawning from inside a script because this
Windows sandbox can block that pattern with `EPERM`.

Zero-dependency static smoke:

```bash
npm run smoke
```

Current server status:

```bash
npm run status
```

Server/module graph smoke, with the local server already running:

```bash
npm run smoke:server
```

Self-contained server/module graph smoke:

```bash
npm run smoke:server:local
```

Optional Playwright readiness:

```bash
npm run e2e:ready
```

`e2e:ready` checks the configured `V16_BASE_URL`. If it is not set, it scans
the local fallback range from `8016` through `8025` and verifies `/healthz`.
V16 app readiness failures still fail the command. Playwright CLI/browser spawn
issues are reported as warnings because some Windows sandbox policies block
them even when the app itself is reachable.

Optional Playwright E2E:

```bash
npm run test:e2e
```

Current environment note: Playwright is installed, the local server is reachable,
and basic Node child process spawn works, but Playwright CLI/browser spawn may
warn with `spawn EPERM` in this Windows sandbox. In that case, use `npm run
validate` plus `npm run e2e:ready` as the reliable app handoff checks here.

## Module Map

- `index.html`: app shell and Supabase CDN loading.
- `ROV_Task_Manager_v16.html`: direct-open bundled v16 app generated by
  `npm run build:single`.
- `build-single-html.mjs`: single HTML bundler.
- `smoke-single-html.mjs`: single HTML execution smoke.
- `serve.mjs`: zero-dependency static server for local v16 use.
- `styles/app.css`: global tokens, layout, cards, controls, responsive UI.
- `src/app.js`: SPA router, event hub, smoke orchestration, imports/exports.
- `src/data/defaults.js`: default local data.
- `src/data/state.js`: localStorage app state.
- `src/data/migration.js`: v15 backup import.
- `src/data/supabase.js`: Supabase client, read-only load, schema probe.
- `src/data/sync.js`: preview, guarded write sync, audit, backup, rollback.
- `src/data/diagnostics.js`: diagnostics export/import parsing.
- `src/features/settings.js`: Settings hub, readiness, handoff report.
- `src/features/health.js`: smoke and data health.
- `src/features/intel.js`: team notes, intel, and strategy CRUD.
- `src/features/members.js`: members page, editing, filters, sorting, role view.
- `src/features/tasks.js`: task page, editing, search, filters, and sorting.
- `src/features/prep.js`: prep workflows, checklist maintenance, and gear packing/editing.
- `src/features/competition.js`: timer, mission runs, run editing, and deletion.
- `src/features/navigation.js`: nav rendering.
- `src/utils/`: escaping, dates, DOM helpers, i18n.

## Current Known Limit

Browser E2E tests are scaffolded but may be blocked by local process policy
(`spawn EPERM`). The app itself is still served and checked successfully by the
zero-dependency smoke scripts.
