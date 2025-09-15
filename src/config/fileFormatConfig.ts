import i18n from '@/i18n';
/**
 * 文件格式支持配置模块
 * 统一管理所有支持的文件格式信息和文案
 */

export interface FileFormatInfo {
  extension: string;
  mimeType: string;
  category: string;
  name: string;
  description: string;
  features: string[];
  limitations?: string[];
  recommendations?: string[];
  parseQuality: 'excellent' | 'good' | 'fair' | 'limited';
  icon: string;
}

/**
 * 文件格式类别定义
 */
export const FILE_CATEGORIES = {
  TEXT: 'text',
  DOCUMENT: 'document', 
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  PDF: 'pdf',
  IMAGE: 'image',
  DATA: 'data'
} as const;

/**
 * 文件格式类别中文名称
 */
export const CATEGORY_NAMES = {
  [FILE_CATEGORIES.TEXT]: i18n.t('config.text.文本格式_te9'),
  [FILE_CATEGORIES.DOCUMENT]: 'Word文档',
  [FILE_CATEGORIES.SPREADSHEET]: 'Excel表格',
  [FILE_CATEGORIES.PRESENTATION]: 'PowerPoint演示',
  [FILE_CATEGORIES.PDF]: 'PDF文档',
  [FILE_CATEGORIES.IMAGE]: '图片格式',
  [FILE_CATEGORIES.DATA]: i18n.t('config.text.数据格式_z5l')
} as const;

/**
 * 完整的文件格式支持配置
 */
