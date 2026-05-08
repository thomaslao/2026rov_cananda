import { expect, test } from '@playwright/test';

const seedData = {
  tasks: [
    {
      id: 101,
      name: 'Alpha open task',
      owner: 'Captain',
      due: '2026-05-10',
      priority: 'High',
      status: 'Open',
      category: 'Mission Run',
      blocked: false,
      notes: 'Seeded from user test',
    },
    {
      id: 102,
      name: 'Zulu completed task',
      owner: 'Pilot',
      due: '2026-05-01',
      priority: 'Low',
      status: 'Done',
      category: 'Gear',
      blocked: false,
      notes: 'Done items should remain last',
    },
  ],
  members: [
    { id: 1, name: 'Captain', role: 'Lead', group: 'Operations' },
    { id: 2, name: 'Pilot', role: 'Pilot', group: 'Drive Team' },
    { id: 3, name: 'Navigator', role: 'Software', group: 'Engineering' },
  ],
  checklist: [
    { id: 1, label: 'Battery charged', done: false },
    { id: 2, label: 'Camera checked', done: true },
  ],
  prediveChecklist: [{ id: 1, label: 'Thrusters secure', done: false }],
  intel: [{ id: 1, title: 'Pool map', content: 'Look for pipe opening', status: 'Draft' }],
  notes: 'Initial team note',
  quotes: [],
  attachments: [],
  v15AuditLog: [],
  strategy: [{ id: 1, title: 'Fast pickup route', content: 'Start left side', status: 'Review' }],
  practiceRuns: [],
  missionRuns: [],
  missionEvents: [],
  competitionFlowStep: 0,
  missionScoreItems: [
    { id: 'task-1', label: 'Task 1', max: 50, score: 0, status: 'pending' },
    { id: 'task-2', label: 'Task 2', max: 50, score: 0, status: 'pending' },
  ],
  gearItems: [{ id: 1, name: 'Battery set', category: 'Electrical', qty: 2, packed: false }],
  presentationRuns: [],
  floatPackets: { raw: '', analysis: null },
  masterData: {
    roles: ['Lead', 'Pilot', 'Software'],
    groups: ['Operations', 'Drive Team', 'Engineering'],
    taskTypes: ['Mission Run', 'Gear', 'General'],
    gearCats: ['Electrical', 'Mechanical', 'Tools'],
  },
};

async function preparePage(page) {
  await page.addInitScript((data) => {
    if (!sessionStorage.getItem('rov_v16_e2e_seeded')) {
      localStorage.clear();
      localStorage.setItem('rov_v16_locale', 'zh');
      localStorage.setItem('rov_v16_app_state', JSON.stringify({
        data,
        currentPage: 'dashboard',
        currentMode: 'review',
        currentSeason: '2025-2026',
        savedAt: new Date().toISOString(),
      }));
      sessionStorage.setItem('rov_v16_e2e_seeded', '1');
    }

    const tableRows = {
      tasks: data.tasks,
      members: data.members,
      checklist_items: data.checklist,
      predive_checklist_items: data.prediveChecklist,
      intel: data.intel,
      notes: [{ id: 1, content: data.notes }],
      quotes: data.quotes,
      task_attachments: [],
      audit_log: [],
      strategy_items: data.strategy,
      practice_runs: data.practiceRuns,
      mission_runs: data.missionRuns,
    };

    window.supabase = {
      createClient: () => ({
        from: (table) => ({
          select: () => ({
            order: () => Promise.resolve({ data: tableRows[table] || [], error: null }),
            limit: () => Promise.resolve({ data: (tableRows[table] || []).slice(0, 1), error: null }),
            then: (resolve) => resolve({ data: tableRows[table] || [], error: null }),
          }),
          upsert: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: [], error: null }),
          update: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
        }),
      }),
    };
  }, seedData);

  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await expect(page.locator('#page-dashboard')).toBeVisible();
  await page.waitForTimeout(700);
}

test('user can open core pages and switch locale', async ({ page }) => {
  await preparePage(page);

  for (const pageName of ['prep', 'tasks', 'members', 'intel', 'competition', 'settings']) {
    await page.locator(`[data-page="${pageName}"]`).first().click();
    await expect(page.locator(`#page-${pageName}`)).toBeVisible();
  }

  await page.locator('[data-locale-toggle]').click();
  await expect(page.locator('#page-settings')).toContainText('Settings Center');
  await page.locator('[data-locale-toggle]').click();
  await expect(page.locator('#page-settings')).toContainText('設置中心');
});

