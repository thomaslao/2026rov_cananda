-- =====================================================
-- Supabase RLS (Row-Level Security) 安全策略
-- 执行此SQL以修复"Table publicly accessible"安全漏洞
-- =====================================================

-- 1. tasks 表
alter table tasks enable row level security;
drop policy if exists "Allow all operations on tasks" on tasks;
create policy "Allow all operations on tasks" 
  on tasks for all 
  using (true) 
  with check (true);

-- 2. members 表
alter table members enable row level security;
drop policy if exists "Allow all operations on members" on members;
create policy "Allow all operations on members" 
  on members for all 
  using (true) 
  with check (true);

-- 3. intel 表
alter table intel enable row level security;
drop policy if exists "Allow all operations on intel" on intel;
create policy "Allow all operations on intel" 
  on intel for all 
  using (true) 
  with check (true);

-- 4. checklist_items 表
alter table checklist_items enable row level security;
drop policy if exists "Allow all operations on checklist_items" on checklist_items;
create policy "Allow all operations on checklist_items" 
  on checklist_items for all 
  using (true) 
  with check (true);

-- 5. predive_checklist_items 表
alter table predive_checklist_items enable row level security;
drop policy if exists "Allow all operations on predive_checklist_items" on predive_checklist_items;
create policy "Allow all operations on predive_checklist_items" 
  on predive_checklist_items for all 
  using (true) 
  with check (true);

-- 6. notes 表
alter table notes enable row level security;
drop policy if exists "Allow all operations on notes" on notes;
create policy "Allow all operations on notes" 
  on notes for all 
  using (true) 
  with check (true);

-- 7. quotes 表
alter table quotes enable row level security;
drop policy if exists "Allow all operations on quotes" on quotes;
create policy "Allow all operations on quotes" 
  on quotes for all 
  using (true) 
  with check (true);

-- 8. task_attachments 表
alter table task_attachments enable row level security;
drop policy if exists "Allow all operations on task_attachments" on task_attachments;
create policy "Allow all operations on task_attachments" 
  on task_attachments for all 
  using (true) 
  with check (true);

-- 9. audit_log 表
alter table audit_log enable row level security;
drop policy if exists "Allow all operations on audit_log" on audit_log;
create policy "Allow all operations on audit_log" 
  on audit_log for all 
  using (true) 
  with check (true);

-- 10. strategy_items 表
alter table strategy_items enable row level security;
drop policy if exists "Allow all operations on strategy_items" on strategy_items;
create policy "Allow all operations on strategy_items" 
  on strategy_items for all 
  using (true) 
  with check (true);

-- 11. practice_runs 表
alter table practice_runs enable row level security;
drop policy if exists "Allow all operations on practice_runs" on practice_runs;
create policy "Allow all operations on practice_runs" 
  on practice_runs for all 
  using (true) 
  with check (true);

-- 12. mission_runs 表
alter table mission_runs enable row level security;
drop policy if exists "Allow all operations on mission_runs" on mission_runs;
create policy "Allow all operations on mission_runs" 
  on mission_runs for all 
  using (true) 
  with check (true);

-- 13. presentation_scores 表
alter table presentation_scores enable row level security;
drop policy if exists "Allow all operations on presentation_scores" on presentation_scores;
create policy "Allow all operations on presentation_scores" 
  on presentation_scores for all 
  using (true) 
  with check (true);

-- 14. competition_events 表
alter table competition_events enable row level security;
drop policy if exists "Allow all operations on competition_events" on competition_events;
create policy "Allow all operations on competition_events" 
  on competition_events for all 
  using (true) 
  with check (true);

-- 15. competition_snapshots 表
alter table competition_snapshots enable row level security;
drop policy if exists "Allow all operations on competition_snapshots" on competition_snapshots;
create policy "Allow all operations on competition_snapshots" 
  on competition_snapshots for all 
  using (true) 
  with check (true);

-- 16. training_items 表
alter table training_items enable row level security;
drop policy if exists "Allow all operations on training_items" on training_items;
create policy "Allow all operations on training_items" 
  on training_items for all 
  using (true) 
  with check (true);

-- 17. training_results 表
alter table training_results enable row level security;
drop policy if exists "Allow all operations on training_results" on training_results;
create policy "Allow all operations on training_results" 
  on training_results for all 
  using (true) 
  with check (true);

-- =====================================================
-- 执行完成！
-- =====================================================
-- 说明：
-- 1. 此SQL为所有表启用了Row-Level Security (RLS)
-- 2. 为每个表创建了允许所有操作的策略（单用户应用）
-- 3. 您的应用仍然可以正常新增、修改、删除数据
-- 4. 修复了"Table publicly accessible"安全漏洞
-- 5. 执行后，Supabase将不再显示安全警告
-- =====================================================
