-- 🗄️ 统一存储系统数据库架构
-- 用于localStorage和Supabase混合存储方案

-- ============================================
-- 用户敏感数据表
-- ============================================
CREATE TABLE IF NOT EXISTS user_sensitive_data (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    data_value JSONB NOT NULL,
    data_category TEXT NOT NULL DEFAULT 'sensitive',
    encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    ttl INTEGER, -- 生存时间(秒)
    checksum TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT user_sensitive_data_unique UNIQUE (user_id, data_key),
    CONSTRAINT user_sensitive_data_category_check CHECK (data_category IN ('sensitive'))
);

-- 用户敏感数据表索引
CREATE INDEX IF NOT EXISTS idx_user_sensitive_data_user_id ON user_sensitive_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sensitive_data_key ON user_sensitive_data(data_key);
CREATE INDEX IF NOT EXISTS idx_user_sensitive_data_updated ON user_sensitive_data(updated_at);

-- ============================================
-- 用户业务数据表
-- ============================================
CREATE TABLE IF NOT EXISTS user_business_data (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    data_value JSONB NOT NULL,
    data_category TEXT NOT NULL DEFAULT 'business',
    data_size INTEGER DEFAULT 0,
    compression_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    ttl INTEGER,
    checksum TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT user_business_data_unique UNIQUE (user_id, data_key),
    CONSTRAINT user_business_data_category_check CHECK (data_category IN ('business'))
);

-- 用户业务数据表索引
CREATE INDEX IF NOT EXISTS idx_user_business_data_user_id ON user_business_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_data_key ON user_business_data(data_key);
CREATE INDEX IF NOT EXISTS idx_user_business_data_updated ON user_business_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_business_data_tags ON user_business_data USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_business_data_size ON user_business_data(data_size);

-- ============================================
-- 用户偏好设置表
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    data_value JSONB NOT NULL,
    data_category TEXT NOT NULL DEFAULT 'preference',
    sync_priority INTEGER DEFAULT 5, -- 1-10, 10最高
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    device_info JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT user_preferences_unique UNIQUE (user_id, data_key),
    CONSTRAINT user_preferences_category_check CHECK (data_category IN ('preference')),
    CONSTRAINT user_preferences_priority_check CHECK (sync_priority BETWEEN 1 AND 10)
);

-- 用户偏好设置表索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(data_key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_priority ON user_preferences(sync_priority);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated ON user_preferences(updated_at);

-- ============================================
-- 创建 user_preferences 表的 RPC 函数
-- ============================================
CREATE OR REPLACE FUNCTION create_user_preferences_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 检查表是否已存在
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_preferences'
    ) THEN
        -- 创建表
        CREATE TABLE user_preferences (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id TEXT NOT NULL,
            data_key TEXT NOT NULL,
            data_value JSONB NOT NULL,
            data_category TEXT NOT NULL DEFAULT 'preference',
            sync_priority INTEGER DEFAULT 5,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            version INTEGER DEFAULT 1,
            device_info JSONB DEFAULT '{}'::jsonb,
            metadata JSONB DEFAULT '{}'::jsonb,

            CONSTRAINT user_preferences_unique UNIQUE (user_id, data_key),
            CONSTRAINT user_preferences_category_check CHECK (data_category IN ('preference')),
            CONSTRAINT user_preferences_priority_check CHECK (sync_priority BETWEEN 1 AND 10)
        );

        -- 创建索引
        CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
        CREATE INDEX idx_user_preferences_key ON user_preferences(data_key);
        CREATE INDEX idx_user_preferences_priority ON user_preferences(sync_priority);
        CREATE INDEX idx_user_preferences_updated ON user_preferences(updated_at);

        -- 启用 RLS
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

        -- 创建 RLS 策略
        CREATE POLICY "Users can only access their own preferences" ON user_preferences
            FOR ALL USING (auth.uid()::text = user_id);

        RAISE NOTICE 'user_preferences table created successfully';
    ELSE
        RAISE NOTICE 'user_preferences table already exists';
    END IF;
END;
$$;

-- ============================================
-- 用户通用数据表
-- ============================================
CREATE TABLE IF NOT EXISTS user_general_data (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    data_value JSONB NOT NULL,
    data_category TEXT NOT NULL DEFAULT 'system',
    storage_layer TEXT NOT NULL DEFAULT 'hybrid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    ttl INTEGER,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT user_general_data_unique UNIQUE (user_id, data_key),
    CONSTRAINT user_general_data_category_check CHECK (data_category IN ('system', 'cache', 'temporary')),
    CONSTRAINT user_general_data_layer_check CHECK (storage_layer IN ('local', 'database', 'hybrid', 'session'))
);

-- 用户通用数据表索引
CREATE INDEX IF NOT EXISTS idx_user_general_data_user_id ON user_general_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_general_data_key ON user_general_data(data_key);
CREATE INDEX IF NOT EXISTS idx_user_general_data_category ON user_general_data(data_category);
CREATE INDEX IF NOT EXISTS idx_user_general_data_accessed ON user_general_data(last_accessed);