test('tasks flow supports add modal, search, sort, status, edit and delete', async ({ page }) => {
  await preparePage(page);
  await page.locator('[data-page="tasks"]').first().click();

  const openTaskModal = page.locator('[data-task-open-modal]');
  await openTaskModal.scrollIntoViewIfNeeded();
  await openTaskModal.evaluate(button => button.click());
  await expect(page.locator('[data-task-modal]')).toBeVisible();
  const taskName = `User task ${Date.now()}`;
  const editedName = `Edited user task ${Date.now()}`;
  await page.locator('[data-task-modal] [name="name"]').fill(taskName);
  await page.locator('[data-task-modal] [name="owner"]').fill('Navigator');
  await page.locator('[data-task-modal] [name="priority"]').selectOption('Medium');
  await page.locator('[data-task-modal] [data-task-form]').evaluate(form => form.requestSubmit());
  await expect(page.locator('[data-task-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-tasks')).toContainText(taskName);

  await page.locator('[data-task-search]').fill('no-match-until-button');
  await expect(page.locator('#page-tasks')).toContainText(taskName);
  await page.locator('[data-task-search-submit]').evaluate(button => button.click());
  await expect(page.locator('tbody tr')).toHaveCount(0);

  await page.locator('[data-task-search]').fill(taskName);
  await page.locator('[data-task-search]').press('Enter');
  await expect(page.locator('#page-tasks')).toContainText(taskName);

  await page.locator('[data-task-clear-filters]').evaluate(button => button.click());
  await page.locator('[data-task-header-sort]').first().evaluate(button => button.click());
  await expect(page.locator('tbody tr').last()).toContainText('Zulu completed task');

  const newRow = page.locator('tbody tr', { hasText: taskName });
  await newRow.locator('[data-task-status]').selectOption('Done');
  await expect(newRow.locator('[data-task-status]')).toHaveValue('Done');

  await newRow.locator('[data-task-edit]').evaluate(button => button.click());
  await expect(page.locator('[data-task-modal]')).toBeVisible();
  await page.locator('[data-task-modal] [name="name"]').fill(editedName);
  await page.locator('[data-task-modal] [data-task-form]').evaluate(form => form.requestSubmit());
  await expect(page.locator('[data-task-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-tasks')).toContainText(editedName);
  await page.reload();
  await expect(page.locator('#page-tasks')).toBeVisible();
  await expect(page.locator('#page-tasks')).toContainText(editedName);
  await expect(page.locator('#page-tasks')).not.toContainText(taskName);

  await page.locator('tbody tr', { hasText: editedName }).locator('[data-task-delete]').evaluate(button => button.click());
  await expect(page.locator('#page-tasks')).not.toContainText(editedName);
});

