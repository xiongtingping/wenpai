#!/usr/bin/env node

/**
 * 检查部署状态脚本
 */

import https from 'https'

// 检查网站是否可访问
function checkWebsite(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        status: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 400
      })
    })

    request.on('error', (error) => {
      resolve({
        status: 0,
        success: false,
        error: error.message
      })
    })

    request.setTimeout(10000, () => {
      request.destroy()
      resolve({
        status: 0,
        success: false,
        error: 'Timeout'
      })
    })
  })
}

// 主函数
async function main() {
  console.log('🚀 检查部署状态...\n')

  const sites = [
    { name: '主站', url: 'https://www.wenpai.xyz' },
    { name: '备用域名', url: 'https://wenpaiai.com' }
  ]

  for (const site of sites) {
    console.log(`🔍 检查 ${site.name}: ${site.url}`)
    
    const result = await checkWebsite(site.url)
    
    if (result.success) {
      console.log(`✅ ${site.name} 可访问 (状态码: ${result.status})`)
    } else {
      console.log(`❌ ${site.name} 不可访问 (${result.error || '状态码: ' + result.status})`)
    }
  }

  console.log('\n📋 部署检查完成')
  console.log('\n🎯 如果网站可访问但出现 Supabase 错误，请检查:')
  console.log('1. Netlify Dashboard 中的环境变量配置')
  console.log('2. 确保所有 VITE_SUPABASE_* 变量都已设置')
  console.log('3. 检查 Supabase 项目是否正常运行')
  
  console.log('\n🔗 相关链接:')
  console.log('- Netlify Dashboard: https://app.netlify.com/')
  console.log('- GitHub Actions: https://github.com/xiongtingping/wenpai/actions')
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy')
}

main().catch(console.error)
