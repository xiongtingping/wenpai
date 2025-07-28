/**
 * 测试多维矩阵提示词系统
 * 验证提示词生成功能是否正常工作
 */

// 模拟测试数据
const testData = {
  originalContent: "今天分享一个超级实用的生活小技巧，让你的日常生活更加便利！",
  platform: "xiaohongshu",
  formId: "lifestyle-sharing",
  style: "real",
  charCount: 300,
  customPrompt: "请加入一些个人体验感受",
  useBrandLibrary: false
};

console.log("🧪 多维矩阵提示词系统测试");
console.log("=" * 50);

console.log("📝 测试数据:");
console.log("原始内容:", testData.originalContent);
console.log("目标平台:", testData.platform);
console.log("内容形式:", testData.formId);
console.log("表达风格:", testData.style);
console.log("字符数限制:", testData.charCount);
console.log("自定义提示词:", testData.customPrompt);
console.log("使用品牌库:", testData.useBrandLibrary);

console.log("\n🎯 预期生成的提示词应包含以下维度:");
console.log("✅ 原始内容维度 - 基础内容分析");
console.log("✅ 目标平台维度 - 小红书特色要求");
console.log("✅ 内容形式维度 - 生活分享结构");
console.log("✅ 表达风格维度 - 真实自然风格");
console.log("✅ 用户自定义维度 - 个人体验感受");
console.log("✅ 字符数控制维度 - 300字符限制");
console.log("✅ 格式化要求维度 - 小红书格式");
console.log("✅ 差异化维度 - 防模板化要求");

console.log("\n🚀 测试方法:");
console.log("1. 打开浏览器访问 http://localhost:5174/adapt");
console.log("2. 在原始内容框中输入测试内容");
console.log("3. 选择小红书平台");
console.log("4. 选择生活分享内容形式");
console.log("5. 选择真实自然风格");
console.log("6. 设置字符数为300");
console.log("7. 输入自定义提示词");
console.log("8. 查看提示词预览区域是否显示完整的多维矩阵提示词");

console.log("\n✅ 成功标准:");
console.log("- 提示词预览区域自动显示");
console.log("- 包含所有8个维度的要求");
console.log("- 参数变化时提示词实时更新");
console.log("- 提示词结构清晰，逻辑完整");
console.log("- 优先级机制正确体现");

console.log("\n🔧 如果测试失败，检查:");
console.log("- 浏览器控制台是否有JavaScript错误");
console.log("- 网络请求是否正常");
console.log("- 函数导入是否正确");
console.log("- 状态更新是否触发");

console.log("\n📋 测试完成后的验证清单:");
console.log("□ 提示词预览功能正常显示");
console.log("□ 实时更新功能正常工作");
console.log("□ 多维矩阵结构完整");
console.log("□ 平台差异化体现明显");
console.log("□ 用户交互体验良好");
console.log("□ 可展开/收起功能正常");

console.log("\n🎉 测试说明:");
console.log("这个多维矩阵提示词系统是AI内容适配器的核心创新功能，");
console.log("它通过8个维度的智能组合，确保生成的内容具有:");
console.log("- 强烈的平台差异化特色");
console.log("- 精确的字符数控制");
console.log("- 个性化的表达风格");
console.log("- 防模板化的创新表达");
console.log("- 品牌一致性保障（如启用品牌库）");

console.log("\n🔮 下一步计划:");
console.log("1. 完成基础功能测试验证");
console.log("2. 优化用户界面和交互体验");
console.log("3. 添加更多平台和内容形式支持");
console.log("4. 集成品牌库高级功能");
console.log("5. 实现批量生成和对比功能");
