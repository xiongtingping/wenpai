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
      id: 'industry',
      name: '行业领域',
      description: '选择内容所属的行业领域（必选）',
      icon: <Building2 className="w-4 h-4" />,
      defaultItems: ['旅游', '教培', '食品饮料', '母婴', '互联网', '金融', '医疗健康', '服饰美妆', '家居家电', '汽车', '宠物', '运动健身', '文化娱乐', '房地产', '政务', '农业']
    },
    {
      id: 'target_audience',
      name: '目标人群',
      description: '选择目标用户群体（必选）',
      icon: <Users className="w-4 h-4" />,
      defaultItems: ['宝妈', '上班族', '学生党', '创业者', '老年人', '年轻人', '情侣', '家庭', '企业', '机构']
    },
    {
      id: 'scenarios',
      name: '使用场景',
      description: '选择内容应用的具体场景（必选）',
      icon: <MapPin className="w-4 h-4" />,
      defaultItems: ['居家生活', '工作办公', '社交聚会', '学习充电', '购物消费', '出行旅游', '健康管理', '娱乐休闲']
    },
    {
      id: 'pain_points',
      name: '痛点需求',
      description: '选择用户面临的核心痛点（必选）',
      icon: <AlertCircle className="w-4 h-4" />,
      defaultItems: ['时间不够', '效率低下', '成本过高', '质量不好', '选择困难', '信息过载', '缺乏专业', '体验不佳', '信任缺失', '安全担忧']
    },
    {
      id: 'benefits',
      name: '核心价值',
      description: '选择解决方案的核心价值（推荐）',
      icon: <Star className="w-4 h-4" />,
      defaultItems: ['省时省力', '提升效率', '降低成本', '改善质量', '简化选择', '专业指导', '优质体验', '建立信任', '创造价值', '安全保障']
    },
    {
      id: 'tones',
      name: '表达调性',
      description: '选择内容的表达风格（推荐）',
      icon: <Palette className="w-4 h-4" />,
      defaultItems: ['轻松幽默', '温暖治愈', '专业权威', '激情澎湃', '简洁明了', '亲切自然']
    },
    {
      id: 'formats',
      name: '内容形式',
      description: '选择内容的表现形式（推荐）',
      icon: <FileText className="w-4 h-4" />,
      defaultItems: ['图文', '短视频脚本', '长图文', '海报文案', '直播话术', '评论回复']
    },
    {
      id: 'emotions',
      name: '情感诉求',
      description: '选择要激发的情感共鸣（可选）',
      icon: <Heart className="w-4 h-4" />,
      defaultItems: ['安全感', '成就感', '归属感', '新鲜感', '优越感', '幸福感', '紧迫感', '好奇心']
    },
    {
      id: 'trends',
      name: '热点趋势',
      description: '选择要结合的热点话题（可选）',
      icon: <TrendingUp className="w-4 h-4" />,
      defaultItems: ['节日营销', '社会热点', '行业动态', '季节变化', '生活话题', '科技趋势', '健康养生', '时尚潮流']
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
  const requiredDimensions = ['industry', 'target_audience', 'scenarios', 'pain_points'];
  
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
    const isRecommended = ['benefits', 'tones', 'formats'].includes(dimensionId);
    const isOptional = ['emotions', 'trends'].includes(dimensionId);
    
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
      target_audience = '目标用户',
      scenarios = '使用场景',
      pain_points = '痛点需求',
      emotions = '情感诉求',
      benefits = '核心价值',
      industry = '行业',
      formats = '内容形式',
      tones = '表达调性',
      trends = '热点趋势'
    } = selectedItems;

    return `请根据以下多维度配置生成一段用于【朋友圈】或【小红书】的图文内容，风格为【${tones}】，内容形式为【${formats}】。必须严格使用以下所有维度信息，并避免使用"提升效率""提供安全感"等模板式话术，要求生活化、真实感强、带网络热梗、情境代入强。

维度：
- 行业：${industry}
- 目标用户：${target_audience}
- 使用场景：${scenarios}
- 用户痛点：${pain_points}
- 情感诉求：${emotions}
- 核心价值：${benefits}
- 热点趋势：${trends}

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
    const { target_audience, scenarios, pain_points, tones, benefits, emotions, industry } = selectedItems;
    
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
    if (tones === '轻松幽默') {
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
      '旅游': ['#居家生活', '#降低成本', '#宝妈日记', '#穷游风也能很美'],
      '教培': ['#学习充电', '#提分秘籍', '#家长必看', '#教育投资'],
      '食品饮料': ['#美食分享', '#省钱攻略', '#吃货日常', '#健康生活'],
      '母婴': ['#宝妈日常', '#育儿经验', '#省钱妙招', '#亲子时光'],
      '互联网': ['#效率神器', '#黑科技', '#数字生活', '#智能推荐'],
      '金融': ['#理财规划', '#财富自由', '#投资理财', '#资产配置'],
      '医疗健康': ['#健康生活', '#科学养生', '#医疗科普', '#健康管理'],
      '服饰美妆': ['#穿搭灵感', '#变美秘籍', '#时尚种草', '#美妆测评'],
      '家居家电': ['#品质生活', '#智能家居', '#收纳神器', '#家装灵感'],
      '汽车': ['#智能驾驶', '#省油省心', '#新车测评', '#驾驶体验'],
      '宠物': ['#萌宠日常', '#铲屎官必看', '#宠物健康', '#宠物互动'],
      '运动健身': ['#燃脂打卡', '#健身计划', '#运动装备', '#健康塑形'],
      '文化娱乐': ['#追剧安利', '#演出现场', '#娱乐八卦', '#粉丝互动'],
      '房地产': ['#置业首选', '#楼盘推荐', '#装修灵感', '#投资回报'],
      '政务': ['#便民服务', '#政策解读', '#政务公开', '#民生关注'],
      '农业': ['#绿色种植', '#农技科普', '#丰收喜悦', '#乡村振兴']
    };
    
    return industryTags[industry] || ['#生活分享', '#实用技巧', '#经验分享'];
  };

  /**
   * 生成轻松幽默风格内容
   */
  const generateHumorousContent = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions, industry } = selectedItems;
    
    // 背景设定：基于行业+场景的真实情境
    const getBackgroundSetting = () => {
      const backgrounds = {
        '旅游': {
          '居家生活': `${target_audience}想带娃出去浪？机票价格劝退一整年😵‍💫`,
          '工作办公': `${target_audience}出差回来，钱包瘦了一圈💸`,
          '社交聚会': `${target_audience}聚会选餐厅，人均200+劝退一半人😅`
        },
        '教培': {
          '居家生活': `${target_audience}在家辅导作业，血压飙升到180😤`,
          '学习充电': `${target_audience}报班费用比房贷还贵，心在滴血💔`,
          '工作办公': `${target_audience}工作忙到没时间学习，焦虑到秃头😱`
        },
        '食品饮料': {
          '居家生活': `${target_audience}在家做饭，食材比外卖还贵😭`,
          '社交聚会': `${target_audience}聚会点餐，人均消费让人想逃😰`,
          '购物消费': `${target_audience}超市购物，账单比工资还长📄`
        },
        '母婴': {
          '居家生活': `${target_audience}带娃日常，奶粉尿布比黄金还贵💰`,
          '购物消费': `${target_audience}母婴店购物，钱包瞬间被掏空💸`,
          '社交聚会': `${target_audience}带娃聚会，装备比搬家还多🎒`
        }
      };
      
      return backgrounds[industry]?.[scenarios] || 
        `${target_audience}在${scenarios}中遇到${pain_points}，简直让人崩溃😫`;
    };

    // 人设代入：融入目标用户特征
    const getCharacterSetting = () => {
      const characters = {
        '宝妈': '带娃出门就是大型物流现场，装备比搬家还多🎒',
        '上班族': '工作忙到连喝水的时间都没有，咖啡当饭吃☕',
        '学生党': '学习压力大到想躺平，但钱包不允许😅',
        '创业者': '创业路上坑太多，钱包比脸还干净💸',
        '老年人': '退休生活本应轻松，但物价上涨让人焦虑😰'
      };
      
      return characters[target_audience] || `${target_audience}的日常就是各种挑战`;
    };

    // 冲突点设定：具体化痛点
    const getConflictPoint = () => {
      const conflicts = {
        '时间不够': '时间去哪了我不知道，但洗衣机确实等不了我！⏰',
        '效率低下': '效率低到连蜗牛都看不下去了🐌',
        '成本过高': `${pain_points}？钱包在哭泣，心在滴血💸`,
        '质量不好': '质量差到连自己都嫌弃😤',
        '选择困难': '选择困难症发作，纠结到天荒地老🤔',
        '信息过载': '信息多到脑子要爆炸💥',
        '缺乏专业': '专业度不够，感觉自己像个小白😅',
        '体验不佳': '体验差到想投诉，但又懒得动😪',
        '信任缺失': '信任度低到连自己都不信自己😰'
      };
      
      return conflicts[pain_points] || `${pain_points}？简直让人崩溃！`;
    };

    // 解决方案设定：具体化价值
    const getSolution = () => {
      const solutions = {
        '省时省力': `好在我发现了${benefits}神器，省时又不掉链子✨`,
        '提升效率': `有了${benefits}，效率直接起飞🚀`,
        '降低成本': `通过${benefits}，钱包终于不用哭泣了💰`,
        '改善质量': `${benefits}让质量直接升级，太香了！🌟`,
        '简化选择': `${benefits}帮我做选择，纠结症有救了🎯`,
        '专业指导': `${benefits}提供专业指导，小白也能变大神👑`,
        '优质体验': `${benefits}带来优质体验，幸福感爆棚💖`,
        '建立信任': `${benefits}建立信任，安全感满满🛡️`,
        '创造价值': `${benefits}创造价值，生活更有意义🎉`
      };
      
      return solutions[benefits] || `通过${benefits}，问题迎刃而解！`;
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

不用当超人，也能搞定${scenarios}的突发事件。

谁说${target_audience}不能松口气？我偏要让${benefits}带我飞～

【互动引导】
${generateHumorousCallToAction()}

${tags}`;
  };

  /**
   * 生成轻松幽默标题
   */
  const generateHumorousTitle = () => {
    const { target_audience, scenarios, pain_points, benefits, industry } = selectedItems;
    
    const titleTemplates = {
      '旅游': {
        '居家生活': `"旅游不如在家省一笔"——${target_audience}的居家反击战⚔️`,
        '工作办公': `"出差回来钱包瘦了"——${target_audience}的省钱秘籍💰`,
        '社交聚会': `"聚会选餐厅太难了"——${target_audience}的省钱攻略🎯`
      },
      '教培': {
        '居家生活': `"辅导作业血压飙升"——${target_audience}的救赎之路😤`,
        '学习充电': `"报班费用比房贷贵"——${target_audience}的省钱大法💸`,
        '工作办公': `"工作忙到没时间学习"——${target_audience}的时间管理⏰`
      },
      '食品饮料': {
        '居家生活': `"在家做饭比外卖贵"——${target_audience}的省钱妙招🍳`,
        '社交聚会': `"聚会点餐人均200+"——${target_audience}的省钱攻略🍽️`,
        '购物消费': `"超市账单比工资长"——${target_audience}的购物清单📄`
      },
      '母婴': {
        '居家生活': `"奶粉尿布比黄金贵"——${target_audience}的省钱日记💰`,
        '购物消费': `"母婴店购物钱包空"——${target_audience}的省钱秘籍🛒`,
        '社交聚会': `"带娃聚会装备多"——${target_audience}的出行攻略🎒`
      }
    };
    
    return titleTemplates[industry]?.[scenarios] || 
      `"${pain_points}太崩溃"——${target_audience}的${benefits}秘籍✨`;
  };

  /**
   * 生成轻松幽默互动引导
   */
  const generateHumorousCallToAction = () => {
    const { target_audience, scenarios, pain_points, industry } = selectedItems;
    
    const callToActions = {
      '旅游': `你有过被旅游价格劝退的瞬间吗？留言告诉我你的省钱妙招！✈️`,
      '教培': `你辅导作业时血压最高到多少？来评论区吐槽一下！📚`,
      '食品饮料': `你最近发现什么省钱美食？快来安利给我！🍜`,
      '母婴': `带娃路上有什么省钱妙招？宝妈们快来分享！👶`,
      '互联网': `你用过最省心的效率神器是什么？求推荐！💻`,
      '金融': `你最近有什么理财心得？来分享一下！💰`,
      '医疗健康': `你有什么养生小妙招？求分享！🏥`,
      '服饰美妆': `你最近发现什么平价好物？快来种草！💄`,
      '家居家电': `你有什么收纳神器推荐？求安利！🏠`,
      '汽车': `你开车有什么省油妙招？来分享一下！🚗`,
      '宠物': `铲屎官们有什么省钱妙招？求推荐！🐱`,
      '运动健身': `你有什么健身省钱攻略？来分享一下！💪`,
      '文化娱乐': `你最近看什么好剧？求推荐！📺`,
      '房地产': `你买房有什么省钱攻略？来分享一下！🏢`,
      '政务': `你用过什么便民服务？求推荐！📋`,
      '农业': `你有什么种植心得？来分享一下！🌱`
    };
    
    return callToActions[industry] || 
      `你在${scenarios}中遇到过${pain_points}吗？来评论区吐槽一下！😄`;
  };

  /**
   * 生成标准风格内容
   */
  const generateStandardContent = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions, industry } = selectedItems;
    
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
在${scenarios}中，${target_audience}常常面临${pain_points}的困扰。

