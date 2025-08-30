-- ============================================================================
-- 第二步：创建触发器和 RLS 策略
-- 请在执行完第一步后，再执行此脚本
-- ============================================================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表创建触发器
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_usage_records_updated_at
    BEFORE UPDATE ON token_usage_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invite_relations_updated_at
    BEFORE UPDATE ON user_invite_relations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invite_stats_updated_at
    BEFORE UPDATE ON user_invite_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_files_updated_at
    BEFORE UPDATE ON user_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at
    BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_corpus_updated_at
    BEFORE UPDATE ON user_brand_corpus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_items_updated_at
    BEFORE UPDATE ON user_library_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用所有表的RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_count_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brand_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_history ENABLE ROW LEVEL SECURITY;

-- 用户基本信息表RLS策略
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 订阅信息表RLS策略
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Token使用记录表RLS策略
CREATE POLICY "Users can view their own token usage" ON token_usage_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own token usage" ON token_usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 使用次数记录表RLS策略
CREATE POLICY "Users can view their own usage count" ON usage_count_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage count" ON usage_count_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 邀请关系表RLS策略
CREATE POLICY "Users can view invites they sent or received" ON user_invite_relations
    FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can create invite relations as inviter" ON user_invite_relations
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users can update invites they sent" ON user_invite_relations
    FOR UPDATE USING (auth.uid() = inviter_id);

-- 邀请统计表RLS策略
CREATE POLICY "Users can view their own invite stats" ON user_invite_stats
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invite stats" ON user_invite_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invite stats" ON user_invite_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 邀请事件表RLS策略
CREATE POLICY "Users can view invite events they're involved in" ON user_invite_events
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can insert invite events" ON user_invite_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户文件表RLS策略
CREATE POLICY "Users can manage their own files" ON user_files
    FOR ALL USING (auth.uid() = user_id);

-- 用户笔记表RLS策略
CREATE POLICY "Users can manage their own notes" ON user_notes
    FOR ALL USING (auth.uid() = user_id);

-- 品牌语料库表RLS策略
CREATE POLICY "Users can manage their own brand corpus" ON user_brand_corpus
    FOR ALL USING (auth.uid() = user_id);

-- 收藏夹表RLS策略
CREATE POLICY "Users can manage their own library items" ON user_library_items
    FOR ALL USING (auth.uid() = user_id);

-- 聊天历史表RLS策略
CREATE POLICY "Users can manage their own chat history" ON user_chat_history
    FOR ALL USING (auth.uid() = user_id);
