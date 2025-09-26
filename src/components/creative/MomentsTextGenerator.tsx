/**
 * t('momentsGenerator.title')
 * t('momentsGenerator.description')
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Zap,
  Eye,
  Edit,
  Share2,
  TrendingUp,
  Calendar,
  Smile,
  Users,
  ChevronDown,
  Settings,
  Layers,
  Grid,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './MomentsTextGenerator.css';

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
 * 行业模板配置
 */
const industryTemplates = [
  { id: 'restaurant', name: '餐饮行业', icon: <Utensils className="w-4 h-4" />, emoji: '🍕', count: 28 },
  { id: 'beauty', name: '美妆时尚', icon: <Sparkles className="w-4 h-4" />, emoji: '💄', count: 32 },
  { id: 'fitness', name: '健身运动', icon: <Dumbbell className="w-4 h-4" />, emoji: '💪', count: 24 },
  { id: 'education', name: '教育培训', icon: <BookOpen className="w-4 h-4" />, emoji: '📚', count: 26 },
  { id: 'retail', name: '电商零售', icon: <Tag className="w-4 h-4" />, emoji: '🛍️', count: 35 },
  { id: 'travel', name: '旅游出行', icon: <Plane className="w-4 h-4" />, emoji: '✈️', count: 29 },
];

/**
 * 节假日模板配置
 */
const holidayTemplates = [
  { id: 'spring_festival', name: '春节新年', emoji: '🧧', isActive: false },
  { id: 'valentines', name: '情人节', emoji: '💕', isActive: false },
  { id: 'womens_day', name: '妇女节', emoji: '🌸', isActive: false },
  { id: 'mid_autumn', name: '中秋节', emoji: '🌕', isActive: false },
  { id: 'national_day', name: '国庆节', emoji: '🇨🇳', isActive: false },
  { id: 'double_eleven', name: '双十一', emoji: '🛒', isActive: true },
  { id: 'christmas', name: '圣诞节', emoji: '🎄', isActive: true },
];

/**
 * 装饰元素配置
 */
const decorationElements = {
  emojis: {
    basic: ['😊', '😍', '😎', '🤔', '😢', '😡', '🥰', '😘', '🤗', '😋'],
    gestures: ['👍', '👌', '✌️', '🤝', '👏', '💪', '🙏', '✊', '👋', '🤘'],
    objects: ['🎁', '🌸', '🔥', '⭐', '💎', '🎯', '🌈', '☀️', '🌙', '⚡'],
    hearts: ['💕', '💖', '💗', '💘', '💝', '💞', '💟', '❤️', '🧡', '💛']
  },
  emoticons: {
    happy: ['(◕‿◕)', '٩(◕‿◕)۶', '(≧∇≦)ﾉ', '(＾▽＾)', 'ヽ(°〇°)ﾉ'],
    cute: ['(｡♥‿♥｡)', '(๑´ڡ`๑)', '(◡ ‿ ◡)', '(´∀｀)♡', '(✿◠‿◠)'],
    surprised: ['(⊙_⊙)', '(°o°)', 'ヽ(°〇°)ﾉ', '(◎_◎)', '(゜o゜)'],
    strong: ['ᕦ(ò_óˇ)ᕤ', '(ง •̀_•́)ง', '💪(￣▽￣)💪', 'ᕙ(⇀‸↼‶)ᕗ'],
    thinking: ['(´･ω･`)', '(￣ω￣)', '(´-ω-`)', '(￣へ￣)', '(๑•́ ₃ •̀๑)']
  }
};

/**
 * 视图模式配置
 */
const viewModes = [
  { id: 'grid', name: '网格视图', icon: <Grid className="w-4 h-4" /> },
  { id: 'list', name: '列表视图', icon: <List className="w-4 h-4" /> },
];

/**
 * 朋友圈文案生成器组件
 */
