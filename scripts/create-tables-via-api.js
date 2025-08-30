#!/usr/bin/env node
/**
 * 通过Supabase API创建表格
 * 使用PostgreSQL REST API直接创建表格
 */

import { createClient } from '@supabase/supabase-js';

// ✅ SECURITY FIX: 2025-08-30 移除硬编码配置，使用环境变量
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少Supabase配置环境变量');
  console.error('请设置: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 创建Supabase客户端（使用service role）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 创建表格的SQL语句
 */
const tableDefinitions = {
  token_usage_records: `
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
  `,
  
  usage_count_records: `
    CREATE TABLE IF NOT EXISTS usage_count_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        feature VARCHAR(100) NOT NULL,
        amount INTEGER NOT NULL DEFAULT 1,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  user_invite_relations: `
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
  `,
  
  user_invite_stats: `
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
  `,
  
  user_invite_events: `
    CREATE TABLE IF NOT EXISTS user_invite_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        inviter_id UUID,
        invitee_id UUID,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  user_files: `
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
  `,
  
  user_notes: `
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
  `,
  
  user_brand_corpus: `
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
  `,
  
  user_library_items: `
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
  `,
  
  user_chat_history: `
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
};

/**
 * 通过HTTP API创建表格
 */
async function createTableViaAPI(tableName, sql) {
  try {
    console.log(`🔧 创建表 ${tableName}...`);
    
    // 使用fetch直接调用PostgreSQL REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: sql.trim() })
    });
    
    if (response.ok) {
      console.log(`✅ 表 ${tableName} 创建成功`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ 表 ${tableName} 创建失败: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 表 ${tableName} 创建异常: ${error.message}`);
    return false;
  }
}

/**
 * 主执行函数
 */
async function main() {
  try {
    console.log('🚀 开始创建Supabase表格...\n');
    
    let successCount = 0;
    let totalCount = Object.keys(tableDefinitions).length;
    
    for (const [tableName, sql] of Object.entries(tableDefinitions)) {
      const success = await createTableViaAPI(tableName, sql);
      if (success) successCount++;
    }
    
    console.log(`\n📊 创建结果: ${successCount}/${totalCount} 个表格创建成功`);
    
    if (successCount === totalCount) {
      console.log('🎉 所有表格创建完成！');
    } else {
      console.log('⚠️  部分表格创建失败，请手动在Supabase Dashboard中创建');
    }
    
  } catch (error) {
    console.error('❌ 创建过程失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);