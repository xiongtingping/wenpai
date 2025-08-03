/**
 * 九宫格创意魔方组件 - 优化版
 * 支持多维度深度融合，生成可用创意内容
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TrendingUp,
  Pin,
  X,
  Eye,
  RotateCcw,
  ArrowRight,
  BookOpen,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MarketingCalendar from './MarketingCalendar';
import { MomentsTextGenerator } from './MomentsTextGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/authStore';
import { callOpenAIProxy } from '@/api/apiProxy';
import { callOpenAIDevProxy } from '@/api/devApiProxy';
import { Label as UILabel } from '@/components/ui/label';

/**
 * 九宫格维度定义
 */
interface CubeDimension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultItems: string[];
  isPinnable: boolean; // 是否可固定
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
  notes?: string;
}

/**
 * 维度卡片组件
 */
interface DimensionCardProps {
  dimension: CubeDimension;
  selectedItems: string[];
  onSelect: (item: string) => void;
  onDeselect: (item: string) => void;
  onPin: () => void;
  isPinned: boolean;
  cubeData: string[];
  onAddCustomItem: (item: string) => void;
  isRequired: boolean;
}

function DimensionCard({ 
  dimension, 
  selectedItems, 
  onSelect, 
  onDeselect, 
  onPin, 
  isPinned, 
  cubeData, 
  onAddCustomItem, 
  isRequired 
}: DimensionCardProps) {
  const [newItem, setNewItem] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const selectedItem = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAddCustomItem(newItem.trim());
      setNewItem('');
      setShowAddInput(false);
    }
  };

  return (
    <Card className={`relative ${isRequired ? 'border-blue-500' : ''} ${selectedItem ? 'bg-purple-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dimension.icon}
            <CardTitle className="text-sm">{dimension.name}</CardTitle>
            {isRequired && <Badge variant="destructive" className="text-xs">必选</Badge>}
          </div>
          {dimension.isPinnable && (
            <Button
              size="sm"
              variant={isPinned ? "default" : "ghost"}
              onClick={onPin}
              className="h-6 w-6 p-0"
            >
              <Pin className={`w-3 h-3 ${isPinned ? 'text-white' : ''}`} />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">{dimension.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedItem && (
          <div className="mb-2 p-2 bg-purple-100 rounded flex items-center justify-between">
            <span className="text-sm font-medium text-purple-800">{selectedItem}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeselect(selectedItem)}
              className="h-4 w-4 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {cubeData.map((item, index) => (
            <Button
              key={index}
              size="sm"
              variant={selectedItem === item ? "default" : "outline"}
              className="w-full justify-start text-xs h-7"
              onClick={() => selectedItem === item ? onDeselect(item) : onSelect(item)}
              disabled={!!selectedItem && selectedItem !== item}
            >
              {item}
            </Button>
          ))}
        </div>
        
        {!showAddInput ? (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-xs"
            onClick={() => setShowAddInput(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            添加自定义
          </Button>
        ) : (
          <div className="mt-2 flex gap-1">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="输入自定义项"
              className="text-xs h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Button size="sm" onClick={handleAddItem}>
              <Plus className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddInput(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 九宫格创意魔方组件
 * @returns React 组件
 */
export function CreativeCube() {
  const { toast } = useToast();
  const { decrementUsage } = useAuthStore();
  const usageRemaining = useAuthStore((state) => state.getUsageRemaining());
  
  // 九宫格维度定义
  const dimensions: CubeDimension[] = [
    {
      id: 'target_audience',
      name: '目标客群',
      description: '选择目标用户群体（必选）',
      icon: <Users className="w-4 h-4" />,
      defaultItems: ['宝妈', '大学生', '银发族', '职场人', '中产女性', 'Z世代', '宠物主', '健身人群', 'K12家长', '二次元', '科技控', '新手创业者'],
      isPinnable: true // 可固定
    },
    {
      id: 'use_case',
      name: '使用场景',
      description: '选择内容应用的具体场景（必选）',
      icon: <MapPin className="w-4 h-4" />,
      defaultItems: ['通勤', '健身', '夜宵', '家庭聚会', '旅游途中', '碎片时间', '出差', '露营', '独处时刻', '早晚高峰', '带娃时', '睡前'],
      isPinnable: true // 可固定
    },
    {
      id: 'pain_point',
      name: '用户痛点',
      description: '选择用户面临的核心痛点（必选）',
      icon: <AlertCircle className="w-4 h-4" />,
      defaultItems: ['时间不够', '预算不足', '操作复杂', '选择困难', '效果不稳', '信息过载', '服务差', '信任缺失', '缺乏动力', '内容同质化'],
      isPinnable: true // 可固定
    },
    {
      id: 'industry',
      name: '行业',
      description: '选择内容所属的行业领域（必选）',
      icon: <Building2 className="w-4 h-4" />,
      defaultItems: ['母婴', '美妆', '旅游', '健康', '教育', '职场', '电商', '本地生活', '宠物', '数码', '食品饮料', '健身', '金融理财'],
      isPinnable: true // 可固定
    },
    {
      id: 'core_value',
      name: '核心价值',
      description: '选择解决方案的核心价值（推荐）',
      icon: <Star className="w-4 h-4" />,
      defaultItems: ['提升效率', '改善体验', '节约成本', '增强信任', '拓宽视野', '激发灵感', '个性表达', '提高品质', '促进成长'],
      isPinnable: true // 可固定
    },
    {
      id: 'tone_style',
      name: '表达风格',
      description: '选择内容的表达风格（推荐）',
      icon: <Palette className="w-4 h-4" />,
      defaultItems: ['轻松幽默', '极简干练', '专业可信', '情感共鸣', '反差反转', '热梗混剪', '小剧场', '第一人称', '旁白式', '访谈感'],
      isPinnable: true // 可固定
    },
    {
      id: 'content_format',
      name: '内容形式',
      description: '选择内容的表现形式（推荐）',
      icon: <FileText className="w-4 h-4" />,
      defaultItems: ['图文', '短视频', '直播', 'H5', '长图', '故事接龙', '清单类', '榜单类', '分镜脚本'],
      isPinnable: true // 可固定
    },
    {
      id: 'emotional_need',
      name: '情感诉求',
      description: '选择要激发的情感共鸣（可选）',
      icon: <Heart className="w-4 h-4" />,
      defaultItems: ['安全感', '归属感', '成就感', '愉悦感', '陪伴感', '放松感', '被理解', '被尊重', '掌控感', '仪式感'],
      isPinnable: false // 不可固定
    },
    {
      id: 'platform_or_trend',
      name: '平台/趋势',
      description: '选择要结合的平台或趋势（可选）',
      icon: <TrendingUp className="w-4 h-4" />,
      defaultItems: ['小红书', '抖音', '知乎', '公众号', '搭子经济', '反向旅游', '高质量独居', '无糖生活', 'AI助理', '低欲望生活'],
      isPinnable: false // 不可固定
    }
  ];

  // 九宫格状态
  const [cubeData, setCubeData] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [pinnedDimensions, setPinnedDimensions] = useState<Set<string>>(new Set()); // 固定维度
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentContentType, setCurrentContentType] = useState<'text' | 'video'>('text');
  const [generatedIdeas, setGeneratedIdeas] = useState<CreativeResult[]>([]); // 历史创意记录
  const [randomDimensionCount, setRandomDimensionCount] = useState<number>(3); // 随机维度数量
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<any[]>([]);

  // 必选维度检查
  const requiredDimensions = ['target_audience', 'use_case', 'pain_point', 'industry'];
  
  // 验证生成条件
  const isValidGeneration = useMemo(() => {
    return requiredDimensions.every(dim => selectedItems[dim] && selectedItems[dim].trim() !== '');
  }, [selectedItems, requiredDimensions]);
  
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
   * 选择维度项目
   */
  const selectItem = (dimensionId: string, item: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [dimensionId]: item
    }));
  };

  /**
   * 取消选择维度项目
   */
  const deselectItem = (dimensionId: string, item: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[dimensionId] === item) {
        delete newItems[dimensionId];
      }
      return newItems;
    });
  };

  /**
   * 切换固定状态
   */
  const togglePin = (dimensionId: string) => {
    setPinnedDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dimensionId)) {
        newSet.delete(dimensionId);
      } else {
        newSet.add(dimensionId);
      }
      return newSet;
    });
  };

  /**
   * 添加自定义项目
   */
  const addCustomItem = (dimensionId: string, item: string) => {
    addItemToCube(dimensionId, item);
  };

  /**
   * 随机选择
   */
  const randomizeSelection = () => {
    const newSelection: Record<string, string> = {};
    
    dimensions.forEach(dimension => {
      // 跳过已固定的维度
      if (pinnedDimensions.has(dimension.id)) {
        return;
      }
      
      const items = cubeData[dimension.id] || dimension.defaultItems;
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        newSelection[dimension.id] = items[randomIndex];
      }
    });
    
    setSelectedItems(prev => ({ ...prev, ...newSelection }));
    
    toast({
      title: "随机选择完成",
      description: `已为${Object.keys(newSelection).length}个维度生成随机选择`,
    });
  };

  /**
   * 清空所有选择
   */
  const clearAllSelections = () => {
    setSelectedItems({});
    toast({
      title: "已清空选择",
      description: "所有维度选择已清空",
    });
  };

  /**
   * 生成创意内容的包装函数
   */
  const handleGenerateContent = () => {
    if (!isValidGeneration) {
      const requiredCheck = checkRequiredDimensions();
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      toast({
        title: "关键维度缺失",
        description: `请确保已选择【${missingNames.join('】【')}】后再生成内容`,
        variant: "destructive"
      });
      return;
    }
    
    generateIdea();
  };

  /**
   * 智能随机生成
   * 必选维度（目标客群、使用场景、用户痛点、行业）必须选择
   * 其他维度可选择性随机选择
   */
  const smartRandomGenerate = (randomDimensionCount?: number) => {
    const newSelection = { ...selectedItems };
    
    // 确保4个必选维度必须有值
    const requiredDimensions = ['target_audience', 'use_case', 'pain_point', 'industry'];
    requiredDimensions.forEach(dimId => {
      // 如果维度已固定，跳过随机生成
      if (pinnedDimensions.has(dimId)) {
        return;
      }
      
      const dimension = dimensions.find(d => d.id === dimId);
      if (dimension && dimension.defaultItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * dimension.defaultItems.length);
        newSelection[dimId] = dimension.defaultItems[randomIndex];
      }
    });
    
    // 其他维度（推荐和可选）可选择性随机选择
    const otherDimensions = dimensions.filter(d => !requiredDimensions.includes(d.id));
    const availableOtherDimensions = otherDimensions.filter(d => !pinnedDimensions.has(d.id));
    
    // 如果指定了随机维度数量，则随机选择指定数量的其他维度
    if (randomDimensionCount !== undefined && randomDimensionCount >= 0) {
      // 先清空所有非必选和非固定的维度
      otherDimensions.forEach(dimension => {
        if (!pinnedDimensions.has(dimension.id)) {
          delete newSelection[dimension.id];
        }
      });
      
      // 随机选择指定数量的其他维度
      const shuffledOtherDimensions = [...availableOtherDimensions].sort(() => Math.random() - 0.5);
      const selectedOtherDimensions = shuffledOtherDimensions.slice(0, randomDimensionCount);
      
      selectedOtherDimensions.forEach(dimension => {
        const items = cubeData[dimension.id] || dimension.defaultItems;
        if (items.length > 0) {
          const randomIndex = Math.floor(Math.random() * items.length);
          newSelection[dimension.id] = items[randomIndex];
        }
      });
    } else {
      // 如果没有指定数量，则为所有其他维度随机选择（原有逻辑）
      availableOtherDimensions.forEach(dimension => {
        const items = cubeData[dimension.id] || dimension.defaultItems;
        if (items.length > 0) {
          const randomIndex = Math.floor(Math.random() * items.length);
          newSelection[dimension.id] = items[randomIndex];
        }
      });
    }
    
    setSelectedItems(newSelection);
    
    const selectedCount = Object.keys(newSelection).length;
    const fixedCount = pinnedDimensions.size;
    
    toast({
      title: "智能随机生成完成",
      description: `已选择${selectedCount}个维度（${fixedCount}个固定，${selectedCount - fixedCount}个随机）`,
    });
    
    // 使用 setTimeout 确保状态更新后再生成，避免检查失效
    setTimeout(() => {
      generateIdea(newSelection);
    }, 100);
  };

  /**
   * 固定维度
   */
  const pinDimension = (dimensionId: string) => {
    setPinnedDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dimensionId)) {
        newSet.delete(dimensionId);
      } else {
        newSet.add(dimensionId);
      }
      return newSet;
    });
  };

  /**
   * 取消固定维度
   */
  const unpinDimension = (dimensionId: string) => {
    setPinnedDimensions(prev => {
      const newSet = new Set(prev);
      newSet.delete(dimensionId);
      return newSet;
    });
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

    // 获取固定维度信息
    const pinnedInfo = Array.from(pinnedDimensions).map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId);
      return dimension?.name || dimId;
    });

    const pinnedText = pinnedInfo.length > 0 
      ? `\n\n⚠️ 重要约束：以下维度已被用户固定，必须严格遵循，不得偏离：\n${pinnedInfo.map(name => `- ${name}`).join('\n')}\n`
      : '';

    return `请根据以下多维度配置生成一段用于【朋友圈】或【小红书】的图文内容，风格为【${tone_style}】，内容形式为【${content_format}】。必须严格使用以下所有维度信息，并避免使用"提升效率""提供安全感"等模板式话术，要求生活化、真实感强、带网络热梗、情境代入强。${pinnedText}

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
  const generateTextContent = () => {
    const { tone_style } = selectedItems;
    
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
   * 生成轻松幽默风格内容
   */
  const generateHumorousContent = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    // 生成标题
    const title = generateHumorousTitle();
    
    // 生成正文
    const body = generateHumorousBody();
    
    // 生成互动引导
    const callToAction = generateHumorousCallToAction();
    
    // 生成短视频建议
    const videoSuggestions = generateVideoSuggestions();
    
    // 生成延展建议
    const extensions = generateExtensionSuggestions();

    return `🎯 内容营销文案（图文/短视频均适用）

【标题】
${title}

【正文文案】
${body}

【结尾互动】
${callToAction}

⸻

🧠 延展建议（短视频内容结构）
${videoSuggestions}

${extensions}`;
  };

  /**
   * 生成轻松幽默标题
   */
  const generateHumorousTitle = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    const titleTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `🏃‍♀️健身没时间？这款美妆神器让${target_audience}也能一秒出门自带光！`,
        '通勤': `🚇通勤路上补妆难？${target_audience}专属美妆神器，地铁上也能精致在线！`,
        '夜宵': `🌙夜宵后卸妆累？这款神器让${target_audience}告别"卸妆恐惧症"！`,
        '独处时刻': `💄独处也要精致！${target_audience}的美妆仪式感，从这款神器开始！`
      },
      '母婴': {
        '带娃时': `👶带娃没时间护肤？这款神器让${target_audience}也能"偷懒"变美！`,
        '家庭聚会': `🎉聚会装备太多？${target_audience}的便携神器，一包搞定所有！`,
        '睡前': `😴睡前哄娃累？这款神器让${target_audience}也能精致入睡！`
      },
      '旅游': {
        '通勤': `🚇通勤路上想旅游？${target_audience}的省钱神器，让梦想不再遥远！`,
        '旅游途中': `✈️旅游途中预算超？${target_audience}的省钱攻略，让旅行更轻松！`,
        '出差': `💼出差回来钱包瘦？${target_audience}的出差神器，让商务旅行更省心！`
      },
      '健康': {
        '健身': `💪健身没时间？${target_audience}的健康神器，让运动更高效！`,
        '碎片时间': `⏰碎片时间养生难？${target_audience}的便携神器，让健康无处不在！`,
        '睡前': `😴睡前养生太复杂？${target_audience}的简单神器，让养生更轻松！`
      }
    };
    
    return titleTemplates[industry]?.[use_case] || 
      `💡${pain_point}太崩溃？这款${core_value}神器让${target_audience}告别烦恼！`;
  };

  /**
   * 生成轻松幽默正文
   */
  const generateHumorousBody = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    // 开场痛点
    const openingPain = generateOpeningPain();
    
    // 解决方案
    const solution = generateSolution();
    
    // 产品亮点
    const highlights = generateProductHighlights();
    
    return `${openingPain}

别急，这款${core_value}神器，专为${target_audience}准备：
${highlights}`;
  };

  /**
   * 生成开场痛点
   */
  const generateOpeningPain = () => {
    const { target_audience, use_case, pain_point, industry } = selectedItems;
    
    const painTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `作为${target_audience}，每天上课、打工、健身三点一线，哪还有时间化妆？\n尤其健完身还要赶图书馆、见朋友，时间根本不够用！`,
        '通勤': `作为${target_audience}，每天地铁公交来回奔波，哪有时间精致化妆？\n尤其早晚高峰，连补妆的时间都没有！`,
        '夜宵': `作为${target_audience}，夜宵后还要卸妆，简直比上班还累！\n时间不够用，皮肤还要遭罪！`
      },
      '母婴': {
        '带娃时': `作为${target_audience}，带娃就是24小时待机，哪有时间护肤？\n尤其宝宝哭闹时，连洗脸的时间都没有！`,
        '家庭聚会': `作为${target_audience}，家庭聚会就是大型装备现场，哪有时间精致？\n尤其带娃出门，装备比搬家还多！`
      },
      '旅游': {
        '通勤': `作为${target_audience}，每天通勤路上都在想旅游，但预算根本不够！\n时间不够用，钱包也不够用！`,
        '旅游途中': `作为${target_audience}，旅游途中预算总是超支，选择困难症发作！\n时间不够用，钱也不够用！`
      },
      '健康': {
        '健身': `作为${target_audience}，每天健身打卡，但时间总是不够用！\n尤其工作学习忙，连运动的时间都要挤！`,
        '碎片时间': `作为${target_audience}，碎片时间很多，但养生太难坚持！\n时间不够用，健康也要打折！`
      }
    };
    
    return painTemplates[industry]?.[use_case] || 
      `作为${target_audience}，在${use_case}中遇到${pain_point}，简直让人崩溃！`;
  };

  /**
   * 生成解决方案
   */
  const generateSolution = () => {
    const { core_value, target_audience } = selectedItems;
    return `这款${core_value}神器，专为${target_audience}准备：`;
  };

  /**
   * 生成产品亮点
   */
  const generateProductHighlights = () => {
    const { industry, use_case, core_value } = selectedItems;
    
    const highlightTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `💨 5秒上妆，零卡粉、不脱妆，健身完照样在线状态！\n🌿 养肤级底妆，汗后肌肤也不崩，提升气色不假面。\n🎒 迷你便携，一支搞定出门妆 + 补妆 + 气场加持！`,
        '通勤': `⚡ 3秒补妆，地铁上也能精致在线！\n🌿 持久不脱妆，早晚高峰也不怕！\n🎒 口袋大小，通勤路上随时补妆！`,
        '夜宵': `🌙 一键卸妆，夜宵后也能轻松入睡！\n🌿 温和不刺激，敏感肌也能安心用！\n⏰ 省时省力，告别"卸妆恐惧症"！`
      },
      '母婴': {
        '带娃时': `👶 带娃也能护肤，5分钟搞定基础护理！\n🌿 温和配方，哺乳期也能安心用！\n🎒 便携设计，带娃出门也能精致！`,
        '家庭聚会': `🎉 聚会装备精简，一包搞定所有需求！\n🌿 多功能设计，带娃聚会也能轻松！\n⏰ 省时省力，聚会准备不再手忙脚乱！`
      },
      '旅游': {
        '通勤': `✈️ 通勤路上也能规划旅行，省钱攻略一键获取！\n🌍 全球目的地推荐，让梦想不再遥远！\n💰 预算管理，让旅行更轻松！`,
        '旅游途中': `🎯 旅游途中省钱攻略，预算超支不再怕！\n🌍 本地推荐，让旅行更深度！\n💰 实时预算提醒，让旅行更省心！`
      },
      '健康': {
        '健身': `💪 健身效率提升，时间不够也能练出好身材！\n��‍♀️ 科学训练计划，让运动更高效！\n⏰ 时间管理，让健身更轻松！`,
        '碎片时间': `⏰ 碎片时间养生，随时随地都能健康！\n🌿 简单易坚持，让养生更轻松！\n💪 科学指导，让健康更有效！`
      }
    };
    
    return highlightTemplates[industry]?.[use_case] || 
      `✨ ${core_value}功能，让问题迎刃而解！\n🌿 专业品质，让体验更升级！\n⏰ 省时省力，让生活更轻松！`;
  };

  /**
   * 生成短视频建议
   */
  const generateVideoSuggestions = () => {
    const { target_audience, use_case, industry } = selectedItems;
    
    const videoTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `• 镜头1：${target_audience}宿舍，闹钟响起，时间紧张\n• 镜头2：健身房镜头，快速出汗、看表\n• 镜头3：快速上妆镜头（BGM轻快节奏感）\n• 镜头4：见朋友状态在线，画面定格品牌产品`,
        '通勤': `• 镜头1：${target_audience}匆忙起床，时间不够\n• 镜头2：地铁站镜头，人潮拥挤\n• 镜头3：快速补妆镜头（BGM都市节奏）\n• 镜头4：精致妆容，自信走出地铁`,
        '夜宵': `• 镜头1：${target_audience}吃夜宵，妆容开始脱妆\n• 镜头2：回家路上，疲惫不堪\n• 镜头3：快速卸妆镜头（BGM轻松舒缓）\n• 镜头4：清爽入睡，皮肤状态好`
      },
      '母婴': {
        '带娃时': `• 镜头1：${target_audience}带娃日常，手忙脚乱\n• 镜头2：宝宝哭闹，没时间护肤\n• 镜头3：快速护肤镜头（BGM温馨轻快）\n• 镜头4：带娃出门，依然精致`,
        '家庭聚会': `• 镜头1：${target_audience}准备聚会，装备太多\n• 镜头2：带娃出门，手忙脚乱\n• 镜头3：精简装备镜头（BGM欢快节奏）\n• 镜头4：聚会现场，轻松自在`
      },
      '旅游': {
        '通勤': `• 镜头1：${target_audience}通勤路上，看着旅游广告\n• 镜头2：查看旅游攻略，预算不够\n• 镜头3：省钱规划镜头（BGM旅行音乐）\n• 镜头4：梦想成真，开始旅行`,
        '旅游途中': `• 镜头1：${target_audience}旅游途中，预算超支\n• 镜头2：选择困难，不知道去哪\n• 镜头3：省钱攻略镜头（BGM轻松愉快）\n• 镜头4：享受旅行，预算充足`
      },
      '健康': {
        '健身': `• 镜头1：${target_audience}忙碌工作，没时间健身\n• 镜头2：健身房，时间不够用\n• 镜头3：高效训练镜头（BGM动感节奏）\n• 镜头4：身材变好，自信满满`,
        '碎片时间': `• 镜头1：${target_audience}碎片时间，不知道做什么\n• 镜头2：工作间隙，想要养生\n• 镜头3：简单养生镜头（BGM舒缓音乐）\n• 镜头4：健康状态，精神饱满`
      }
    };
    
    return videoTemplates[industry]?.[use_case] || 
      `• 镜头1：${target_audience}遇到问题，表情困扰\n• 镜头2：使用产品，问题解决\n• 镜头3：效果展示，满意表情\n• 镜头4：推荐产品，画面定格`;
  };

  /**
   * 生成延展建议
   */
  const generateExtensionSuggestions = () => {
    const { target_audience, use_case, industry } = selectedItems;
    
    return `📝 文案/配音：同步上面内容，调性自然、真实、有代入感

🎬 拍摄建议：
• 画面风格：生活化、真实感强
• 色调：明亮温暖，符合${target_audience}审美
• 节奏：轻快有节奏感，符合${use_case}场景
• 互动：鼓励用户分享自己的${use_case}经验

🏷️ 标签建议：
${getIndustryTags().join(' ')} #${target_audience} #${use_case} #${industry}`;
  };

  /**
   * 生成行业特色标签
   */
  const getIndustryTags = () => {
    const { industry } = selectedItems;
    const industryTags: Record<string, string[]> = {
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
   * 生成轻松幽默互动引导
   */
  const generateHumorousCallToAction = () => {
    const { target_audience, use_case, pain_point, industry } = selectedItems;
    
    const callToActions: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `⌛ 谁说健身和精致不能兼得？快评论区告诉我你的 #健身速妆秘籍 吧！`,
        '通勤': `🚇 通勤路上有什么补妆妙招？快来分享你的 #通勤美妆秘籍 ！`,
        '夜宵': `🌙 夜宵后有什么卸妆神器？快来安利你的 #夜宵卸妆秘籍 ！`,
        '独处时刻': `💄 独处时有什么护肤仪式？快来分享你的 #独处美妆秘籍 ！`
      },
      '母婴': {
        '带娃时': `👶 带娃时有什么护肤妙招？宝妈们快来分享你的 #带娃护肤秘籍 ！`,
        '家庭聚会': `🎉 家庭聚会有什么装备妙招？快来分享你的 #聚会装备秘籍 ！`,
        '睡前': `😴 睡前有什么护肤仪式？快来分享你的 #睡前护肤秘籍 ！`
      },
      '旅游': {
        '通勤': `✈️ 通勤路上有什么省钱妙招？快来分享你的 #通勤省钱秘籍 ！`,
        '旅游途中': `🎯 旅游途中有什么省钱攻略？快来分享你的 #旅游省钱秘籍 ！`,
        '出差': `💼 出差有什么省钱妙招？快来分享你的 #出差省钱秘籍 ！`
      },
      '健康': {
        '健身': `💪 健身有什么时间管理妙招？快来分享你的 #健身时间秘籍 ！`,
        '碎片时间': `⏰ 碎片时间有什么养生妙招？快来分享你的 #碎片养生秘籍 ！`,
        '睡前': `😴 睡前有什么养生仪式？快来分享你的 #睡前养生秘籍 ！`
      }
    };
    
    return callToActions[industry]?.[use_case] || 
      `💡 你在${use_case}中遇到过${pain_point}吗？快来分享你的 #${use_case}秘籍 吧！`;
  };

  /**
   * 生成标准风格内容
   */
  const generateStandardContent = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
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

