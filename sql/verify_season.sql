-- =====================================================
-- 验证 season 字段是否成功添加
-- =====================================================

-- 检查 tasks 表的列
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- 检查 tasks 表中有多少条记录的 season 是 NULL
SELECT 
  COUNT(*) as total_records,
  COUNT(season) as has_season,
  COUNT(*) - COUNT(season) as null_season
FROM tasks;

-- 查看前5条任务的 season 值
SELECT id, name, season 
FROM tasks 
LIMIT 5;

-- 检查所有有season值的任务统计
SELECT season, COUNT(*) as count 
FROM tasks 
GROUP BY season 
ORDER BY season;
