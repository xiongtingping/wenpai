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
 * @param uploadedImage 上传的图片文件
 * @returns 情绪prompt数组
 */
export function buildEmotionPrompts(characterDesc: string, brand: string, uploadedImage?: File | null) {
  // 基础品牌描述增强
  const enhancedDesc = characterDesc.trim() || '可爱的卡通形象';
  
  // 构建更详细的提示词模板
  const basePrompt = `一个${brand}品牌的${enhancedDesc}，`;
  
  return baseEmotions.map((emotion) => {
    // 根据不同表情类型构建更具体的描述
    let emotionDesc = '';
    switch (emotion) {
      case '开心微笑':
        emotionDesc = '面带温暖微笑，眼睛弯弯的，表情友好亲切';
        break;
      case '大笑':
        emotionDesc = '开怀大笑，眼睛眯成一条线，露出整齐的牙齿';
        break;
      case '生气':
        emotionDesc = '眉头紧皱，嘴巴抿成一条线，表情严肃但不可怕';
        break;
      case '哭泣':
        emotionDesc = '眼角含泪，嘴巴微微下垂，表情委屈但可爱';
        break;
      case '惊讶':
        emotionDesc = '眼睛睁大，嘴巴微微张开，表情惊讶但有趣';
        break;
      case '疑惑':
        emotionDesc = '歪着头，眉毛微微上扬，表情困惑但可爱';
        break;
      case '睡觉':
        emotionDesc = '闭着眼睛，嘴巴微微张开，表情安详可爱';
        break;
      case '吐舌':
        emotionDesc = '调皮地吐着舌头，眼睛眨着，表情俏皮可爱';
        break;
      case '鼓掌':
        emotionDesc = '双手鼓掌，脸上带着赞许的笑容';
        break;
      case '比心':
        emotionDesc = '双手比心，脸上带着温暖的笑容';
        break;
      case '点赞':
        emotionDesc = '竖起大拇指，脸上带着赞许的表情';
        break;
      case 'OK 手势':
        emotionDesc = '做出OK手势，脸上带着自信的笑容';
        break;
      case '拒绝':
        emotionDesc = '摇头摆手，表情坚定但友好';
        break;
      case '拍头':
        emotionDesc = '轻拍头部，表情恍然大悟';
        break;
      case '举手提问':
        emotionDesc = '举手提问，表情好奇认真';
        break;
      case '加油':
        emotionDesc = '握拳加油，表情充满干劲';
        break;
      case '挑眉':
        emotionDesc = '单边挑眉，表情俏皮有趣';
        break;
      case '害羞':
        emotionDesc = '脸颊微红，低头害羞，表情可爱';
        break;
      case '眨眼':
        emotionDesc = '单眼眨眼，表情俏皮可爱';
        break;
      case '黑脸':
        emotionDesc = '表情严肃，但保持可爱风格';
        break;
      case '鼻涕泡':
        emotionDesc = '鼻子冒泡，表情呆萌可爱';
        break;
      case '流口水':
        emotionDesc = '嘴角流口水，表情馋嘴可爱';
        break;
      case '咀嚼':
        emotionDesc = '嘴巴咀嚼，表情满足可爱';
        break;
      case '偷笑':
        emotionDesc = '偷偷笑着，表情俏皮可爱';
        break;
      case '吓到':
        emotionDesc = '被吓到，表情惊讶但可爱';
        break;
      case '打喷嚏':
        emotionDesc = '打喷嚏，表情可爱';
        break;
      case '爱心眼':
        emotionDesc = '眼睛变成爱心，表情迷恋可爱';
        break;
      case '庆祝':
        emotionDesc = '庆祝动作，表情开心兴奋';
        break;
      case '拿红包':
        emotionDesc = '拿着红包，表情开心满足';
        break;
      case '举杯微笑':
        emotionDesc = '举杯微笑，表情优雅友好';
        break;
      default:
        emotionDesc = `正在${emotion}`;
    }
    
    // 构建完整的提示词
    const fullPrompt = `${basePrompt}${emotionDesc}，表情风格为 emoji，扁平卡通风，透明背景，高质量，细节丰富`;
    
    return {
      emotion,
      prompt: fullPrompt,
    };
  });
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