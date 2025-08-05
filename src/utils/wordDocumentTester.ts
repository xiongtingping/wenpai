/**
 * Word文档解析测试工具
 * 用于测试和调试Word文档解析功能
 */

import mammoth from 'mammoth';

export interface WordTestResult {
  success: boolean;
  content?: string;
  error?: string;
  fileInfo: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
  parseInfo?: {
    textLength: number;
    hasWarnings: boolean;
    warnings?: string[];
  };
}

export class WordDocumentTester {
  /**
   * 测试Word文档解析
   */
  public async testWordDocument(file: File): Promise<WordTestResult> {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    const result: WordTestResult = {
      success: false,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: fileExtension
      }
    };

    try {
      console.log(`🧪 开始测试Word文档解析: ${file.name}`);
      console.log(`📋 文件信息:`, result.fileInfo);

      // 检查文件类型
      const isWordFile = this.isWordDocument(file, fileExtension);
      if (!isWordFile) {
        result.error = '不是有效的Word文档格式';
        return result;
      }

      // 读取文件为ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // 使用mammoth解析
      const mammothResult = await mammoth.extractRawText({ 
        arrayBuffer,
        convertImage: mammoth.images.ignoreAll,
        includeDefaultStyleMap: true
      });

      const extractedText = mammothResult.value.trim();
      
      if (!extractedText) {
        result.error = '文档内容为空或无法提取文本';
        return result;
      }

      result.success = true;
      result.content = extractedText;
      result.parseInfo = {
        textLength: extractedText.length,
        hasWarnings: mammothResult.messages && mammothResult.messages.length > 0,
        warnings: mammothResult.messages?.map(msg => msg.message) || []
      };

      console.log(`✅ Word文档解析成功:`, result.parseInfo);
      return result;

    } catch (error) {
      console.error('❌ Word文档解析失败:', error);
      result.error = error instanceof Error ? error.message : '未知错误';
      return result;
    }
  }

  /**
   * 检查是否为Word文档
   */
  private isWordDocument(file: File, extension: string): boolean {
    const wordMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-word'
    ];

    const wordExtensions = ['.docx', '.doc'];

    const isMimeTypeMatch = wordMimeTypes.includes(file.type) || 
                           file.type.includes('word') || 
                           file.type.includes('document');
    
    const isExtensionMatch = wordExtensions.includes(extension);

    console.log(`🔍 Word文档检查:`, {
      mimeType: file.type,
      extension,
      isMimeTypeMatch,
      isExtensionMatch
    });

    return isMimeTypeMatch || isExtensionMatch;
  }

  /**
   * 读取文件为ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('文件读取结果不是ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 生成测试报告
   */
  public generateTestReport(results: WordTestResult[]): string {
    const totalTests = results.length;
    const successCount = results.filter(r => r.success).length;
    const failureCount = totalTests - successCount;

    let report = `📊 Word文档解析测试报告\n`;
    report += `=`.repeat(40) + '\n\n';
    report += `📈 测试统计:\n`;
    report += `• 总测试数: ${totalTests}\n`;
    report += `• 成功解析: ${successCount} (${((successCount/totalTests)*100).toFixed(1)}%)\n`;
    report += `• 解析失败: ${failureCount} (${((failureCount/totalTests)*100).toFixed(1)}%)\n\n`;

    if (results.length > 0) {
      report += `📋 详细结果:\n`;
      results.forEach((result, index) => {
        report += `\n${index + 1}. ${result.fileInfo.name}\n`;
        report += `   📁 大小: ${(result.fileInfo.size / 1024).toFixed(2)} KB\n`;
        report += `   🏷️ 类型: ${result.fileInfo.type || '未知'}\n`;
        report += `   📎 扩展名: ${result.fileInfo.extension}\n`;
        
        if (result.success) {
          report += `   ✅ 解析成功\n`;
          report += `   📝 文本长度: ${result.parseInfo?.textLength || 0} 字符\n`;
          if (result.parseInfo?.hasWarnings) {
            report += `   ⚠️ 警告: ${result.parseInfo.warnings?.join(', ')}\n`;
          }
        } else {
          report += `   ❌ 解析失败: ${result.error}\n`;
        }
      });
    }

    report += `\n💡 使用建议:\n`;
    report += `• 推荐使用 .docx 格式，兼容性最佳\n`;
    report += `• 避免使用过于复杂的格式和嵌入对象\n`;
    report += `• 如解析失败，尝试用Word重新保存文档\n`;
    report += `• 可以复制文档内容到纯文本文件作为备选方案\n`;

    return report;
  }

  /**
   * 创建测试用的Word文档内容
   */
  public createTestWordContent(): string {
    return `品牌测试文档

这是一个用于测试Word文档解析功能的示例文档。

品牌信息：
• 品牌名称：创新科技公司
• 品牌理念：科技改变生活
• 核心价值：创新、品质、服务

产品特色：
1. 高科技产品研发
2. 用户体验优先
3. 持续创新迭代

联系方式：
电话：400-123-4567
邮箱：info@example.com
网址：www.example.com

这个文档包含了中英文混合内容，用于测试mammoth.js的解析能力。`;
  }
}

export default WordDocumentTester;
