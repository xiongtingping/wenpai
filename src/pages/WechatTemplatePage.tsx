import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Edit, Heart, Search, Filter, MessageCircle, Calendar, Sparkles, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 微信朋友圈文案模板接口定义
 */
interface WechatTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  emoji: string;
  wordCount: number;
  isFavorite: boolean;
  useCount: number;
  createdAt: Date;
  occasion?: string;
  mood?: string;
}

/**
 * 微信朋友圈文案模板页面组件
 */
const WechatTemplatePage: React.FC = () => {
  const [templates, setTemplates] = useState<WechatTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WechatTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<WechatTemplate | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // 预设分类
  const categories = [
    '日常分享', '节日祝福', '心情表达', '美食分享', '旅行记录', 
    '工作感悟', '生活感悟', '励志鸡汤', '搞笑段子', '其他'
  ];

  // 预设标签
  const allTags = [
    '温馨', '搞笑', '励志', '文艺', '小清新', '治愈', '正能量', 
    '节日', '生日', '新年', '情人节', '母亲节', '父亲节', '感恩节'
  ];

  // 预设场合
  const occasions = [
    '日常', '生日', '新年', '情人节', '母亲节', '父亲节', '感恩节', 
    '圣诞节', '春节', '中秋节', '国庆节', '毕业季', '工作', '旅行'
  ];

  /**
   * 初始化示例数据 - 增加更多高质量模板
   */
  useEffect(() => {
    const sampleTemplates: WechatTemplate[] = [
      {
        id: '1',
        title: '温馨日常分享',
        content: `今天的阳光刚好 ☀️
洒在桌前的那本书上
时光变得格外温柔 ✨

有些美好
不需要刻意寻找
就这样静静地
在日常里发光 💫

#慢生活 #温柔时光`,
        category: '日常分享',
        tags: ['温馨', '小清新', '治愈'],
        emoji: '☀️✨💫',
        wordCount: 65,
        isFavorite: true,
        useCount: 156,
        createdAt: new Date('2024-01-15'),
        occasion: '日常',
        mood: '开心'
      },
      {
        id: '2',
        title: '新年愿景',
        content: `🎊 2024，让我们重新开始

愿你眼里有星辰 ⭐️
心中有山海 🌊
脚下有力量 💪

新的一年
新的可能
新的自己 ✨

Together we grow 🌱

#新年愿望 #成长记录 #向上生长`,
        category: '节日祝福',
        tags: ['节日', '新年', '正能量'],
        emoji: '🎊⭐️🌊💪✨🌱',
        wordCount: 78,
        isFavorite: false,
        useCount: 234,
        createdAt: new Date('2024-01-10'),
        occasion: '新年',
        mood: '祝福'
      },
      {
        id: '3',
        title: '美食生活美学',
        content: `🍜 一碗热腾腾的拉面
就是这个冬天最好的拥抱

汤头浓郁醇香 🔥
面条爽滑Q弹 🥢
每一口都是满满的治愈感

Life is too short for bad food ✨
简单的食物，不简单的心情 💝

#美食记录 #冬日暖胃 #生活仪式感`,
        category: '美食分享',
        tags: ['美食', '分享', '治愈'],
        emoji: '🍜🔥🥢✨💝',
        wordCount: 92,
        isFavorite: true,
        useCount: 189,
        createdAt: new Date('2024-01-08'),
        occasion: '日常',
        mood: '满足'
      },
      {
        id: '4',
        title: '旅行心境',
        content: `✈️ 在路上的第3天

看过了雪山的壮美 🏔️
听过了海浪的呢喃 🌊
走过了古城的石板路 🏛️

世界很大
而我们很小
但正因为如此
每一次相遇都显得珍贵 💎

Travel is the only thing you buy
that makes you richer ✨

#旅行日记 #在路上 #世界很美`,
        category: '旅行记录',
        tags: ['旅行', '治愈', '美景'],
        emoji: '✈️🏔️🌊🏛️💎✨',
        wordCount: 118,
        isFavorite: false,
        useCount: 123,
        createdAt: new Date('2024-01-05'),
        occasion: '旅行',
        mood: '兴奋'
      },
      {
        id: '5',
        title: '成长感悟',
        content: `💪 关于成长这件事

不是一蹴而就的奇迹 ⚡️
而是日复一日的坚持 📅

每一个优秀的人背后
都有一段沉默的时光 🌙
那是付出努力的岁月
也是积蓄力量的过程 🌱

Be patient with yourself
You are growing at your own pace 🌸

#成长记录 #自我提升 #坚持的力量`,
        category: '励志鸡汤',
        tags: ['励志', '正能量', '成长'],
        emoji: '💪⚡️📅🌙🌱🌸',
        wordCount: 126,
        isFavorite: true,
        useCount: 278,
        createdAt: new Date('2024-01-03'),
        occasion: '日常',
        mood: '励志'
      },
      {
        id: '6',
        title: '爱的表达',
        content: `💕 To my dearest

你是我平淡生活里的英雄梦想 🦸‍♀️
是疲惫世界的惊喜与希望 ✨

因为你
每一个平凡的日子
都变得闪闪发光 💫

Love is not just looking at each other
it's looking in the same direction 👫

#爱的告白 #情人节 #珍惜当下`,
        category: '节日祝福',
        tags: ['节日', '情人节', '甜蜜'],
        emoji: '💕🦸‍♀️✨💫👫',
        wordCount: 98,
        isFavorite: false,
        useCount: 367,
        createdAt: new Date('2024-01-01'),
        occasion: '情人节',
        mood: '甜蜜'
      },
      {
        id: '7',
        title: '幽默日常',
        content: `😂 今日沙雕事件播报

本人成功解锁新技能：
把开水壶煮干了 🫖
把电饭煲煮糊了 🍚
把自己都煮傻了 🤪

经过深入分析得出结论：
我可能不适合进厨房
但我适合叫外卖 📱

Life is tough, but so are you! 💪
（外卖也很tough）

#日常沙雕 #生活小确丧 #自嘲专家`,
        category: '搞笑段子',
        tags: ['搞笑', '日常', '自嘲'],
        emoji: '😂🫖🍚🤪📱💪',
        wordCount: 134,
        isFavorite: true,
        useCount: 445,
        createdAt: new Date('2023-12-28'),
        occasion: '日常',
        mood: '搞笑'
      },
      {
        id: '8',
        title: '工作感悟',
        content: `💼 深夜办公室的小确幸

虽然加班到很晚 🌙
但看到项目终于上线的那一刻
所有的疲惫都烟消云散了 ✨

每一行代码都是汗水 💻
每一个功能都是心血 ❤️
但当用户说"很好用"的时候
一切都值得了 🌟

Dream big, work hard, stay humble 🚀

#加班日常 #程序员的浪漫 #热爱工作`,
        category: '工作感悟',
        tags: ['工作', '励志', '成就感'],
        emoji: '💼🌙✨💻❤️🌟🚀',
        wordCount: 118,
        isFavorite: false,
        useCount: 192,
        createdAt: new Date('2023-12-25'),
        occasion: '工作',
        mood: '满足'
      },
      {
        id: '9',
        title: '周末慢生活',
        content: `🌿 Weekend vibes

泡一壶好茶 🫖
读几页好书 📖
听几首老歌 🎵
看窗外云卷云舒 ☁️

慢下来的时光
是生活给我们的礼物 🎁

在这个快节奏的世界里
学会与自己独处
是一种难得的能力 ✨

#周末时光 #慢生活 #与自己对话`,
        category: '日常分享',
        tags: ['周末', '慢生活', '治愈'],
        emoji: '🌿🫖📖🎵☁️🎁✨',
        wordCount: 96,
        isFavorite: true,
        useCount: 234,
        createdAt: new Date('2023-12-20'),
        occasion: '日常',
        mood: '放松'
      },
      {
        id: '10',
        title: '雨天心情',
        content: `🌧️ 下雨天的温柔

雨滴敲打窗台的声音
像是大自然在弹奏钢琴 🎹
每一滴都是动听的音符 🎵

躲在屋檐下的小猫 🐱
匆忙奔跑的路人 🏃‍♀️
还有雨中绽放的花朵 🌸

Rain brings life
and sometimes, perspective 💭

#雨天随想 #大自然的音乐 #温柔时光`,
        category: '心情表达',
        tags: ['雨天', '温柔', '感性'],
        emoji: '🌧️🎹🎵🐱🏃‍♀️🌸💭',
        wordCount: 102,
        isFavorite: false,
        useCount: 156,
        createdAt: new Date('2023-12-15'),
        occasion: '日常',
        mood: '感性'
      },
      {
        id: '11',
        title: '健身打卡',
        content: `💪 运动日记 Day 30

汗水是脂肪的眼泪 💦
每一次举铁都是对自己的投资 🏋️‍♀️
每一滴汗水都在重塑更好的自己 ✨

30天前的我：
"明天开始运动" 😅

30天后的我：
"今天不练手痒痒" 🔥

Discipline is choosing between
what you want now
and what you want most 🎯

#健身打卡 #自律人生 #变美变强`,
        category: '生活感悟',
        tags: ['健身', '自律', '坚持'],
        emoji: '💪💦🏋️‍♀️✨😅🔥🎯',
        wordCount: 132,
        isFavorite: true,
        useCount: 289,
        createdAt: new Date('2023-12-10'),
        occasion: '日常',
        mood: '激励'
      },
      {
        id: '12',
        title: '深夜思考',
        content: `🌙 凌晨2点的思考

世界安静下来的时候
思绪反而变得清晰 💭

想起今天的小美好：
- 路边的花开了 🌸
- 咖啡师画的拉花很好看 ☕️
- 收到朋友的暖心消息 💌
- 看到夕阳很美 🌅

原来幸福就是
在平凡的日子里
发现不平凡的瞬间 ✨

Good night, beautiful world 🌎

#深夜思考 #感恩日常 #小确幸`,
        category: '心情表达',
        tags: ['深夜', '感恩', '思考'],
        emoji: '🌙💭🌸☕️💌🌅✨🌎',
        wordCount: 118,
        isFavorite: false,
        useCount: 203,
        createdAt: new Date('2023-12-05'),
        occasion: '日常',
        mood: '感性'
      }
    ];
    setTemplates(sampleTemplates);
    setFilteredTemplates(sampleTemplates);
  }, []);

  /**
   * 过滤模板
   */
  useEffect(() => {
    let filtered = templates;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.some(tag => template.tags.includes(tag))
      );
    }

    // 场合过滤
    if (selectedOccasion !== 'all') {
      filtered = filtered.filter(template => template.occasion === selectedOccasion);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, selectedTags, selectedOccasion]);

  /**
   * 复制文案到剪贴板
   */
  const copyTemplate = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "复制成功",
        description: "文案已复制到剪贴板",
      });
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制",
        variant: "destructive",
      });
    }
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  /**
   * 增加使用次数
   */
  const incrementUseCount = (id: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, useCount: template.useCount + 1 }
        : template
    ));
  };

  /**
   * 添加新模板
   */
  const addTemplate = (template: Omit<WechatTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: WechatTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setIsAddDialogOpen(false);
  };

  /**
   * 更新模板
   */
  const updateTemplate = (id: string, updates: Partial<WechatTemplate>) => {
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, ...updates }
        : template
    ));
    setEditingTemplate(null);
  };

  /**
   * 删除模板
   */
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="creative-module-title">微信朋友圈文案模板</h1>
          <p className="creative-module-description">精心设计的文案模板，让你的朋友圈更有魅力</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加模板
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新模板</DialogTitle>
            </DialogHeader>
            <AddTemplateForm onSubmit={addTemplate} categories={categories} allTags={allTags} occasions={occasions} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文案..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="选择场合" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部场合</SelectItem>
                {occasions.map(occasion => (
                  <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSelectedTags([])}>
              <Filter className="w-4 h-4 mr-2" />
              清除标签过滤
            </Button>
          </div>
          
          {/* 标签过滤 */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onCopy={copyTemplate}
            onToggleFavorite={toggleFavorite}
            onIncrementUse={incrementUseCount}
            onEdit={setEditingTemplate}
            onDelete={deleteTemplate}
            categories={categories}
            allTags={allTags}
            occasions={occasions}
          />
        ))}
      </div>

      {/* 编辑对话框 */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑模板</DialogTitle>
            </DialogHeader>
            <EditTemplateForm
              template={editingTemplate}
              onSubmit={(updates) => updateTemplate(editingTemplate.id, updates)}
              categories={categories}
              allTags={allTags}
              occasions={occasions}
            />
          </DialogContent>
        </Dialog>
      )}

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无模板</h3>
            <p className="text-muted-foreground">尝试调整搜索条件或添加新的模板</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * 模板卡片组件
 */
