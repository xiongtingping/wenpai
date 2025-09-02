-- 快速修复：为user_subscriptions表添加缺失的payment_status列
-- 解决PostgreSQL 42703错误

-- 检查当前表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查payment_status列是否存在
DO $$
BEGIN
    -- 尝试添加payment_status列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'payment_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'active';
        
        RAISE NOTICE '✅ 已添加payment_status列';
    ELSE
        RAISE NOTICE '✅ payment_status列已存在';
    END IF;
END $$;

-- 检查tier列是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'tier'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN tier VARCHAR(20) DEFAULT 'trial';
        
        RAISE NOTICE '✅ 已添加tier列';
    ELSE
        RAISE NOTICE '✅ tier列已存在';
    END IF;
END $$;

-- 检查monthly_token_limit列是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'monthly_token_limit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN monthly_token_limit INTEGER DEFAULT 100000;
        
        RAISE NOTICE '✅ 已添加monthly_token_limit列';
    ELSE
        RAISE NOTICE '✅ monthly_token_limit列已存在';
    END IF;
END $$;

-- 检查usage_count_limit列是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'usage_count_limit'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN usage_count_limit INTEGER DEFAULT 10;
        
        RAISE NOTICE '✅ 已添加usage_count_limit列';
    ELSE
        RAISE NOTICE '✅ usage_count_limit列已存在';
    END IF;
END $$;

-- 如果有现有数据，根据subscription_type和status更新新列
UPDATE user_subscriptions 
SET 
    tier = CASE 
        WHEN subscription_type = 'professional' THEN 'pro'
        WHEN subscription_type = 'premium' THEN 'premium'
        ELSE 'trial'
    END,
    payment_status = CASE 
        WHEN status = 'active' THEN 'active'
        WHEN status = 'expired' THEN 'expired'
        WHEN status = 'cancelled' THEN 'cancelled'
        ELSE 'pending'
    END
WHERE tier IS NULL OR payment_status IS NULL;

-- 确保RLS被禁用
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_status ON user_subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- 验证修复结果
SELECT 
    '修复验证' as test_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN payment_status IS NOT NULL THEN 1 END) as has_payment_status,
    COUNT(CASE WHEN tier IS NOT NULL THEN 1 END) as has_tier
FROM user_subscriptions;

-- 测试关键查询
SELECT 'payment_status查询测试' as test_name, COUNT(*) as count
FROM user_subscriptions 
WHERE payment_status = 'active';

-- 显示最终表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
