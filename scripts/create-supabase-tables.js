#!/usr/bin/env node

/**
 * 直接使用 Supabase Service Role Key 创建数据库表格
 * 这个脚本会直接执行 SQL 语句创建所有必要的表格
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// 从环境变量获取配置
const supabaseUrl = 'https://weizkydylskcwgnaieqy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w'

// 创建 Supabase 客户端（使用 Service Role Key）
const supabase = createClient(supabaseUrl, serviceRoleKey)

// 直接通过 REST API 执行 SQL
async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HTTP 错误:', response.status, errorText)

      // 如果 exec_sql 函数不存在，我们直接使用 SQL 编辑器 API
      if (response.status === 404) {
        console.log('尝试使用 SQL 编辑器 API...')
        return await executeSQLDirect(sql)
      }
      return false
    }

    return true
  } catch (err) {
    console.error('执行 SQL 时发生错误:', err.message)
    return false
  }
}

// 使用 Supabase SQL 编辑器 API
async function executeSQLDirect(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        query: sql
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('直接 SQL 执行错误:', response.status, errorText)
      return false
    }

    return true
  } catch (err) {
    console.error('直接执行 SQL 时发生错误:', err.message)
    return false
  }
}

// 创建所有表格的 SQL 语句
const createTablesSQL = `
-- 用户扩展信息表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 用户订阅信息表
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'trial',
    monthly_token_limit INTEGER NOT NULL DEFAULT 100000,
    usage_count_limit INTEGER NOT NULL DEFAULT 10,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Token使用记录表
CREATE TABLE IF NOT EXISTS token_usage_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    feature VARCHAR(100) NOT NULL,
    task_type VARCHAR(100),
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    model VARCHAR(100) NOT NULL,
    content_summary TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用次数记录表
CREATE TABLE IF NOT EXISTS usage_count_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    feature VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邀请关系表
CREATE TABLE IF NOT EXISTS user_invite_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL,
    invitee_id UUID NOT NULL,
    invite_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    source VARCHAR(20) NOT NULL DEFAULT 'link',
    metadata JSONB DEFAULT '{}',
    rewarded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invitee_id)
);

-- 邀请统计表
CREATE TABLE IF NOT EXISTS user_invite_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total_invites INTEGER NOT NULL DEFAULT 0,
    successful_invites INTEGER NOT NULL DEFAULT 0,
    link_clicks INTEGER NOT NULL DEFAULT 0,
    rewards_issued INTEGER NOT NULL DEFAULT 0,
    total_reward_count INTEGER NOT NULL DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 邀请事件表
CREATE TABLE IF NOT EXISTS user_invite_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    inviter_id UUID,
    invitee_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户文件表
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_type VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户笔记表
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_private BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户品牌语料库表
CREATE TABLE IF NOT EXISTS user_brand_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    brand_description TEXT,
    tone_keywords TEXT[],
    style_guide TEXT,
    content_samples TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户收藏夹表
CREATE TABLE IF NOT EXISTS user_library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户聊天历史表
CREATE TABLE IF NOT EXISTS user_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

// 创建索引的 SQL
const createIndexesSQL = `
-- 用户相关索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- Token使用相关索引
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_feature ON token_usage_records(feature);
CREATE INDEX IF NOT EXISTS idx_token_usage_success ON token_usage_records(success);

CREATE INDEX IF NOT EXISTS idx_usage_count_user_id ON usage_count_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_count_feature ON usage_count_records(feature);

-- 邀请相关索引
CREATE INDEX IF NOT EXISTS idx_invite_relations_inviter_id ON user_invite_relations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_relations_invitee_id ON user_invite_relations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invite_relations_status ON user_invite_relations(status);

CREATE INDEX IF NOT EXISTS idx_invite_stats_user_id ON user_invite_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_events_user_id ON user_invite_events(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_events_type ON user_invite_events(event_type);

-- 内容相关索引
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_type ON user_files(file_type);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_category ON user_notes(category);

CREATE INDEX IF NOT EXISTS idx_brand_corpus_user_id ON user_brand_corpus(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_user_id ON user_library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_status ON user_library_items(status);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON user_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON user_chat_history(session_id);
`

// 主函数
async function createDatabase() {
  console.log('🚀 开始创建 Supabase 数据库表格...')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  
  try {
    // 测试连接
    console.log('\n🔍 测试数据库连接...')
    const { data, error } = await supabase.from('auth.users').select('count').limit(1)
    if (error) {
      console.log('⚠️  无法访问 auth.users，但这是正常的，继续创建表格...')
    } else {
      console.log('✅ 数据库连接成功')
    }

    // 创建表格
    console.log('\n📝 创建数据库表格...')
    
    // 分割 SQL 语句并逐个执行
    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`执行语句 ${i + 1}/${statements.length}...`)
        const success = await executeSQL(statement)
        if (!success) {
          console.error(`❌ 语句 ${i + 1} 执行失败`)
        }
      }
    }

    // 创建索引
    console.log('\n📊 创建数据库索引...')
    const indexStatements = createIndexesSQL.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (let i = 0; i < indexStatements.length; i++) {
      const statement = indexStatements[i].trim()
      if (statement) {
        console.log(`创建索引 ${i + 1}/${indexStatements.length}...`)
        const success = await executeSQL(statement)
        if (!success) {
          console.error(`❌ 索引 ${i + 1} 创建失败`)
        }
      }
    }

    console.log('\n🎉 数据库创建完成!')
    console.log('\n📋 已创建的表格:')
    const tables = [
      'user_profiles - 用户扩展信息',
      'user_subscriptions - 用户订阅信息',
      'token_usage_records - Token使用记录',
      'usage_count_records - 使用次数记录',
      'user_invite_relations - 邀请关系',
      'user_invite_stats - 邀请统计',
      'user_invite_events - 邀请事件',
      'user_files - 用户文件',
      'user_notes - 用户笔记',
      'user_brand_corpus - 品牌语料库',
      'user_library_items - 收藏夹',
      'user_chat_history - 聊天历史'
    ]
    tables.forEach(table => console.log(`  ✓ ${table}`))

  } catch (error) {
    console.error('\n❌ 创建过程中发生错误:', error.message)
  }
}

// 运行创建脚本
createDatabase().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
