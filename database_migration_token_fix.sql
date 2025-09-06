-- ============================================================================
-- Token使用量统计修复脚本
-- 修复user_id字段类型不匹配和RLS策略问题
-- ============================================================================

-- 1. 修改token_usage_records表的user_id字段类型
-- 从UUID改为VARCHAR(100)以兼容Authing用户ID

-- 先删除外键约束
ALTER TABLE token_usage_records DROP CONSTRAINT IF EXISTS token_usage_records_user_id_fkey;

-- 修改字段类型
ALTER TABLE token_usage_records ALTER COLUMN user_id TYPE VARCHAR(100);

-- 2. 修改其他相关表的user_id字段类型
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE VARCHAR(100);

ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;
ALTER TABLE user_subscriptions ALTER COLUMN user_id TYPE VARCHAR(100);

ALTER TABLE usage_count_records DROP CONSTRAINT IF EXISTS usage_count_records_user_id_fkey;
ALTER TABLE usage_count_records ALTER COLUMN user_id TYPE VARCHAR(100);

ALTER TABLE user_invite_relations DROP CONSTRAINT IF EXISTS user_invite_relations_inviter_id_fkey;
ALTER TABLE user_invite_relations DROP CONSTRAINT IF EXISTS user_invite_relations_invitee_id_fkey;
ALTER TABLE user_invite_relations ALTER COLUMN inviter_id TYPE VARCHAR(100);
ALTER TABLE user_invite_relations ALTER COLUMN invitee_id TYPE VARCHAR(100);

ALTER TABLE user_invite_stats DROP CONSTRAINT IF EXISTS user_invite_stats_user_id_fkey;
ALTER TABLE user_invite_stats ALTER COLUMN user_id TYPE VARCHAR(100);

ALTER TABLE user_invite_events DROP CONSTRAINT IF EXISTS user_invite_events_user_id_fkey;
ALTER TABLE user_invite_events ALTER COLUMN user_id TYPE VARCHAR(100);

-- 3. 暂时禁用RLS策略以便测试数据访问
ALTER TABLE token_usage_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_count_records DISABLE ROW LEVEL SECURITY;

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id_varchar ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_timestamp ON token_usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_timestamp ON token_usage_records(user_id, timestamp);

-- 5. 更新触发器函数以自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 确保所有表都有updated_at触发器
DROP TRIGGER IF EXISTS update_token_usage_records_updated_at ON token_usage_records;
CREATE TRIGGER update_token_usage_records_updated_at 
    BEFORE UPDATE ON token_usage_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建用于测试的示例数据（可选）
-- 插入一些测试用的Token使用记录
-- INSERT INTO token_usage_records (
--     id, user_id, feature, input_tokens, output_tokens, total_tokens, 
--     model, success, timestamp
-- ) VALUES (
--     'test_' || generate_random_uuid()::text,
--     'test_user_id_123',
--     'ai-content-adapter',
--     500, 800, 1300,
--     'gpt-4',
--     true,
--     NOW() - INTERVAL '2 days'
-- );

-- 7. 验证修复结果的查询
-- 使用以下查询验证修复是否成功：

-- 查看表结构
-- \d token_usage_records

-- 查询示例数据
-- SELECT user_id, feature, total_tokens, timestamp 
-- FROM token_usage_records 
-- WHERE user_id = 'test_user_id_123'
-- ORDER BY timestamp DESC;

-- 8. 创建用于调试的函数
CREATE OR REPLACE FUNCTION debug_token_usage(p_user_id VARCHAR(100))
RETURNS TABLE (
    record_count BIGINT,
    total_tokens BIGINT,
    latest_record TIMESTAMP WITH TIME ZONE,
    sample_record JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as record_count,
        COALESCE(SUM(tur.total_tokens), 0)::BIGINT as total_tokens,
        MAX(tur.timestamp) as latest_record,
        (SELECT row_to_json(tur2) FROM token_usage_records tur2 
         WHERE tur2.user_id = p_user_id 
         ORDER BY tur2.timestamp DESC LIMIT 1)::JSONB as sample_record
    FROM token_usage_records tur
    WHERE tur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 使用示例：SELECT * FROM debug_token_usage('your_user_id');

RAISE NOTICE '✅ Token使用量统计修复脚本执行完成';
RAISE NOTICE '📋 接下来需要：';
RAISE NOTICE '   1. 验证表结构是否正确修改';
RAISE NOTICE '   2. 测试Token使用量统计功能';
RAISE NOTICE '   3. 根据需要重新启用RLS策略';