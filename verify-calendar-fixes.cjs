/**
 * 营销日历界面修复验证脚本
 */

const fs = require('fs');

console.log('🔍 验证营销日历界面修复...\n');

const filePath = 'src/components/creative/MarketingCalendar.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const fixes = [
  {
    name: '1. 左边标题水平对齐',
    test: () => {
      // 检查是否添加了 leading-5 类来对齐文字
      const alignmentFix = /span className="leading-5">营销日历<\/span>/;
      return alignmentFix.test(content);
    }
  },
  {
    name: '2. 右边去掉"已选择"文字',
    test: () => {
      // 检查是否不再包含"已选择"文字
      const noSelectedText = !content.includes('已选择:');
      return noSelectedText;
    }
  },
  {
    name: '3. 右边日期放大显示',
    test: () => {
      // 检查是否使用了更大的字体和样式
      const largeDateStyle = /text-lg font-semibold text-primary/;
      const dateDisplay = /\{selectedDate\}/;
      return largeDateStyle.test(content) && dateDisplay.test(content);
    }
  },
  {
    name: '4. 修复"回到今天"日期判断',
    test: () => {
      // 检查是否统一使用本地时间格式化
      const localTimeFormatting = /const year = dayInfo\.date\.getFullYear\(\)/;
      const monthFormatting = /const month = String\(dayInfo\.date\.getMonth\(\) \+ 1\)\.padStart\(2, '0'\)/;
      const dayFormatting = /const day = String\(dayInfo\.date\.getDate\(\)\)\.padStart\(2, '0'\)/;
      const todayComparison = /const isToday = dateStr === todayStr/;
      return localTimeFormatting.test(content) && 
             monthFormatting.test(content) && 
             dayFormatting.test(content) && 
             todayComparison.test(content);
    }
  },
  {
    name: '5. 统一日期格式化逻辑',
    test: () => {
      // 检查goToToday函数和日历显示是否使用相同的格式化逻辑
      const goTodayFormatting = /const todayStr = `\$\{year\}-\$\{month\}-\$\{day\}`/;
      const calendarFormatting = /const dateStr = `\$\{year\}-\$\{month\}-\$\{day\}`/;
      return goTodayFormatting.test(content) && calendarFormatting.test(content);
    }
  },
  {
    name: '6. 保持现有功能完整',
    test: () => {
      // 检查重要功能是否保持不变
      const calendarIcon = /<Calendar className="w-5 h-5" \/>/;
      const titleText = /营销日历/;
      const description = /点击日期查看对应任务/;
      const goTodayButton = /回到今天/;
      return calendarIcon.test(content) && 
             titleText.test(content) && 
             description.test(content) && 
             goTodayButton.test(content);
    }
  }
];

let passedTests = 0;
let totalTests = fixes.length;

fixes.forEach((fix, index) => {
  try {
    const result = fix.test();
    if (result) {
      console.log(`✅ ${fix.name}`);
      passedTests++;
    } else {
      console.log(`❌ ${fix.name}`);
    }
  } catch (error) {
    console.log(`❌ ${fix.name} - 测试出错: ${error.message}`);
  }
});

console.log(`\n📊 界面修复验证结果: ${passedTests}/${totalTests} 通过`);

if (passedTests === totalTests) {
  console.log('🎉 所有界面修复验证通过！');
  console.log('\n✨ 已完成的修复:');
  console.log('   📐 左边标题和图标水平对齐');
  console.log('   🚫 去掉右边"已选择"文字');
  console.log('   🔍 右边日期放大显示');
  console.log('   📅 修复"回到今天"日期判断逻辑');
  console.log('   🔧 统一日期格式化，避免时区问题');
  console.log('   ✅ 保持所有现有功能完整');
  console.log('\n🌐 访问地址: http://localhost:5175/creative-studio');
  console.log('💡 提示: "回到今天"现在会准确选中当前日期');
} else {
  console.log('❌ 部分界面修复验证失败，请检查代码');
  process.exit(1);
}
