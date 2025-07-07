/**
 * 九宫格创意魔方组件 - 优化版
 * 支持多维度深度融合，生成可用创意内容
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles,
  RefreshCw,
  Copy,
  Save,
  Lightbulb,
  Target,
  Users,
  MapPin,
  AlertTriangle,
  Heart,
  Star,
  Zap,
  Plus,
  Trash2,
  Shuffle,
  Download,
  FileText,
  Video,
  Music,
  Camera,
  Clock,
  Building2,
  AlertCircle,
  Palette,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 九宫格维度定义
 */
interface CubeDimension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultItems: string[];
}

/**
 * 创意组合结果
 */
interface CreativeResult {
  id: string;
  combination: Record<string, string>;
  generatedContent: string;
  contentType: 'text' | 'video';
  timestamp: string;
  tags: string[];
}

/**
 * 短视频分镜脚本
 */
interface VideoScript {
  sceneNumber: string;
  sceneDescription: string;
  dialogue: string;
  tone: string;
  emotion: string;
  bgm: string;
  soundEffect: string;
  shotType: string;
  duration: number;
}

/**
 * 九宫格创意魔方组件
 * @returns React 组件
 */
export function CreativeCube() {
  const { toast } = useToast();
  
  // 九宫格维度定义
  const dimensions: CubeDimension[] = [
    {
      id: 'target_audience',
      name: '目标客群',
      description: '选择目标用户群体（必选）',
      icon: <Users className="w-4 h-4" />,
      defaultItems: ['宝妈', '大学生', '银发族', '职场人', '中产女性', 'Z世代', '宠物主', '健身人群', 'K12家长', '二次元', '科技控', '新手创业者']
    },
    {
      id: 'use_case',
      name: '使用场景',
      description: '选择内容应用的具体场景（必选）',
      icon: <MapPin className="w-4 h-4" />,
      defaultItems: ['通勤', '健身', '夜宵', '家庭聚会', '旅游途中', '碎片时间', '出差', '露营', '独处时刻', '早晚高峰', '带娃时', '睡前']
    },
    {
      id: 'pain_point',
      name: '用户痛点',
      description: '选择用户面临的核心痛点（必选）',
      icon: <AlertCircle className="w-4 h-4" />,
      defaultItems: ['时间不够', '预算不足', '操作复杂', '选择困难', '效果不稳', '信息过载', '服务差', '信任缺失', '缺乏动力', '内容同质化']
    },
    {
      id: 'industry',
      name: '行业',
      description: '选择内容所属的行业领域（必选）',
      icon: <Building2 className="w-4 h-4" />,
      defaultItems: ['母婴', '美妆', '旅游', '健康', '教育', '职场', '电商', '本地生活', '宠物', '数码', '食品饮料', '健身', '金融理财']
    },
    {
      id: 'core_value',
      name: '核心价值',
      description: '选择解决方案的核心价值（推荐）',
      icon: <Star className="w-4 h-4" />,
      defaultItems: ['提升效率', '改善体验', '节约成本', '增强信任', '拓宽视野', '激发灵感', '个性表达', '提高品质', '促进成长']
    },
    {
      id: 'tone_style',
      name: '表达风格',
      description: '选择内容的表达风格（推荐）',
      icon: <Palette className="w-4 h-4" />,
      defaultItems: ['轻松幽默', '极简干练', '专业可信', '情感共鸣', '反差反转', '热梗混剪', '小剧场', '第一人称', '旁白式', '访谈感']
    },
    {
      id: 'content_format',
      name: '内容形式',
      description: '选择内容的表现形式（推荐）',
      icon: <FileText className="w-4 h-4" />,
      defaultItems: ['图文', '短视频', '直播', 'H5', '长图', '故事接龙', '清单类', '榜单类', '分镜脚本']
    },
    {
      id: 'emotional_need',
      name: '情感诉求',
      description: '选择要激发的情感共鸣（可选）',
      icon: <Heart className="w-4 h-4" />,
      defaultItems: ['安全感', '归属感', '成就感', '愉悦感', '陪伴感', '放松感', '被理解', '被尊重', '掌控感', '仪式感']
    },
    {
      id: 'platform_or_trend',
      name: '平台/趋势',
      description: '选择要结合的平台或趋势（可选）',
      icon: <TrendingUp className="w-4 h-4" />,
      defaultItems: ['小红书', '抖音', '知乎', '公众号', '搭子经济', '反向旅游', '高质量独居', '无糖生活', 'AI助理', '低欲望生活']
    }
  ];

  // 状态管理
  const [cubeData, setCubeData] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [generatedIdeas, setGeneratedIdeas] = useState<CreativeResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentContentType, setCurrentContentType] = useState<'text' | 'video'>('text');
  const [videoScript, setVideoScript] = useState<VideoScript[]>([]);

  // 必选维度检查
  const requiredDimensions = ['target_audience', 'use_case', 'pain_point', 'industry'];
  
  /**
   * 检查必选维度是否已选择
   */
  const checkRequiredDimensions = () => {
    const missingDimensions = requiredDimensions.filter(dim => !selectedItems[dim]);
    return {
      isValid: missingDimensions.length === 0,
      missing: missingDimensions
    };
  };

  /**
   * 获取维度选择状态
   */
  const getDimensionStatus = (dimensionId: string) => {
    const isRequired = requiredDimensions.includes(dimensionId);
    const isSelected = !!selectedItems[dimensionId];
    const isRecommended = ['core_value', 'tone_style', 'content_format'].includes(dimensionId);
    const isOptional = ['emotional_need', 'platform_or_trend'].includes(dimensionId);
    
    return {
      isRequired,
      isSelected,
      isRecommended,
      isOptional,
      status: isRequired ? (isSelected ? 'required-selected' : 'required-missing') : 
              isRecommended ? (isSelected ? 'recommended-selected' : 'recommended') :
              isOptional ? (isSelected ? 'optional-selected' : 'optional') : 'optional'
    };
  };

  /**
   * 初始化九宫格数据
   */
  useEffect(() => {
    const initialData: Record<string, string[]> = {};
    dimensions.forEach(dim => {
      initialData[dim.id] = [...dim.defaultItems];
    });
    setCubeData(initialData);
  }, [dimensions]);

  /**
   * 添加新项目到九宫格
   */
  const addItemToCube = (dimensionId: string, newItem: string) => {
    if (!newItem.trim()) return;
    
    setCubeData(prev => ({
      ...prev,
      [dimensionId]: [...(prev[dimensionId] || []), newItem.trim()]
    }));
  };

  /**
   * 智能随机生成 - 保持用户选择，随机其他维度
   */
  const smartRandomGenerate = () => {
    const newSelection: Record<string, string> = { ...selectedItems };
    dimensions.forEach(dim => {
      // 如果用户没有选择这个维度，则随机选择
      if (!selectedItems[dim.id]) {
        const items = cubeData[dim.id] || [];
        if (items.length > 0) {
          const randomIndex = Math.floor(Math.random() * items.length);
          newSelection[dim.id] = items[randomIndex];
        }
      }
    });
    setSelectedItems(newSelection);
  };

  /**
   * 构建AI Prompt
   */
  const buildPrompt = () => {
    const {
      target_audience = '目标客群',
      use_case = '使用场景',
      pain_point = '用户痛点',
      emotional_need = '情感诉求',
      core_value = '核心价值',
      industry = '行业',
      content_format = '内容形式',
      tone_style = '表达风格',
      platform_or_trend = '平台/趋势'
    } = selectedItems;

    return `请根据以下多维度配置生成一段用于【朋友圈】或【小红书】的图文内容，风格为【${tone_style}】，内容形式为【${content_format}】。必须严格使用以下所有维度信息，并避免使用"提升效率""提供安全感"等模板式话术，要求生活化、真实感强、带网络热梗、情境代入强。

维度：
- 目标客群：${target_audience}
- 使用场景：${use_case}
- 用户痛点：${pain_point}
- 行业：${industry}
- 核心价值：${core_value}
- 表达风格：${tone_style}
- 内容形式：${content_format}
- 情感诉求：${emotional_need}
- 平台/趋势：${platform_or_trend}

输出要求：
1. 标题：突出情境与人设冲突
2. 正文：必须展现真实生活情境 + 人物吐槽 + 转折解决方案
3. 互动引导：鼓励用户留言、点赞、共鸣
4. 避免"核心概念/策略分析"等空话模板
5. 内容输出控制在 150-200 字之间，符合社交平台阅读节奏
6. 多使用emoji表情，提升阅读情绪节奏

请直接输出创意内容，而非策略说明。`;
  };

  /**
   * 生成图文内容
   */
  const generateTextContent = (prompt: string) => {
    const { target_audience, use_case, pain_point, tone_style, core_value, emotional_need, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    // 根据调性生成不同风格的内容
    if (tone_style === '轻松幽默') {
      return generateHumorousContent();
    } else {
      return generateStandardContent();
    }
  };

  /**
   * 生成行业特色标签
   */
  const getIndustryTags = () => {
    const { industry } = selectedItems;
    const industryTags = {
      '母婴': ['#宝妈日常', '#育儿经验', '#省钱妙招', '#亲子时光'],
      '美妆': ['#美妆分享', '#护肤心得', '#变美秘籍', '#美妆测评'],
      '旅游': ['#旅行攻略', '#省钱旅游', '#旅行日记', '#穷游风也能很美'],
      '健康': ['#健康生活', '#养生心得', '#健康管理', '#科学养生'],
      '教育': ['#学习充电', '#提分秘籍', '#家长必看', '#教育投资'],
      '职场': ['#职场心得', '#工作效率', '#职场技能', '#职业发展'],
      '电商': ['#购物分享', '#省钱攻略', '#好物推荐', '#购物清单'],
      '本地生活': ['#本地美食', '#生活服务', '#城市探索', '#生活便利'],
      '宠物': ['#萌宠日常', '#铲屎官必看', '#宠物健康', '#宠物互动'],
      '数码': ['#数码测评', '#科技分享', '#数码生活', '#智能设备'],
      '食品饮料': ['#美食分享', '#吃货日常', '#健康饮食', '#美食测评'],
      '健身': ['#健身打卡', '#运动装备', '#健康塑形', '#燃脂计划'],
      '金融理财': ['#理财规划', '#投资理财', '#财富管理', '#理财心得']
    };
    
    return industryTags[industry] || ['#生活分享', '#实用技巧', '#经验分享'];
  };

  /**
   * 生成轻松幽默风格内容
   */
  const generateHumorousContent = () => {
    const { target_audience, use_case, pain_point, core_value, emotional_need, industry } = selectedItems;
    
    // 背景设定：基于行业+场景的真实情境
    const getBackgroundSetting = () => {
      const backgrounds = {
        '旅游': {
          '通勤': `${target_audience}通勤路上，地铁挤得像沙丁鱼罐头😵‍💫`,
          '旅游途中': `${target_audience}旅游途中，钱包瘦了一圈💸`,
          '出差': `${target_audience}出差回来，行李箱比心情还重😅`
        },
        '母婴': {
          '带娃时': `${target_audience}带娃日常，奶粉尿布比黄金还贵💰`,
          '家庭聚会': `${target_audience}家庭聚会，装备比搬家还多🎒`,
          '睡前': `${target_audience}睡前哄娃，比加班还累😴`
        },
        '美妆': {
          '通勤': `${target_audience}通勤化妆，地铁上补妆像杂技表演🎭`,
          '夜宵': `${target_audience}夜宵后卸妆，比上班还认真🧴`,
          '独处时刻': `${target_audience}独处时刻，护肤比约会还精致💄`
        },
        '健康': {
          '健身': `${target_audience}健身打卡，肌肉比钱包还瘦💪`,
          '碎片时间': `${target_audience}碎片时间养生，比工作还忙🏃‍♀️`,
          '睡前': `${target_audience}睡前养生，比考试还紧张😰`
        }
      };
      
      return backgrounds[industry]?.[use_case] || 
        `${target_audience}在${use_case}中遇到${pain_point}，简直让人崩溃😫`;
    };

    // 人设代入：融入目标用户特征
    const getCharacterSetting = () => {
      const characters = {
        '宝妈': '带娃出门就是大型物流现场，装备比搬家还多🎒',
        '大学生': '学习压力大到想躺平，但钱包不允许😅',
        '银发族': '退休生活本应轻松，但物价上涨让人焦虑😰',
        '职场人': '工作忙到连喝水的时间都没有，咖啡当饭吃☕',
        '中产女性': '精致生活不易，钱包在哭泣💸',
        'Z世代': '年轻人压力山大，但依然要精致生活✨',
        '宠物主': '铲屎官日常，比上班还累🐱',
        '健身人群': '健身路上坑太多，钱包比肌肉还瘦💪',
        'K12家长': '辅导作业血压飙升，比工作还累📚',
        '二次元': '二次元世界太美好，现实太残酷😭',
        '科技控': '科技产品更新太快，钱包跟不上节奏💻',
        '新手创业者': '创业路上坑太多，钱包比脸还干净💸'
      };
      
      return characters[target_audience] || `${target_audience}的日常就是各种挑战`;
    };

    // 冲突点设定：具体化痛点
    const getConflictPoint = () => {
      const conflicts = {
        '时间不够': '时间去哪了我不知道，但洗衣机确实等不了我！⏰',
        '预算不足': '预算不足？钱包在哭泣，心在滴血💸',
        '操作复杂': '操作复杂到连说明书都看不懂😤',
        '选择困难': '选择困难症发作，纠结到天荒地老🤔',
        '效果不稳': '效果不稳，比天气预报还不可靠🌦️',
        '信息过载': '信息多到脑子要爆炸💥',
        '服务差': '服务差到想投诉，但又懒得动😪',
        '信任缺失': '信任度低到连自己都不信自己😰',
        '缺乏动力': '缺乏动力，比咸鱼还咸🐟',
        '内容同质化': '内容同质化，比复制粘贴还无聊📋'
      };
      
      return conflicts[pain_point] || `${pain_point}？简直让人崩溃！`;
    };

    // 解决方案设定：具体化价值
    const getSolution = () => {
      const solutions = {
        '提升效率': `好在我发现了${core_value}神器，效率直接起飞🚀`,
        '改善体验': `有了${core_value}，体验直接升级，太香了！🌟`,
        '节约成本': `通过${core_value}，钱包终于不用哭泣了💰`,
        '增强信任': `${core_value}建立信任，安全感满满🛡️`,
        '拓宽视野': `${core_value}拓宽视野，眼界大开👀`,
        '激发灵感': `${core_value}激发灵感，创意爆棚💡`,
        '个性表达': `${core_value}个性表达，独一无二✨`,
        '提高品质': `${core_value}提高品质，生活更美好🎉`,
        '促进成长': `${core_value}促进成长，进步神速📈`
      };
      
      return solutions[core_value] || `通过${core_value}，问题迎刃而解！`;
    };

    const background = getBackgroundSetting();
    const character = getCharacterSetting();
    const conflict = getConflictPoint();
    const solution = getSolution();
    const tags = getIndustryTags().join(' ');

    return `📱 ${target_audience}专属爆梗文案

【标题】
${generateHumorousTitle()}

【正文】
${background}

${character}

${conflict}

${solution}

不用当超人，也能搞定${use_case}的突发事件。

谁说${target_audience}不能松口气？我偏要让${core_value}带我飞～

【互动引导】
${generateHumorousCallToAction()}

${tags}`;
  };

  /**
   * 生成轻松幽默标题
   */
  const generateHumorousTitle = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    const titleTemplates = {
      '旅游': {
        '通勤': `"通勤路上钱包瘦了"——${target_audience}的省钱秘籍💰`,
        '旅游途中': `"旅游途中钱包瘦了"——${target_audience}的旅行攻略🌟`,
        '出差': `"出差回来行李箱重了"——${target_audience}的出差日记📝`
      },
      '母婴': {
        '带娃时': `"带娃日常奶粉尿布贵"——${target_audience}的育儿日记👶`,
        '家庭聚会': `"家庭聚会装备多"——${target_audience}的聚会攻略🎉`,
        '睡前': `"睡前哄娃比加班累"——${target_audience}的带娃日记😴`
      },
      '美妆': {
        '通勤': `"通勤化妆地铁补妆"——${target_audience}的通勤日记🎭`,
        '夜宵': `"夜宵后卸妆比上班认真"——${target_audience}的护肤日记🧴`,
        '独处时刻': `"独处时刻护肤比约会精致"——${target_audience}的护肤日记💄`
      },
      '健康': {
        '健身': `"健身打卡肌肉比钱包瘦"——${target_audience}的健身日记💪`,
        '碎片时间': `"碎片时间养生比工作忙"——${target_audience}的养生日记🏃‍♀️`,
        '睡前': `"睡前养生比考试紧张"——${target_audience}的养生日记😰`
      }
    };
    
    return titleTemplates[industry]?.[use_case] || 
      `"${pain_point}太崩溃"——${target_audience}的${core_value}秘籍✨`;
  };

  /**
   * 生成轻松幽默互动引导
   */
  const generateHumorousCallToAction = () => {
    const { target_audience, use_case, pain_point, industry } = selectedItems;
    
    const callToActions = {
      '旅游': `你有过被旅游价格劝退的瞬间吗？留言告诉我你的省钱妙招！✈️`,
      '母婴': `带娃路上有什么省钱妙招？宝妈们快来分享！👶`,
      '美妆': `你最近发现什么平价好物？快来种草！💄`,
      '健康': `你有什么养生小妙招？求分享！🏥`,
      '教育': `你辅导作业时血压最高到多少？来评论区吐槽一下！📚`,
      '职场': `你工作中有哪些效率神器？求推荐！💼`,
      '电商': `你最近买过什么好物？快来安利！🛒`,
      '本地生活': `你发现什么本地好去处？求推荐！🏠`,
      '宠物': `铲屎官们有什么省钱妙招？求推荐！🐱`,
      '数码': `你用过最省心的数码产品是什么？求推荐！💻`,
      '食品饮料': `你最近发现什么省钱美食？快来安利给我！🍜`,
      '健身': `你有什么健身省钱攻略？来分享一下！💪`,
      '金融理财': `你最近有什么理财心得？来分享一下！💰`
    };
    
    return callToActions[industry] || 
      `你在${use_case}中遇到过${pain_point}吗？来评论区吐槽一下！😄`;
  };

  /**
   * 生成标准风格内容
   */
  const generateStandardContent = () => {
    const { target_audience, use_case, pain_point, core_value, emotional_need, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    return `📱 ${target_audience}专属文案

【标题】
${generateStandardTitle()}

【正文】
在${use_case}中，${target_audience}常常面临${pain_point}的困扰。

${emotional_need ? `这种挑战不仅影响日常体验，更让人感到${emotional_need}。` : ''}

${core_value ? `然而，通过${core_value}，我们可以有效解决这些问题。` : '我们可以提供有效的解决方案。'}

${generateIndustrySpecificContent()}

【互动引导】
${generateStandardCallToAction()}

#${target_audience} #${use_case} #${industry}`;
  };

  /**
   * 生成标准标题
   */
  const generateStandardTitle = () => {
    const { target_audience, use_case, pain_point, core_value } = selectedItems;
    return `${target_audience}的${use_case}新选择：用${core_value}解决${pain_point}`;
  };

  /**
   * 生成行业特定内容
   */
  const generateIndustrySpecificContent = () => {
    const { industry, target_audience, core_value } = selectedItems;
    
    const industryContent = {
      '母婴': `在育儿过程中，${core_value}为${target_audience}提供贴心的服务和解决方案。`,
      '美妆': `在个人形象塑造中，${core_value}帮助${target_audience}展现最佳状态。`,
      '旅游': `无论是家庭出游还是商务出行，${core_value}都能为${target_audience}提供更优质的旅行体验。`,
      '健康': `在健康管理中，${core_value}为${target_audience}提供科学的健康指导。`,
      '教育': `在学习和成长的道路上，${core_value}为${target_audience}提供专业支持和指导。`,
      '职场': `在职业发展中，${core_value}帮助${target_audience}提升工作效率和职业竞争力。`,
      '电商': `在购物体验中，${core_value}为${target_audience}提供便捷的购物服务。`,
      '本地生活': `在日常生活中，${core_value}为${target_audience}提供便利的生活服务。`,
      '宠物': `在宠物护理中，${core_value}为${target_audience}提供贴心的宠物服务。`,
      '数码': `在数字化时代，${core_value}帮助${target_audience}提升科技生活品质。`,
      '食品饮料': `从日常饮食到社交聚会，${core_value}让${target_audience}享受更美好的用餐体验。`,
      '健身': `在健康塑形中，${core_value}帮助${target_audience}实现健身目标。`,
      '金融理财': `在理财规划中，${core_value}为${target_audience}提供专业的金融服务。`
    };
    
    return industryContent[industry] || 
      `通过${core_value}，${target_audience}能够获得更好的体验和服务。`;
  };

  /**
   * 生成标准互动引导
   */
  const generateStandardCallToAction = () => {
    const { target_audience, use_case, core_value } = selectedItems;
    return `你是否也在${use_case}中遇到过类似问题？欢迎分享你的经验和想法，让我们一起探讨如何通过${core_value}改善生活品质。`;
  };

  /**
   * 生成短视频脚本
   */
  const generateVideoScript = (prompt: string) => {
    const { target_audience, use_case, pain_point, tone_style, core_value, emotional_need, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    // 根据调性生成不同风格的脚本
    if (tone_style === '轻松幽默') {
      return generateHumorousVideoScript();
    } else {
      return generateStandardVideoScript();
    }
  };

  /**
   * 生成轻松幽默短视频脚本
   */
  const generateHumorousVideoScript = () => {
    const { target_audience, use_case, pain_point, core_value, emotional_need, industry } = selectedItems;
    
    // 场景设定
    const getVideoSetting = () => {
      const settings = {
        '旅游': {
          '通勤': '地铁车厢，上班族对着手机屏幕叹气',
          '旅游途中': '旅游景点，游客们排队等待拍照',
          '出差': '机场，出差人士拖着行李箱赶飞机'
        },
        '母婴': {
          '带娃时': '婴儿房，宝妈抱着宝宝哄睡',
          '家庭聚会': '客厅，家庭成员围坐聊天',
          '睡前': '卧室，宝妈和宝宝一起躺在床上'
        },
        '美妆': {
          '通勤': '地铁站，白领们匆忙补妆',
          '夜宵': '夜市，年轻人吃夜宵卸妆',
          '独处时刻': '卧室，女生对着镜子护肤'
        },
        '健康': {
          '健身': '健身房，健身人士在跑步机上挥汗如雨',
          '碎片时间': '公交车上，乘客们低头看手机',
          '睡前': '卧室，学生或职场人士在床上看书'
        }
      };
      
      return settings[industry]?.[use_case] || `${use_case}场景，${target_audience}在忙碌`;
    };

    // 镜头脚本
    const getShotScript = () => {
      const shots = {
        '旅游': [
          '镜头1：特写手机屏幕，显示机票价格，表情震惊',
          '镜头2：全景地铁车厢，上班族瘫在座位上叹气',
          '镜头3：特写钱包，里面只有几张零钱',
          '镜头4：中景，上班族拿起手机，表情从沮丧到惊喜',
          '镜头5：特写手机屏幕，显示省钱攻略',
          '镜头6：全景，上班族开心地规划旅行'
        ],
        '母婴': [
          '镜头1：特写婴儿用品，价格标签昂贵',
          '镜头2：中景，宝妈抱着宝宝，表情疲惫',
          '镜头3：特写手机，显示育儿省钱攻略',
          '镜头4：中景，宝妈开心地购物',
          '镜头5：特写宝宝，表情可爱',
          '镜头6：全景，温馨的亲子时光'
        ],
        '美妆': [
          '镜头1：特写化妆品价格标签，价格昂贵',
          '镜头2：中景，女生对着镜子化妆，表情无奈',
          '镜头3：特写手机，显示美妆省钱APP',
          '镜头4：中景，女生开心地挑选化妆品',
          '镜头5：特写化妆过程，效果展示',
          '镜头6：全景，女生自信地展示妆容'
        ],
        '健康': [
          '镜头1：特写健身房价格表，费用昂贵',
          '镜头2：中景，健身人士在跑步机上，表情疲惫',
          '镜头3：特写手机，显示健康管理APP',
          '镜头4：中景，健身人士开心地运动',
          '镜头5：特写运动效果，身材变化',
          '镜头6：全景，健康活力的生活状态'
        ]
      };
      
      return shots[industry] || [
        '镜头1：特写问题场景，表现痛点',
        '镜头2：中景，用户表情困扰',
        '镜头3：特写解决方案，手机屏幕',
        '镜头4：中景，用户表情转变',
        '镜头5：特写效果展示',
        '镜头6：全景，问题解决后的满足感'
      ];
    };

    // 台词脚本
    const getDialogueScript = () => {
      const dialogues = {
        '旅游': [
          '旁白：通勤路上，钱包瘦了一圈💸',
          '上班族：旅游途中，消费比工资还高😵‍💫',
          '旁白：好在——发现了省钱旅游神器✨',
          '上班族：出差也能省下一大笔💰',
          '旁白：省下的钱，拿来享受生活，不香吗？！',
          '上班族：省钱小妙招，告别"旅游破产"，旅行梦我们慢慢来🌟'
        ],
        '母婴': [
          '旁白：带娃日常，奶粉尿布比黄金还贵💰',
          '宝妈：家庭聚会，装备比搬家还多🎒',
          '旁白：好在——发现了育儿省钱神器✨',
          '宝妈：睡前哄娃，比加班还累😴',
          '旁白：省下的钱，拿来买更多玩具，不香吗？！',
          '宝妈：省钱小妙招，告别"育儿破产"，带娃梦我们慢慢来🌟'
        ],
        '美妆': [
          '旁白：通勤化妆，地铁上补妆像杂技表演🎭',
          '女生：夜宵后卸妆，比上班还认真🧴',
          '旁白：好在——发现了美妆省钱神器✨',
          '女生：独处时刻护肤，比约会还精致💄',
          '旁白：省下的钱，拿来买更多化妆品，不香吗？！',
          '女生：省钱小妙招，告别"美妆破产"，变美梦我们慢慢来🌟'
        ],
        '健康': [
          '旁白：健身打卡，肌肉比钱包还瘦💪',
          '健身人士：碎片时间养生，比工作还忙🏃‍♀️',
          '旁白：好在——发现了健康管理神器✨',
          '健身人士：睡前养生，比考试还紧张😰',
          '旁白：省下的钱，拿来买更多健康产品，不香吗？！',
          '健身人士：省钱小妙招，告别"健康破产"，养生梦我们慢慢来🌟'
        ]
      };
      
      return dialogues[industry] || [
        '旁白：在' + use_case + '中遇到' + pain_point + '，简直让人崩溃😫',
        target_audience + '：' + pain_point + '？钱包在哭泣，心在滴血💸',
        '旁白：好在——发现了' + core_value + '神器✨',
        target_audience + '：通过' + core_value + '，钱包终于不用哭泣了💰',
        '旁白：省下的钱，拿来享受生活，不香吗？！',
        target_audience + '：省钱小妙招，告别"开销恐惧症"，生活梦我们慢慢来🌟'
      ];
    };

    // BGM建议
    const getBGM = () => {
      const bgm = {
        '旅游': '轻快旅行音乐，营造轻松愉快的氛围',
        '母婴': '温馨亲子音乐，营造温馨有爱的氛围',
        '美妆': '时尚美妆音乐，营造精致优雅的氛围',
        '健康': '活力健身音乐，营造积极向上的氛围'
      };
      
      return bgm[industry] || '轻快背景音乐，营造积极向上的氛围';
    };

    const setting = getVideoSetting();
    const shots = getShotScript();
    const dialogues = getDialogueScript();
    const bgm = getBGM();

    return `📹 ${target_audience}专属短视频脚本

【场景设定】
${setting}

【镜头脚本】
${shots.join('\n')}

【台词脚本】
${dialogues.join('\n')}

【BGM建议】
${bgm}

【互动引导】
${generateHumorousCallToAction()}

【标签】
${getIndustryTags().join(' ')}`;
  };

  /**
   * 生成标准短视频脚本
   */
  const generateStandardVideoScript = () => {
    const { target_audience, use_case, pain_point, core_value, emotional_need, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    return `📹 ${target_audience}专属短视频脚本

【场景设定】
${use_case}场景，${target_audience}在面临${pain_point}的困扰

【镜头脚本】
镜头1：特写问题场景，表现痛点
镜头2：中景，${target_audience}表情困扰
镜头3：特写解决方案，手机屏幕显示${core_value || '解决方案'}
镜头4：中景，${target_audience}表情转变
镜头5：特写效果展示
镜头6：全景，问题解决后的满足感

【台词脚本】
旁白：在${use_case}中，${target_audience}常常面临${pain_point}的困扰
${target_audience}：这种挑战不仅影响日常体验${emotional_need ? `，更让人感到${emotional_need}` : ''}
旁白：然而，${core_value ? `通过${core_value}，我们可以有效解决这些问题` : '我们可以提供有效的解决方案'}
${target_audience}：${generateIndustrySpecificContent()}
旁白：让我们一起，为${target_audience}创造更好的${use_case}体验

【BGM建议】
温馨背景音乐，营造积极向上的氛围

【互动引导】
${generateStandardCallToAction()}

【标签】
#${target_audience} #${use_case} #${industry}`;
  };

  /**
   * 生成创意内容
   */
  const generateIdea = async () => {
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      toast({
        title: "请选择必要维度",
        description: `缺少必要维度：${missingNames.join('、')}`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 模拟AI生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const format = selectedItems.content_format || '图文';
      const isVideo = format.includes('视频') || format.includes('短视频');
      
      let generatedContent = '';
      let contentType: 'text' | 'video' = 'text';
      
      if (isVideo) {
        contentType = 'video';
        const script = generateVideoScript(buildPrompt());
        setVideoScript([]); // 重置视频脚本数组，因为现在返回的是字符串
        
        generatedContent = script; // 直接使用生成的脚本字符串
      } else {
        contentType = 'text';
        generatedContent = generateTextContent(buildPrompt());
      }

      setCurrentContent(generatedContent);
      setCurrentContentType(contentType);

      // 保存到历史记录
      const newResult: CreativeResult = {
        id: Date.now().toString(),
        combination: { ...selectedItems },
        generatedContent,
        contentType,
        timestamp: new Date().toISOString(),
        tags: Object.values(selectedItems).slice(0, 3)
      };

      setGeneratedIdeas(prev => [newResult, ...prev]);

      toast({
        title: "创意生成成功",
        description: `已生成${isVideo ? '短视频脚本' : '图文内容'}`,
      });
    } catch {
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 导出Excel
   */
  const exportToExcel = () => {
    if (currentContentType !== 'video' || !currentContent) {
      toast({
        title: "无法导出",
        description: "只有短视频脚本才能导出Excel",
        variant: "destructive"
      });
      return;
    }

    // 创建CSV内容
    const headers = ['脚本内容'];
    const csvContent = [
      headers.join(','),
      currentContent.replace(/\n/g, '\\n') // 转义换行符
    ].join('\n');

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `短视频脚本_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: "短视频脚本已导出为CSV文件",
    });
  };

  /**
   * 复制创意内容
   */
  const copyIdea = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "创意内容已复制",
    });
  };

  /**
   * 保存创意
   */
  const saveIdea = () => {
    // 这里可以集成到文案管理系统
    toast({
      title: "已保存到文案库",
      description: "创意已保存到文案管理系统",
    });
  };

  return (
    <div className="space-y-6">
      {/* 九宫格创意魔方 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            九宫格创意魔方
          </CardTitle>
          <CardDescription>
            选择不同维度的元素，AI将为你生成可直接使用的创意内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {dimensions.map((dimension) => {
              const status = getDimensionStatus(dimension.id);
              const borderColor = status.isRequired 
                ? (status.isSelected ? 'border-green-500' : 'border-red-500') 
                : status.isRecommended 
                ? (status.isSelected ? 'border-blue-500' : 'border-blue-300')
                : (status.isSelected ? 'border-gray-500' : 'border-gray-200');
              
              return (
                <Card key={dimension.id} className={`border-2 border-dashed ${borderColor} relative`}>
                  {/* 必选标识 */}
                  {status.isRequired && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge variant={status.isSelected ? "default" : "destructive"} className="text-xs">
                        {status.isSelected ? "✓" : "必选"}
                      </Badge>
                    </div>
                  )}
                  
                  {/* 推荐标识 */}
                  {status.isRecommended && !status.isRequired && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge variant={status.isSelected ? "default" : "secondary"} className="text-xs">
                        {status.isSelected ? "✓" : "推荐"}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {dimension.icon}
                      {dimension.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {dimension.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* 已选择的项目 */}
                    {selectedItems[dimension.id] && (
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Badge variant="secondary" className="text-xs">
                          {selectedItems[dimension.id]}
                        </Badge>
                      </div>
                    )}
                    
                    {/* 可选项目列表 */}
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {cubeData[dimension.id]?.map((item, index) => (
                        <div key={index} className="flex items-center p-1 hover:bg-gray-50 rounded">
                          <span 
                            className="text-xs cursor-pointer hover:text-primary flex-1"
                            onClick={() => setSelectedItems(prev => ({
                              ...prev,
                              [dimension.id]: item
                            }))}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* 添加新项目 */}
                    <div className="flex gap-1">
                      <Input
                        placeholder="添加新项目"
                        className="text-xs h-6"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addItemToCube(dimension.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addItemToCube(dimension.id, input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button onClick={smartRandomGenerate} variant="outline">
          <Shuffle className="w-4 h-4 mr-2" />
          智能随机生成
        </Button>
        <Button onClick={generateIdea} disabled={isGenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '生成中...' : '生成创意'}
        </Button>
      </div>

      {/* 当前生成的内容 */}
      {currentContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentContentType === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              {currentContentType === 'video' ? '短视频脚本' : '图文内容'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">内容预览</TabsTrigger>
                {currentContentType === 'video' && (
                  <TabsTrigger value="script">分镜脚本</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Textarea
                  value={currentContent}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={() => copyIdea(currentContent)} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    复制内容
                  </Button>
                  <Button onClick={saveIdea}>
                    <Save className="w-4 h-4 mr-2" />
                    保存到文案库
                  </Button>
                  {currentContentType === 'video' && (
                    <Button onClick={exportToExcel} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      导出Excel
                    </Button>
                  )}
                </div>
              </TabsContent>

              {currentContentType === 'video' && (
                <TabsContent value="script" className="space-y-4">
                  <div className="space-y-4">
                    {videoScript.map((scene, index) => (
                      <Card key={index} className="border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            {scene.sceneNumber}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>画面说明：</strong> {scene.sceneDescription}
                            </div>
                            <div>
                              <strong>台词文案：</strong> {scene.dialogue}
                            </div>
                            <div>
                              <strong>调性：</strong> {scene.tone}
                            </div>
                            <div>
                              <strong>表达情绪：</strong> {scene.emotion}
                            </div>
                            <div>
                              <strong>背景音乐：</strong> {scene.bgm}
                            </div>
                            <div>
                              <strong>音效：</strong> {scene.soundEffect}
                            </div>
                            <div>
                              <strong>镜头类型：</strong> {scene.shotType}
                            </div>
                            <div>
                              <strong>时长：</strong> {scene.duration}秒
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 历史创意记录 */}
      {generatedIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史创意记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedIdeas.map((idea) => (
                <Card key={idea.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {idea.contentType === 'video' ? '短视频' : '图文'}
                          </Badge>
                          {idea.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {idea.generatedContent.substring(0, 200)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(idea.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => copyIdea(idea.generatedContent)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={saveIdea}>
                          <Save className="w-3 h-3" />
                        </Button>
                        {idea.contentType === 'video' && (
                          <Button size="sm" variant="outline" onClick={exportToExcel}>
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 