/**
 * 支付页面无限循环修复验证脚本
 */

console.log('🔧 开始验证支付页面无限循环修复...');

// 检查修复的文件
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const paymentPagePath = path.join(__dirname, 'src', 'pages', 'PaymentPage.tsx');
const pricingSectionPath = path.join(__dirname, 'src', 'components', 'landing', 'PricingSection.tsx');

function checkPaymentPageFix() {
  try {
    const content = fs.readFileSync(paymentPagePath, 'utf8');
    
    console.log('\n📋 检查PaymentPage.tsx修复内容:');
    
    // 检查useEffect依赖数组是否移除了timeLeft
    if (content.includes('}, [currentIsAuthenticated, currentUser?.id, toast]);')) {
      console.log('✅ useEffect依赖数组已移除timeLeft，避免无限循环');
    } else {
      console.log('❌ useEffect依赖数组仍包含timeLeft，可能导致无限循环');
    }
    
    // 检查是否使用了previousTimeLeft来避免依赖timeLeft
    if (content.includes('const previousTimeLeft = timeLeft;')) {
      console.log('✅ 已使用previousTimeLeft来避免依赖timeLeft');
    } else {
      console.log('❌ 未使用previousTimeLeft，可能仍有问题');
    }
    
    // 检查是否导入了正确的工具函数
    if (content.includes('import { isInPromoPeriod, calculateRemainingTime, formatTimeLeft } from "@/utils/paymentTimer";')) {
      console.log('✅ 已导入正确的工具函数');
    } else {
      console.log('❌ 未导入正确的工具函数');
    }
    
  } catch (error) {
    console.error('❌ 读取PaymentPage.tsx失败:', error.message);
  }
}

function checkPricingSectionFix() {
  try {
    const content = fs.readFileSync(pricingSectionPath, 'utf8');
    
    console.log('\n📋 检查PricingSection.tsx修复内容:');
    
    // 检查是否添加了timeLeft状态
    if (content.includes('const [timeLeft, setTimeLeft] = useState(0);')) {
      console.log('✅ 已添加timeLeft状态管理');
    } else {
      console.log('❌ 未添加timeLeft状态管理');
    }
    
    // 检查useEffect是否正确更新状态
    if (content.includes('setTimeLeft(remaining);')) {
      console.log('✅ useEffect正确更新timeLeft状态');
    } else {
      console.log('❌ useEffect未正确更新timeLeft状态');
    }
    
    // 检查依赖数组是否正确
    if (content.includes('}, [isAuthenticated, currentUser?.id]);')) {
      console.log('✅ useEffect依赖数组正确，不包含timeLeft');
    } else {
      console.log('❌ useEffect依赖数组可能有问题');
    }
    
  } catch (error) {
    console.error('❌ 读取PricingSection.tsx失败:', error.message);
  }
}

function checkDevelopmentServer() {
  console.log('\n🌐 检查开发服务器状态:');
  
  import { exec } from 'child_process';
  exec('ps aux | grep "npm run dev" | grep -v grep', (error, stdout, stderr) => {
    if (stdout) {
      console.log('✅ 开发服务器正在运行');
      console.log('📝 进程信息:', stdout.trim());
    } else {
      console.log('❌ 开发服务器未运行');
    }
  });
}

// 执行检查
checkPaymentPageFix();
checkPricingSectionFix();
checkDevelopmentServer();

console.log('\n🎯 修复总结:');
console.log('1. 移除了useEffect依赖数组中的timeLeft，避免无限循环');
console.log('2. 使用previousTimeLeft来检测优惠期结束');
console.log('3. 首页PricingSection添加了正确的状态管理');
console.log('4. 统一使用@/utils/paymentTimer工具函数');

console.log('\n✅ 验证完成！请刷新页面测试是否还有无限循环错误。'); 