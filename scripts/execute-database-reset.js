#!/usr/bin/env node

/**
 * 执行数据库重置和重新创建
 * 警告：这将删除所有现有数据！
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase 配置
const supabaseUrl = 'https://weizkydylskcwgnaieqy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w'

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, serviceRoleKey)

// 读取 SQL 文件
function readSQLFile(filename) {
  const filePath = path.join(__dirname, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL 文件不存在: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

// 执行 SQL 语句
async function executeSQL(sql, description) {
  console.log(`\n📝 执行 ${description}...`)
  
  try {
    // 分割 SQL 语句
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          // 使用 REST API 直接执行 SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ sql: statement })
          })

          if (response.ok) {
            successCount++
            if (i % 10 === 0) {
              console.log(`  进度: ${i + 1}/${statements.length}`)
            }
          } else {
            const errorText = await response.text()
            console.error(`  ❌ 语句执行失败: ${errorText}`)
            errorCount++
          }
        } catch (err) {
          console.error(`  ❌ 语句执行异常: ${err.message}`)
          errorCount++
        }
      }
    }

    console.log(`✅ ${description} 完成: ${successCount} 成功, ${errorCount} 失败`)
    return errorCount === 0

  } catch (err) {
    console.error(`❌ ${description} 执行出错:`, err.message)
    return false
  }
}

// 确认操作
async function confirmReset() {
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    console.log('⚠️  警告：此操作将删除所有现有数据库表格和数据！')
    console.log('📊 这包括：')
    console.log('  - 所有用户资料和订阅信息')
    console.log('  - 所有 Token 使用记录')
    console.log('  - 所有邀请关系和统计')
    console.log('  - 所有用户文件、笔记、品牌语料库')
    console.log('  - 所有收藏夹和聊天历史')
    console.log('')
    
    rl.question('确定要继续吗？请输入 "RESET" 确认: ', (answer) => {
      rl.close()
      resolve(answer === 'RESET')
    })
  })
}

// 主函数
async function main() {
  console.log('🔄 Supabase 数据库重置工具')
  console.log(`📍 目标数据库: ${supabaseUrl}`)
  
  // 确认操作
  const confirmed = await confirmReset()
  if (!confirmed) {
    console.log('❌ 操作已取消')
    return
  }

  console.log('\n🚀 开始重置数据库...')

  try {
    // 执行第一部分：删除和重新创建表格
    console.log('\n📋 第一阶段：删除现有表格并重新创建...')
    const part1SQL = readSQLFile('reset-and-create-all-tables.sql')
    const part1Success = await executeSQL(part1SQL, '表格重置和创建')

    if (!part1Success) {
      console.log('❌ 第一阶段失败，停止执行')
      return
    }

    // 等待一下让数据库处理完成
    console.log('\n⏳ 等待数据库处理...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 执行第二部分：RLS、视图、函数等
    console.log('\n📋 第二阶段：创建 RLS 策略、视图和函数...')
    const part2SQL = readSQLFile('reset-and-create-all-tables-part2.sql')
    const part2Success = await executeSQL(part2SQL, 'RLS 策略和函数创建')

    if (part1Success && part2Success) {
      console.log('\n🎉 数据库重置完成！')
      
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

      console.log('\n🎯 下一步:')
      console.log('1. 运行测试脚本验证: node scripts/test-supabase-connection.js')
      console.log('2. 在应用中使用 useSupabase Hook')
      console.log('3. 开始使用完整的数据库功能')

    } else {
      console.log('\n⚠️  数据库重置部分失败，请检查错误信息')
    }

  } catch (error) {
    console.error('\n❌ 重置过程中发生错误:', error.message)
  }
}

// 运行重置
main().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
