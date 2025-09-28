-- 速率限制日志表
-- 用于记录API访问频率和限制事件

CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL, -- 支持IPv4和IPv6
    endpoint VARCHAR(255) NOT NULL, -- API端点路径
    user_tier VARCHAR(20) DEFAULT 'trial', -- 用户等级
    is_blocked BOOLEAN DEFAULT FALSE, -- 是否被阻止
    request_count INTEGER DEFAULT 1, -- 请求次数
    user_agent TEXT, -- 用户代理
    referer TEXT, -- 来源页面
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_ip_timestamp 
ON rate_limit_logs(ip_address, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_endpoint_timestamp 
ON rate_limit_logs(endpoint, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_blocked 
ON rate_limit_logs(is_blocked, timestamp DESC) 
WHERE is_blocked = true;

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user_tier 
ON rate_limit_logs(user_tier, timestamp DESC);

-- 创建分区表（按月分区，提高大数据量下的查询性能）
-- 注意：这需要PostgreSQL 10+支持
-- CREATE TABLE rate_limit_logs_y2025m01 PARTITION OF rate_limit_logs
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 自动清理旧数据的函数（保留30天）
CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limit_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- 记录清理结果
    RAISE NOTICE '清理了 % 天前的速率限制日志', 30;
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-rate-logs', '0 2 * * *', 'SELECT cleanup_old_rate_limit_logs();');

-- 创建统计视图
CREATE OR REPLACE VIEW rate_limit_stats AS
SELECT 
    ip_address,
    endpoint,
    user_tier,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE is_blocked = true) as blocked_requests,
    COUNT(*) FILTER (WHERE is_blocked = false) as allowed_requests,
    ROUND(
        (COUNT(*) FILTER (WHERE is_blocked = true)::decimal / COUNT(*)) * 100, 
        2
    ) as block_rate_percent,
    MIN(timestamp) as first_request,
    MAX(timestamp) as last_request,
    DATE_TRUNC('hour', timestamp) as hour_bucket
FROM rate_limit_logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY ip_address, endpoint, user_tier, DATE_TRUNC('hour', timestamp)
ORDER BY total_requests DESC;

-- RLS (Row Level Security) 策略
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看所有日志
CREATE POLICY "管理员可查看速率限制日志" ON rate_limit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- 插入权限（系统自动插入）
CREATE POLICY "系统可插入速率限制日志" ON rate_limit_logs
    FOR INSERT WITH CHECK (true);

-- 注释
COMMENT ON TABLE rate_limit_logs IS '速率限制日志表，记录API访问频率和限制事件';
COMMENT ON COLUMN rate_limit_logs.ip_address IS '客户端IP地址';
COMMENT ON COLUMN rate_limit_logs.endpoint IS 'API端点路径';
COMMENT ON COLUMN rate_limit_logs.user_tier IS '用户等级（trial/pro/premium）';
COMMENT ON COLUMN rate_limit_logs.is_blocked IS '请求是否被速率限制阻止';
COMMENT ON COLUMN rate_limit_logs.request_count IS '在时间窗口内的请求计数';
COMMENT ON COLUMN rate_limit_logs.user_agent IS '客户端用户代理字符串';
COMMENT ON COLUMN rate_limit_logs.referer IS '请求来源页面URL';

-- 示例查询
/*
-- 查询最近1小时被阻止最多的IP
SELECT ip_address, COUNT(*) as blocked_count
FROM rate_limit_logs 
WHERE is_blocked = true 
AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY ip_address 
ORDER BY blocked_count DESC 
LIMIT 10;

-- 查询各端点的访问频率
SELECT endpoint, user_tier, 
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE is_blocked = true) as blocked
FROM rate_limit_logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY endpoint, user_tier
ORDER BY total DESC;

-- 查询异常IP（短时间内大量请求）
SELECT ip_address, 
       COUNT(*) as request_count,
       COUNT(*) FILTER (WHERE is_blocked = true) as blocked_count,
       MIN(timestamp) as first_request,
       MAX(timestamp) as last_request,
       EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) as duration_seconds
FROM rate_limit_logs 
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 100 -- 1小时内超过100次请求
ORDER BY request_count DESC;
*/