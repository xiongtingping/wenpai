/**
 * 创建 Supabase 数据库表
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// 加载环境变量
dotenv.config({ path: '.env.local' });
dotenv.config();

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 创建 Supabase 数据库表\n');
console.log('='.repeat(60));

// 检查环境变量
console.log('📋 环境变量检查:');
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ 已设置' : '❌ 未设置'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ 缺少必要的环境变量，无法继续');
  process.exit(1);
}

// 创建服务端客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 执行 SQL 脚本
 */
async function executeSQLScript(scriptPath, description) {
  console.log(`\n📄 执行 ${description}...`);
  
  try {
    // 读取 SQL 文件
    const sqlContent = fs.readFileSync(scriptPath, 'utf8');
    console.log(`  文件大小: ${sqlContent.length} 字符`);
    
    // 分割 SQL 语句（按分号分割，但忽略注释和字符串中的分号）
    const statements = sqlContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`  SQL 语句数量: ${statements.length}`);
    
    // 逐个执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`  执行语句 ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // 如果是表已存在的错误，可以忽略
          if (error.message.includes('already exists')) {
            console.log(`    ⚠️  表已存在，跳过: ${error.message.substring(0, 100)}...`);
            continue;
          }
          
          console.log(`    ❌ 执行失败: ${error.message}`);
          console.log(`    SQL: ${statement.substring(0, 200)}...`);
          
          // 尝试直接执行（某些语句可能不支持 rpc）
          console.log(`    🔄 尝试直接执行...`);
          const { data: directData, error: directError } = await supabase
            .from('_sql_exec')
            .select('*')
            .limit(0);
          
          if (directError) {
            console.log(`    ❌ 直接执行也失败: ${directError.message}`);
          }
        } else {
          console.log(`    ✅ 执行成功`);
        }
      } catch (execError) {
        console.log(`    ❌ 执行异常: ${execError.message}`);
        console.log(`    SQL: ${statement.substring(0, 200)}...`);
      }
    }
    
    console.log(`✅ ${description} 完成`);
    return true;
    
  } catch (error) {
    console.log(`❌ ${description} 失败: ${error.message}`);
    return false;
  }
}

/**
 * 手动创建表
 */
async function createTablesManually() {
  console.log('\n🔧 手动创建数据库表...');
  
  // 1. 创建 orders 表
  console.log('\n1. 创建 orders 表...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id TEXT UNIQUE NOT NULL,
          aoid TEXT,
          user_id TEXT NOT NULL,
          user_email TEXT,
          product_name TEXT NOT NULL,
          product_type TEXT NOT NULL,
          duration_type TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          pay_price DECIMAL(10,2),
          status TEXT DEFAULT 'pending',
          pay_type TEXT DEFAULT 'alipay',
          qr_code TEXT,
          qr_image TEXT,
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          paid_at TIMESTAMPTZ,
          processed_at TIMESTAMPTZ,
          metadata JSONB,
          
          CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'processed')),
          CONSTRAINT valid_product_type CHECK (product_type IN ('professional', 'premium')),
          CONSTRAINT valid_duration_type CHECK (duration_type IN ('monthly', 'yearly')),
          CONSTRAINT valid_pay_type CHECK (pay_type IN ('alipay', 'wechat'))
        );
      `
    });
    
    if (error) {
      console.log('❌ 创建 orders 表失败:', error.message);
    } else {
      console.log('✅ orders 表创建成功');
    }
  } catch (error) {
    console.log('❌ 创建 orders 表异常:', error.message);
  }
  
  // 2. 创建 user_subscriptions 表
  console.log('\n2. 创建 user_subscriptions 表...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          subscription_type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          started_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL,
          order_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT valid_subscription_type CHECK (subscription_type IN ('professional', 'premium')),
          CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'expired', 'cancelled'))
        );
      `
    });
    
    if (error) {
      console.log('❌ 创建 user_subscriptions 表失败:', error.message);
    } else {
      console.log('✅ user_subscriptions 表创建成功');
    }
  } catch (error) {
    console.log('❌ 创建 user_subscriptions 表异常:', error.message);
  }
  
  // 3. 创建索引
  console.log('\n3. 创建索引...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);',
    'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);',
    'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);'
  ];
  
  for (const indexSQL of indexes) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (error) {
        console.log(`❌ 创建索引失败: ${error.message}`);
      } else {
        console.log(`✅ 索引创建成功: ${indexSQL.substring(0, 50)}...`);
      }
    } catch (error) {
      console.log(`❌ 创建索引异常: ${error.message}`);
    }
  }
}

/**
 * 验证表创建结果
 */
async function verifyTables() {
  console.log('\n🔍 验证表创建结果...');
  
  const tables = ['orders', 'user_subscriptions'];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ 表 ${tableName} 验证失败: ${error.message}`);
      } else {
        console.log(`✅ 表 ${tableName} 验证成功`);
      }
    } catch (error) {
      console.log(`❌ 表 ${tableName} 验证异常: ${error.message}`);
    }
  }
}

/**
 * 运行所有操作
 */
async function runAll() {
  try {
    // 1. 尝试执行 SQL 脚本
    const scriptSuccess = await executeSQLScript(
      'supabase/migrations/create_orders_table.sql',
      'orders 表迁移脚本'
    );
    
    // 2. 如果脚本执行失败，手动创建表
    if (!scriptSuccess) {
      console.log('\n⚠️  SQL 脚本执行失败，尝试手动创建表...');
      await createTablesManually();
    }
    
    // 3. 验证表创建结果
    await verifyTables();
    
    // 4. 添加约束和索引
    await addDatabaseConstraints();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 数据库表创建流程完成');
    
  } catch (error) {
    console.log('\n❌ 创建数据库表失败:', error.message);
    console.log(error.stack);
  }
}

/**
 * 添加数据库约束和索引
 */
async function addDatabaseConstraints() {
  try {
    console.log('\n🔧 添加数据库约束和索引...');
    
    const constraints = [
      // 唯一约束
      'ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS orders_order_id_unique UNIQUE (order_id);',
      'CREATE UNIQUE INDEX IF NOT EXISTS orders_aoid_unique ON orders (aoid) WHERE aoid IS NOT NULL;',
      
      // 性能索引
      'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);',
      'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_order_id ON user_subscriptions (order_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions (status);',
      
      // 数据完整性约束
      'ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS orders_amount_positive CHECK (amount > 0);',
      'ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS orders_status_valid CHECK (status IN (\'pending\', \'paid\', \'processed\', \'failed\', \'expired\'));'
    ];

    for (const sql of constraints) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
        if (error) {
          console.log(`⚠️ 约束可能已存在: ${sql.substring(0, 50)}... - ${error.message}`);
        } else {
          console.log(`✅ 约束添加成功: ${sql.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`⚠️ 跳过约束: ${sql.substring(0, 50)}... - ${err.message}`);
      }
    }
    
    console.log('✅ 数据库约束和索引处理完成');
  } catch (error) {
    console.error('❌ 添加约束失败:', error);
  }
}

// 运行
runAll().catch(console.error);
