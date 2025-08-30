#!/usr/bin/env node

/**
 * 部署前环境变量检查脚本
 * 确保所有必要的环境变量都已正确配置
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 检查部署环境变量配置...')

// 必需的环境变量
const requiredEnvVars = {
  'Supabase 配置': [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ],
  'Authing 配置': [
    'VITE_AUTHING_APP_ID',
    'VITE_AUTHING_HOST'
  ],
  'AI API 配置': [
    'VITE_OPENAI_API_KEY',
    'VITE_DEEPSEEK_API_KEY'
  ]
}

// 检查 .env.local 文件
function checkLocalEnv() {
  const envLocalPath = '.env.local'
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('⚠️  .env.local 文件不存在')
    return {}
  }

  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=')
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })

  return envVars
}

// 检查 vite.config.ts 中的 define 配置
function checkViteConfig() {
  const viteConfigPath = 'vite.config.ts'
  
  if (!fs.existsSync(viteConfigPath)) {
    console.log('❌ vite.config.ts 文件不存在')
    return false
  }

  const viteContent = fs.readFileSync(viteConfigPath, 'utf8')
  
  // 检查是否包含 Supabase 环境变量
  const hasSupabaseUrl = viteContent.includes('VITE_SUPABASE_URL')
  const hasSupabaseKey = viteContent.includes('VITE_SUPABASE_ANON_KEY')
  
  return hasSupabaseUrl && hasSupabaseKey
}

// 主检查函数
function main() {
  console.log('📋 环境变量检查报告\n')

  // 检查本地环境变量
  const localEnv = checkLocalEnv()
  
  let allPassed = true
  
  // 检查每个分类的环境变量
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    console.log(`📂 ${category}:`)
    
    vars.forEach(varName => {
      const value = localEnv[varName] || process.env[varName]
      if (value && value.length > 0) {
        console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`)
      } else {
        console.log(`  ❌ ${varName}: 未配置`)
        allPassed = false
      }
    })
    console.log('')
  })

  // 检查 Vite 配置
  console.log('🔧 Vite 配置检查:')
  const viteConfigOk = checkViteConfig()
  if (viteConfigOk) {
    console.log('  ✅ vite.config.ts 包含 Supabase 环境变量配置')
  } else {
    console.log('  ❌ vite.config.ts 缺少 Supabase 环境变量配置')
    allPassed = false
  }
  console.log('')

  // 部署平台提醒
  console.log('🚀 部署平台配置提醒:')
  console.log('  📌 Netlify 部署需要在 Dashboard 中配置以下环境变量:')
  console.log('     - VITE_SUPABASE_URL')
  console.log('     - VITE_SUPABASE_ANON_KEY')
  console.log('     - VITE_AUTHING_APP_ID')
  console.log('     - VITE_AUTHING_HOST')
  console.log('     - VITE_OPENAI_API_KEY')
  console.log('     - VITE_DEEPSEEK_API_KEY')
  console.log('')
  console.log('  🔗 Netlify 环境变量配置地址:')
  console.log('     https://app.netlify.com/sites/[your-site-name]/settings/deploys#environment-variables')
  console.log('')

  // 总结
  if (allPassed) {
    console.log('🎉 所有环境变量检查通过！可以安全部署。')
    console.log('')
    console.log('📋 下一步操作:')
    console.log('1. 确保 Netlify Dashboard 中配置了相同的环境变量')
    console.log('2. 推送代码将自动触发部署')
    console.log('3. 部署完成后访问 https://www.wenpai.xyz 测试功能')
  } else {
    console.log('⚠️  发现配置问题，请修复后再部署。')
    process.exit(1)
  }
}

main()
