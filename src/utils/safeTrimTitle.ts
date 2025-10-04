/**
 * ✅ V3.4 安全标题裁剪函数 - 增强版
 * 🎯 专门处理语义完整性，避免残词和未闭合表达，增加语序异常检测和词边界识别
 * @param title 原始标题
 * @param maxLength 最大字符数
 * @returns 裁剪后的标题
 */
export function safeTrimTitle(title: string, maxLength: number): string {
  // 1. 基础清理
  let clean = title
    .replace(/[、,.;，。；、]+$/, '')  // 移除末尾标点
    .replace(/[…\.]+$/, '')           // 移除省略号
    .replace(/(文|工|图|说|表)$/g, '') // 移除常见残词
    .trim();

  // 2. 语序异常检测和修正
  const brokenPatterns = [
    /让我小红书(.*)/,
    /小红书优化(.*)/,
    /工具帮我(.*)/,
    /发现宝藏AI(.*)/,
    /优化关键(.*)/,
    /台、文(.*)/,
    /小红书优化关键(.*)/,
    /工具帮我小红书(.*)/,
    /让我小红书优化(.*)/,
    /小红书优化工具(.*)/,
    /工具帮我优化(.*)/,
    /优化小红书(.*)/,
    /小红书工具(.*)/,
    /工具小红书(.*)/,
    /小红书帮我(.*)/,
    /帮我小红书(.*)/,
    /优化小红书工具(.*)/,
    /小红书工具帮我(.*)/,
    /工具小红书优化(.*)/,
    /优化工具小红书(.*)/
  ];

  // 移除语序异常的结构
  for (const pattern of brokenPatterns) {
    if (pattern.test(clean)) {
      clean = clean.replace(pattern, '').trim();
    }
  }

  // 3. 如果清理后长度符合要求，直接返回
  if (clean.length <= maxLength) {
    return clean;
  }

  // 4. 智能寻找截断点 - 优先在自然边界处截断
  let trimmed = findBestCutoffPoint(clean, maxLength);

  // 5. 处理未闭合词 - 更全面的残词列表
  const badEnds = [
    '、', '的', '是', '我', '和', '让', '要', '在', '对', '为', '把', '给', '向',
    '从', '到', '由', '被', '得', '着', '过', '了', '吗', '呢', '啊', '哦', '吧',
    '这', '那', '它', '他', '她', '们', '个', '种', '些', '点', '下', '上', '里',
    '外', '前', '后', '左', '右', '中', '间', '边', '面', '方', '向', '位', '处',
    '时', '分', '秒', '年', '月', '日', '周', '期', '次', '回', '遍', '趟',
    '件', '条', '张', '片', '块', '本', '册', '页', '章', '节', '段', '句', '词',
    '字', '号', '名', '称', '码', '数', '量', '度', '级', '等', '类', '型',
    '式', '样', '态', '状', '况', '情', '形', '势', '力', '能', '功', '效',
    '果', '用', '处', '途', '路', '道', '法', '术', '技', '艺', '学', '科',
    '研', '究', '探', '索', '寻', '找', '求', '追', '赶', '超', '越', '经',
    '历', '验', '证', '明', '确', '定', '决', '断', '判', '评', '估', '测', '试',
    '实', '现', '表', '达', '示', '说', '讲', '谈', '论', '议',
    '讨', '辩', '争', '吵', '闹', '嚷', '叫', '喊', '呼', '唤', '召', '集',
    '聚', '合', '并', '联', '结', '组', '织', '构', '建', '造', '制', '作',
    '创', '发', '明', '到', '获', '收',
    '取', '拿', '抓', '握', '持'
  ];

  // 6. 循环移除未闭合词，直到找到合适的结尾
  while (badEnds.includes(trimmed[trimmed.length - 1])) {
    trimmed = trimmed.slice(0, -1);

    // 防止过度裁剪
    if (trimmed.length < maxLength * 0.7) {
      break;
    }
  }

  // 7. 再次检查语序异常（防止截断后产生新的语序问题）
  for (const pattern of brokenPatterns) {
    if (pattern.test(trimmed)) {
      trimmed = trimmed.replace(pattern, '').trim();
    }
  }

  // 8. 确保结果不为空
  if (trimmed.length === 0) {
    console.warn('⚠️ safeTrimTitle: 裁剪后标题为空，使用默认标题');
    return '智能生成标题';
  }

  return trimmed;
}

