-- =====================================================
-- 为所有表添加 season 字段并更新现有数据
-- 修复：任务数据无法显示的问题
-- =====================================================

-- 1. tasks 表
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE tasks SET season = '2025-2026' WHERE season IS NULL;

-- 2. members 表
ALTER TABLE members ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE members SET season = '2025-2026' WHERE season IS NULL;

-- 3. intel 表
ALTER TABLE intel ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE intel SET season = '2025-2026' WHERE season IS NULL;

-- 4. checklist_items 表
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE checklist_items SET season = '2025-2026' WHERE season IS NULL;

-- 5. predive_checklist_items 表
ALTER TABLE predive_checklist_items ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE predive_checklist_items SET season = '2025-2026' WHERE season IS NULL;

-- 6. strategy_items 表
ALTER TABLE strategy_items ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE strategy_items SET season = '2025-2026' WHERE season IS NULL;

-- 7. practice_runs 表
ALTER TABLE practice_runs ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE practice_runs SET season = '2025-2026' WHERE season IS NULL;

-- 8. mission_runs 表
ALTER TABLE mission_runs ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2025-2026';
UPDATE mission_runs SET season = '2025-2026' WHERE season IS NULL;

-- =====================================================
-- ✅ 执行完成！
-- =====================================================
-- 说明：
-- 1. 为所有8个表添加了 season 字段
-- 2. 将所有现有数据的 season 设置为 '2025-2026'
-- 3. 现在前端可以正确筛选和显示数据了
-- 
-- 执行后请：
-- 1. 刷新浏览器页面（Ctrl + F5）
-- 2. 检查数据是否正常显示
-- =====================================================
