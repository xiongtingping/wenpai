/**
 * 文件格式支持服务
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { SUPPORTED_FILE_FORMATS, getAllSupportedExtensions, getAllSupportedMimeTypes, getFormatByExtension, getFormatsGroupedByCategory, CATEGORY_NAMES, generateFormatSupportDescription, FileFormatInfo } from '@/config/fileFormatConfig';

interface FileFormatCheckResult {
  isSupported: boolean;
  reason?: string;
  suggestions?: string[];
  formatInfo?: any; // 🔧 FIXED: 添加缺失的formatInfo属性
}

interface FileFormatSummary {
  totalFormats: number;
  categoryCounts: Record<string, number>;
  supportLevels: Record<string, number>;
  description: string;
}

export class FileFormatSupportService {
  /**
   * 获取支持的文件类型列表
   */
  public getSupportedFileTypes(): Array<{
    extension: string;
    mimeType: string;
    description: string;
  }> {
    return SUPPORTED_FILE_FORMATS.map(format => ({
      extension: format.extension,
      mimeType: format.mimeType,
      description: format.name
    }));
  }

  /**
   * 检查文件是否支持
   */
  public isFileTypeSupported(file: File): boolean {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const supportedExtensions = getAllSupportedExtensions();
    const supportedMimeTypes = getAllSupportedMimeTypes();
    
    // 检查扩展名
    const isExtensionSupported = supportedExtensions.includes(fileExtension);
    
    // 检查MIME类型
    const isMimeTypeSupported = supportedMimeTypes.some(mimeType => 
      file.type === mimeType || file.type.includes(fileExtension.slice(1))
    );
    
    return isExtensionSupported || isMimeTypeSupported;
  }

  /**
   * 详细检查文件格式支持情况
   */
  public checkFileFormatSupport(file: File): FileFormatCheckResult {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const formatInfo = getFormatByExtension(fileExtension);
    
    if (!formatInfo) {
      return {
        isSupported: false,
        reason: `不支持的文件格式: ${fileExtension}`,
        suggestions: [
          '请检查文件扩展名是否正确',
          '尝试转换为支持的格式',
          '查看支持的格式列表'
        ]
      };
    }

    // 检查MIME类型匹配
    if (file.type && file.type !== formatInfo.mimeType) {
      console.warn(`MIMEtypenot match: 期望 ${formatInfo.mimeType}, 实际 ${file.type}`);
    }

    return {
      isSupported: true,
      formatInfo,
      reason: `支持的${formatInfo.name}格式`
    };
  }

  /**
   * 获取文件格式详细信息
   */
  public getFileFormatInfo(file: File): FileFormatInfo | null {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return getFormatByExtension(fileExtension) || null;
  }

  /**
   * 获取格式支持摘要
   */
  public getFormatSupportSummary(): FileFormatSummary {
    const groupedFormats = getFormatsGroupedByCategory();
    const categoryCounts: Record<string, number> = {};
    const supportLevels: Record<string, number> = {
      excellent: 0,
      good: 0,
      fair: 0,
      limited: 0
    };

    // 统计各类别数量
    Object.entries(groupedFormats).forEach(([category, formats]) => {
      const categoryName = CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES];
      categoryCounts[categoryName] = formats.length;
      
      // 统计支持质量级别
      formats.forEach(format => {
        supportLevels[format.parseQuality]++;
      });
    });

    return {
      totalFormats: SUPPORTED_FILE_FORMATS.length,
      categoryCounts,
      supportLevels,
      description: generateFormatSupportDescription()
    };
  }

  /**
   * 生成用户友好的格式支持说明
   */
  public generateUserFriendlyDescription(): string {
    const summary = this.getFormatSupportSummary();
    
    let description = `🎯 **文件上传支持** (共${summary.totalFormats}种格式)\n\n`;
    
    // 按支持质量分类说明
    description += `📊 **解析质量说明**:\n`;
    description += `🟢 完美支持 (${summary.supportLevels.excellent}种) - 100%准确解析\n`;
    description += `🟡 良好支持 (${summary.supportLevels.good}种) - 高质量解析\n`;
    description += `🟠 基础支持 (${summary.supportLevels.fair}种) - OCR识别\n`;
    description += `🔴 有限支持 (${summary.supportLevels.limited}种) - 需要转换\n\n`;
    
    // 推荐使用格式
    description += `💡 **推荐格式** (解析效果最佳):\n`;
    description += `• 📄 文本文件: .txt, .md\n`;
    description += `• 📘 Word文档: .docx\n`;
    description += `• 📗 Excel表格: .xlsx\n`;
    description += `• 📋 PDF文档: 无页数限制\n`;
    description += `• 🎯 PowerPoint: .pptx (新增支持)\n\n`;
    
    // 特殊说明
    description += `⚠️ **特殊说明**:\n`;
    description += `• PDF文档: 已移除10页限制，支持完整解析\n`;
    description += `• PowerPoint: .pptx支持文本提取，.ppt建议转换\n`;
    description += `• 图片格式: 支持OCR文字识别，需要清晰文字\n`;
    description += `• 大文件: 系统会显示解析进度，请耐心等待\n`;
    
    return description;
  }

  /**
   * 获取文件上传提示文案
   */
  public getUploadHintText(): string {
    return `文档、表格、演示、文本、图片等格式，支持批量上传和网页内容提取`;
  }

  /**
   * 获取文件格式过滤器（用于文件选择对话框）
   */
  public getFileAcceptString(): string {
    const extensions = getAllSupportedExtensions();
    const mimeTypes = getAllSupportedMimeTypes();
    
    // 组合扩展名和MIME类型
    return [...extensions, ...mimeTypes].join(',');
  }

  /**
   * 验证并提供文件格式建议
   */
  public validateAndSuggest(file: File): {
    isValid: boolean;
    message: string;
    suggestions?: string[];
    formatInfo?: FileFormatInfo;
  } {
    const checkResult = this.checkFileFormatSupport(file);
    
    if (!checkResult.isSupported) {
      return {
        isValid: false,
        message: checkResult.reason || 'u64cdu4f5cu5931u8d25',
        suggestions: checkResult.suggestions
      };
    }

    const formatInfo = checkResult.formatInfo!;
    let message = `✅ ${formatInfo.name} - ${formatInfo.description}`;
    
    // 添加质量说明
    const qualityMap: Record<string, string> = {
      excellent: '完美解析',
      good: '高质量解析',
      fair: 'OCR识别',
      limited: '需要转换'
    };
    const qualityText = qualityMap[formatInfo.parseQuality] || '未知质量';
    
    message += ` (${qualityText})`;
    
    // 添加建议
    let suggestions: string[] = [];
    if (formatInfo.recommendations) {
      suggestions = formatInfo.recommendations;
    }
    
    if (formatInfo.limitations) {
      suggestions.push(...formatInfo.limitations.map((limit: any) => `注意: ${limit}`));
    }

    return {
      isValid: true,
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      formatInfo
    };
  }

  /**
   * 获取
   */
  public getModuleLockInfo(): string {
    return `

⚠️  本模块统一管理所有文件格式支持逻辑，
📋 如需修改，请提交变更说明并通过审查
🚫 禁止复制本模块逻辑到其他文件
📞 如有问题，请联系开发负责人
    `.trim();
  }
}

// 🔧 FIXED: 移除单例模式，改为导出类和默认实例
export default new FileFormatSupportService();
