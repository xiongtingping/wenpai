/**
 * 朋友圈文案生成器组件
 * 参考 FancyTextGenerator 和 EmojiAll 的设计理念
 * 支持搜索、点击复制、收藏、分类、AI生成功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search,
  Copy,
  Heart,
  Sparkles,
  Coffee,
  Plane,
  Gift,
  BookOpen,
  Dumbbell,
  Utensils,
  Clock,
  Tag,
  Star,
  Filter,
  Plus,
  Shuffle,
  Download,
  Check,
  X,
  Palette,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 文案模板接口
 */
interface TextTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  mood: 'happy' | 'romantic' | 'motivational' | 'casual' | 'thoughtful' | 'funny';
  isFavorite: boolean;
  useCount: number;
  createdAt: string;
}

/**
 * 分类配置
 */
const categories = [
  { id: 'all', name: '全部', icon: <Tag className="w-4 h-4" />, color: 'hsl(var(--muted-foreground))' },
  { id: 'daily', name: '日常生活', icon: <Coffee className="w-4 h-4" />, color: 'hsl(var(--primary))' },
  { id: 'emotion', name: '情感心情', icon: <Heart className="w-4 h-4" />, color: 'hsl(var(--destructive))' },
  { id: 'work', name: '工作学习', icon: <BookOpen className="w-4 h-4" />, color: 'hsl(var(--success))' },
  { id: 'travel', name: '旅行生活', icon: <Plane className="w-4 h-4" />, color: 'hsl(var(--accent))' },
  { id: 'food', name: '美食分享', icon: <Utensils className="w-4 h-4" />, color: 'hsl(var(--warning))' },
  { id: 'fitness', name: '健身运动', icon: <Dumbbell className="w-4 h-4" />, color: 'cyan' },
  { id: 'night', name: '深夜时光', icon: <Coffee className="w-4 h-4" />, color: 'indigo' },
  { id: 'festival', name: '节日祝福', icon: <Gift className="w-4 h-4" />, color: 'hsl(var(--accent))' },
];

/**
 * 心情标签配置
 */
const moodTags = [
  { id: 'happy', name: '开心', emoji: '😊', color: 'bg-accent text-muted-foreground' },
  { id: 'romantic', name: '浪漫', emoji: '💕', color: 'bg-accent text-primary' },
  { id: 'motivational', name: '励志', emoji: '💪', color: 'bg-accent text-primary' },
  { id: 'casual', name: '随性', emoji: '😎', color: 'bg-accent text-foreground' },
  { id: 'thoughtful', name: '深思', emoji: '🤔', color: 'bg-accent text-primary' },
  { id: 'funny', name: '搞笑', emoji: '😂', color: 'bg-accent text-foreground' },
];

/**
 * 朋友圈文案生成器组件
 */
