/**
 * 文件格式支持测试工具
 * 用于验证所有支持的文件格式是否能正常解析内容
 */

import AIAnalysisService from '@/services/aiAnalysisService';

export interface FileFormatTestResult {
  extension: string;
  mimeType: string;
  description: string;
  isSupported: boolean;
  testStatus: 'not_tested' | 'testing' | 'success' | 'error';
  testMessage?: string;
  contentLength?: number;
  sampleContent?: string;
}

export class FileFormatTester {
  private aiService: AIAnalysisService;

  constructor() {
    this.aiService = AIAnalysisService.getInstance();
  }

  /**
   * 获取所有支持的文件格式
   */
  public getSupportedFormats(): FileFormatTestResult[] {
    const supportedTypes = this.aiService.getSupportedFileTypes();
    
    return supportedTypes.map(type => ({
      extension: type.extension,
      mimeType: type.mimeType,
      description: type.description,
      isSupported: true,
      testStatus: 'not_tested'
    }));
  }

  /**
   * 创建测试文件
   */
  private createTestFile(extension: string, mimeType: string): File {
    let content: string | ArrayBuffer;
    let fileName: string;

    switch (extension) {
      case '.txt':
        content = '这是一个测试文本文件。\n包含品牌信息：创新科技公司，专注于人工智能解决方案。';
        fileName = 'test.txt';
        break;
      
      case '.md':
        content = '# 品牌介绍\n\n## 公司概况\n创新科技是一家专注于AI技术的公司。\n\n### 核心价值\n- 创新\n- 专业\n- 可靠';
        fileName = 'test.md';
        break;
      
      case '.csv':
        content = '字段,值\n品牌名称,创新科技\n成立时间,2020年\n主营业务,人工智能';
        fileName = 'test.csv';
        break;
      
      case '.json':
        content = JSON.stringify({
          brandName: '创新科技',
          industry: '人工智能',
          values: ['创新', '专业', '可靠'],
          description: '专注于AI技术的创新公司'
        }, null, 2);
        fileName = 'test.json';
        break;
      
      default:
        // 对于其他格式，创建一个简单的文本内容
        content = `测试文件内容 - ${extension} 格式`;
        fileName = `test${extension}`;
        break;
    }

    // 创建 Blob 和 File 对象
    const blob = new Blob([content], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  }

  /**
   * 测试单个文件格式
   */
  public async testSingleFormat(format: FileFormatTestResult): Promise<FileFormatTestResult> {
    const result = { ...format };
    result.testStatus = 'testing';

    try {
      // 创建测试文件
      const testFile = this.createTestFile(format.extension, format.mimeType);
      
      // 检查文件类型支持
      if (!this.aiService.isFileTypeSupported(testFile)) {
        result.testStatus = 'error';
        result.testMessage = '文件类型检查失败：不支持该格式';
        return result;
      }

      // 尝试读取文件内容
      const content = await this.aiService.readFileContent(testFile);
      
      result.testStatus = 'success';
      result.contentLength = content.length;
      result.sampleContent = content.substring(0, 200) + (content.length > 200 ? '...' : '');
      result.testMessage = `成功解析，内容长度：${content.length} 字符`;

    } catch (error) {
      result.testStatus = 'error';
      result.testMessage = `解析失败：${error instanceof Error ? error.message : '未知错误'}`;
    }

    return result;
  }

  /**
   * 测试所有支持的文件格式
   */
  public async testAllFormats(): Promise<FileFormatTestResult[]> {
    const formats = this.getSupportedFormats();
    const results: FileFormatTestResult[] = [];

    console.log('🧪 开始测试所有支持的文件格式...');

    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      console.log(`📄 测试格式 ${i + 1}/${formats.length}: ${format.extension} (${format.description})`);
      
      try {
        const result = await this.testSingleFormat(format);
        results.push(result);
        
        if (result.testStatus === 'success') {
          console.log(`✅ ${format.extension} 测试成功`);
        } else {
          console.log(`❌ ${format.extension} 测试失败: ${result.testMessage}`);
        }
      } catch (error) {
        console.error(`💥 ${format.extension} 测试异常:`, error);
        results.push({
          ...format,
          testStatus: 'error',
          testMessage: `测试异常：${error instanceof Error ? error.message : '未知错误'}`
        });
      }

      // 添加延迟避免过快处理
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * 生成测试报告
   */
  public generateTestReport(results: FileFormatTestResult[]): string {
    const successCount = results.filter(r => r.testStatus === 'success').length;
    const errorCount = results.filter(r => r.testStatus === 'error').length;
    const totalCount = results.length;

    let report = `# 文件格式支持测试报告\n\n`;
    report += `## 测试概况\n`;
    report += `- 总计测试格式：${totalCount}\n`;
    report += `- 成功解析：${successCount}\n`;
    report += `- 解析失败：${errorCount}\n`;
    report += `- 成功率：${((successCount / totalCount) * 100).toFixed(1)}%\n\n`;

    report += `## 详细结果\n\n`;

    // 成功的格式
    const successResults = results.filter(r => r.testStatus === 'success');
    if (successResults.length > 0) {
      report += `### ✅ 成功解析的格式 (${successResults.length})\n\n`;
      successResults.forEach(result => {
        report += `**${result.extension}** - ${result.description}\n`;
        report += `- MIME类型：${result.mimeType}\n`;
        report += `- 内容长度：${result.contentLength} 字符\n`;
        if (result.sampleContent) {
          report += `- 示例内容：${result.sampleContent}\n`;
        }
        report += `\n`;
      });
    }

    // 失败的格式
    const errorResults = results.filter(r => r.testStatus === 'error');
    if (errorResults.length > 0) {
      report += `### ❌ 解析失败的格式 (${errorResults.length})\n\n`;
      errorResults.forEach(result => {
        report += `**${result.extension}** - ${result.description}\n`;
        report += `- MIME类型：${result.mimeType}\n`;
        report += `- 错误信息：${result.testMessage}\n`;
        report += `\n`;
      });
    }

    return report;
  }

  /**
   * 在控制台输出测试报告
   */
  public async runFullTest(): Promise<void> {
    console.log('🚀 启动文件格式支持完整测试...');
    
    const results = await this.testAllFormats();
    const report = this.generateTestReport(results);
    
    console.log('\n' + '='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
    
    // 返回结果供进一步处理
    return Promise.resolve();
  }
}

export default FileFormatTester;