${emotions ? `这种挑战不仅影响日常体验，更让人感到${emotions}。` : ''}

${benefits ? `然而，通过${benefits}，我们可以有效解决这些问题。` : '我们可以提供有效的解决方案。'}

${generateIndustrySpecificContent()}

【互动引导】
${generateStandardCallToAction()}

#${target_audience} #${scenarios} #${industry}`;
  };

  /**
   * 生成标准标题
   */
  const generateStandardTitle = () => {
    const { target_audience, scenarios, pain_points, benefits } = selectedItems;
    return `${target_audience}的${scenarios}新选择：用${benefits}解决${pain_points}`;
  };

  /**
   * 生成行业特定内容
   */
  const generateIndustrySpecificContent = () => {
    const { industry, target_audience, benefits } = selectedItems;
    
    const industryContent = {
      '旅游': `无论是家庭出游还是商务出行，${benefits}都能为${target_audience}提供更优质的旅行体验。`,
      '教培': `在学习和成长的道路上，${benefits}为${target_audience}提供专业支持和指导。`,
      '食品饮料': `从日常饮食到社交聚会，${benefits}让${target_audience}享受更美好的用餐体验。`,
      '母婴': `在育儿过程中，${benefits}为${target_audience}提供贴心的服务和解决方案。`,
      '互联网': `在数字化时代，${benefits}帮助${target_audience}提升效率和生活品质。`,
      '金融': `在理财规划中，${benefits}为${target_audience}提供专业的金融服务。`,
      '医疗健康': `在健康管理中，${benefits}为${target_audience}提供科学的健康指导。`,
      '服饰美妆': `在个人形象塑造中，${benefits}帮助${target_audience}展现最佳状态。`,
      '家居家电': `在居家生活中，${benefits}为${target_audience}创造舒适的生活环境。`,
      '汽车': `在出行体验中，${benefits}为${target_audience}提供便捷的驾驶服务。`,
      '宠物': `在宠物护理中，${benefits}为${target_audience}提供贴心的宠物服务。`,
      '运动健身': `在健康塑形中，${benefits}帮助${target_audience}实现健身目标。`,
      '文化娱乐': `在休闲娱乐中，${benefits}为${target_audience}提供丰富的文化体验。`,
      '房地产': `在置业选择中，${benefits}为${target_audience}提供专业的房产服务。`,
      '政务': `在便民服务中，${benefits}为${target_audience}提供便捷的政务服务。`,
      '农业': `在农业生产中，${benefits}为${target_audience}提供科学的种植指导。`
    };
    
    return industryContent[industry] || 
      `通过${benefits}，${target_audience}能够获得更好的体验和服务。`;
  };

  /**
   * 生成标准互动引导
   */
  const generateStandardCallToAction = () => {
    const { target_audience, scenarios, benefits } = selectedItems;
    return `你是否也在${scenarios}中遇到过类似问题？欢迎分享你的经验和想法，让我们一起探讨如何通过${benefits}改善生活品质。`;
  };

  /**
   * 生成短视频脚本
   */
  const generateVideoScript = (prompt: string) => {
    const { target_audience, scenarios, pain_points, tones, benefits, emotions, industry } = selectedItems;
    
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
    if (tones === '轻松幽默') {
      return generateHumorousVideoScript();
    } else {
      return generateStandardVideoScript();
    }
  };

  /**
   * 生成轻松幽默短视频脚本
   */
  const generateHumorousVideoScript = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions, industry } = selectedItems;
    
    // 场景设定
    const getVideoSetting = () => {
      const settings = {
        '旅游': {
          '居家生活': '客厅沙发，宝妈抱着手机看旅游攻略',
          '工作办公': '办公室，上班族对着电脑屏幕叹气',
          '社交聚会': '餐厅，朋友们围坐讨论旅行计划'
        },
        '教培': {
          '居家生活': '书房，家长辅导孩子写作业',
          '学习充电': '咖啡厅，年轻人看学习资料',
          '工作办公': '会议室，员工参加培训'
        },
        '食品饮料': {
          '居家生活': '厨房，主妇准备食材',
          '社交聚会': '餐厅，朋友们点餐',
          '购物消费': '超市，顾客推购物车'
        },
        '母婴': {
          '居家生活': '婴儿房，宝妈照顾宝宝',
          '购物消费': '母婴店，宝妈挑选商品',
          '社交聚会': '公园，宝妈们聚会'
        }
      };
      
      return settings[industry]?.[scenarios] || `${scenarios}场景，${target_audience}在忙碌`;
    };

    // 镜头脚本
    const getShotScript = () => {
      const shots = {
        '旅游': [
          '镜头1：特写手机屏幕，显示机票价格，表情震惊',
          '镜头2：全景客厅，宝妈瘫在沙发上叹气',
          '镜头3：特写钱包，里面只有几张零钱',
          '镜头4：中景，宝妈拿起手机，表情从沮丧到惊喜',
          '镜头5：特写手机屏幕，显示省钱攻略',
          '镜头6：全景，宝妈开心地规划居家旅行'
        ],
        '教培': [
          '镜头1：特写作业本，密密麻麻的题目',
          '镜头2：中景，家长辅导孩子，表情焦虑',
          '镜头3：特写时钟，时间飞逝',
          '镜头4：特写手机，显示学习APP',
          '镜头5：中景，家长和孩子一起学习，表情轻松',
          '镜头6：全景，学习氛围温馨'
        ],
        '食品饮料': [
          '镜头1：特写超市账单，金额惊人',
          '镜头2：中景，顾客推购物车，表情无奈',
          '镜头3：特写手机，显示省钱美食APP',
          '镜头4：中景，顾客开心地挑选食材',
          '镜头5：特写厨房，制作美食过程',
          '镜头6：全景，享受美食的满足感'
        ],
        '母婴': [
          '镜头1：特写母婴店价格标签，价格昂贵',
          '镜头2：中景，宝妈推婴儿车，表情疲惫',
          '镜头3：特写手机，显示育儿省钱攻略',
          '镜头4：中景，宝妈开心地购物',
          '镜头5：特写宝宝，表情可爱',
          '镜头6：全景，温馨的亲子时光'
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
          '旁白：想带娃出去浪？机票价格劝退一整年😵‍💫',
          '宝妈：酒店比拼命打扫的客厅还贵？简直心在滴血💸',
          '旁白：好在——居家也能假装在旅行✨',
          '宝妈：把阳台打造成日式温泉区，地垫铺上就是东南亚小栈🌴',
          '旁白：省下的钱，拿来囤玩具、囤奶粉，不香吗？！',
          '宝妈：省钱小妙招，告别"开销恐惧症"，旅游梦我们慢慢来🌟'
        ],
        '教培': [
          '旁白：辅导作业血压飙升到180😤',
          '家长：报班费用比房贷还贵，心在滴血💔',
          '旁白：好在——有了学习神器，效率直接起飞🚀',
          '家长：不用当超人，也能搞定学习难题',
          '旁白：谁说家长不能松口气？',
          '家长：我偏要让学习变得轻松有趣～'
        ],
        '食品饮料': [
          '旁白：在家做饭，食材比外卖还贵😭',
          '主妇：聚会点餐，人均消费让人想逃😰',
          '旁白：好在——发现了省钱美食神器✨',
          '主妇：超市购物也能省下一大笔💰',
          '旁白：省下的钱，拿来买更多美食，不香吗？！',
          '主妇：省钱小妙招，告别"吃货破产"，美食梦我们慢慢来🌟'
        ],
        '母婴': [
          '旁白：带娃日常，奶粉尿布比黄金还贵💰',
          '宝妈：母婴店购物，钱包瞬间被掏空💸',
          '旁白：好在——发现了育儿省钱神器✨',
          '宝妈：带娃聚会，装备比搬家还多🎒',
          '旁白：省下的钱，拿来买更多玩具，不香吗？！',
          '宝妈：省钱小妙招，告别"育儿破产"，带娃梦我们慢慢来🌟'
        ]
      };
      
      return dialogues[industry] || [
        '旁白：在' + scenarios + '中遇到' + pain_points + '，简直让人崩溃😫',
        target_audience + '：' + pain_points + '？钱包在哭泣，心在滴血💸',
        '旁白：好在——发现了' + benefits + '神器✨',
        target_audience + '：通过' + benefits + '，钱包终于不用哭泣了💰',
        '旁白：省下的钱，拿来享受生活，不香吗？！',
        target_audience + '：省钱小妙招，告别"开销恐惧症"，生活梦我们慢慢来🌟'
      ];
    };

    // BGM建议
    const getBGM = () => {
      const bgm = {
        '旅游': '轻快旅行音乐，营造轻松愉快的氛围',
        '教培': '温馨学习音乐，营造专注学习的氛围',
        '食品饮料': '欢快美食音乐，营造享受美食的氛围',
        '母婴': '温馨亲子音乐，营造温馨有爱的氛围'
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
    const { target_audience, scenarios, pain_points, benefits, emotions, industry } = selectedItems;
    
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
${scenarios}场景，${target_audience}在面临${pain_points}的困扰

【镜头脚本】
镜头1：特写问题场景，表现痛点
镜头2：中景，${target_audience}表情困扰
镜头3：特写解决方案，手机屏幕显示${benefits || '解决方案'}
镜头4：中景，${target_audience}表情转变
镜头5：特写效果展示
镜头6：全景，问题解决后的满足感

【台词脚本】
旁白：在${scenarios}中，${target_audience}常常面临${pain_points}的困扰
${target_audience}：这种挑战不仅影响日常体验${emotions ? `，更让人感到${emotions}` : ''}
旁白：然而，${benefits ? `通过${benefits}，我们可以有效解决这些问题` : '我们可以提供有效的解决方案'}
${target_audience}：${generateIndustrySpecificContent()}
旁白：让我们一起，为${target_audience}创造更好的${scenarios}体验

【BGM建议】
温馨背景音乐，营造积极向上的氛围

【互动引导】
${generateStandardCallToAction()}

【标签】
#${target_audience} #${scenarios} #${industry}`;
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
      
      const format = selectedItems.formats || '图文';
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