export const SUPPORTED_FILE_FORMATS: FileFormatInfo[] = [
  // 📝 文本格式
  {
    extension: '.txt',
    mimeType: 'text/plain',
    category: FILE_CATEGORIES.TEXT,
    name: '纯文本文件',
    description: '最通用的文本格式，兼容性最佳',
    features: [
      '解析速度最快',
      '100%准确率',
      '支持所有字符编码',
      '无格式限制'
    ],
    parseQuality: 'excellent',
    icon: '📄'
  },
  {
    extension: '.md',
    mimeType: 'text/markdown',
    category: FILE_CATEGORIES.TEXT,
    name: 'Markdown文档',
    description: '轻量级标记语言，支持格式化文本',
    features: [
      '保留文档结构',
      '支持标题层级',
      '解析标记语法',
      '适合技术文档'
    ],
    parseQuality: 'excellent',
    icon: '📝'
  },
  {
    extension: '.csv',
    mimeType: 'text/csv',
    category: FILE_CATEGORIES.TEXT,
    name: 'CSV表格文件',
    description: '逗号分隔值格式，适合结构化数据',
    features: [
      '表格数据解析',
      '自动识别分隔符',
      '支持多列数据',
      '兼容Excel导出'
    ],
    parseQuality: 'excellent',
    icon: '📊'
  },

  // 📄 Word文档格式
  {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: FILE_CATEGORIES.DOCUMENT,
    name: 'Word文档',
    description: '微软Word现代格式，功能最全面',
    features: [
      '提取纯文本内容',
      '保留段落结构',
      '支持表格数据',
      '处理复杂格式'
    ],
    parseQuality: 'excellent',
    icon: '📘'
  },
  {
    extension: '.doc',
    mimeType: 'application/msword',
    category: FILE_CATEGORIES.DOCUMENT,
    name: 'Word文档（旧版）',
    description: '微软Word传统格式，广泛兼容',
    features: [
      '兼容旧版Word',
      '提取文本内容',
      '支持基础格式',
      '稳定解析'
    ],
    limitations: [
      '部分复杂格式可能丢失',
      '建议升级为.docx格式'
    ],
    parseQuality: 'good',
    icon: '📙'
  },

  // 📊 Excel表格格式
  {
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: FILE_CATEGORIES.SPREADSHEET,
    name: 'Excel表格',
    description: '微软Excel现代格式，数据处理首选',
    features: [
      '多工作表支持',
      '表格数据转文本',
      '公式结果提取',
      '数据结构保留'
    ],
    parseQuality: 'excellent',
    icon: '📗'
  },
  {
    extension: '.xls',
    mimeType: 'application/vnd.ms-excel',
    category: FILE_CATEGORIES.SPREADSHEET,
    name: 'Excel表格（旧版）',
    description: '微软Excel传统格式，兼容性好',
    features: [
      '兼容旧版Excel',
      '基础表格解析',
      '数据提取稳定',
      '格式转换自动'
    ],
    limitations: [
      '部分新功能不支持',
      '建议升级为.xlsx格式'
    ],
    parseQuality: 'good',
    icon: '📒'
  },

  // 🎯 PowerPoint演示格式
  {
    extension: '.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: FILE_CATEGORIES.PRESENTATION,
    name: 'PowerPoint演示文稿',
    description: '微软PowerPoint现代格式，支持文本提取',
    features: [
      '多幻灯片解析',
      '文本内容提取',
      'XML结构解析',
      '标题正文识别'
    ],
    limitations: [
      '主要提取文字内容',
      '图表内容可能缺失',
      '复杂动画不支持'
    ],
    recommendations: [
      '确保幻灯片包含文字内容',
      '避免纯图片幻灯片',
      '重要信息建议用文字表达'
    ],
    parseQuality: 'good',
    icon: '🎯'
  },
  {
    extension: '.ppt',
    mimeType: 'application/vnd.ms-powerpoint',
    category: FILE_CATEGORIES.PRESENTATION,
    name: 'PowerPoint演示文稿（旧版）',
    description: '微软PowerPoint传统格式，建议格式转换',
    features: [
      '格式识别支持',
      '转换建议提供',
      '兼容性检查'
    ],
    limitations: [
      '二进制格式复杂',
      '直接解析困难',
      '需要格式转换'
    ],
    recommendations: [
      '另存为.pptx格式后重新上传',
      '复制内容到Word文档',
      '导出为PDF格式',
      '手动输入关键内容'
    ],
    parseQuality: 'limited',
    icon: '🎪'
  },

  // 📋 PDF文档格式
  {
    extension: '.pdf',
    mimeType: 'application/pdf',
    category: FILE_CATEGORIES.PDF,
    name: 'PDF文档',
    description: '便携式文档格式，无页数限制完整解析',
    features: [
      '无页数限制解析',
      '逐页文本提取',
      '进度实时显示',
      '大文件优化处理',
      '错误自动恢复'
    ],
    limitations: [
      '依赖PDF文本层质量',
      '扫描版PDF效果有限',
      '复杂排版可能影响顺序'
    ],
    recommendations: [
      '使用文本版PDF效果最佳',
      '避免纯扫描版PDF',
      '大文件请耐心等待',
      '如解析失败建议转换为Word格式'
    ],
    parseQuality: 'good',
    icon: '📋'
  },

  // 🖼️ 图片格式（OCR支持）
  {
    extension: '.jpg',
    mimeType: 'image/jpeg',
    category: FILE_CATEGORIES.IMAGE,
    name: 'JPEG图片',
    description: '最常用的图片格式，支持OCR文字识别',
    features: [
      'OCR文字识别',
      '中英文混合支持',
      '自动图像优化',
      '文字区域检测'
    ],
    limitations: [
      '依赖图片清晰度',
      '文字对比度要求高',
      '复杂背景影响识别'
    ],
    recommendations: [
      '确保图片清晰',
      '文字与背景对比度高',
      '避免倾斜或模糊',
      '单色背景效果最佳'
    ],
    parseQuality: 'fair',
    icon: '🖼️'
  },
  {
    extension: '.jpeg',
    mimeType: 'image/jpeg',
    category: FILE_CATEGORIES.IMAGE,
    name: 'JPEG图片',
    description: 'JPEG格式图片，支持OCR文字识别',
    features: [
      'OCR文字识别',
      '中英文混合支持',
      '自动图像优化',
      '文字区域检测'
    ],
    limitations: [
      '依赖图片清晰度',
      '文字对比度要求高',
      '复杂背景影响识别'
    ],
    recommendations: [
      '确保图片清晰',
      '文字与背景对比度高',
      '避免倾斜或模糊',
      '单色背景效果最佳'
    ],
    parseQuality: 'fair',
    icon: '🖼️'
  },
  {
    extension: '.png',
    mimeType: 'image/png',
    category: FILE_CATEGORIES.IMAGE,
    name: 'PNG图片',
    description: '无损压缩图片格式，OCR识别效果好',
    features: [
      'OCR文字识别',
      '无损图像质量',
      '透明背景支持',
      '高清晰度保持'
    ],
    limitations: [
      '文件体积较大',
      '需要清晰文字内容'
    ],
    recommendations: [
      'PNG格式OCR效果通常最佳',
      '适合截图和扫描文档',
      '保持原始分辨率'
    ],
    parseQuality: 'good',
    icon: '🖼️'
  },
  {
    extension: '.gif',
    mimeType: 'image/gif',
    category: FILE_CATEGORIES.IMAGE,
    name: 'GIF图片',
    description: 'GIF格式图片，支持静态图片OCR',
    features: [
      'OCR文字识别',
      '静态帧提取',
      '基础文字识别'
    ],
    limitations: [
      '仅处理静态内容',
      '动画帧不处理',
      '色彩限制影响识别'
    ],
    recommendations: [
      '建议使用静态GIF',
      '转换为PNG格式效果更佳'
    ],
    parseQuality: 'fair',
    icon: '🎭'
  },
  {
    extension: '.bmp',
    mimeType: 'image/bmp',
    category: FILE_CATEGORIES.IMAGE,
    name: 'BMP图片',
    description: '位图格式，无压缩高质量OCR',
    features: [
      'OCR文字识别',
      '无压缩高质量',
      '像素级精确度'
    ],
    limitations: [
      '文件体积很大',
      '传输效率低'
    ],
    recommendations: [
      '适合高质量文档扫描',
      '建议转换为PNG格式'
    ],
    parseQuality: 'good',
    icon: '🖼️'
  },
  {
    extension: '.webp',
    mimeType: 'image/webp',
    category: FILE_CATEGORIES.IMAGE,
    name: 'WebP图片',
    description: '现代图片格式，高压缩比OCR支持',
    features: [
      'OCR文字识别',
      '高压缩比',
      '现代浏览器支持',
      '质量与体积平衡'
    ],
    limitations: [
      '部分旧系统不支持',
      'OCR兼容性一般'
    ],
    recommendations: [
      '现代格式，识别效果良好',
      '如有问题建议转换为PNG'
    ],
    parseQuality: 'good',
    icon: '🌐'
  },

  // 📊 数据格式
  {
    extension: '.json',
    mimeType: 'application/json',
    category: FILE_CATEGORIES.DATA,
    name: 'JSON数据文件',
    description: 'JavaScript对象表示法，结构化数据首选',
    features: [
      '结构化数据解析',
      '嵌套对象支持',
      '数组数据处理',
      '键值对提取'
    ],
    parseQuality: 'excellent',
    icon: '📊'
  }
];

