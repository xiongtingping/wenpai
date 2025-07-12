/**
 * Emoji提示词生成工具
 * 提供基础情绪列表和prompt构建功能
 */

/**
 * 基础情绪列表
 */
export const baseEmotions = [
  '开心微笑', '大笑', '生气', '哭泣', '惊讶', '疑惑', '睡觉', '吐舌',
  '鼓掌', '比心', '点赞', 'OK 手势', '拒绝', '拍头', '举手提问', '加油',
  '挑眉', '害羞', '眨眼', '黑脸', '鼻涕泡', '流口水', '咀嚼', '偷笑',
  '吓到', '打喷嚏', '爱心眼', '庆祝', '拿红包', '举杯微笑'
];

/**
 * 风格选项
 */
export const styleOptions = [
  { value: 'cute', label: '可爱风格', emoji: '🥰' },
  { value: 'modern', label: '现代简约', emoji: '✨' },
  { value: 'vintage', label: '复古经典', emoji: '📷' },
  { value: 'cartoon', label: '卡通动漫', emoji: '🎨' },
  { value: 'minimalist', label: '极简主义', emoji: '⚪' },
  { value: '3d', label: '3D立体', emoji: '🎯' },
];

/**
 * 复杂度描述
 */
export const complexityLabels = ['简单', '适中', '复杂', '非常复杂', '极度复杂'];

/**
 * 根据品牌和角色描述构建情绪prompt
 * @param characterDesc 角色描述
 * @param brand 品牌名称
 * @returns 情绪prompt数组
 */
export function buildEmotionPrompts(characterDesc: string, brand: string) {
  return baseEmotions.map((emotion) => ({
    emotion,
    prompt: `一个${brand}品牌卡通形象正在${emotion}，${characterDesc}，表情风格为 emoji，扁平卡通风，透明背景`,
  }));
}

/**
 * 生成基础prompt
 * @param uploadedData 上传的数据
 * @param style 风格
 * @returns 基础prompt
 */
export function generateBasePrompt(uploadedData: { image?: File; description?: string } | null, style: string) {
  if (!uploadedData) return '';

  let basePrompt = '';
  const styleLabel = styleOptions.find(s => s.value === style)?.label || '可爱';
  
  if (uploadedData.image) {
    basePrompt = `基于上传的品牌图片，创建一个${styleLabel}的Emoji表情`;
  } else if (uploadedData.description) {
    basePrompt = `基于描述"${uploadedData.description}"，创建一个${styleLabel}的Emoji表情`;
  }

  return basePrompt;
}

/**
 * 生成完整prompt
 * @param uploadedData 上传的数据
 * @param style 风格
 * @param complexity 复杂度
 * @returns 完整prompt
 */
export function generateFullPrompt(
  uploadedData: { image?: File; description?: string } | null,
  style: string,
  complexity: number
) {
  const basePrompt = generateBasePrompt(uploadedData, style);
  const complexityLevel = complexityLabels[complexity - 1];
  
  let fullPrompt = `${basePrompt}，${complexityLevel}程度的设计，`;
  
  // 根据风格添加特定描述
  switch (style) {
    case 'cute':
      fullPrompt += '圆润的线条，温暖的色彩，充满亲和力';
      break;
    case 'modern':
      fullPrompt += '简洁的几何形状，清晰的轮廓，现代感十足';
      break;
    case 'vintage':
      fullPrompt += '复古色调，经典元素，怀旧风格';
      break;
    case 'cartoon':
      fullPrompt += '夸张的表情，鲜艳的色彩，卡通风格';
      break;
    case 'minimalist':
      fullPrompt += '极简设计，单一色彩，简洁明了';
      break;
    case '3d':
      fullPrompt += '立体效果，光影层次，3D渲染风格';
      break;
  }

  return fullPrompt;
}

/**
 * 生成批量情绪prompt
 * @param uploadedData 上传的数据
 * @param style 风格
 * @param complexity 复杂度
 * @param brand 品牌名称
 * @returns 批量prompt数组
 */
export function generateBatchPrompts(
  uploadedData: { image?: File; description?: string } | null,
  style: string,
  complexity: number,
  brand: string = '品牌'
) {
  const characterDesc = uploadedData?.description || '卡通形象';
  const emotionPrompts = buildEmotionPrompts(characterDesc, brand);
  
  return emotionPrompts.map(({ emotion, prompt }) => ({
    emotion,
    prompt: `${prompt}，${styleOptions.find(s => s.value === style)?.label || '可爱'}风格，${complexityLabels[complexity - 1]}程度的设计`
  }));
} 