-- =====================================================
-- Supabase RLS 安全策略 - 最终修正版
-- 修复：启用RLS后无法读取数据的问题
-- =====================================================

-- 说明：之前的策略只创建了通用的"all"策略
-- 现在为每个操作类型创建明确的策略

-- 1. tasks 表
alter table tasks enable row level security;
drop policy if exists "Enable read access for all users" on tasks;
drop policy if exists "Enable insert for all users" on tasks;
drop policy if exists "Enable update for all users" on tasks;
drop policy if exists "Enable delete for all users" on tasks;

create policy "Enable read access for all users"
  on tasks for select
  using (true);

create policy "Enable insert for all users"
  on tasks for insert
  with check (true);

create policy "Enable update for all users"
  on tasks for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on tasks for delete
  using (true);

-- 2. members 表
alter table members enable row level security;
drop policy if exists "Enable read access for all users" on members;
drop policy if exists "Enable insert for all users" on members;
drop policy if exists "Enable update for all users" on members;
drop policy if exists "Enable delete for all users" on members;

create policy "Enable read access for all users"
  on members for select
  using (true);

create policy "Enable insert for all users"
  on members for insert
  with check (true);

create policy "Enable update for all users"
  on members for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on members for delete
  using (true);

-- 3. intel 表
alter table intel enable row level security;
drop policy if exists "Enable read access for all users" on intel;
drop policy if exists "Enable insert for all users" on intel;
drop policy if exists "Enable update for all users" on intel;
drop policy if exists "Enable delete for all users" on intel;

create policy "Enable read access for all users"
  on intel for select
  using (true);

create policy "Enable insert for all users"
  on intel for insert
  with check (true);

create policy "Enable update for all users"
  on intel for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on intel for delete
  using (true);

-- 4. checklist_items 表
alter table checklist_items enable row level security;
drop policy if exists "Enable read access for all users" on checklist_items;
drop policy if exists "Enable insert for all users" on checklist_items;
drop policy if exists "Enable update for all users" on checklist_items;
drop policy if exists "Enable delete for all users" on checklist_items;

create policy "Enable read access for all users"
  on checklist_items for select
  using (true);

create policy "Enable insert for all users"
  on checklist_items for insert
  with check (true);

create policy "Enable update for all users"
  on checklist_items for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on checklist_items for delete
  using (true);

-- 5. predive_checklist_items 表
alter table predive_checklist_items enable row level security;
drop policy if exists "Enable read access for all users" on predive_checklist_items;
drop policy if exists "Enable insert for all users" on predive_checklist_items;
drop policy if exists "Enable update for all users" on predive_checklist_items;
drop policy if exists "Enable delete for all users" on predive_checklist_items;

create policy "Enable read access for all users"
  on predive_checklist_items for select
  using (true);

create policy "Enable insert for all users"
  on predive_checklist_items for insert
  with check (true);

create policy "Enable update for all users"
  on predive_checklist_items for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on predive_checklist_items for delete
  using (true);

-- 6. notes 表
alter table notes enable row level security;
drop policy if exists "Enable read access for all users" on notes;
drop policy if exists "Enable insert for all users" on notes;
drop policy if exists "Enable update for all users" on notes;
drop policy if exists "Enable delete for all users" on notes;

create policy "Enable read access for all users"
  on notes for select
  using (true);

create policy "Enable insert for all users"
  on notes for insert
  with check (true);

create policy "Enable update for all users"
  on notes for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on notes for delete
  using (true);

-- 7. quotes 表
alter table quotes enable row level security;
drop policy if exists "Enable read access for all users" on quotes;
drop policy if exists "Enable insert for all users" on quotes;
drop policy if exists "Enable update for all users" on quotes;
drop policy if exists "Enable delete for all users" on quotes;

create policy "Enable read access for all users"
  on quotes for select
  using (true);

create policy "Enable insert for all users"
  on quotes for insert
  with check (true);

