/**
 * Supabase设置验证脚本
 * 快速验证配置是否正确
 */

// 检查环境变量
console.log('🔍 检查环境变量配置...')
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || '未设置')
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '已设置 ✅' : '未设置 ❌')
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '已设置 ✅' : '未设置 ❌')

// 验证URL格式
const url = process.env.VITE_SUPABASE_URL
if (url && url.includes('weizkydylskcwgnaieqy.supabase.co')) {
  console.log('✅ Supabase URL 配置正确')
} else {
  console.log('❌ Supabase URL 配置错误')
}

// 验证密钥格式
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (anonKey && anonKey.startsWith('eyJ') && anonKey.includes('weizkydylskcwgnaieqy')) {
  console.log('✅ 匿名密钥配置正确')
} else {
  console.log('❌ 匿名密钥配置错误')
}

console.log('\n🎯 下一步：')
console.log('1. 在Supabase SQL编辑器中执行数据库脚本')
console.log('2. 访问 http://localhost:5175/storage-settings')
console.log('3. 运行连接测试验证功能')
console.log('\n🚀 设置完成后，您就可以享受统一存储系统了！')