test('members, prep, intel and competition flows can add and update data', async ({ page }) => {
  await preparePage(page);

  await page.locator('[data-page="members"]').first().click();
  await page.locator('[data-member-form] [name="name"]').fill('User Tester');
  await page.locator('[data-member-form] [name="role"]').fill('QA');
  await page.locator('[data-member-form] [name="group"]').fill('Engineering');
  await page.locator('[data-member-form]').evaluate(form => form.requestSubmit());
  await expect(page.locator('#page-members')).toContainText('User Tester');
  await page.locator('[data-member-search]').fill('User Tester');
  await expect(page.locator('#page-members')).toContainText('User Tester');
  await page.locator('[data-member-edit]').first().evaluate(button => button.click());
  await expect(page.locator('[data-member-modal]')).toBeVisible();
  await page.locator('[data-member-modal] [name="name"]').fill('User Tester Modal');
  await page.locator('[data-member-modal] [data-member-form]').evaluate(form => form.requestSubmit());
  await expect(page.locator('[data-member-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-members')).toContainText('User Tester Modal');

  await page.locator('[data-page="prep"]').first().click();
  await page.locator('[data-checklist-input="checklist"]').fill('User checklist item');
  await page.locator('[data-checklist-add="checklist"]').click();
  await expect(page.locator('#page-prep')).toContainText('User checklist item');
  const checklistRow = page.locator('[data-prep-focus-row="checklist"]', { hasText: 'User checklist item' });
  await checklistRow.locator('[data-checklist-toggle]').click();
  await expect(checklistRow.locator('[data-checklist-toggle]')).toContainText(/完成/);

  await checklistRow.locator('[data-checklist-edit]').click();
  await expect(page.locator('[data-prep-modal]')).toBeVisible();
  await page.locator('[data-prep-modal] [data-checklist-input="checklist"]').fill('User checklist item modal');
  await page.locator('[data-prep-modal] [data-checklist-update="checklist"]').click();
  await expect(page.locator('[data-prep-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-prep')).toContainText('User checklist item modal');

  await page.locator('[data-gear-name]').fill('User spare part');
  await page.locator('[data-gear-category]').fill('Tools');
  await page.locator('[data-gear-qty]').fill('3');
  await page.locator('[data-gear-add]').click();
  await expect(page.locator('#page-prep')).toContainText('User spare part');
  await page.locator('[data-prep-focus-row="gearItems"]', { hasText: 'User spare part' }).locator('[data-gear-edit]').click();
  await expect(page.locator('[data-prep-modal]')).toBeVisible();
  await page.locator('[data-prep-modal] [data-gear-name]').fill('User spare part modal');
  await page.locator('[data-prep-modal] [data-gear-update]').click();
  await expect(page.locator('[data-prep-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-prep')).toContainText('User spare part modal');

  await page.locator('[data-page="intel"]').first().click();
  await page.locator('[data-knowledge-form="intel"] [name="title"]').fill('User intel item');
  await page.locator('[data-knowledge-form="intel"] [name="content"]').fill('Observed during validation');
  await page.locator('[data-knowledge-form="intel"]').evaluate(form => form.requestSubmit());
  await expect(page.locator('#page-intel')).toContainText('User intel item');
  await page.locator('[data-knowledge-edit="intel"]').first().evaluate(button => button.click());
  await expect(page.locator('[data-knowledge-modal]')).toBeVisible();
  await page.locator('[data-knowledge-modal] [name="title"]').fill('User intel item modal');
  await page.locator('[data-knowledge-modal] [data-knowledge-form="intel"]').evaluate(form => form.requestSubmit());
  await expect(page.locator('[data-knowledge-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-intel')).toContainText('User intel item modal');
  await page.locator('[data-notes-input]').fill('Saved by user validation');
  await page.locator('[data-notes-save]').click();
  await expect(page.locator('#page-intel')).toContainText('Saved by user validation');

  await page.locator('[data-page="competition"]').first().click();
  await page.locator('[data-score-item]').first().locator('[data-score-item-value]').fill('25');
  await page.locator('[data-score-item]').first().locator('[data-score-item-status]').selectOption('done');
  await page.locator('[data-run-note]').fill('User validation run');
  await page.locator('[data-action="save-run"]').click();
  await expect(page.locator('#page-competition')).toContainText('User validation run');
  await page.locator('[data-run-edit]').first().evaluate(button => button.click());
  await expect(page.locator('[data-run-modal]')).toBeVisible();
  await page.locator('[data-run-modal] [data-run-note]').fill('User validation run modal');
  await page.locator('[data-run-modal] [data-action="update-run"]').click();
  await expect(page.locator('[data-run-modal-bg]')).not.toHaveClass(/open/);
  await expect(page.locator('#page-competition')).toContainText('User validation run modal');
  await page.locator('[data-run-search]').fill('validation');
  await expect(page.locator('#page-competition')).toContainText('User validation run');
});

test('settings exposes safety, Supabase and diagnostic controls', async ({ page }) => {
  await preparePage(page);
  await page.locator('[data-page="settings"]').first().click();

  for (const selector of [
    '#settings-db-section',
    '#settings-schema-section',
    '#settings-sync-section',
    '#settings-write-section',
    '#settings-audit-section',
    '#settings-rollback-section',
    '[data-action="load-supabase-readonly"]',
    '[data-action="build-sync-preview"]',
    '[data-action="export-v16-backup"]',
    '[data-action="export-diagnostics"]',
    '[data-action="run-v16-smoke"]',
  ]) {
    await expect(page.locator(selector).first()).toBeVisible();
  }

  await page.locator('[data-action="run-v16-smoke"]').first().click();
  await expect(page.locator('#v16-smoke-report')).toContainText('Passed');
});