${selectedItems.emotional_need ? `这种挑战不仅影响日常体验，更让人感到${selectedItems.emotional_need}。` : ''}

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
    
    const industryContent: Record<string, string> = {
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
      const settings: Record<string, Record<string, string>> = {
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
      const shots: Record<string, string[]> = {
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
      const dialogues: Record<string, string[]> = {
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
      const bgm: Record<string, string> = {
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
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
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
${target_audience}：这种挑战不仅影响日常体验${selectedItems.emotional_need ? `，更让人感到${selectedItems.emotional_need}` : ''}
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
   * 生成创意内容（支持传入自定义selectedItems）
   */
  const generateIdea = async (customSelectedItems?: Record<string, string>) => {
    const useItems = customSelectedItems || selectedItems;
    const { target_audience, use_case, pain_point, content_format, tone_style, core_value, emotional_need, industry, platform_or_trend } = useItems;
    
    // 检查必选维度 - 修复检查逻辑
    const requiredCheck = (() => {
      const requiredDimensions = ['target_audience', 'use_case', 'pain_point', 'industry'];
      const missingDimensions = requiredDimensions.filter(dim => {
        const value = useItems[dim];
        return !value || value.trim() === '';
      });
      return {
        isValid: missingDimensions.length === 0,
        missing: missingDimensions
      };
    })();
    
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      toast({
        title: "关键维度缺失",
        description: `请确保已选择【${missingNames.join('】【')}】后再生成内容`,
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      // 构建AI提示词
      const prompt = buildPrompt();
      
      // 确定内容类型
      const format = content_format || '图文';
      const isVideo = format.includes('视频') || format.includes('短视频');
      const contentType = isVideo ? 'video' : 'text';
      
      // 调用AI服务生成内容
      const aiResponse = await callAIForCreativeContent(prompt, contentType);
      
      if (aiResponse.success && aiResponse.content) {
        setCurrentContent(aiResponse.content);
        setCurrentContentType(contentType);
        
        // 保存到历史记录
        const newResult: CreativeResult = {
          id: Date.now().toString(),
          combination: useItems,
          generatedContent: aiResponse.content,
          contentType,
          timestamp: new Date().toISOString(),
          tags: getIndustryTags()
        };
        setGeneratedIdeas(prev => [newResult, ...prev.slice(0, 9)]); // 保留最近10条
        
        toast({
          title: "生成成功",
          description: `已生成${contentType === 'video' ? '短视频脚本' : '图文内容'}`,
        });
      } else {
        toast({
          title: "生成失败",
          description: aiResponse.error || 'AI生成内容失败',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : 'AI生成内容失败',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 调用AI服务生成创意内容
   */
  const callAIForCreativeContent = async (prompt: string, contentType: 'text' | 'video'): Promise<{ success: boolean; content?: string; error?: string }> => {
    try {
      console.log('开始调用AI服务...');
      
      // 使用统一的AI服务层
      const aiService = (await import('@/api/aiService')).callAI;
      
      const systemPrompt = `You are an expert social media copywriter and brand storyteller.

Your job is to generate emotionally resonant and platform-ready marketing content based on user-selected dimensions, using natural human language and realistic storytelling.

---

🧭 Writing Rules:

1. You MUST fully integrate all provided dimensions into a **cohesive, vivid, and emotionally realistic** storyline — **no keywords or labels**.

2. Only use dimensions that are explicitly provided. Do not invent or assume any missing information.

3. 🖼 For graphic content (图文):
   - Start with a strong emotional hook.
   - Present a realistic pain point within the selected scenario.
   - Transition naturally into a solution or product tied to the industry.
   - Close with relatable interaction prompts (e.g. "你也有这种烦恼吗？快来评论！").

4. 🎥 For video content:
   - Output a structured script with: Scene description, camera movement, dialogue/subtitle, visual cues, BGM suggestion, emotional tone.
   - Use real-life pacing and emotion fit for TikTok/Xiaohongshu.

5. 💬 Language must:
   - Match the tone and voice of the selected audience.
   - Avoid marketing clichés like "提升用户体验" or "打造差异化".
   - Use conversational, emoji-rich, platform-native expressions.

---

🚫 Never:
- Invent or assume dimensions not provided.
- Output generic frameworks, bullet points, or headings.
- Repeat input words mechanically without meaningful transformation.
- Generate placeholder content.

🎯 Goal:
Your output must feel like it was written by a real KOC or content strategist — creative, emotionally engaging, and 100% based on the provided input.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      console.log('调用AI服务，消息数量:', messages.length);
      console.log('用户提示词长度:', prompt.length);

      const response = await aiService({
        prompt: prompt,
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7,
          systemPrompt: systemPrompt
      });

      console.log('AI服务响应:', response);

      if (response.success && response.content) {
        const content = response.content;
        console.log('AI生成成功，内容长度:', content.length);
        return {
          success: true,
          content: content
        };
      } else {
        console.error('AI服务响应异常:', response);
        return {
          success: false,
          error: response.error || 'AI服务响应异常'
        };
      }
    } catch (error) {
      console.error('AI服务调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  };

  /**
   * 解析视频脚本
   */
  const parseVideoScript = (content: string): VideoScript[] => {
    try {
      // 尝试从内容中提取分镜脚本
      const scriptMatch = content.match(/【分镜脚本】([\s\S]*?)(?=\n\n|$)/);
      if (scriptMatch) {
        const scriptText = scriptMatch[1];
        const scenes = scriptText.split('\n').filter(line => line.trim().startsWith('•'));
        
        return scenes.map((scene, index) => ({
          sceneNumber: `镜头${index + 1}`,
          sceneDescription: scene.replace('•', '').trim(),
          dialogue: '',
          tone: '自然',
          emotion: '真实',
          bgm: '轻快背景音乐',
          soundEffect: '',
          shotType: '中景',
          duration: 3
        }));
      }
      
      // 如果没有找到分镜脚本，返回默认结构
      return [
        {
          sceneNumber: '镜头1',
          sceneDescription: '问题场景展示',
          dialogue: '',
          tone: '自然',
          emotion: '困扰',
          bgm: '轻快背景音乐',
          soundEffect: '',
          shotType: '中景',
          duration: 3
        },
        {
          sceneNumber: '镜头2',
          sceneDescription: '解决方案展示',
          dialogue: '',
          tone: '积极',
          emotion: '满意',
          bgm: '轻快背景音乐',
          soundEffect: '',
          shotType: '特写',
          duration: 3
        }
      ];
    } catch (error) {
      console.error('解析视频脚本失败:', error);
      return [];
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
        <CardContent className="space-y-6">
          {/* 九宫格网格 */}
          <div className="grid grid-cols-3 gap-4">
            {dimensions.map((dimension) => (
              <DimensionCard
                key={dimension.id}
                dimension={dimension}
                selectedItems={selectedItems[dimension.id] ? [selectedItems[dimension.id]] : []}
                onSelect={(item) => selectItem(dimension.id, item)}
                onDeselect={(item) => deselectItem(dimension.id, item)}
                onPin={() => togglePin(dimension.id)}
                isPinned={pinnedDimensions.has(dimension.id)}
                cubeData={cubeData[dimension.id] || []}
                onAddCustomItem={(item) => addCustomItem(dimension.id, item)}
                isRequired={['target_audience', 'use_case', 'pain_point', 'industry'].includes(dimension.id)}
              />
            ))}
          </div>

          {/* 控制按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={randomizeSelection}
                disabled={isGenerating}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                随机选择
              </Button>
              
              {/* 智能随机生成 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => smartRandomGenerate(randomDimensionCount)}
                  disabled={isGenerating}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  智能随机
                </Button>
                <Select 
                  value={randomDimensionCount.toString()} 
                  onValueChange={(value) => setRandomDimensionCount(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0个</SelectItem>
                    <SelectItem value="1">1个</SelectItem>
                    <SelectItem value="2">2个</SelectItem>
                    <SelectItem value="3">3个</SelectItem>
                    <SelectItem value="4">4个</SelectItem>
                    <SelectItem value="5">5个</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-500">可选维度</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllSelections}
                disabled={isGenerating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                清空选择
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={pinnedDimensions.size > 0 ? "default" : "outline"} className="text-xs">
                <Pin className="w-3 h-3 mr-1" />
                {pinnedDimensions.size} 个固定维度
              </Badge>
              <Button
                onClick={handleGenerateContent}
                disabled={!isValidGeneration || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成创意内容
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 生成内容展示 */}
          {currentContent && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    生成结果
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyIdea(currentContent)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveIdea}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      保存
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentContent('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-white rounded-lg border">
                  {currentContent}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 历史生成记录 */}
          {generatedIdeas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  历史生成记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedIdeas.map((idea) => (
                    <Card key={idea.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-2">{idea.timestamp}</div>
                            <div className="text-sm line-clamp-3">{idea.generatedContent}</div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyIdea(idea.generatedContent)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentContent(idea.generatedContent)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 