/**
 * 根据类别获取文件格式
 */
export function getFormatsByCategory(category: string): FileFormatInfo[] {
  return SUPPORTED_FILE_FORMATS.filter(format => format.category === category);
}

/**
 * 根据扩展名获取文件格式信息
 */
export function getFormatByExtension(extension: string): FileFormatInfo | undefined {
  return SUPPORTED_FILE_FORMATS.find(format => format.extension === extension);
}

/**
 * 获取所有支持的扩展名
 */
export function getAllSupportedExtensions(): string[] {
  return SUPPORTED_FILE_FORMATS.map(format => format.extension);
}

/**
 * 获取所有支持的MIME类型
 */
export function getAllSupportedMimeTypes(): string[] {
  return SUPPORTED_FILE_FORMATS.map(format => format.mimeType);
}

/**
 * 按类别分组的格式信息
 */
export function getFormatsGroupedByCategory(): Record<string, FileFormatInfo[]> {
  const grouped: Record<string, FileFormatInfo[]> = {};
  
  Object.values(FILE_CATEGORIES).forEach(category => {
    grouped[category] = getFormatsByCategory(category);
  });
  
  return grouped;
}

/**
 * 生成格式支持说明文案
 */
export function generateFormatSupportDescription(): string {
  const groupedFormats = getFormatsGroupedByCategory();
  let description = '📁 支持的文件格式 (共 ' + SUPPORTED_FILE_FORMATS.length + ' 种):\n\n';
  
  Object.entries(groupedFormats).forEach(([category, formats]) => {
    if (formats.length === 0) return;
    
    const categoryName = CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES];
    description += `${formats[0].icon} **${categoryName}** (${formats.length}种):\n`;
    
    formats.forEach(format => {
      const qualityIcon = {
        excellent: '🟢',
        good: '🟡', 
        fair: '🟠',
        limited: '🔴'
      }[format.parseQuality];
      
      description += `  • ${format.extension} - ${format.name} ${qualityIcon}\n`;
    });
    description += '\n';
  });
  
  return description;
}

export default SUPPORTED_FILE_FORMATS;