-- ============================================
-- 数据同步日志表
-- ============================================
CREATE TABLE IF NOT EXISTS data_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    sync_type TEXT NOT NULL, -- 'upload', 'download', 'conflict', 'merge'
    source_location TEXT NOT NULL, -- 'local', 'database'
    target_location TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'conflict'
    data_size_before INTEGER DEFAULT 0,
    data_size_after INTEGER DEFAULT 0,
    conflict_resolution TEXT, -- 'local', 'remote', 'merge', 'manual'
    error_message TEXT,
    sync_duration INTEGER, -- 毫秒
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT sync_logs_type_check CHECK (sync_type IN ('upload', 'download', 'conflict', 'merge')),
    CONSTRAINT sync_logs_status_check CHECK (sync_status IN ('pending', 'success', 'failed', 'conflict')),
    CONSTRAINT sync_logs_location_check CHECK (source_location IN ('local', 'database', 'session', 'memory'))
);

-- 数据同步日志表索引
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON data_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_key ON data_sync_logs(data_key);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON data_sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON data_sync_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON data_sync_logs(sync_type);

-- ============================================
-- 数据版本历史表
-- ============================================
CREATE TABLE IF NOT EXISTS data_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    version INTEGER NOT NULL,
    data_value JSONB NOT NULL,
    change_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'restore'
    change_summary TEXT,
    data_size INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system',
    checksum TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT version_history_change_type_check CHECK (change_type IN ('create', 'update', 'delete', 'restore')),
    CONSTRAINT version_history_unique UNIQUE (user_id, data_key, version)
);

-- 数据版本历史表索引
CREATE INDEX IF NOT EXISTS idx_version_history_user_key ON data_version_history(user_id, data_key);
CREATE INDEX IF NOT EXISTS idx_version_history_version ON data_version_history(version);
CREATE INDEX IF NOT EXISTS idx_version_history_created ON data_version_history(created_at);
CREATE INDEX IF NOT EXISTS idx_version_history_type ON data_version_history(change_type);

-- ============================================
-- 数据访问统计表
-- ============================================
CREATE TABLE IF NOT EXISTS data_access_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    data_key TEXT NOT NULL,
    access_type TEXT NOT NULL, -- 'read', 'write', 'delete'
    storage_layer TEXT NOT NULL, -- 'local', 'database', 'hybrid'
    access_source TEXT, -- 'user', 'system', 'sync'
    response_time INTEGER, -- 毫秒
    data_size INTEGER DEFAULT 0,
    cache_hit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT access_stats_type_check CHECK (access_type IN ('read', 'write', 'delete')),
    CONSTRAINT access_stats_layer_check CHECK (storage_layer IN ('local', 'database', 'hybrid', 'session', 'memory'))
);

-- 数据访问统计表索引
CREATE INDEX IF NOT EXISTS idx_access_stats_user_id ON data_access_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_access_stats_key ON data_access_stats(data_key);
CREATE INDEX IF NOT EXISTS idx_access_stats_type ON data_access_stats(access_type);
CREATE INDEX IF NOT EXISTS idx_access_stats_created ON data_access_stats(created_at);
CREATE INDEX IF NOT EXISTS idx_access_stats_layer ON data_access_stats(storage_layer);

-- ============================================
-- 存储配额管理表
-- ============================================
CREATE TABLE IF NOT EXISTS user_storage_quotas (
    user_id TEXT PRIMARY KEY,
    total_quota_bytes BIGINT DEFAULT 104857600, -- 100MB默认
    used_bytes BIGINT DEFAULT 0,
    reserved_bytes BIGINT DEFAULT 0,
    sensitive_data_bytes BIGINT DEFAULT 0,
    business_data_bytes BIGINT DEFAULT 0,
    preference_data_bytes BIGINT DEFAULT 0,
    temp_data_bytes BIGINT DEFAULT 0,
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    quota_warnings INTEGER DEFAULT 0,
    quota_exceeded BOOLEAN DEFAULT FALSE,
    auto_cleanup_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT quota_positive_check CHECK (total_quota_bytes > 0),
    CONSTRAINT usage_within_quota CHECK (used_bytes <= total_quota_bytes)
);

-- 存储配额管理表索引
CREATE INDEX IF NOT EXISTS idx_storage_quotas_usage ON user_storage_quotas(used_bytes);
CREATE INDEX IF NOT EXISTS idx_storage_quotas_exceeded ON user_storage_quotas(quota_exceeded);
CREATE INDEX IF NOT EXISTS idx_storage_quotas_updated ON user_storage_quotas(updated_at);

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================

-- 启用行级安全
ALTER TABLE user_sensitive_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_business_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_general_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_storage_quotas ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY user_data_isolation ON user_sensitive_data
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_business_data_isolation ON user_business_data
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_preferences_isolation ON user_preferences
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_general_data_isolation ON user_general_data
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_sync_logs_isolation ON data_sync_logs
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_version_history_isolation ON data_version_history
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_access_stats_isolation ON data_access_stats
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY user_storage_quota_isolation ON user_storage_quotas
    FOR ALL USING (auth.uid()::text = user_id);