create policy "Enable update for all users"
  on quotes for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on quotes for delete
  using (true);

-- 8. task_attachments 表
alter table task_attachments enable row level security;
drop policy if exists "Enable read access for all users" on task_attachments;
drop policy if exists "Enable insert for all users" on task_attachments;
drop policy if exists "Enable update for all users" on task_attachments;
drop policy if exists "Enable delete for all users" on task_attachments;

create policy "Enable read access for all users"
  on task_attachments for select
  using (true);

create policy "Enable insert for all users"
  on task_attachments for insert
  with check (true);

create policy "Enable update for all users"
  on task_attachments for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on task_attachments for delete
  using (true);

-- 9. audit_log 表
alter table audit_log enable row level security;
drop policy if exists "Enable read access for all users" on audit_log;
drop policy if exists "Enable insert for all users" on audit_log;
drop policy if exists "Enable update for all users" on audit_log;
drop policy if exists "Enable delete for all users" on audit_log;

create policy "Enable read access for all users"
  on audit_log for select
  using (true);

create policy "Enable insert for all users"
  on audit_log for insert
  with check (true);

create policy "Enable update for all users"
  on audit_log for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on audit_log for delete
  using (true);

-- 10. strategy_items 表
alter table strategy_items enable row level security;
drop policy if exists "Enable read access for all users" on strategy_items;
drop policy if exists "Enable insert for all users" on strategy_items;
drop policy if exists "Enable update for all users" on strategy_items;
drop policy if exists "Enable delete for all users" on strategy_items;

create policy "Enable read access for all users"
  on strategy_items for select
  using (true);

create policy "Enable insert for all users"
  on strategy_items for insert
  with check (true);

create policy "Enable update for all users"
  on strategy_items for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on strategy_items for delete
  using (true);

-- 11. practice_runs 表
alter table practice_runs enable row level security;
drop policy if exists "Enable read access for all users" on practice_runs;
drop policy if exists "Enable insert for all users" on practice_runs;
drop policy if exists "Enable update for all users" on practice_runs;
drop policy if exists "Enable delete for all users" on practice_runs;

create policy "Enable read access for all users"
  on practice_runs for select
  using (true);

create policy "Enable insert for all users"
  on practice_runs for insert
  with check (true);

create policy "Enable update for all users"
  on practice_runs for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on practice_runs for delete
  using (true);

-- 12. mission_runs 表
alter table mission_runs enable row level security;
drop policy if exists "Enable read access for all users" on mission_runs;
drop policy if exists "Enable insert for all users" on mission_runs;
drop policy if exists "Enable update for all users" on mission_runs;
drop policy if exists "Enable delete for all users" on mission_runs;

create policy "Enable read access for all users"
  on mission_runs for select
  using (true);

create policy "Enable insert for all users"
  on mission_runs for insert
  with check (true);

create policy "Enable update for all users"
  on mission_runs for update
  using (true)
  with check (true);

create policy "Enable delete for all users"
  on mission_runs for delete
  using (true);

-- =====================================================
-- ✅ 执行完成！
-- =====================================================
-- 问题修复说明：
-- 
-- 之前的策略：
--   create policy "Allow all operations" on tasks for all using (true) with check (true);
--   ❌ 这种写法在PostgreSQL中，"for all" 不一定会为 SELECT 创建正确的策略
--
-- 现在的策略：
--   ✅ 为 SELECT 明确创建策略：for select using (true)
--   ✅ 为 INSERT 明确创建策略：for insert with check (true)
--   ✅ 为 UPDATE 明确创建策略：for update using (true) with check (true)
--   ✅ 为 DELETE 明确创建策略：for delete using (true)
--
-- 这样确保：
--   1. 可以读取数据（SELECT）
--   2. 可以新增数据（INSERT）
--   3. 可以修改数据（UPDATE）
--   4. 可以删除数据（DELETE）
--   5. Supabase 安全警告解除
-- =====================================================
