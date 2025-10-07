#!/usr/bin/env node
/**
 * 列出Supabase数据库中的所有表
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

async function listTables() {
  console.log('\n📋 查询数据库表列表...\n');
  
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');
  
  if (error) {
    console.error('❌ 查询失败:', error.message);
    
    // 尝试另一种方法
    console.log('\n尝试使用RPC查询...\n');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_tables');
    
    if (rpcError) {
      console.error('❌ RPC查询也失败:', rpcError.message);
    } else {
      console.log('✅ 找到的表:');
      rpcData?.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.tablename || table.table_name || JSON.stringify(table)}`);
      });
    }
  } else {
    console.log('✅ 找到的表:');
    data?.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
  }
}

listTables();

