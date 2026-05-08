# ROV Task Manager v16 Release Notes

Date: 2026-05-07

## Status

v16 is a standalone local-first SPA. It can run from `v16/index.html` through
the local server, and it also ships as a direct-open single HTML file:

```text
ROV_Task_Manager_v16.html
```

Production fallback remains:

```text
../ROV_Task_Manager_v15.html
```

Local v16 URL:

```text
http://127.0.0.1:8016
```

If `8016` is occupied, the local server automatically tries the next available
port and prints the active URL.

Start command:

```bash
npm run serve
```

Background start command:

```bash
npm run start:local
```

Background stop command:

```bash
npm run stop:local
```

Health check:

```text
http://127.0.0.1:8016/healthz
```

Quick local status:

```bash
npm run status
```

## Highlights

- Dashboard, Prep, Tasks, Members, Intel, Competition, and Settings are available as separate
  v16 routes.
- Dashboard shows assignment health, action summary, prep and intel gap lists, this-week focus, member workload, unassigned tasks, prep readiness, intel readiness, latest run, run score summary, task filter/focus/member workload/data health/prep gap/intel gap/latest-run edit jump-throughs, latest-run filter alignment, and quick handoff export.
- Route changes clear edit forms from non-active pages while preserving destination-page dashboard presets.
- Filtered empty states distinguish no saved data from no rows matching the current filters across Tasks, Members, Prep, Intel, and Competition.
- Dashboard prep/intel focus jump-throughs align the destination filters so the focused row remains visible after earlier filtering, and clear the dashboard-applied search when the focus is dismissed or auto-cleared.
- Prep checklists support adding, editing, deleting local checklist items, dashboard-driven focus highlighting, focus clearing, focus-applied search clearing, stable search/status filters, visible/total section counts, removable active filter chips, clear filters, and completed-item focus auto-clear.
- Prep gear items support adding, editing, packed toggles, deletion, focus-applied search clearing, stable search/status filters, visible/total section counts, removable active filter chips, clear filters, and completed-item focus auto-clear.
- Members is available as a separate route with add/edit/delete, search, sorting,
  role/group filters, stable in-session filter state, visible/total member count,
  filtered role view, member task lists, filtered handoff cards, removable active
  filter chips, and clear filters.
- Intel supports team notes plus add/edit/delete, search, status filters,
  stable in-session filter state, sorting, dashboard-driven focus highlighting,
  focus clearing, focus-applied search clearing, Ready-state focus auto-clear,
  visible/total list counts, removable active filter chips, and per-list clear filters for intel and strategy items.
- Tasks support create/edit/status/delete, including notes, member owner suggestions,
  due/overdue display, search, sorting, owner/status/priority/category filters,
  health filters, evidence filters, health summary, visible/total task count, clean health shortcut presets, active health shortcut state, removable active filter chips, clear filters, row health badges, and local task evidence links/notes migrated from v15-style attachments.
- Competition run history supports editing score/note, deleting incorrect runs,
  duplicating a previous run into the form as a new draft, search, sorting,
  removable active filter chips, and clear filters.
- Destructive local delete actions now require confirmation before removing
  master data, tasks, members, prep items, gear, intel/strategy items, or runs.
- Local save/export/import/delete/status operations show non-blocking toast
  feedback.
- Undo is available after local data changes through the toast, a persistent
  undo bar, and `Ctrl+Z` / `Cmd+Z` outside text inputs.
- The latest undo snapshot is stored in `localStorage`, survives page refresh,
  shows its capture time, and can be cleared manually.
- Dashboard Data Safety shows recent local actions, can export
  `rov_v16_action_log_YYYY-MM-DD.json`, and can clear the action log.
- Dashboard Data Safety also summarizes undo snapshot availability, recent
  action count, and last saved time.
- Dashboard Data Safety can export `rov_v16_safety_report_YYYY-MM-DD.json`
  with saved time, undo metadata, action log, local counts, context metadata,
  and health issues.
- Dashboard Data Safety can clear only safety metadata, removing the undo
  snapshot and recent local action log without touching app data or Supabase.
- Project root now includes `OPEN_V16.html`, a simple launcher that redirects
  to the packaged direct-open v16 app.
- Local state persists through browser localStorage.
- v15 backup JSON can be imported into normalized v16 data.
- Settings includes master data editing, settings pack import/export, rollback,
  reset, diagnostics, readiness, and handoff workflows.
- Traditional Chinese and English UI strings are supported through the v16 i18n
  foundation.

## Supabase

Read-only paths:

- Load v15 production Supabase data into v16 local state.
- Supabase read-only import is explicitly labelled as the v15 production
  Supabase DB and shows source/mode cards after loading.
- Settings now shows a fixed V15 Supabase coverage summary for every expected
  v15 table, including missing or failed tables.
- Settings now raises a V15 DB readiness warning when read-only import is
  partial, including the missing table names.
