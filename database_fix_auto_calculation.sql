-- ============================================
-- 修复自动计算触发器
-- ============================================
-- 问题：total_count 和 remaining_count 没有自动计算
-- 解决：添加自动计算触发器
-- ============================================

-- 1. 创建自动计算函数
CREATE OR REPLACE FUNCTION calculate_usage_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 自动计算 total_count = base_count + bonus_count
  NEW.total_count = COALESCE(NEW.base_count, 0) + COALESCE(NEW.bonus_count, 0);
  
  -- 自动计算 remaining_count = total_count - used_count
  NEW.remaining_count = NEW.total_count - COALESCE(NEW.used_count, 0);
  
  -- 确保 remaining_count 不为负数
  IF NEW.remaining_count < 0 THEN
    NEW.remaining_count = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_calculate_usage_balance ON user_usage_balance;

-- 3. 创建新触发器（INSERT 和 UPDATE 时都触发）
CREATE TRIGGER trigger_calculate_usage_balance
BEFORE INSERT OR UPDATE ON user_usage_balance
FOR EACH ROW
EXECUTE FUNCTION calculate_usage_balance();

-- 4. 修复现有数据
UPDATE user_usage_balance
SET 
  total_count = COALESCE(base_count, 0) + COALESCE(bonus_count, 0),
  remaining_count = (COALESCE(base_count, 0) + COALESCE(bonus_count, 0)) - COALESCE(used_count, 0);

-- 5. 验证修复
SELECT 
  user_id,
  base_count,
  bonus_count,
  total_count,
  used_count,
  remaining_count
FROM user_usage_balance
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ 自动计算触发器已修复！';
  RAISE NOTICE '📊 现有数据已更新';
  RAISE NOTICE '🔧 新插入的数据将自动计算 total_count 和 remaining_count';
END $$;