-- ============================================
-- 触发器和函数
-- ============================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要的表创建更新时间戳触发器
CREATE TRIGGER update_user_sensitive_data_updated_at
    BEFORE UPDATE ON user_sensitive_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_business_data_updated_at
    BEFORE UPDATE ON user_business_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_general_data_updated_at
    BEFORE UPDATE ON user_general_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_storage_quotas_updated_at
    BEFORE UPDATE ON user_storage_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 数据大小计算触发器函数
CREATE OR REPLACE FUNCTION calculate_data_size()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_size = length(NEW.data_value::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为业务数据表创建数据大小计算触发器
CREATE TRIGGER calculate_business_data_size
    BEFORE INSERT OR UPDATE ON user_business_data
    FOR EACH ROW EXECUTE FUNCTION calculate_data_size();

-- 存储配额更新触发器函数
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
    quota_record RECORD;
BEGIN
    -- 获取用户当前配额记录
    SELECT * INTO quota_record FROM user_storage_quotas WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
        -- 创建新的配额记录
        INSERT INTO user_storage_quotas (user_id, used_bytes) 
        VALUES (NEW.user_id, COALESCE(NEW.data_size, 0));
    ELSE
        -- 更新已有配额记录
        UPDATE user_storage_quotas 
        SET used_bytes = used_bytes + COALESCE(NEW.data_size, 0) - COALESCE(OLD.data_size, 0),
            last_calculated = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为业务数据表创建配额更新触发器
CREATE TRIGGER update_business_data_quota
    AFTER INSERT OR UPDATE ON user_business_data
    FOR EACH ROW EXECUTE FUNCTION update_storage_quota();

-- TTL清理函数
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- 清理过期的业务数据
    DELETE FROM user_business_data 
    WHERE ttl IS NOT NULL 
    AND (EXTRACT(EPOCH FROM (NOW() - updated_at)) > ttl);
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- 清理过期的通用数据
    DELETE FROM user_general_data 
    WHERE ttl IS NOT NULL 
    AND (EXTRACT(EPOCH FROM (NOW() - updated_at)) > ttl);
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- 清理旧的同步日志（保留30天）
    DELETE FROM data_sync_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- 清理旧的访问统计（保留7天）
    DELETE FROM data_access_stats 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 视图和统计
-- ============================================

-- 用户数据概览视图
CREATE OR REPLACE VIEW user_data_overview AS
SELECT 
    u.user_id,
    COUNT(CASE WHEN u.source_table = 'user_sensitive_data' THEN 1 END) as sensitive_count,
    COUNT(CASE WHEN u.source_table = 'user_business_data' THEN 1 END) as business_count,
    COUNT(CASE WHEN u.source_table = 'user_preferences' THEN 1 END) as preference_count,
    COUNT(CASE WHEN u.source_table = 'user_general_data' THEN 1 END) as general_count,
    SUM(CASE WHEN u.source_table = 'user_business_data' THEN u.data_size ELSE 0 END) as total_size,
    MAX(u.updated_at) as last_updated
FROM (
    SELECT user_id, data_size, updated_at, 'user_sensitive_data' as source_table FROM user_sensitive_data
    UNION ALL
    SELECT user_id, data_size, updated_at, 'user_business_data' as source_table FROM user_business_data
    UNION ALL
    SELECT user_id, 0 as data_size, updated_at, 'user_preferences' as source_table FROM user_preferences
    UNION ALL
    SELECT user_id, 0 as data_size, updated_at, 'user_general_data' as source_table FROM user_general_data
) u
GROUP BY u.user_id;

-- 数据同步状态视图
CREATE OR REPLACE VIEW sync_status_overview AS
SELECT 
    user_id,
    data_key,
    COUNT(*) as total_syncs,
    COUNT(CASE WHEN sync_status = 'success' THEN 1 END) as successful_syncs,
    COUNT(CASE WHEN sync_status = 'failed' THEN 1 END) as failed_syncs,
    COUNT(CASE WHEN sync_status = 'conflict' THEN 1 END) as conflict_syncs,
    MAX(created_at) as last_sync,
    AVG(sync_duration) as avg_sync_duration
FROM data_sync_logs
GROUP BY user_id, data_key;

-- ============================================
-- 初始化数据
-- ============================================

-- 创建默认存储配置
INSERT INTO user_storage_quotas (user_id, total_quota_bytes)
SELECT DISTINCT user_id, 104857600 -- 100MB
FROM user_business_data 
WHERE NOT EXISTS (
    SELECT 1 FROM user_storage_quotas q WHERE q.user_id = user_business_data.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 定期维护任务
-- ============================================

-- 创建定期清理任务（需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');

-- 手动执行清理（用于测试）
-- SELECT cleanup_expired_data();

-- ============================================
-- 权限设置
-- ============================================

-- 授予认证用户访问权限
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sensitive_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_business_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_general_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_sync_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_version_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_access_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_storage_quotas TO authenticated;

-- 授予视图访问权限
GRANT SELECT ON user_data_overview TO authenticated;
GRANT SELECT ON sync_status_overview TO authenticated;

-- 授予序列使用权限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;