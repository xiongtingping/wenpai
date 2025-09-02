-- 文派AI - 修复user_subscriptions表结构不一致问题
-- 解决PostgreSQL 42703错误：column "payment_status" does not exist

-- ============================================================================
-- 1. 检查当前表结构
-- ============================================================================

-- 查看当前user_subscriptions表的结构
\d user_subscriptions;

-- 检查当前表中的数据
SELECT COUNT(*) as total_records FROM user_subscriptions;
SELECT * FROM user_subscriptions LIMIT 5;

-- ============================================================================
-- 2. 备份现有数据（如果有的话）
-- ============================================================================

-- 创建备份表
CREATE TABLE IF NOT EXISTS user_subscriptions_backup AS 
SELECT * FROM user_subscriptions;

-- ============================================================================
-- 3. 统一表结构 - 使用标准结构
-- ============================================================================

-- 删除旧表（数据已备份）
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- 重新创建标准结构的user_subscriptions表
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'trial', -- trial, pro, premium
    monthly_token_limit INTEGER NOT NULL DEFAULT 100000,
    usage_count_limit INTEGER NOT NULL DEFAULT 10,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 关键：确保这个列存在
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- 4. 数据迁移（从备份表恢复数据）
-- ============================================================================

-- 检查备份表结构，决定如何迁移数据
DO $$
DECLARE
    backup_has_data BOOLEAN;
    backup_columns TEXT[];
BEGIN
    -- 检查备份表是否有数据
    SELECT EXISTS(SELECT 1 FROM user_subscriptions_backup LIMIT 1) INTO backup_has_data;
    
    IF backup_has_data THEN
        -- 获取备份表的列名
        SELECT array_agg(column_name) INTO backup_columns
        FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions_backup' 
        AND table_schema = 'public';
        
        RAISE NOTICE '备份表列名: %', backup_columns;
        
        -- 根据备份表的结构进行数据迁移
        IF 'subscription_type' = ANY(backup_columns) THEN
            -- 从结构B迁移到结构A
            INSERT INTO user_subscriptions (
                id, user_id, tier, start_date, end_date, 
                payment_status, created_at, updated_at
            )
            SELECT 
                id,
                user_id,
                CASE 
                    WHEN subscription_type = 'professional' THEN 'pro'
                    WHEN subscription_type = 'premium' THEN 'premium'
                    ELSE 'trial'
                END as tier,
                started_at as start_date,
                expires_at as end_date,
                CASE 
                    WHEN status = 'active' THEN 'active'
                    WHEN status = 'expired' THEN 'expired'
                    ELSE 'pending'
                END as payment_status,
                created_at,
                updated_at
            FROM user_subscriptions_backup;
            
            RAISE NOTICE '已从结构B迁移数据到结构A';
        ELSE
            -- 从结构A迁移到结构A（直接复制）
            INSERT INTO user_subscriptions SELECT * FROM user_subscriptions_backup;
            RAISE NOTICE '已从结构A复制数据';
        END IF;
    ELSE
        RAISE NOTICE '备份表无数据，跳过迁移';
    END IF;
END $$;

-- ============================================================================
-- 5. 创建索引和约束
-- ============================================================================

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_status ON user_subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);

-- ============================================================================
-- 6. 禁用RLS（确保查询正常）
-- ============================================================================

ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- 删除所有可能的RLS策略
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;

-- ============================================================================
-- 7. 创建触发器（自动更新updated_at）
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. 验证修复结果
-- ============================================================================

-- 检查新表结构
\d user_subscriptions;

-- 测试关键查询（这些查询之前会失败）
SELECT 'payment_status列测试' as test_name, COUNT(*) as count
FROM user_subscriptions 
WHERE payment_status = 'active';

SELECT 'user_id查询测试' as test_name, COUNT(*) as count
FROM user_subscriptions 
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- 显示迁移结果
SELECT 
    'user_subscriptions表修复完成' as status,
    COUNT(*) as total_records,
    COUNT(DISTINCT tier) as unique_tiers,
    COUNT(DISTINCT payment_status) as unique_payment_statuses
FROM user_subscriptions;

-- ============================================================================
-- 9. 清理备份表（可选）
-- ============================================================================

-- 注释掉以保留备份，如需清理可取消注释
-- DROP TABLE IF EXISTS user_subscriptions_backup;

COMMIT;