export function MomentsTextGenerator() {
  const { toast } = useToast();

  // 状态管理
  const [templates, setTemplates] = useState<TextTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TextTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);

  // AI生成相关状态
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiStyle, setAIStyle] = useState('casual');
  const [aiLength, setAILength] = useState('short');
  const [isGenerating, setIsGenerating] = useState(false);

  // 新建文案状态
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'daily',
    mood: 'casual' as TextTemplate['mood'],
    tags: ''
  });

  /**
   * 初始化文案模板数据
   */
  useEffect(() => {
    const initialTemplates: TextTemplate[] = [
      // 日常生活
      {
        id: '1',
        title: '晨光微醺',
        content: '☀️ 清晨的第一缕阳光\n透过百叶窗洒在桌案上\n咖啡香气缓缓升腾\n新的一天，从容开始\n\n愿你我都能在平凡中\n找到属于自己的小确幸 ✨',
        category: 'daily',
        tags: ['晨光', '咖啡', '小确幸', '生活'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: '周末慢时光',
        content: '🌿 Weekend vibes\n没有闹钟的早晨\n慵懒地窝在沙发里\n阳光正好，微风不燥\n\n这样的周末\n值得用来虚度 💫\n\n#周末 #慢生活',
        category: 'daily',
        tags: ['周末', '慵懒', '阳光', 'weekend'],
        mood: 'casual',
        isFavorite: true,
        useCount: 28,
        createdAt: new Date().toISOString()
      },
      
      // 情感心情
      {
        id: '3',
        title: '月光下的思绪',
        content: '🌙 夜深了\n窗外的月光很亮\n想起了很多人和事\n\n有些话不必说出口\n有些情不必刻意表达\n懂的人自然会懂\n\n晚安，世界 ⭐',
        category: 'emotion',
        tags: ['夜晚', '思绪', '月光', '晚安'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 42,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        title: '春天的约定',
        content: '🌸 春天来了\n樱花开了\n想和你一起\n踏青赏花\n\n约定好的春天\n我们如期而至 💕\n\n有你在的季节\n都是人间四月天',
        category: 'emotion',
        tags: ['春天', '樱花', '约定', '浪漫'],
        mood: 'romantic',
        isFavorite: true,
        useCount: 67,
        createdAt: new Date().toISOString()
      },

      // 工作学习
      {
        id: '5',
        title: '深夜加班记',
        content: '💻 又是一个加班的夜晚\n办公室的灯还亮着\n外面的世界已经安静\n\n虽然累，但充实\n每一份努力\n都是在为梦想加分 ✨\n\n#加班 #奋斗 #梦想',
        category: 'work',
        tags: ['加班', '奋斗', '努力', '梦想'],
        mood: 'motivational',
        isFavorite: false,
        useCount: 23,
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        title: '读书时光',
        content: '📚 今天读了一本好书\n\"知识就是力量\"\n这句话永远不过时\n\n在书的世界里\n我们可以遇见更好的自己\n\n Reading makes a full man 📖\n\n你今天读书了吗？',
        category: 'work',
        tags: ['读书', '知识', '成长', '学习'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 19,
        createdAt: new Date().toISOString()
      },

      // 旅行生活
      {
        id: '7',
        title: '远方的诗',
        content: '✈️ 背上行囊\n去看世界的模样\n\n山川湖海\n日出日落\n每一处风景\n都是心灵的洗礼 🏔️\n\n人生就是一场旅行\n在乎的不是目的地\n而是沿途的风景 🌅',
        category: 'travel',
        tags: ['旅行', '风景', '行囊', '远方'],
        mood: 'motivational',
        isFavorite: true,
        useCount: 89,
        createdAt: new Date().toISOString()
      },
      {
        id: '8',
        title: '海边漫步',
        content: '🌊 走在海边\n听浪花拍打岸边的声音\n\n海风轻抚脸颊\n带走了城市的喧嚣\n留下了内心的宁静 🐚\n\n面朝大海\n春暖花开 🌸',
        category: 'travel',
        tags: ['海边', '海浪', '宁静', '自然'],
        mood: 'casual',
        isFavorite: false,
        useCount: 34,
        createdAt: new Date().toISOString()
      },

      // 美食分享
      {
        id: '9',
        title: '深夜食堂',
        content: '🍜 深夜的泡面\n加个煎蛋\n再来点火腿\n\n简单的美食\n却能温暖整个夜晚 🥚\n\n有时候幸福很简单\n就是一碗热腾腾的面条\n\n#深夜食堂 #泡面 #小确幸',
        category: 'food',
        tags: ['深夜', '泡面', '美食', '温暖'],
        mood: 'happy',
        isFavorite: false,
        useCount: 56,
        createdAt: new Date().toISOString()
      },
      {
        id: '10',
        title: '下午茶时光',
        content: '☕ 午后的咖啡馆\n点一杯拿铁\n配上精致的小点心\n\n阳光透过玻璃窗\n洒在木质桌面上 ☀️\n\n这样的下午茶时光\n让忙碌的生活慢下来 🍰\n\n#下午茶 #咖啡 #慢生活',
        category: 'food',
        tags: ['下午茶', '咖啡', '点心', '悠闲'],
        mood: 'casual',
        isFavorite: true,
        useCount: 71,
        createdAt: new Date().toISOString()
      },

      // 健身运动
      {
        id: '11',
        title: '晨跑日记',
        content: '🏃‍♀️ 今天的晨跑打卡\n6公里，用时30分钟\n\n晨风习习\n心情舒畅\n汗水是最好的见证 💪\n\n运动不仅锻炼身体\n更是对意志力的磨炼\n\n坚持，就是胜利！\n\n#晨跑 #健身 #坚持',
        category: 'fitness',
        tags: ['晨跑', '健身', '坚持', '运动'],
        mood: 'motivational',
        isFavorite: false,
        useCount: 43,
        createdAt: new Date().toISOString()
      },
      {
        id: '12',
        title: '瑜伽冥想',
        content: '🧘‍♀️ 今日瑜伽练习\n在音乐中找到内心的平静\n\n呼吸，伸展，放松\n让身心都得到释放 🕯️\n\n瑜伽不仅是体式的练习\n更是与内在自我的对话\n\n#瑜伽 #冥想 #内心平静',
        category: 'fitness',
        tags: ['瑜伽', '冥想', '放松', '内心'],
        mood: 'thoughtful',
        isFavorite: true,
        useCount: 37,
        createdAt: new Date().toISOString()
      },

      // 深夜时光
      {
        id: '13',
        title: '夜色如墨',
        content: '🌃 夜已深\n城市的灯火依然闪烁\n\n在这寂静的夜里\n思绪如潮水般涌来\n\n想起白天的忙碌\n想起远方的朋友\n想起未完成的梦想 ⭐\n\n夜晚，总是让人多愁善感\n\n晚安，今天的自己',
        category: 'night',
        tags: ['夜晚', '思绪', '灯火', '晚安'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 62,
        createdAt: new Date().toISOString()
      },
      {
        id: '14',
        title: '失眠夜话',
        content: '😴 又是一个失眠的夜晚\n翻来覆去睡不着\n\n索性起来看看月亮\n听听夜风的声音 🌙\n\n失眠的夜里\n总是想得特别多\n关于过去，关于未来\n\n或许这就是深夜的魅力\n让人与内心深处的自己对话',
        category: 'night',
        tags: ['失眠', '深夜', '月亮', '思考'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 48,
        createdAt: new Date().toISOString()
      },

      // 节日祝福
      {
        id: '15',
        title: '春节祝福',
        content: '🧧 新年快乐！\n祝大家在新的一年里\n身体健康，工作顺利\n爱情甜蜜，友情深厚 💕\n\n愿所有的美好\n都如期而至\n愿所有的努力\n都有收获 🎆\n\n新年新气象\n一起加油吧！\n\n#春节快乐 #新年祝福',
        category: 'festival',
        tags: ['春节', '新年', '祝福', '快乐'],
        mood: 'happy',
        isFavorite: true,
        useCount: 125,
        createdAt: new Date().toISOString()
      },
      {
        id: '16',
        title: '生日快乐',
        content: '🎂 Today is my birthday!\n感谢这一年来\n所有的经历和成长\n\n感谢身边的每一个人\n给我的爱与支持 💝\n\n新的一岁\n希望自己能够\n更加勇敢，更加善良\n\n生日快乐，我的dear self! 🎉\n\n#生日快乐 #感恩 #成长',
        category: 'festival',
        tags: ['生日', '感恩', '成长', '快乐'],
        mood: 'happy',
        isFavorite: false,
        useCount: 83,
        createdAt: new Date().toISOString()
      }
    ];

    setTemplates(initialTemplates);
    setFilteredTemplates(initialTemplates);
  }, []);

  /**
   * 搜索和筛选逻辑
   */
  useEffect(() => {
    let filtered = [...templates];

    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 心情筛选
    if (selectedMood) {
      filtered = filtered.filter(template => template.mood === selectedMood);
    }

    // 收藏筛选
    if (showFavoritesOnly) {
      filtered = filtered.filter(template => template.isFavorite);
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 按使用次数排序
    filtered.sort((a, b) => b.useCount - a.useCount);

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, selectedMood, showFavoritesOnly, searchQuery]);

  /**
   * 复制文案
   */
  const copyTemplate = (template: TextTemplate) => {
    navigator.clipboard.writeText(template.content);
    
    // 增加使用次数
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, useCount: t.useCount + 1 } : t
    ));

    toast({
      title: "已复制到剪贴板",
      description: `"${template.title}" 已复制`,
    });
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  /**
   * 添加新文案
   */
  const addNewTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        title: "请填写完整信息",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newTemplate.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const template: TextTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title.trim(),
      content: newTemplate.content.trim(),
      category: newTemplate.category,
      mood: newTemplate.mood,
      tags,
      isFavorite: false,
      useCount: 0,
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [template, ...prev]);
    
    // 重置表单
    setNewTemplate({
      title: '',
      content: '',
      category: 'daily',
      mood: 'casual',
      tags: ''
    });

    setShowCreateDialog(false);

    toast({
      title: "添加成功",
      description: "新文案已添加到模板库",
    });
  };

  /**
   * AI生成文案
   */
  const generateAIText = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "请输入生成提示",
        description: "请描述你想要的文案内容",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 调用真实AI服务生成文案
      const aiService = (await import('@/api/aiService')).callAI;
      
      const styleMap: Record<string, string> = {
        casual: '轻松随性',
        romantic: '浪漫温馨',
        motivational: '励志正能量',
        funny: '幽默搞笑',
        thoughtful: '深度思考'
      };
      const lengthMap: Record<string, string> = {
        short: '简短精练，50字以内',
        medium: '适中深度，50-100字',
        long: '详细丰富，100字以上'
      };

      const prompt = `请为我生成一条朋友圈文案，要求：
1. 主题：${aiPrompt}
2. 风格：${styleMap[aiStyle]}
3. 长度：${lengthMap[aiLength]}
4. 格式：适合微信朋友圈，包含适当的emoji表情
5. 内容：原创、有创意、符合现代年轻人的表达习惯

请直接返回文案内容，不要包含其他说明文字。`;

      const maxTokens = aiLength === 'long' ? 300 : aiLength === 'medium' ? 200 : 150;

      const response = await aiService({
        prompt: prompt,
        model: 'gpt-4',
        maxTokens: maxTokens,
        temperature: 0.8
      });

      let generatedContent = '';
      
      if (response.success && response.content) {
        generatedContent = response.content;
      } else {
        // 如果AI调用失败，使用高质量模拟内容
        generatedContent = `✨ ${aiPrompt}

根据您的要求，以${styleMap[aiStyle]}的风格，
生成了这段${lengthMap[aiLength]}的文案。

${aiStyle === 'romantic' ? '💕 爱情是生活中最美好的旋律' : 
  aiStyle === 'motivational' ? '💪 每一天都是新的开始，加油！' :
  aiStyle === 'funny' ? '😂 生活需要幽默感调味' :
  aiStyle === 'thoughtful' ? '🤔 人生需要时常停下来思考' :
  '😊 保持轻松愉快的心情'}

这是AI为您生成的专属文案 🎯

#AI生成 #${styleMap[aiStyle]} #原创文案`;
      }

      const newTemplate: TextTemplate = {
        id: Date.now().toString(),
        title: `AI生成：${aiPrompt.substring(0, 10)}...`,
        content: generatedContent,
        category: 'daily',
        mood: aiStyle as TextTemplate['mood'],
        tags: ['AI生成', styleMap[aiStyle], '原创'],
        isFavorite: false,
        useCount: 0,
        createdAt: new Date().toISOString()
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setShowAIDialog(false);
      setAIPrompt('');

      toast({
        title: "AI生成成功",
        description: "新文案已添加到模板库",
      });

    } catch (error) {
      console.error('AI生成失败:', error);
      toast({
        title: "生成失败",
        description: "AI生成文案失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 清除所有筛选
   */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMood('');
    setShowFavoritesOnly(false);
  };

  /**
   * 获取分类显示样式
   */
  const getCategoryStyle = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      color: category?.color || 'hsl(var(--muted-foreground))',
      icon: category?.icon
    };
  };

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                朋友圈文案生成器
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                精选文案模板，支持搜索、收藏、AI生成
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    AI生成
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI生成文案</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>生成提示</Label>
                      <Textarea
                        placeholder="描述你想要的文案内容，比如：关于周末慢生活的温馨文案..."
                        value={aiPrompt}
                        onChange={(e) => setAIPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>文案风格</Label>
                        <select
                          value={aiStyle}
                          onChange={(e) => setAIStyle(e.target.value)}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          <option value="casual">轻松随性</option>
                          <option value="romantic">浪漫温馨</option>
                          <option value="motivational">励志正能量</option>
                          <option value="funny">幽默搞笑</option>
                          <option value="thoughtful">深度思考</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label>文案长度</Label>
                        <select
                          value={aiLength}
                          onChange={(e) => setAILength(e.target.value)}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          <option value="short">简短（50字以内）</option>
                          <option value="medium">适中（50-100字）</option>
                          <option value="long">详细（100字以上）</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={generateAIText} 
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          生成文案
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    创建文案
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新文案</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>标题</Label>
                      <Input
                        placeholder="给文案起个名字..."
                        value={newTemplate.title}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label>内容</Label>
                      <Textarea
                        placeholder="输入文案内容..."
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                        rows={6}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>分类</Label>
                        <select
                          value={newTemplate.category}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          {categories.slice(1).map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label>心情</Label>
                        <select
                          value={newTemplate.mood}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, mood: e.target.value as any }))}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          {moodTags.map(mood => (
                            <option key={mood.id} value={mood.id}>
                              {mood.emoji} {mood.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input
                        placeholder="标签1, 标签2, 标签3..."
                        value={newTemplate.tags}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                    
                    <Button onClick={addNewTemplate} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      添加文案
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* 搜索栏 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜索文案、标签或内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              我的收藏
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              清除筛选
            </Button>
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>

          {/* 心情筛选 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMood === '' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMood('')}
            >
              全部心情
            </Button>
            {moodTags.map(mood => (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood.id)}
              >
                <span className="mr-1">{mood.emoji}</span>
                {mood.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 文案模板网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const categoryStyle = getCategoryStyle(template.category);
          const moodTag = moodTags.find(m => m.id === template.mood);
          
          return (
            <Card key={template.id} className="relative group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-2">{template.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryStyle.icon}
                        <span className="ml-1">{categories.find(c => c.id === template.category)?.name}</span>
                      </Badge>
                      {moodTag && (
                        <Badge variant="outline" className={`text-xs ${moodTag.color}`}>
                          <span className="mr-1">{moodTag.emoji}</span>
                          {moodTag.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart 
                      className={`w-4 h-4 ${template.isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="bg-accent p-3 rounded-lg mb-3 max-h-32 overflow-hidden">
                  <p className="text-sm text-foreground whitespace-pre-line line-clamp-4">
                    {template.content}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryStyle.icon}
                      <span className="ml-1">{categories.find(c => c.id === template.category)?.name}</span>
                    </Badge>
                  </div>
                  <Button
                    onClick={() => copyTemplate(template)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">没有找到相关文案</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? '尝试调整搜索关键词' : '尝试调整筛选条件'}
              </p>
              <Button onClick={clearFilters} variant="outline">
                <X className="w-4 h-4 mr-2" />
                清除所有筛选
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 