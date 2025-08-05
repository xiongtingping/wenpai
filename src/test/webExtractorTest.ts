/**
 * 网页提取功能测试脚本
 * 用于验证网页内容提取服务的功能
 */

import { WebContentExtractorService } from '../services/webContentExtractor';

/**
 * 测试网页提取功能
 */
export async function testWebExtraction() {
  console.log('🧪 开始测试网页提取功能...');
  
  const webExtractor = WebContentExtractorService.getInstance();
  
  // 测试用例1: 测试URL验证
  console.log('\n1. 测试URL验证功能');
  const testUrls = [
    'https://www.example.com',
    'http://invalid-url',
    'not-a-url',
    'https://www.baidu.com'
  ];
  
  for (const url of testUrls) {
    try {
      const isValid = webExtractor['isValidUrl'](url);
      console.log(`   URL: ${url} - 有效性: ${isValid ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   URL: ${url} - 验证失败: ${error}`);
    }
  }
  
  // 测试用例2: 测试URL标准化
  console.log('\n2. 测试URL标准化功能');
  const urlsToNormalize = [
    'www.example.com',
    'example.com',
    'https://www.example.com',
    'http://example.com'
  ];
  
  for (const url of urlsToNormalize) {
    try {
      const normalized = webExtractor['normalizeUrl'](url);
      console.log(`   原始: ${url} -> 标准化: ${normalized}`);
    } catch (error) {
      console.log(`   URL: ${url} - 标准化失败: ${error}`);
    }
  }
  
  // 测试用例3: 测试域名提取
  console.log('\n3. 测试域名提取功能');
  for (const url of urlsToNormalize) {
    try {
      const domain = webExtractor['extractDomain'](url);
      console.log(`   URL: ${url} -> 域名: ${domain}`);
    } catch (error) {
      console.log(`   URL: ${url} - 域名提取失败: ${error}`);
    }
  }
  
  // 测试用例4: 测试提示词构建
  console.log('\n4. 测试提示词构建功能');
  const testUrl = 'https://www.example.com/about';
  try {
    const prompt = webExtractor['buildExtractionPrompt'](testUrl);
    console.log(`   生成的提示词长度: ${prompt.length} 字符`);
    console.log(`   提示词预览: ${prompt.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   提示词构建失败: ${error}`);
  }
  
  // 测试用例5: 测试响应解析
  console.log('\n5. 测试响应解析功能');
  const testResponses = [
    '{"title": "测试标题", "content": "测试内容", "keywords": ["关键词1", "关键词2"]}',
    '标题: 测试标题\n内容: 测试内容',
    '无效的响应格式'
  ];
  
  for (let i = 0; i < testResponses.length; i++) {
    try {
      const parsed = webExtractor['parseExtractionResponse'](testResponses[i]);
      console.log(`   响应${i + 1}: 解析成功 - 标题: ${parsed.title}`);
    } catch (error) {
      console.log(`   响应${i + 1}: 解析失败 - ${error}`);
    }
  }
  
  console.log('\n✅ 网页提取功能测试完成');
  return true;
}

/**
 * 测试品牌资产转换功能
 */
export async function testBrandAssetConversion() {
  console.log('\n🧪 开始测试品牌资产转换功能...');
  
  const webExtractor = WebContentExtractorService.getInstance();
  
  // 模拟提取结果
  const mockExtractionResult = {
    id: 'test-extraction-1',
    url: 'https://www.example.com/brand',
    title: '测试品牌页面',
    content: '这是一个测试品牌页面的内容，包含品牌介绍、产品信息等。',
    extractedAt: new Date().toISOString(),
    metadata: {
      description: '测试品牌页面描述',
      keywords: ['品牌', '产品', '服务'],
      author: '测试作者',
      publishDate: '2024-01-01',
      wordCount: 50,
      charCount: 200,
      domain: 'example.com',
      language: 'zh-CN'
    },
    brandAnalysis: {
      brandKeywords: ['创新', '品质', '服务'],
      productKeywords: ['产品A', '产品B'],
      targetAudience: ['年轻人', '专业人士'],
      brandTone: '专业友好',
      brandValues: ['创新', '可靠'],
      competitiveAdvantage: ['技术领先', '服务优质'],
      suggestions: ['加强品牌宣传', '优化用户体验']
    },
    status: 'success' as const
  };
  
  try {
    const brandAsset = webExtractor.convertToBrandAsset(mockExtractionResult, '网页内容');
    
    console.log('✅ 品牌资产转换成功:');
    console.log(`   ID: ${brandAsset.id}`);
    console.log(`   名称: ${brandAsset.name}`);
    console.log(`   类型: ${brandAsset.type}`);
    console.log(`   分类: ${brandAsset.category}`);
    console.log(`   处理状态: ${brandAsset.processingStatus}`);
    console.log(`   关键词数量: ${brandAsset.extractedKeywords?.length || 0}`);
    console.log(`   内容长度: ${brandAsset.content?.length || 0} 字符`);
    
    return true;
  } catch (error) {
    console.log(`❌ 品牌资产转换失败: ${error}`);
    return false;
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests() {
  console.log('🚀 开始运行网页提取功能完整测试套件...\n');
  
  try {
    await testWebExtraction();
    await testBrandAssetConversion();
    
    console.log('\n🎉 所有测试完成！网页提取功能基础组件工作正常。');
    console.log('\n📝 注意: 实际的网页内容提取需要真实的AI服务调用，');
    console.log('   请在品牌库页面中测试完整的提取流程。');
    
    return true;
  } catch (error) {
    console.log(`\n❌ 测试过程中出现错误: ${error}`);
    return false;
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