- Settings now shows per-table Supabase read errors directly under V15
  coverage, so permission/RLS/table-name issues are visible without DevTools.
- V15 Supabase read-only import now deduplicates repeated tasks, members,
  checklist rows, pre-dive rows, and quotes before writing to V16 local state.
- Settings now shows a V15 import dedupe summary so repeated production rows
  are visible after load.
- Saved V16 edits now auto-sync create/update changes back to Supabase after a
  short delay when a read-only Supabase snapshot is loaded.
- Auto-sync still skips deletes and records write audit entries, keeping
  destructive changes behind the guarded/manual path.
- Settings now previews the latest V15 `audit_log` rows after a read-only
  Supabase load, keeping them separate from V16 guarded write audit entries.
- Settings now adds a V15 audit risk preview for failed/error/delete/rollback
  actions so risky production history is visible before handoff.
- V15 `audit_log` is loaded newest-first by `created_at`, so the Settings
  preview shows the latest history first.
- Diagnostics and Handoff Report now include recent V15 audit rows, and the
  Diagnostics Viewer can preview imported V15 audit history.
- Diagnostics and Handoff Report now include V15 audit risk highlights, and the
  Diagnostics Viewer shows those risky rows before the general audit preview.
- Diagnostics and Handoff Report now include a fixed V15 DB coverage summary
  for all expected Supabase tables, and imported packages preview that coverage.
- Diagnostics and Handoff Report now include V15 DB readiness metadata, and
  Diagnostics sorts missing or failed V15 tables first for faster triage.
- Diagnostics Viewer now preserves and displays V15 per-table read errors in
  imported diagnostics packages.
- Diagnostics Viewer summary cards now show imported V15 DB coverage as
  `loaded/expected`, highlighted green when all expected tables loaded.
- Handoff Report dashboard safety summary now includes V15 DB coverage so
  handoff packages show Supabase read completeness at first glance.
- v15 `task_attachments` metadata is read during Supabase read-only import and
  attached to matching v16 tasks as evidence links.
- v15 `audit_log` rows are read during Supabase read-only import as historical
  V15 audit context, separate from V16 guarded write audit entries.
- Diagnostics and Handoff Report counts now include imported attachment
  evidence, and Diagnostics Viewer shows an `Evidence` summary card.
- v15 `practice_runs` are now read during Supabase read-only import and counted
  in Diagnostics and Handoff Report summaries.
- v15 `quotes` are now read during Supabase read-only import and counted in
  Diagnostics and Handoff Report summaries.
- Probe candidate schema columns with read-only selects.
- Build local-vs-remote sync previews without writes.

Guarded write path:

- Manual create/update only.
- Requires `SYNC V16`.
- Downloads a v16 local backup first.
- Uses table and field whitelists.
- Can shrink payloads using schema probe results.
- Deletes are disabled.
- Saves local write audit entries.
- Reloads DB after write attempts for post-write diff verification.

## Backup And Recovery

- `Export v16 Backup` downloads a full local backup.
- `Restore v16 Backup` restores from `rov_v16_local_backup` JSON.
- Restore downloads the current v16 backup first and can be undone from the
  local undo snapshot.
- `Reset v16 Local Data` requires `RESET V16`, downloads a backup first, clears
  v16 localStorage keys, and reloads defaults.
- Rollback and reset do not write to Supabase.

## Delivery Hygiene

- Local dependency folders, test reports, caches, and server logs are ignored by
  the v16 workspace `.gitignore`.

## Diagnostics And Handoff

- `Export Diagnostics` creates a JSON bundle with smoke, DB, schema, sync, audit,
  and health state.
- `Import Diagnostics` renders detailed smoke, health, sync, DB/schema, and audit
  views.
- Settings shows current local Data Health issues beside diagnostics.
- Release Readiness shows a local handoff checklist in Settings, including local data health.
- `Export Handoff Report` creates a JSON summary with readiness, health issues, operational gaps, focus tasks, member workload, unassigned tasks, run summary, and sync context.
- Dashboard `Data Safety` actions are grouped into backup/restore, report export,
  and maintenance controls so the direct-open app is easier to scan.
- First v15 feature migration batch adds v16-native Presentation scoring,
  five-week Gantt timeline, and Float packet checker pages.
- Competition now has v15-style local mission event logging and flow steps;
  saved runs include a mission event summary in the run note.
- Mission Run scoring now supports v15-style score items, gross score,
  penalties, automatic total score, and success-rate capture.
- Competition post-run stats now summarize run count, best score, average score,
  score delta, weakest score item, and CSV export.
- Tasks now keep local evidence/attachment references on each task, show evidence
  counts and links in the task table, and preserve existing evidence while editing.
- Task search now includes evidence title, URL, note, and type, with quick
  filters for tasks with or without evidence.
