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
  Clock
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
  const dimensions: CubeDimension[] = useMemo(() => [
    {
      id: 'target_audience',
      name: '目标客群',
      description: '目标客户人群标签',
      icon: <Users className="w-4 h-4" />,
      defaultItems: ['宝妈', '学生党', '上班族', '创业者', '老年人', '年轻人', '专业人士', '自由职业者', '家庭主妇']
    },
    {
      id: 'scenarios',
      name: '使用场景',
      description: '产品使用或内容传播场景',
      icon: <MapPin className="w-4 h-4" />,
      defaultItems: ['居家生活', '工作办公', '户外运动', '社交聚会', '学习充电', '休闲娱乐', '购物消费', '旅行度假', '健康养生']
    },
    {
      id: 'pain_points',
      name: '痛点需求',
      description: '用户痛点或核心需求',
      icon: <AlertTriangle className="w-4 h-4" />,
      defaultItems: ['时间不够', '效率低下', '成本过高', '质量不好', '选择困难', '信息过载', '缺乏专业', '体验不佳', '信任缺失']
    },
    {
      id: 'emotions',
      name: '情感诉求',
      description: '激发的情感或心理需求',
      icon: <Heart className="w-4 h-4" />,
      defaultItems: ['安全感', '成就感', '归属感', '新鲜感', '优越感', '幸福感', '满足感', '刺激感', '放松感']
    },
    {
      id: 'benefits',
      name: '核心价值',
      description: '产品或服务的核心价值',
      icon: <Star className="w-4 h-4" />,
      defaultItems: ['省时省力', '提升效率', '降低成本', '改善质量', '简化选择', '专业指导', '优质体验', '建立信任', '创造价值']
    },
    {
      id: 'industry',
      name: '行业',
      description: '内容所属行业领域',
      icon: <Zap className="w-4 h-4" />,
      defaultItems: [
        '旅游', '教培', '食品饮料', '母婴', '互联网', '金融', '医疗健康', '服饰美妆', '家居家电', '汽车', '宠物', '运动健身', '文化娱乐', '房地产', '政务', '农业'
      ]
    },
    {
      id: 'formats',
      name: '内容形式',
      description: '内容呈现的形式',
      icon: <Target className="w-4 h-4" />,
      defaultItems: ['图文', '短视频', '直播', '音频', 'H5', '小程序', '海报', '长图文', '互动游戏']
    },
    {
      id: 'tones',
      name: '表达调性',
      description: '内容的表达风格和调性',
      icon: <Lightbulb className="w-4 h-4" />,
      defaultItems: ['专业权威', '轻松幽默', '温暖治愈', '激情澎湃', '理性分析', '感性共鸣', '实用干货', '创意有趣', '高端奢华']
    },
    {
      id: 'trends',
      name: '热点趋势',
      description: '当前热点或趋势话题',
      icon: <Sparkles className="w-4 h-4" />,
      defaultItems: ['AI技术', '健康生活', '环保理念', '数字化转型', '个性化定制', '社交电商', '知识付费', '国潮文化', '元宇宙']
    }
  ], []);

  // 状态管理
  const [cubeData, setCubeData] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [generatedIdeas, setGeneratedIdeas] = useState<CreativeResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentContentType, setCurrentContentType] = useState<'text' | 'video'>('text');
  const [videoScript, setVideoScript] = useState<VideoScript[]>([]);

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
      channels = '传播渠道',
      formats = '内容形式',
      tones = '表达调性',
      trends = '热点趋势'
    } = selectedItems;

    return `请生成一段适用于${formats}的创意内容，目标用户是「${target_audience}」，使用场景为「${scenarios}」，面临的核心痛点是「${pain_points}」，希望传达的核心价值为「${benefits}」，激发的情绪为「${emotions}」，风格调性为「${tones}」，发布渠道为「${channels}」，结合当前热点话题「${trends}」。

请直接输出创意内容，而非策略说明。`;
  };

  /**
   * 生成图文内容
   */
  const generateTextContent = (prompt: string) => {
    const { target_audience, scenarios, pain_points, tones, benefits, emotions } = selectedItems;
    
    // 根据调性生成不同风格的内容
    if (tones === '轻松幽默') {
      return generateHumorousContent();
    } else {
      return generateStandardContent();
    }
  };

  /**
   * 生成轻松幽默风格内容
   */
  const generateHumorousContent = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions } = selectedItems;
    
    return `📱 ${target_audience}专属爆梗文案

【标题】
${generateHumorousTitle()}

【正文】
${generateHumorousBody()}

【互动引导】
${generateHumorousCallToAction()}

#${target_audience}日常 #${scenarios} #${benefits} #搞笑真实日记`;
  };

  /**
   * 生成标准风格内容
   */
  const generateStandardContent = () => {
    const { target_audience, scenarios, pain_points, tones, benefits, emotions } = selectedItems;
    
    let contentStyle = '';
    switch (tones) {
      case '温暖治愈':
        contentStyle = '用温暖治愈的语调，营造温馨感人的氛围';
        break;
      case '专业权威':
        contentStyle = '用专业权威的语气，突出专业性和可信度';
        break;
      case '激情澎湃':
        contentStyle = '用激情澎湃的语气，充满感染力和号召力';
        break;
      default:
        contentStyle = '用自然流畅的语气';
    }

    return `📱 ${target_audience}专属文案

${contentStyle}，为${target_audience}在${scenarios}中遇到的${pain_points}提供解决方案。

💡 核心价值：${benefits}
❤️ 情感共鸣：${emotions}

【标题】
${generateTitle()}

【正文】
${generateBody()}

【互动引导】
${generateCallToAction()}

#${target_audience} #${scenarios} #${benefits} #${tones}`;
  };

  /**
   * 生成轻松幽默标题
   */
  const generateHumorousTitle = () => {
    const { target_audience, scenarios, pain_points } = selectedItems;
    
    const humorousTitles = [
      `${target_audience}的${scenarios}日常：${pain_points}？不存在的！`,
      `当${target_audience}遇到${pain_points}，我笑出了声😅`,
      `${target_audience}的${scenarios}生存指南：${pain_points}克星`,
      `${target_audience}必看：${pain_points}的搞笑解决方案`,
      `${target_audience}的${scenarios}日常：${pain_points}？我选择躺平！`,
      `${target_audience}的${pain_points}自救手册，太真实了叭！`,
      `${target_audience}的${scenarios}日常：${pain_points}？我有妙招！`,
      `${target_audience}的${pain_points}克星，别说我没告诉你！`
    ];
    
    return humorousTitles[Math.floor(Math.random() * humorousTitles.length)];
  };

  /**
   * 生成标题
   */
  const generateTitle = () => {
    const { target_audience, pain_points, benefits, tones } = selectedItems;
    
    const titles = {
      '温暖治愈': [
        `给${target_audience}的一封信：关于${pain_points}的温暖答案`,
        `${target_audience}，你值得拥有更好的${benefits}`,
        `陪伴${target_audience}，让${pain_points}不再是困扰`
      ],
      '专业权威': [
        `${target_audience}${pain_points}专业解决方案`,
        `权威解析：${target_audience}如何实现${benefits}`,
        `${target_audience}必读：${pain_points}的科学应对方法`
      ],
      '激情澎湃': [
        `${target_audience}们！是时候告别${pain_points}了！`,
        `突破极限！${target_audience}的${benefits}革命`,
        `改变从现在开始！${target_audience}的${pain_points}解决方案`
      ]
    };

    const titleList = titles[tones as keyof typeof titles] || titles['温暖治愈'];
    return titleList[Math.floor(Math.random() * titleList.length)];
  };

  /**
   * 生成轻松幽默正文
   */
  const generateHumorousBody = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions, industry } = selectedItems;
    
    // 根据目标人群和场景生成具体的生活场景
    const getSpecificScenario = () => {
      if (target_audience === '宝妈' && scenarios === '居家生活') {
        return [
          '👶 孩子在背后扯衣角',
          '🍳 锅里在咕嘟咕嘟冒泡', 
          '📱 群消息还在催你交作业表格',
          '🧺 洗衣机里的衣服在等主人',
          '🐕 狗子也在催你带它出门'
        ];
      } else if (target_audience === '上班族' && scenarios === '工作办公') {
        return [
          '💻 电脑死机了',
          '📧 邮件堆成山',
          '☕ 咖啡凉了还没喝',
          '📅 会议一个接一个',
          '🚇 地铁挤得像沙丁鱼'
        ];
      } else if (target_audience === '学生党' && scenarios === '学习充电') {
        return [
          '📚 书还没看完',
          '📝 作业还没写完',
          '⏰ 闹钟响了又响',
          '🍕 外卖还没到',
          '🎮 游戏在召唤'
        ];
      } else {
        return [
          `在${scenarios}中手忙脚乱`,
          `被${pain_points}搞得焦头烂额`,
          `感觉时间不够用`,
          `想要更好的解决方案`
        ];
      }
    };

    const scenarioList = getSpecificScenario();
    const randomScenarios = scenarioList.slice(0, 3).join('\n');
    
    const humorousResponses = [
      `有没有人懂那种——\n${randomScenarios}\n\n${pain_points}？别说你，我都快碎片成数据包了！`,
      `太真实了叭！\n${randomScenarios}\n\n${pain_points}？我选择躺平！😅`,
      `笑死，${target_audience}的日常：\n${randomScenarios}\n\n${pain_points}？不存在的！`,
      `真实写照：\n${randomScenarios}\n\n${pain_points}？我有妙招！`,
      `别说${target_audience}了，连狗都看不过去了😤\n${randomScenarios}\n\n${pain_points}？我选择开挂！`
    ];

    const solution = `好在我发现了${benefits}神器，省时又不掉链子。\n不用当超人，也能搞定${scenarios}的突发事件。\n\n谁说${target_audience}不能松口气？我偏要让${benefits}带我飞～`;

    // 行业术语与风格增强
    const industryTips: Record<string, string[]> = {
      '旅游': [
        '打卡新地标', '旅拍大片', '网红景点', '攻略必备', '体验感爆棚'
      ],
      '教培': [
        '提分秘籍', '名师带飞', '课程体验', '家长口碑', '高效学习'
      ],
      '食品饮料': [
        '爆款新品', '口感绝绝子', '健康轻食', '网红美食', '吃货必备'
      ],
      '母婴': [
        '科学育儿', '宝妈神器', '安全放心', '成长记录', '亲子互动'
      ],
      '互联网': [
        '黑科技', '效率神器', '新玩法', '数字生活', '智能推荐'
      ],
      '金融': [
        '财富自由', '理财规划', '低风险高收益', '投资新风口', '资产配置'
      ],
      '医疗健康': [
        '健康守护', '专业医疗', '科学养生', '权威认证', '健康生活'
      ],
      '服饰美妆': [
        '穿搭灵感', '爆款单品', '变美秘籍', '时尚种草', '美妆测评'
      ],
      '家居家电': [
        '品质生活', '智能家居', '收纳神器', '家装灵感', '舒适体验'
      ],
      '汽车': [
        '智能驾驶', '省油省心', '新车上市', '试驾体验', '性能测评'
      ],
      '宠物': [
        '萌宠日常', '铲屎官必看', '健康喂养', '宠物互动', '爆笑瞬间'
      ],
      '运动健身': [
        '燃脂打卡', '健身计划', '运动装备', '健康塑形', '活力满满'
      ],
      '文化娱乐': [
        '追剧安利', '演出现场', '娱乐八卦', '明星同款', '粉丝互动'
      ],
      '房地产': [
        '置业首选', '楼盘推荐', '装修灵感', '投资回报', '生活配套'
      ],
      '政务': [
        '便民服务', '政策解读', '政务公开', '民生关注', '权威发布'
      ],
      '农业': [
        '绿色种植', '农技科普', '丰收喜悦', '乡村振兴', '生态农业'
      ]
    };
    const industryArr = industryTips[industry || ''] || [];
    const industryPhrase = industryArr.length > 0 ? `#${industryArr[Math.floor(Math.random() * industryArr.length)]}#` : '';

    return `${humorousResponses[Math.floor(Math.random() * humorousResponses.length)]}

${solution}
${industryPhrase}`;
  };

  /**
   * 生成正文
   */
  const generateBody = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions, tones } = selectedItems;
    
    const scenarioTexts = [
      `作为${target_audience}，你一定经历过在${scenarios}时的${pain_points}。`,
      `每当${scenarios}的时候，${target_audience}最担心的就是${pain_points}。`,
      `${target_audience}在${scenarios}中，${pain_points}总是让人头疼不已。`
    ];

    const solutions = [
      `但现在，有了${benefits}的解决方案，一切都变得不一样了！`,
      `通过${benefits}，我们可以轻松应对这些挑战。`,
      `这就是为什么我们需要${benefits}来改变现状。`
    ];

    const emotionTexts = [
      `这不仅能解决${pain_points}，更能带来${emotions}的满足。`,
      `让${target_audience}在${scenarios}中感受到真正的${emotions}。`,
      `这就是我们追求的${emotions}，也是${benefits}的核心价值。`
    ];

    return `${scenarioTexts[Math.floor(Math.random() * scenarioTexts.length)]}

${solutions[Math.floor(Math.random() * solutions.length)]}

${emotionTexts[Math.floor(Math.random() * emotionTexts.length)]}

让我们一起，为${target_audience}创造更好的${scenarios}体验！`;
  };

  /**
   * 生成轻松幽默互动引导
   */
  const generateHumorousCallToAction = () => {
    const { target_audience, scenarios, pain_points } = selectedItems;
    
    const humorousCTAs = [
      `如果你也曾在${scenarios}里原地转圈，快来试试👇\n👇留言说说你的一天能有几次想"开挂"！`,
      `有没有同款${target_audience}？快来评论区集合！\n👇分享你的${pain_points}搞笑经历～`,
      `${target_audience}们，你们也是这样吗？\n👇快来吐槽你的${scenarios}日常！`,
      `太真实了叭！${target_audience}的日常写照\n👇留言说说你的${pain_points}自救妙招！`,
      `笑死，${target_audience}的日常太真实了\n👇快来分享你的${scenarios}搞笑瞬间！`
    ];
    
    return humorousCTAs[Math.floor(Math.random() * humorousCTAs.length)];
  };

  /**
   * 生成互动引导
   */
  const generateCallToAction = () => {
    const { target_audience, benefits, tones } = selectedItems;
    
    const ctas = {
      '温暖治愈': [
        `💝 为${target_audience}准备的${benefits}，温暖你的每一天`,
        `🌟 让${target_audience}感受到${benefits}带来的温暖`,
        `💕 ${target_audience}，你值得拥有这份${benefits}的关怀`
      ],
      '专业权威': [
        `📊 专业数据证明：${target_audience}的${benefits}效果显著`,
        `🔬 权威认证：${target_audience}的${benefits}解决方案`,
        `📈 科学验证：${target_audience}的${benefits}提升方案`
      ],
      '激情澎湃': [
        `🔥 ${target_audience}们！立即行动，体验${benefits}的震撼效果！`,
        `⚡ 突破自我！${target_audience}的${benefits}革命现在开始！`,
        `🚀 改变命运！${target_audience}的${benefits}之旅等你加入！`
      ]
    };

    const ctaList = ctas[tones as keyof typeof ctas] || ctas['温暖治愈'];
    return ctaList[Math.floor(Math.random() * ctaList.length)];
  };

  /**
   * 生成短视频脚本
   */
  const generateVideoScript = () => {
    const { target_audience, scenarios, pain_points, benefits, emotions, tones } = selectedItems;
    
    const scripts: VideoScript[] = [
      {
        sceneNumber: 'Scene1',
        sceneDescription: `${target_audience}在${scenarios}中遇到${pain_points}的困扰`,
        dialogue: `"又是这样...${pain_points}真是让人头疼"`,
        tone: tones,
        emotion: '困扰、无奈',
        bgm: '轻快背景音乐',
        soundEffect: '环境音',
        shotType: '中景',
        duration: 3
      },
      {
        sceneNumber: 'Scene2',
        sceneDescription: '展示解决方案和${benefits}的效果',
        dialogue: `"原来可以这样！${benefits}真的太棒了"`,
        tone: tones,
        emotion: '惊喜、满意',
        bgm: '积极向上的音乐',
        soundEffect: '成功音效',
        shotType: '特写',
        duration: 4
      },
      {
        sceneNumber: 'Scene3',
        sceneDescription: '展示使用后的${emotions}体验',
        dialogue: `"现在终于感受到${emotions}了！"`,
        tone: tones,
        emotion: emotions,
        bgm: '温暖治愈音乐',
        soundEffect: '温馨音效',
        shotType: '全景',
        duration: 3
      },
      {
        sceneNumber: 'End',
        sceneDescription: '产品展示和行动号召',
        dialogue: `"${target_audience}们，快来体验${benefits}吧！"`,
        tone: tones,
        emotion: '热情、邀请',
        bgm: '高潮音乐',
        soundEffect: '号召音效',
        shotType: '中景',
        duration: 2
      }
    ];

    return scripts;
  };

  /**
   * 生成创意内容
   */
  const generateIdea = async () => {
    if (Object.keys(selectedItems).length < 3) {
      toast({
        title: "请至少选择3个维度",
        description: "选择更多维度可以生成更丰富的创意",
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
        const script = generateVideoScript();
        setVideoScript(script);
        
        generatedContent = `📹 短视频创意脚本

🎯 目标：${selectedItems.target_audience} × ${selectedItems.scenarios} × ${selectedItems.pain_points}
💡 核心价值：${selectedItems.benefits}
❤️ 情感诉求：${selectedItems.emotions}
🎨 调性风格：${selectedItems.tones}

📝 分镜脚本：
${script.map(scene => `
【${scene.sceneNumber}】${scene.sceneDescription}
台词：${scene.dialogue}
情绪：${scene.emotion}
镜头：${scene.shotType}
时长：${scene.duration}秒
BGM：${scene.bgm}
音效：${scene.soundEffect}
`).join('')}

🎵 音乐建议：根据${selectedItems.tones}调性选择合适BGM
🎬 拍摄建议：注重${selectedItems.emotions}的视觉表达
📱 发布平台：${selectedItems.channels}`;
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
    if (currentContentType !== 'video' || videoScript.length === 0) {
      toast({
        title: "无法导出",
        description: "只有短视频脚本才能导出Excel",
        variant: "destructive"
      });
      return;
    }

    // 创建CSV内容
    const headers = ['镜头编号', '画面说明', '台词文案', '调性', '表达情绪', '背景音乐', '音效', '镜头类型', '时长（s）'];
    const csvContent = [
      headers.join(','),
      ...videoScript.map(scene => [
        scene.sceneNumber,
        scene.sceneDescription,
        scene.dialogue,
        scene.tone,
        scene.emotion,
        scene.bgm,
        scene.soundEffect,
        scene.shotType,
        scene.duration
      ].join(','))
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
            {dimensions.map((dimension) => (
              <Card key={dimension.id} className="border-2 border-dashed border-gray-200">
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
            ))}
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