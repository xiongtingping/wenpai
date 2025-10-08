#!/usr/bin/env node
/**
 * 测试 create-order 端点
 * 用于快速诊断支付订单创建问题
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testLocalEndpoint() {
  section('测试本地 create-order 端点');
  
  const testPayload = {
    userId: 'test_user_' + Date.now(),
    userEmail: 'test@example.com',
    productName: '测试产品',
    productType: 'professional',
    durationType: 'monthly',
    amount: 0.01,
    payType: 'alipay'
  };

  log('\n📋 测试负载:', 'yellow');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    log('\n🔄 发送请求到本地端点...', 'blue');
    const response = await fetch('http://localhost:8888/.netlify/functions/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    log(`\n📡 响应状态: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');

    const responseText = await response.text();
    
    try {
      const responseData = JSON.parse(responseText);
      log('\n📦 响应数据:', 'yellow');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.error) {
        log(`\n❌ 错误: ${responseData.error}`, 'red');
        if (responseData.details) {
          log(`   详情: ${responseData.details}`, 'yellow');
        }
        if (responseData.hint) {
          log(`   提示: ${responseData.hint}`, 'cyan');
        }
        return false;
      } else if (responseData.success) {
        log('\n✅ 订单创建成功!', 'green');
        log(`   订单ID: ${responseData.orderId}`, 'cyan');
        return true;
      }
    } catch {
      log('\n📄 响应内容 (非JSON):', 'yellow');
      console.log(responseText.substring(0, 1000));
      return false;
    }

    return response.ok;
  } catch (error) {
    log(`\n❌ 请求失败: ${error.message}`, 'red');
    
    if (error.message.includes('ECONNREFUSED')) {
      log('\n💡 提示:', 'yellow');
      log('   本地开发服务器未运行', 'yellow');
      log('   请先运行: npm run dev', 'cyan');
    }
    
    return false;
  }
}

async function testProductionEndpoint() {
  section('测试生产环境 create-order 端点');
  
  const testPayload = {
    userId: 'test_user_' + Date.now(),
    userEmail: 'test@example.com',
    productName: '测试产品',
    productType: 'professional',
    durationType: 'monthly',
    amount: 0.01,
    payType: 'alipay'
  };

  log('\n📋 测试负载:', 'yellow');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    log('\n🔄 发送请求到生产环境...', 'blue');
    const response = await fetch('https://www.wenpai.xyz/.netlify/functions/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    log(`\n📡 响应状态: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');

    const responseText = await response.text();
    
    try {
      const responseData = JSON.parse(responseText);
      log('\n📦 响应数据:', 'yellow');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.error) {
        log(`\n❌ 错误: ${responseData.error}`, 'red');
        if (responseData.details) {
          log(`   详情: ${responseData.details}`, 'yellow');
        }
        if (responseData.hint) {
          log(`   提示: ${responseData.hint}`, 'cyan');
        }
        
        // 根据错误提示给出建议
        if (responseData.hint?.includes('BufPay')) {
          log('\n🔧 建议检查:', 'cyan');
          log('   1. Netlify 环境变量中的 BUFPAY_SECRET_KEY', 'yellow');
          log('   2. BufPay API 是否可访问', 'yellow');
        } else if (responseData.hint?.includes('数据库')) {
          log('\n🔧 建议检查:', 'cyan');
          log('   1. Netlify 环境变量中的 SUPABASE_URL', 'yellow');
          log('   2. Netlify 环境变量中的 SUPABASE_SERVICE_ROLE_KEY', 'yellow');
          log('   3. Supabase orders 表是否存在', 'yellow');
        }
        
        return false;
      } else if (responseData.success) {
        log('\n✅ 订单创建成功!', 'green');
        log(`   订单ID: ${responseData.orderId}`, 'cyan');
        return true;
      }
    } catch {
      log('\n📄 响应内容 (非JSON):', 'yellow');
      console.log(responseText.substring(0, 1000));
      return false;
    }

    return response.ok;
  } catch (error) {
    log(`\n❌ 请求失败: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🧪 开始测试 create-order 端点...', 'cyan');
  
  // 询问测试哪个环境
  const args = process.argv.slice(2);
  const env = args[0] || 'production';
  
  let success = false;
  
  if (env === 'local') {
    success = await testLocalEndpoint();
  } else if (env === 'production') {
    success = await testProductionEndpoint();
  } else if (env === 'both') {
    log('\n测试本地环境:', 'cyan');
    const localSuccess = await testLocalEndpoint();
    
    log('\n测试生产环境:', 'cyan');
    const prodSuccess = await testProductionEndpoint();
    
    success = localSuccess && prodSuccess;
  } else {
    log(`\n❌ 未知环境: ${env}`, 'red');
    log('\n用法:', 'yellow');
    log('  node scripts/test-create-order.mjs [local|production|both]', 'cyan');
    log('\n示例:', 'yellow');
    log('  node scripts/test-create-order.mjs production  # 测试生产环境', 'cyan');
    log('  node scripts/test-create-order.mjs local       # 测试本地环境', 'cyan');
    log('  node scripts/test-create-order.mjs both        # 测试两个环境', 'cyan');
    process.exit(1);
  }
  
  section('测试总结');
  
  if (success) {
    log('✅ 所有测试通过', 'green');
    process.exit(0);
  } else {
    log('❌ 测试失败，请查看上述错误信息', 'red');
    log('\n📝 下一步:', 'yellow');
    log('1. 查看 Netlify Functions 日志获取详细错误', 'cyan');
    log('2. 检查环境变量配置', 'cyan');
    log('3. 验证 Supabase 数据库连接', 'cyan');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ 测试脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