- Data Health now flags high-priority or completed tasks that are missing
  evidence, and Dashboard health actions jump straight to the no-evidence task
  filter.
- Tasks now include an evidence summary strip for with-evidence, no-evidence,
  and needs-evidence counts, with one-click evidence filter shortcuts.
- Tasks can now export a CSV with owner, due date, status, evidence count,
  evidence links, health issue labels, and notes for handoff review.
- Task CSV export now uses the current task search, filters, and sort order,
  matching the visible task table.
- Handoff Report now includes task evidence summary and a missing-evidence
  task list for high-priority or completed tasks.
- Release Readiness now includes a Task Evidence gate so missing evidence blocks
  handoff readiness.
- Release Readiness Task Evidence TODO now opens the Tasks page with the
  no-evidence filter applied.
- Release Readiness Data Health TODO now opens the Dashboard data health list
  for faster issue triage.
- Release Readiness TODO actions now route Smoke, Local Data, Schema Probe, and
  Sync Review to the relevant Settings workflow section.
- Handoff Report now includes a compact readiness action plan for unresolved
  release blockers.
- Settings now shows the same readiness action plan under Release Readiness,
  so blockers can be triaged without exporting JSON first.
- Release Readiness now shows a ready-for-handoff note when all gates pass.
- Handoff Report now includes a validation summary with the packaged HTML file,
  latest smoke status, readiness progress, and unresolved blocker count.
- Settings Release Readiness now displays the validation summary inline.
- Dashboard Data Safety now displays the same package, smoke, readiness, and
  blocker summary at first glance.
- Dashboard Data Safety Blockers summary now opens Settings Release Readiness.
- Dashboard Data Safety Blockers summary now uses a real button for keyboard
  and assistive-tech behavior.
- Dashboard Data Safety Blockers button now has dedicated hover and focus
  styling while preserving the summary-card appearance.
- Dashboard Data Safety Smoke summary now runs the in-app smoke test directly.
- Dashboard Data Safety Readiness summary now opens Settings Release Readiness,
  and validation summary buttons include hover titles.
- Handoff Report now includes a `dashboardSafetySummary` matching the Dashboard
  Data Safety package, smoke, readiness, and blocker cards.
- Diagnostics import now accepts Handoff Report JSON and previews its Dashboard
  Safety summary inside Settings.
- Diagnostics Viewer now keeps the Dashboard Safety preview visible with a
  neutral empty state when an imported package lacks dashboard safety cards.
- Diagnostics Viewer now formats imported diagnostics, smoke, and audit
  timestamps safely so missing or invalid values show `-`.
- Single HTML smoke now verifies Handoff Report diagnostics import and the
  Dashboard Safety preview are present in the packaged HTML.
- Diagnostics Viewer now shows imported Handoff Report readiness blockers as a
  read-only Diagnostics Action Plan.
- Diagnostics Viewer now keeps the Diagnostics Action Plan visible with a
  green empty state when an imported Handoff Report has no action items.
- Diagnostics Viewer summary now includes an imported `Blockers` count from the
  Handoff Report readiness action plan.
- Diagnostics Viewer highlights the imported `Blockers` summary in orange when
  blockers remain and green when the imported report is clear.
- Diagnostics Viewer summary now shows imported Handoff Report readiness
  progress as `passed/total`.
- Diagnostics Viewer highlights imported `Readiness` progress in green when
  all gates pass and orange while gates remain open.
- Diagnostics Viewer highlights imported `Smoke` in green for OK and red for
  FAIL while leaving missing smoke data neutral.
- Diagnostics Viewer highlights imported `Health` in green when there are no
  issues and orange when imported data health issues remain.
- E2E readiness scans the local fallback port range when `V16_BASE_URL` is not
  set and verifies the v16 `/healthz` endpoint.
- E2E readiness now uses the verified v16 `/healthz` endpoint before checking
  the app page, so another service on `8016` cannot be mistaken for v16.
- Playwright CLI/browser spawn issues are reported as E2E readiness warnings
  after v16 app readiness passes, matching sandboxed Windows behavior.
- `npm run status` scans local fallback ports and reports the active v16 URL
  when the app and `/healthz` are reachable.
- `npm run start:local` launches the v16 server in the background on Windows,
  writes local logs, and confirms readiness through `npm run status`.
- `npm run stop:local` stops only the local v16 `serve.mjs` Node process for
  this workspace.

## Validation

Latest local validation:

```bash
npm run validate
```

Result:

- JS syntax checks passed for 17 source files.
- Static smoke passed: 795 checks.
- Single HTML smoke passed: 58 checks.
- Server/module graph smoke passed: 31 checks against temporary local server
  `http://127.0.0.1:8019` or the next available validation port.

## Known Limit

Playwright browser E2E is scaffolded but this Windows sandbox may block nested
process creation with `spawn EPERM`. Use `npm run validate` as the reliable
local handoff check in this environment.
