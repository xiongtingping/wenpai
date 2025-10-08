#!/usr/bin/env node
/**
 * 使用 pg 客户端直接执行 SQL
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

// 从 Supabase URL 构建 PostgreSQL 连接字符串
// Supabase URL 格式: https://xxxxx.supabase.co
// PostgreSQL 连接格式: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.VITE_SUPABASE_DB_PASSWORD;

if (!dbPassword) {
  console.error('❌ 缺少数据库密码 (SUPABASE_DB_PASSWORD)');
  console.log('');
  console.log('💡 提示：请在 .env.local 中添加：');
  console.log('SUPABASE_DB_PASSWORD=your_database_password');
  console.log('');
  console.log('或者，在 Supabase Dashboard 中执行 SQL：');
  console.log('1. 打开 https://supabase.com/dashboard');
  console.log('2. 选择项目');
  console.log('3. 进入 SQL Editor');
  console.log('4. 复制并执行: supabase/migrations/cleanup_database_schema.sql');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

console.log('🔧 使用 PostgreSQL 客户端执行数据库清理...\n');
console.log('📡 连接到:', `db.${projectRef}.supabase.co`);
console.log('');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  // 连接到数据库
  console.log('🔌 正在连接...');
  await client.connect();
  console.log('✅ 连接成功\n');
  
  // 读取 SQL 文件
  const sqlPath = join(__dirname, '../supabase/migrations/cleanup_database_schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');
  
  console.log('📄 读取 SQL 文件:', sqlPath);
  console.log('📏 SQL 文件大小:', sql.length, '字符\n');
  
  // 执行 SQL
  console.log('⚙️  执行 SQL...\n');
  console.log('================================================================================');
  
  const result = await client.query(sql);
  
  console.log('================================================================================\n');
  console.log('✅ SQL 执行成功！');
  
  // 显示通知消息
  if (result.notices && result.notices.length > 0) {
    console.log('\n📋 执行日志:');
    result.notices.forEach(notice => {
      console.log(`   ${notice.message}`);
    });
  }
  
} catch (error) {
  console.error('\n❌ 执行失败:', error.message);
  console.error('\n详细错误:', error);
  process.exit(1);
} finally {
  await client.end();
  console.log('\n🔌 连接已关闭');
}

console.log('\n✅ 数据库清理完成！');
console.log('\n📋 后续步骤:');
console.log('1. 运行验证脚本: node scripts/verify-database-cleanup.mjs');
console.log('2. 测试所有功能');
console.log('3. 提交代码更改');

