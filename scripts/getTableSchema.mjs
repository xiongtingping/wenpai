#!/usr/bin/env node
/**
 * 查看表结构
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTableSchema() {
  const tableName = process.argv[2] || 'orders';
  
  console.log(`\n📋 查询表结构: ${tableName}\n`);
  
  // 查询一条记录看字段
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error('❌ 查询失败:', error.message);
    return;
  }
  
  console.log('✅ 表字段:');
  Object.keys(data).forEach((key, index) => {
    console.log(`   ${index + 1}. ${key}: ${typeof data[key]} = ${data[key]}`);
  });
}

getTableSchema();