/**
 * 寻找最佳截断点 - 在自然边界处截断
 * 优先级: 句号 > 感叹号/问号 > 逗号 > 顿号 > 空格 > 强制截断
 */
function findBestCutoffPoint(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 在maxLength范围内寻找自然边界
  const searchRange = text.slice(0, maxLength);

  // 定义边界优先级
  const boundaries = [
    { char: '。', priority: 1 },
    { char: '！', priority: 2 },
    { char: '？', priority: 2 },
    { char: '，', priority: 3 },
    { char: '、', priority: 4 },
    { char: ' ', priority: 5 },
  ];

  let bestCutoff = maxLength;
  let bestPriority = 999;

  // 从后往前搜索，找到优先级最高的边界
  for (const boundary of boundaries) {
    const lastIndex = searchRange.lastIndexOf(boundary.char);

    // 确保截断点不会太靠前（至少保留70%的长度）
    if (lastIndex > maxLength * 0.7 && boundary.priority < bestPriority) {
      bestCutoff = lastIndex;
      bestPriority = boundary.priority;
    }
  }

  return text.slice(0, bestCutoff);
}

/**
 * 检测标题是否有截断问题
 */
export function detectTruncationIssues(title: string): {
  hasTruncation: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const issues: string[] = [];

  // 1. 检查句子未闭合
  const incompleteSentence = /[^。！？]$/.test(title);
  if (incompleteSentence) {
    const lastChar = title[title.length - 1];
    if (['、', '，', '的', '了', '在', '和', '让', '要'].includes(lastChar)) {
      issues.push('句子未闭合，存在断尾现象');
    }
  }

  // 2. 检查语义不完整
  const semanticIncomplete = /...(工|文|台|内容|创作|优化|帮我|让我)$/.test(title);
  if (semanticIncomplete) {
    issues.push('语义不完整，可能被截断');
  }

  // 3. 检查结构断裂
  const structureBroken = title.includes('…') || /\.\.\.$/.test(title);
  if (structureBroken) {
    issues.push('结构断裂，包含省略号');
  }

  // 4. 检查缺乏收束
  const lackEnding = !/[。！？了的吧呢啊]$/.test(title);
  if (lackEnding && title.length > 10) {
    issues.push('缺乏自然收束');
  }

  // 5. 检查语序异常
  const brokenOrder = /让我小红书|工具帮我小|优化关键|台、文/.test(title);
  if (brokenOrder) {
    issues.push('语序异常，可能是截断导致');
  }

  // 判断严重程度
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (issues.length >= 3) {
    severity = 'high';
  } else if (issues.length >= 2) {
    severity = 'medium';
  }

  return {
    hasTruncation: issues.length > 0,
    issues,
    severity
  };
}

/**
 * 修复截断标题
 */
export function fixTruncatedTitle(title: string, maxLength: number): string {
  // 先检测问题
  const detection = detectTruncationIssues(title);

  if (!detection.hasTruncation) {
    // 没有问题，但仍然应用安全裁剪
    return safeTrimTitle(title, maxLength);
  }

  console.log(`🔧 检测到标题截断问题 (${detection.severity}): ${detection.issues.join(', ')}`);

  // 应用修复
  let fixed = title;

  // 1. 移除省略号和断尾
  fixed = fixed.replace(/[…\.]+$/, '');

  // 2. 移除不完整的词组
  fixed = fixed.replace(/[工文台内容创作优化帮我让我]$/, '');

  // 3. 移除语序异常部分
  const brokenPatterns = [
    /让我小红书.*/,
    /工具帮我小.*/,
    /优化关键.*/,
    /台、文.*/
  ];

  for (const pattern of brokenPatterns) {
    fixed = fixed.replace(pattern, '');
  }

  // 4. 应用安全裁剪
  fixed = safeTrimTitle(fixed.trim(), maxLength);

  console.log(`✅ 标题修复完成: "${title}" -> "${fixed}"`);

  return fixed;
}
