-- ============================================================================
-- 用户ID索引优化脚本 V2（安全版本）
-- ============================================================================
-- 目的：为所有包含user_id字段的表添加索引，提升查询性能
-- 特点：自动检测表是否存在，不存在则跳过
-- 执行时间：约1-2分钟（取决于数据量）
-- 影响：提升用户相关查询性能，无数据变更
-- ============================================================================

-- 为新创建的表添加索引（这些表一定存在）
-- ============================================================================

-- 1. invite_rewards 表
CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id 
ON invite_rewards(user_id);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_related_user_id 
ON invite_rewards(related_user_id);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id_status 
ON invite_rewards(user_id, status);

-- 2. user_usage_balance 表
-- user_id 已经是主键，不需要额外索引

-- 3. user_invite_codes 表
CREATE INDEX IF NOT EXISTS idx_user_invite_codes_inviter_id 
ON user_invite_codes(inviter_id);

-- 为可能存在的表添加索引（条件创建）
-- ============================================================================

-- 4. user_profiles 表（如果存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
        ON user_profiles(user_id);
        RAISE NOTICE '✅ user_profiles 表索引创建成功';
    ELSE
        RAISE NOTICE '⚠️  user_profiles 表不存在，跳过';
    END IF;
END $$;

-- 5. user_subscriptions 表（如果存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
        ON user_subscriptions(user_id);
        
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id_status 
        ON user_subscriptions(user_id, status);
        
        RAISE NOTICE '✅ user_subscriptions 表索引创建成功';
    ELSE
        RAISE NOTICE '⚠️  user_subscriptions 表不存在，跳过';
    END IF;
END $$;

-- 6. token_usage_records 表（如果存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'token_usage_records') THEN
        CREATE INDEX IF NOT EXISTS idx_token_usage_records_user_id 
        ON token_usage_records(user_id);
        
        RAISE NOTICE '✅ token_usage_records 表索引创建成功';
    ELSE
        RAISE NOTICE '⚠️  token_usage_records 表不存在，跳过';
    END IF;
END $$;

-- 7. user_invite_relations 表（如果存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_invite_relations') THEN
        CREATE INDEX IF NOT EXISTS idx_user_invite_relations_inviter_id 
        ON user_invite_relations(inviter_id);
        
        CREATE INDEX IF NOT EXISTS idx_user_invite_relations_invitee_id 
        ON user_invite_relations(invitee_id);
        
        CREATE INDEX IF NOT EXISTS idx_user_invite_relations_inviter_status 
        ON user_invite_relations(inviter_id, status);
        
        RAISE NOTICE '✅ user_invite_relations 表索引创建成功';
    ELSE
        RAISE NOTICE '⚠️  user_invite_relations 表不存在，跳过';
    END IF;
END $$;

-- 8. user_invite_stats 表（如果存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_invite_stats') THEN
        CREATE INDEX IF NOT EXISTS idx_user_invite_stats_user_id 
        ON user_invite_stats(user_id);
        
        RAISE NOTICE '✅ user_invite_stats 表索引创建成功';
    ELSE
        RAISE NOTICE '⚠️  user_invite_stats 表不存在，跳过';
    END IF;
END $$;

-- 9. orders 表（如果存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_user_id 
        ON orders(user_id);
        
        CREATE INDEX IF NOT EXISTS idx_orders_user_id_status 
        ON orders(user_id, status);
        
        RAISE NOTICE '✅ orders 表索引创建成功';
    ELSE
        RAISE NOTICE '⚠️  orders 表不存在，跳过';
    END IF;
END $$;

-- 验证索引创建
-- ============================================================================

-- 查看所有user_id相关的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE '%user_id%' OR indexname LIKE '%inviter_id%'
ORDER BY tablename, indexname;

-- 完成提示
DO $$
BEGIN
    RAISE NOTICE '✅ 索引创建脚本执行完成！';
    RAISE NOTICE '📊 请查看上方的索引列表确认创建成功';
END $$;

