#!/usr/bin/env node

/**
 * Supabase 数据库自动初始化脚本
 * 
 * 使用方法:
 * 1. 确保已安装 @supabase/supabase-js
 * 2. 设置环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
 * 3. 运行: node scripts/setup-supabase.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量:')
  console.error('   VITE_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY (推荐) 或 VITE_SUPABASE_ANON_KEY')
  console.error('')
  console.error('请在 .env 文件中设置这些变量')
  process.exit(1)
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 读取 SQL 文件
function readSQLFile(filename) {
  const filePath = path.join(__dirname, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL 文件不存在: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

// 执行 SQL 语句
async function executeSQLStatements(sqlContent, description) {
  console.log(`\n📝 执行 ${description}...`)
  
  try {
    // 注意: 这里使用 Supabase 的 RPC 功能执行 SQL
    // 需要在 Supabase 中创建一个执行 SQL 的函数
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    })
    
    if (error) {
      console.error(`❌ ${description} 执行失败:`, error.message)
      return false
    }
    
    console.log(`✅ ${description} 执行成功`)
    return true
  } catch (err) {
    console.error(`❌ ${description} 执行出错:`, err.message)
    return false
  }
}

// 检查表是否存在
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    return !error
  } catch {
    return false
  }
}

// 主要的初始化函数
async function initializeDatabase() {
  console.log('🚀 开始初始化 Supabase 数据库...')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  
  try {
    // 检查连接
    console.log('\n🔍 检查数据库连接...')
    const { data, error } = await supabase.from('auth.users').select('count').limit(1)
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      return
    }
    console.log('✅ 数据库连接成功')

    // 检查是否已经初始化
    console.log('\n🔍 检查数据库状态...')
    const tableExists = await checkTableExists('user_profiles')
    
    if (tableExists) {
      console.log('✅ 数据库已经初始化')
      
      // 询问是否重新初始化
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        rl.question('是否要重新初始化数据库? (y/N): ', resolve)
      })
      rl.close()
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('👋 取消初始化')
        return
      }
    }

    // 执行初始化脚本
    const scripts = [
      { file: 'init-database.sql', description: '创建表格和索引' },
      { file: 'init-database-part2.sql', description: '创建触发器和RLS策略' },
      { file: 'init-database-part3.sql', description: '创建视图、函数和初始数据' }
    ]

    let allSuccess = true
    for (const script of scripts) {
      try {
        const sqlContent = readSQLFile(script.file)
        const success = await executeSQLStatements(sqlContent, script.description)
        if (!success) {
          allSuccess = false
        }
      } catch (err) {
        console.error(`❌ 读取 ${script.file} 失败:`, err.message)
        allSuccess = false
      }
    }

    if (allSuccess) {
      console.log('\n🎉 数据库初始化完成!')
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
      
      console.log('\n📊 已创建的功能:')
      console.log('  ✓ 自动更新时间戳触发器')
      console.log('  ✓ 行级安全策略 (RLS)')
      console.log('  ✓ 性能优化索引')
      console.log('  ✓ 统计视图和存储过程')
      console.log('  ✓ 数据清理函数')
      
    } else {
      console.log('\n⚠️  数据库初始化部分失败，请检查错误信息')
    }

  } catch (error) {
    console.error('\n❌ 初始化过程中发生错误:', error.message)
  }
}

// 显示使用说明
function showUsage() {
  console.log(`
📖 Supabase 数据库初始化工具

使用方法:
  node scripts/setup-supabase.js

环境变量:
  VITE_SUPABASE_URL          - Supabase 项目 URL
  SUPABASE_SERVICE_ROLE_KEY  - Service Role Key (推荐)
  VITE_SUPABASE_ANON_KEY     - Anonymous Key (备选)

注意事项:
  1. 确保已安装 @supabase/supabase-js 依赖
  2. 建议使用 Service Role Key 以获得完整权限
  3. 初始化会创建所有必要的表格、索引和安全策略
  4. 如果表格已存在，会询问是否重新初始化

示例 .env 文件:
  VITE_SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`)
}

// 处理命令行参数
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  showUsage()
  process.exit(0)
}

// 运行初始化
initializeDatabase().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