export function MomentsTextGenerator() {
  const { t } = useTranslation();
  const { toast } = useToast();

  /**
   * 分类配置 - 增强版
   */
  const categories = [
    { id: 'all', name: '全部', icon: <Grid className="w-4 h-4" />, color: 'hsl(var(--muted-foreground))', description: '查看所有文案模板' },
    { id: 'daily', name: '日常生活', icon: <Coffee className="w-4 h-4" />, color: 'hsl(220 14.3% 95.9%)', description: '记录生活点滴美好' },
    { id: 'emotion', name: '情感心情', icon: <Heart className="w-4 h-4" />, color: 'hsl(0 84.2% 60.2%)', description: '表达内心真实感受' },
    { id: 'work', name: '工作学习', icon: <BookOpen className="w-4 h-4" />, color: 'hsl(142.1 76.2% 36.3%)', description: '职场成长与学习心得' },
    { id: 'travel', name: '旅行生活', icon: <Plane className="w-4 h-4" />, color: 'hsl(221.2 83.2% 53.3%)', description: '记录旅途精彩瞬间' },
    { id: 'food', name: '美食分享', icon: <Utensils className="w-4 h-4" />, color: 'hsl(47.9 95.8% 53.1%)', description: '分享美食与味蕾体验' },
    { id: 'fitness', name: '健身运动', icon: <Dumbbell className="w-4 h-4" />, color: 'hsl(173 80% 40%)', description: '运动打卡与健康生活' },
    { id: 'night', name: '深夜时光', icon: <Clock className="w-4 h-4" />, color: 'hsl(258.3 89.5% 66.3%)', description: '夜深人静的思考时刻' },
    { id: 'festival', name: '节日祝福', icon: <Gift className="w-4 h-4" />, color: 'hsl(346.8 77.2% 49.8%)', description: '节庆祝福与特殊时刻' },
  ];

  /**
   * 心情配置
   */
  const MOODS = [
    { id: 'happy', name: '开心', emoji: '😊', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', description: '快乐正能量' },
    { id: 'romantic', name: '浪漫', emoji: '💕', color: 'bg-pink-50 text-pink-700 border-pink-200', description: '温柔甜蜜' },
    { id: 'motivational', name: '励志', emoji: '💪', color: 'bg-orange-50 text-orange-700 border-orange-200', description: '积极向上' },
    { id: 'casual', name: '随性', emoji: '😎', color: 'bg-blue-50 text-blue-700 border-blue-200', description: '轻松自在' },
    { id: 'thoughtful', name: '深思', emoji: '🤔', color: 'bg-purple-50 text-purple-700 border-purple-200', description: '深度思考' },
    { id: 'funny', name: '搞笑', emoji: '😂', color: 'bg-green-50 text-green-700 border-green-200', description: '幽默风趣' },
  ];

  /**
   * 排序选项配置
   */
  const sortOptions = [
    { id: 'useCount', name: '使用次数', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'created', name: '创建时间', icon: <Clock className="w-4 h-4" /> },
    { id: 'title', name: '标题排序', icon: <Tag className="w-4 h-4" /> },
    { id: 'favorite', name: '收藏优先', icon: <Heart className="w-4 h-4" /> },
  ];

  // 基础状态管理
  const [templates, setTemplates] = useState<TextTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TextTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // 新增的UI状态
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('useCount');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedHoliday, setSelectedHoliday] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // 对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDecorationPanel, setShowDecorationPanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TextTemplate | null>(null);

  // AI生成相关状态
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiStyle, setAIStyle] = useState('casual');
  const [aiLength, setAILength] = useState('short');
  const [aiIndustry, setAIIndustry] = useState('');
  const [aiIncludeDecorations, setAIIncludeDecorations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // 新建文案状态 - 增强版
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'daily',
    mood: 'casual' as TextTemplate['mood'],
    tags: '',
    industry: '',
    decorations: {
      emojis: [] as string[],
      emoticons: [] as string[]
    }
  });

  // 装饰系统状态
  const [selectedDecorations, setSelectedDecorations] = useState({
    emojis: [] as string[],
    emoticons: [] as string[]
  });
  const [decorationCategory, setDecorationCategory] = useState('basic');

  // 动画状态
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [favoriteAnimationId, setFavoriteAnimationId] = useState<string | null>(null);
  const [buttonClickAnimation, setButtonClickAnimation] = useState<string | null>(null);

  // 搜索建议状态
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 计算属性：搜索建议
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const allTags = templates.flatMap(t => t.tags);
    const allTitles = templates.map(t => t.title);
    const allKeywords = [...new Set([...allTags, ...allTitles])];
    
    return allKeywords
      .filter(keyword => 
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery, templates]);

  // 计算属性：统计信息
  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const favoriteCount = templates.filter(t => t.isFavorite).length;
    const categoryStats = categories.slice(1).map(cat => ({
      ...cat,
      count: templates.filter(t => t.category === cat.id).length
    }));
    
    return {
      total: totalTemplates,
      favorites: favoriteCount,
      categories: categoryStats
    };
  }, [templates]);

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
    ];

    setTemplates(initialTemplates);
    setFilteredTemplates(initialTemplates);
  }, []);

  /**
   * 搜索和筛选逻辑 - 增强版
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
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 排序逻辑
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'useCount':
          return b.useCount - a.useCount;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'favorite':
          if (a.isFavorite === b.isFavorite) {
            return b.useCount - a.useCount;
          }
          return a.isFavorite ? -1 : 1;
        default:
          return b.useCount - a.useCount;
      }
    });

    setFilteredTemplates(filtered);
  }, [
    templates, 
    selectedCategory, 
    selectedMood,
    showFavoritesOnly, 
    searchQuery,
    sortBy
  ]);

  /**
   * 复制文案 - 增强动画版
   */
  const copyTemplate = async (template: TextTemplate) => {
    try {
      // 设置复制动画状态
      setCopyingId(template.id);
      
      await navigator.clipboard.writeText(template.content);
      
      // 增加使用次数
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, useCount: t.useCount + 1 } : t
      ));

      toast({
        title: "✨ 已复制到剪贴板",
        description: `"${template.title}" 已成功复制`,
      });
      
      // 清除动画状态
      setTimeout(() => setCopyingId(null), 600);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动选中并复制文案内容",
        variant: "destructive"
      });
      setCopyingId(null);
    }
  };

  /**
   * 切换收藏状态 - 增强动画版
   */
  const toggleFavorite = (templateId: string) => {
    // 设置动画状态
    setFavoriteAnimationId(templateId);
    
    setTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        const newFavoriteState = !template.isFavorite;
        
        // 显示相应的toast消息
        toast({
          title: newFavoriteState ? "❤️ 已添加到收藏" : "💔 已取消收藏",
          description: `"${template.title}" ${newFavoriteState ? '已收藏' : '已取消收藏'}`,
        });
        
        return { ...template, isFavorite: newFavoriteState };
      }
      return template;
    }));
    
    // 清除动画状态
    setTimeout(() => setFavoriteAnimationId(null), 600);
  };

  /**
   * 清除所有筛选 - 增强版
   */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMood('');
    setShowFavoritesOnly(false);
    setShowSuggestions(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
        {/* 头部区域 - 响应式优化 */}
        <div className="mb-6 lg:mb-8">
          <div className="text-center mb-4 lg:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-background" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              朋友圈文案生成器
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              智能创作精美文案，让你的朋友圈更有趣 ✨
            </p>
          </div>
          
          {/* 统计信息卡片 - 响应式网格 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 lg:mb-6">
            <Card className="text-center p-3 sm:p-4 bg-background/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">总模板数</div>
            </Card>
            <Card className="text-center p-3 sm:p-4 bg-background/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-destructive">{stats.favorites}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">我的收藏</div>
            </Card>
            <Card className="text-center p-3 sm:p-4 bg-background/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-success">{filteredTemplates.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">筛选结果</div>
            </Card>
            <Card className="text-center p-3 sm:p-4 bg-background/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{industryTemplates.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">行业模板</div>
            </Card>
          </div>
        </div>

        {/* 操作栏 - 响应式优化 */}
        <Card className="mb-4 lg:mb-6 bg-background/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg w-full sm:w-auto">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  AI智能生成
                </Button>
                
                <Button variant="outline" size="lg" className="border-2 hover:bg-accent w-full sm:w-auto">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  创建文案
                </Button>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                {/* 视图切换 - 移动端隐藏文字 */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  {viewModes.map(mode => (
                    <Button
                      key={mode.id}
                      variant={viewMode === mode.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(mode.id as 'grid' | 'list')}
                      className="h-8 px-2 sm:px-3"
                      title={mode.name}
                    >
                      {mode.icon}
                      <span className="hidden sm:inline ml-1">{mode.name}</span>
                    </Button>
                  ))}
                </div>
                
                {/* 排序选项 - 响应式宽度 */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span className="hidden sm:inline">{option.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 搜索栏 - 响应式优化 */}
            <div className="relative mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="搜索文案标题、内容或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 h-10 sm:h-12 text-base sm:text-lg border-2 focus:border-primary bg-background"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant={showAdvancedFilters ? "default" : "outline"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="h-10 sm:h-12 px-3 sm:px-6 flex-1 sm:flex-none"
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                    <span className="hidden sm:inline">高级筛选</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="h-10 sm:h-12 px-3 sm:px-6"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                    <span className="hidden sm:inline">清除</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 分类筛选 - 响应式网格 */}
            <div className="mb-4 sm:mb-6">
              <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">分类筛选</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
                {categories.map((category, index) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 h-auto transition-all hover:scale-105 fade-in ${
                      selectedCategory === category.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-background filter-tag-active' 
                        : 'bg-background hover:bg-accent'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-xs sm:text-sm">{category.icon}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden text-xs">{category.name.slice(0, 2)}</span>
                    {category.id !== 'all' && (
                      <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4 count-up">
                        {stats.categories.find(c => c.id === category.id)?.count || 0}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* 心情筛选 - 响应式网格 */}
            <div className="mb-4 sm:mb-6">
              <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">心情筛选</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                <Button
                  variant={selectedMood === '' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood('')}
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto transition-all hover:scale-105 fade-in ${
                    selectedMood === '' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-background filter-tag-active' 
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  <span className="hidden sm:inline">全部心情</span>
                  <span className="sm:hidden">全部</span>
                </Button>
                {MOODS.map((mood, index) => (
                  <Button
                    key={mood.id}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto transition-all hover:scale-105 fade-in ${
                      selectedMood === mood.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-background filter-tag-active' 
                        : `bg-background hover:bg-accent ${mood.color}`
                    }`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <span className="mr-1 text-xs sm:text-sm">{mood.emoji}</span>
                    <span className="hidden sm:inline">{mood.name}</span>
                    <span className="sm:hidden text-xs">{mood.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文案模板网格 - 响应式优化 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredTemplates.map((template, index) => {
              const categoryStyle = getCategoryStyle(template.category);
              const moodTag = MOODS.find(m => m.id === template.mood);
              const isAnimating = favoriteAnimationId === template.id;
              const isCopying = copyingId === template.id;
              
              return (
                <Card 
                  key={template.id} 
                  className={`template-card group bg-background/90 backdrop-blur-sm border-0 shadow-lg ${
                    index % 4 === 0 ? 'fade-in' : 
                    index % 4 === 1 ? 'fade-in-delay-1' :
                    index % 4 === 2 ? 'fade-in-delay-2' : 'fade-in-delay-3'
                  }`}
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-1 pr-2">{template.title}</h3>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-background/80 px-1 sm:px-2 py-0 h-5 sm:h-6 tag-hover inline-style-converted" 
                          >
                            <span className="text-xs">{categoryStyle.icon}</span>
                            <span className="ml-1 hidden sm:inline text-xs">{categories.find(c => c.id === template.category)?.name}</span>
                          </Badge>
                          {moodTag && (
                            <Badge variant="outline" className={`text-xs px-1 sm:px-2 py-0 h-5 sm:h-6 tag-hover ${moodTag.color}`}>
                              <span className="text-xs">{moodTag.emoji}</span>
                              <span className="ml-1 hidden sm:inline text-xs">{moodTag.name}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(template.id)}
                        className={`h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-70 hover:opacity-100 flex-shrink-0 transition-all ${
                          isAnimating ? 'heart-favorite' : ''
                        }`}
                      >
                        <Heart 
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${
                            template.isFavorite ? 'fill-red-500 text-destructive scale-110' : 'text-muted-foreground hover:text-destructive'
                          }`} 
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 max-h-28 sm:max-h-36 overflow-hidden relative transition-all hover:shadow-inner">
                      <p className="text-xs sm:text-sm text-foreground whitespace-pre-line line-clamp-4 sm:line-clamp-5">
                        {template.content}
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-4 sm:h-6 bg-gradient-to-t from-slate-50 to-transparent"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-background/60 px-1 py-0 h-4 tag-hover">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-background/60 px-1 py-0 h-4 tag-hover">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span className="hidden sm:inline count-up">使用 {template.useCount} 次</span>
                        <span className="sm:hidden count-up">{template.useCount}</span>
                      </div>
                      <div className="flex items-center gap-0 sm:gap-1">
                        <Button
                          onClick={() => copyTemplate(template)}
                          disabled={isCopying}
                          size="sm"
                          className={`h-6 sm:h-8 px-2 sm:px-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm transition-all hover:scale-105 ${
                            isCopying ? 'copy-success button-loading' : ''
                          }`}
                        >
                          {isCopying ? (
                            <div className="loading-dots">复制中</div>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">复制</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map(template => {
              const categoryStyle = getCategoryStyle(template.category);
              const moodTag = MOODS.find(m => m.id === template.mood);
              
              return (
                <Card key={template.id} className="bg-background/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{template.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs inline-style-converted">
                              {categoryStyle.icon}
                              <span className="ml-1">{categories.find(c => c.id === template.category)?.name}</span>
                            </Badge>
                            {moodTag && (
                              <Badge variant="outline" className={`text-xs ${moodTag.color}`}>
                                <span className="mr-1">{moodTag.emoji}</span>
                                {moodTag.name}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {template.useCount}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-lg mb-3">
                          <p className="text-sm text-foreground whitespace-pre-line">
                            {template.content}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-background/60">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(template.id)}
                          className="h-10 w-10 p-0"
                        >
                          <Heart 
                            className={`w-5 h-5 transition-colors ${
                              template.isFavorite ? 'fill-red-500 text-destructive' : 'text-muted-foreground hover:text-destructive'
                            }`} 
                          />
                        </Button>
                        
                        <Button
                          onClick={() => copyTemplate(template)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 空状态 */}
        {filteredTemplates.length === 0 && (
          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">未找到相关文案</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery ? '尝试调整搜索关键词或放宽筛选条件' : '尝试调整筛选条件或创建新文案'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={clearFilters} variant="outline" size="lg">
                    <X className="w-5 h-5 mr-2" />
                    清除筛选
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}