interface TemplateCardProps {
  template: WechatTemplate;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementUse: (id: string) => void;
  onEdit: (template: WechatTemplate) => void;
  onDelete: (id: string) => void;
  categories: string[];
  allTags: string[];
  occasions: string[];
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onCopy,
  onToggleFavorite,
  onIncrementUse,
  onEdit,
  onDelete,
  categories,
  allTags,
  occasions
}) => {
  const handleCopy = () => {
    onCopy(template.content);
    onIncrementUse(template.id);
  };

  return (
    <Card className={`wechat-template-card ${template.isFavorite ? 'ring-2 ring-primary' : ''} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="creative-module-subtitle flex items-center gap-2">
              <span>{template.emoji}</span>
              <span>{template.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="creative-module-label">{template.category}</Badge>
              {template.occasion && <Badge variant="outline" className="creative-module-label">{template.occasion}</Badge>}
              <Badge variant="outline" className="creative-module-label">{template.wordCount}字</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(template.id)}
            >
              <Heart className={`w-4 h-4 ${template.isFavorite ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{template.content}</p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {template.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>使用次数: {template.useCount}</span>
          <span>创建时间: {template.createdAt.toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制文案
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 添加模板表单组件
 */
interface AddTemplateFormProps {
  onSubmit: (template: Omit<WechatTemplate, 'id' | 'createdAt'>) => void;
  categories: string[];
  allTags: string[];
  occasions: string[];
}

const AddTemplateForm: React.FC<AddTemplateFormProps> = ({ onSubmit, categories, allTags, occasions }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    emoji: '',
    wordCount: 0,
    isFavorite: false,
    useCount: 0,
    occasion: '',
    mood: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: [],
        emoji: '',
        wordCount: 0,
        isFavorite: false,
        useCount: 0,
        occasion: '',
        mood: ''
      });
    }
  };

  const updateWordCount = (content: string) => {
    setFormData(prev => ({ ...prev, content, wordCount: content.length }));
  };

  const popularEmojis = ['😊', '🎉', '💕', '🌟', '✨', '🎊', '💪', '🌸', '🌈', '🎵', '🍕', '✈️'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">标题 *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="模板标题"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">分类</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="creative-module-button">文案内容 *</label>
        <Textarea
          value={formData.content}
          onChange={(e) => updateWordCount(e.target.value)}
          placeholder="输入朋友圈文案内容..."
          rows={4}
          required
        />
        <div className="creative-module-small mt-1">
          字数: {formData.wordCount} (建议30-50字)
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Emoji装饰</label>
        <Input
          value={formData.emoji}
          onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          placeholder="添加Emoji装饰"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {popularEmojis.map(e => (
            <button
              key={e}
              type="button"
              className="text-xl hover:scale-110 transition-transform"
              onClick={() => setFormData(prev => ({ ...prev, emoji: prev.emoji + e }))}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">场合</label>
          <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="选择场合" />
            </SelectTrigger>
            <SelectContent>
              {occasions.map(occasion => (
                <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">心情</label>
          <Input
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
            placeholder="开心、温馨、励志等"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">标签</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={formData.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFormData(prev => ({
                ...prev,
                tags: prev.tags.includes(tag)
                  ? prev.tags.filter(t => t !== tag)
                  : [...prev.tags, tag]
              }))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm">收藏</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">添加模板</Button>
      </div>
    </form>
  );
};

/**
 * 编辑模板表单组件
 */
interface EditTemplateFormProps {
  template: WechatTemplate;
  onSubmit: (updates: Partial<WechatTemplate>) => void;
  categories: string[];
  allTags: string[];
  occasions: string[];
}

const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template, onSubmit, categories, allTags, occasions }) => {
  const [formData, setFormData] = useState({
    title: template.title,
    content: template.content,
    category: template.category,
    tags: template.tags,
    emoji: template.emoji,
    wordCount: template.wordCount,
    isFavorite: template.isFavorite,
    useCount: template.useCount,
    occasion: template.occasion || '',
    mood: template.mood || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateWordCount = (content: string) => {
    setFormData(prev => ({ ...prev, content, wordCount: content.length }));
  };

  const popularEmojis = ['😊', '🎉', '💕', '🌟', '✨', '🎊', '💪', '🌸', '🌈', '🎵', '🍕', '✈️'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">标题 *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="模板标题"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">分类</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">文案内容 *</label>
        <Textarea
          value={formData.content}
          onChange={(e) => updateWordCount(e.target.value)}
          placeholder="输入朋友圈文案内容..."
          rows={4}
          required
        />
        <div className="text-xs text-muted-foreground mt-1">
          字数: {formData.wordCount} (建议30-50字)
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Emoji装饰</label>
        <Input
          value={formData.emoji}
          onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          placeholder="添加Emoji装饰"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {popularEmojis.map(e => (
            <button
              key={e}
              type="button"
              className="text-xl hover:scale-110 transition-transform"
              onClick={() => setFormData(prev => ({ ...prev, emoji: prev.emoji + e }))}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">场合</label>
          <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="选择场合" />
            </SelectTrigger>
            <SelectContent>
              {occasions.map(occasion => (
                <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">心情</label>
          <Input
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
            placeholder="开心、温馨、励志等"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">标签</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={formData.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFormData(prev => ({
                ...prev,
                tags: prev.tags.includes(tag)
                  ? prev.tags.filter(t => t !== tag)
                  : [...prev.tags, tag]
              }))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm">收藏</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">保存修改</Button>
      </div>
    </form>
  );
};

export default WechatTemplatePage; 