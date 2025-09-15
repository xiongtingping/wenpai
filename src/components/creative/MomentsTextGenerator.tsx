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
 * 分类配置 - 增强版
 */
const categories = [
  { id: 'all', name: '全部', icon: <Grid className="w-4 h-4" />, color: 'hsl(var(--muted-foreground))', description: '查看所有文案模板' },
  { id: 'daily', name: t('momentsGenerator.categories.daily'), icon: <Coffee className="w-4 h-4" />, color: 'hsl(220 14.3% 95.9%)', description: '记录生活点滴美好' },
  { id: 'emotion', name: t('components.text.情感心情_87i'), icon: <Heart className="w-4 h-4" />, color: 'hsl(0 84.2% 60.2%)', description: '表达内心真实感受' },
  { id: 'work', name: t('components.text.工作学习_dg8'), icon: <BookOpen className="w-4 h-4" />, color: 'hsl(142.1 76.2% 36.3%)', description: '职场成长与学习心得' },
  { id: 'travel', name: t('components.text.旅行生活_vnp'), icon: <Plane className="w-4 h-4" />, color: 'hsl(221.2 83.2% 53.3%)', description: '记录旅途精彩瞬间' },
  { id: 'food', name: t('momentsGenerator.categories.food'), icon: <Utensils className="w-4 h-4" />, color: 'hsl(47.9 95.8% 53.1%)', description: '分享美食与味蕾体验' },
  { id: 'fitness', name: t('momentsGenerator.categories.fitness'), icon: <Dumbbell className="w-4 h-4" />, color: 'hsl(173 80% 40%)', description: '运动打卡与健康生活' },
  { id: 'night', name: t('components.text.深夜时光_9em'), icon: <Clock className="w-4 h-4" />, color: 'hsl(258.3 89.5% 66.3%)', description: '夜深人静的思考时刻' },
  { id: 'festival', name: t('components.text.节日祝福_loy'), icon: <Gift className="w-4 h-4" />, color: 'hsl(346.8 77.2% 49.8%)', description: '节庆祝福与特殊时刻' },
];

/**
 * 行业模板配置
 */
const industryTemplates = [
  { id: 'restaurant', name: '餐饮行业', icon: <Utensils className="w-4 h-4" />, emoji: '🍕', count: 28 },
  { id: 'beauty', name: '美妆时尚', icon: <Sparkles className="w-4 h-4" />, emoji: '💄', count: 32 },
  { id: 'fitness', name: t('momentsGenerator.categories.fitness'), icon: <Dumbbell className="w-4 h-4" />, emoji: '💪', count: 24 },
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
    thinking: ['(´･ω･`)', '(￣ω￣)', '(´-ω-`)', '(￣へ￣)', '(๑•́ ₃ •̀๑)happy', name: '开心', emoji: '😊', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', description: '快乐正能量' },
  { id: 'romantic', name: '浪漫', emoji: '💕', color: 'bg-pink-50 text-pink-700 border-pink-200', description: '温柔甜蜜' },
  { id: 'motivational', name: '励志', emoji: '💪', color: 'bg-orange-50 text-orange-700 border-orange-200', description: '积极向上' },
  { id: 'casual', name: '随性', emoji: '😎', color: 'bg-blue-50 text-blue-700 border-blue-200', description: '轻松自在' },
  { id: 'thoughtful', name: '深思', emoji: '🤔', color: 'bg-purple-50 text-purple-700 border-purple-200', description: t('components.text.深度思考_bpo') },
  { id: 'funny', name: '搞笑', emoji: '😂', color: 'bg-green-50 text-green-700 border-green-200', description: '幽默风趣' },
];

/**
 * 视图模式配置
 */
const viewModes = [
  { id: 'grid', name: '网格视图', icon: <Grid className="w-4 h-4" /> },
  { id: 'list', name: t('components.text.列表视图_5ar'), icon: <List className="w-4 h-4" /> },
];

/**
 * 排序选项配置
 */
const sortOptions = [
  { id: 'useCount', name: '使用次数', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'created', name: '创建时间', icon: <Clock className="w-4 h-4" /> },
  { id: 'title', name: t(), icon: <Tag className="w-4 h-4" /> },
  { id: 'favorite', name: '收藏优先', icon: <Heart className="w-4 h-4" /> },
];

/**
 * 朋友圈文案生成器组件
 */
export function MomentsTextGenerator() {
  const { toast } = useToast();

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
        title: t('components.labels.晨光微醺'),
        content: '☀️ 清晨的第一缕阳光\n透过百叶窗洒在桌案上\n咖啡香气缓缓升腾\n新的一天，从容开始\n\n愿你我都能在平凡中\n找到属于自己的小确幸 ✨',
        category: 'daily',
        tags: ['晨光', t('components.text.咖啡_x5o'), '小确幸', '生活'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: t('components.labels.周末慢时光'),
        content: '🌿 Weekend vibes\n没有闹钟的早晨\n慵懒地窝在沙发里\n阳光正好，微风不燥\n\n这样的周末\n值得用来虚度 💫\n\n#周末 #慢生活',
        category: 'daily',
        tags: [t('components.text.周末_17g'), '慵懒', '阳光', 'weekend'],
        mood: 'casual',
        isFavorite: true,
        useCount: 28,
        createdAt: new Date().toISOString()
      },
      
      // 情感心情
      {
        id: '3',
        title: t('components.labels.月光下的思绪'),
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
        title: t('components.labels.春天的约定'),
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
        title: t('components.labels.深夜加班记'),
        content: '💻 又是一个加班的夜晚\n办公室的灯还亮着\n外面的世界已经安静\n\n虽然累，但充实\n每一份努力\n都是在为梦想加分 ✨\n\n#加班 #奋斗 #梦想',
        category: 'work',
        tags: [t('components.text.加班_8kf'), t('components.text.奋斗_cc1'), '努力', '梦想'],
        mood: 'motivational',
        isFavorite: false,
        useCount: 23,
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        title: t('components.labels.读书时光'),
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
        title: t('components.labels.远方的诗'),
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
        title: t('components.labels.海边漫步'),
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
        title: t('components.labels.深夜食堂'),
        content: '🍜 深夜的泡面\n加个煎蛋\n再来点火腿\n\n简单的美食\n却能温暖整个夜晚 🥚\n\n有时候幸福很简单\n就是一碗热腾腾的面条\n\n#深夜食堂 #泡面 #小确幸',
        category: 'food',
        tags: ['深夜', t('components.text.泡面_ju6'), '美食', '温暖'],
        mood: 'happy',
        isFavorite: false,
        useCount: 56,
        createdAt: new Date().toISOString()
      },
      {
        id: '10',
        title: t('components.labels.下午茶时光'),
        content: '☕ 午后的咖啡馆\n点一杯拿铁\n配上精致的小点心\n\n阳光透过玻璃窗\n洒在木质桌面上 ☀️\n\n这样的下午茶时光\n让忙碌的生活慢下来 🍰\n\n#下午茶 #咖啡 #慢生活',
        category: 'food',
        tags: [t('components.text.下午茶_lut'), t('components.text.咖啡_x5o'), '点心', '悠闲'],
        mood: 'casual',
        isFavorite: true,
        useCount: 71,
        createdAt: new Date().toISOString()
      },

      // 健身运动
      {
        id: '11',
        title: t('components.labels.晨跑日记'),
        content: '🏃‍♀️ 今天的晨跑打卡\n6公里，用时30分钟\n\n晨风习习\n心情舒畅\n汗水是最好的见证 💪\n\n运动不仅锻炼身体\n更是对意志力的磨炼\n\n坚持，就是胜利！\n\n#晨跑 #健身 #坚持',
        category: 'fitness',
        tags: ['晨跑', t('components.text.健身_ugh'), '坚持', '运动'],
        mood: 'motivational',
        isFavorite: false,
        useCount: 43,
        createdAt: new Date().toISOString()
      },
      {
        id: '12',
        title: t('components.labels.瑜伽冥想'),
        content: '🧘‍♀️ 今日瑜伽练习\n在音乐中找到内心的平静\n\n呼吸，伸展，放松\n让身心都得到释放 🕯️\n\n瑜伽不仅是体式的练习\n更是与内在自我的对话\n\n#瑜伽 #冥想 #内心平静',
        category: 'fitness',
        tags: ['瑜伽', t('components.text.冥想_05f'), '放松', '内心'],
        mood: 'thoughtful',
        isFavorite: true,
        useCount: 37,
        createdAt: new Date().toISOString()
      },

      // 深夜时光
      {
        id: '13',
        title: t('components.labels.夜色如墨'),
        content: $,
        category: 'night',
        tags: ['夜晚', '思绪', '灯火', '晚安'],
        mood: 'thoughtful',
        isFavorite: false,
        useCount: 62,
        createdAt: new Date().toISOString()
      },
      {
        id: '14',
        title: t('components.labels.失眠夜话'),
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
        title: t('components.labels.春节祝福'),
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
        title: t('components.labels.生日快乐'),
        content: '🎂 Today is my birthday!\n感谢这一年来\n所有的经历和成长\n\n感谢身边的每一个人\n给我的爱与支持 💝\n\n新的一岁\n希望自己能够\n更加勇敢，更加善良\n\n生日快乐，我的dear self! 🎉\n\n#生日快乐 #感恩 #成长',
        category: 'festival',
        tags: ['生日', t('components.text.感恩_c8r'), '成长', '快乐'],
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

    // 行业筛选
    if (selectedIndustry) {
      filtered = filtered.filter(template => 
        template.tags.some(tag => 
          tag.toLowerCase().includes(selectedIndustry.toLowerCase())
        )
      );
    }

    // 节假日筛选
    if (selectedHoliday) {
      const holidayKeywords = {
        'spring_festival': ['春节', '新年', '过年'],
        'valentines': ['情人节', '浪漫', '爱情'],
        'womens_day': ['妇女节', '女性', '女神'],
        'mid_autumn': ['中秋', '月饼', '团圆'],
        'national_day': ['国庆', '十一', '祖国'],
        'double_eleven': ['双十一', '购物', '促销'],
        'christmas': ['圣诞', '平安夜', '节日']
      };
      
      const keywords = holidayKeywords[selectedHoliday as keyof typeof holidayKeywords] || [];
      filtered = filtered.filter(template =>
        keywords.some(keyword => 
          template.content.includes(keyword) || 
          template.tags.some(tag => tag.includes(keyword))
        )
      );
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
    selectedIndustry,
    selectedHoliday,
    showFavoritesOnly, 
    searchQuery,
    sortBy
  ]);

  /**
   * 搜索建议处理
   */
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, suggestions]);

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
        title: t(),
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
          title: newFavoriteState ? "❤️ 已添加到收藏" : $,
          description: `"${template.title}" ${newFavoriteState ? t('components.labels.已收藏') : t()}`,
        });
        
        return { ...template, isFavorite: newFavoriteState };
      }
      return template;
    }));
    
    // 清除动画状态
    setTimeout(() => setFavoriteAnimationId(null), 600);
  };

  /**
   * 按钮点击动画
   */
  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonClickAnimation(buttonId);
    action();
    setTimeout(() => setButtonClickAnimation(null), 300);
  };

  /**
   * 添加新文案
   */
  const addNewTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        title: t('components.labels.请填写完整信息'),
        description: ,
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
      tags: '',
      industry: '',
      decorations: {
        emojis: [],
        emoticons: []
      }
    });

    setShowCreateDialog(false);

    toast({
      title: t(),
      description: "新文案已添加到模板库",
    });
  };

  /**
   * AI生成文案
   */
  const generateAIText = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: t($),
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
        casual: t('components.text.轻松随性_asj'),
        romantic: t('components.text.浪漫温馨_d57'),
        motivational: t('components.text.励志正能量_lcj'),
        funny: t('components.text.幽默搞笑_d5p'),
        thoughtful: t('components.text.深度思考_bpo')
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
        tags: [t('momentsGenerator.tabs.generate'), styleMap[aiStyle], '原创'],
        isFavorite: false,
        useCount: 0,
        createdAt: new Date().toISOString()
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setShowAIDialog(false);
      setAIPrompt('');

      toast({
        title: ,
        description: "新文案已添加到模板库",
      });

    } catch (error) {
      console.error(t('components.error.AI生成失败_kbm'), error);
      toast({
        title: t(),
        description: ,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 清除所有筛选 - 增强版
   */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMood('');
    setSelectedIndustry('');
    setSelectedHoliday('');
    setShowFavoritesOnly(false);
    setShowSuggestions(false);
  };

  /**
   * 预览模板
   */
  const previewTemplate = (template: TextTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  /**
   * 一键分享功能
   */
  const shareTemplate = async (template: TextTemplate) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: template.title,
          text: template.content,
          url: window.location.href
        });
        
        toast({
          title: t($),
          description: `"${template.title}" 已分享`,
        });
      } catch (error) {
        // 用户取消了分享
      }
    } else {
      // 退匠到复制功能
      copyTemplate(template);
      toast({
        title: t('components.labels.已复制到剪贴板'),
        description: "您可以手动分享该内容",
      });
    }
  };

  /**
   * 添加装饰元素
   */
  const addDecoration = (type: 'emoji' | 'emoticon', decoration: string) => {
    if (type === 'emoji') {
      setSelectedDecorations(prev => ({
        ...prev,
        emojis: prev.emojis.includes(decoration) 
          ? prev.emojis.filter(e => e !== decoration)
          : [...prev.emojis, decoration]
      }));
    } else {
      setSelectedDecorations(prev => ({
        ...prev,
        emoticons: prev.emoticons.includes(decoration)
          ? prev.emoticons.filter(e => e !== decoration)
          : [...prev.emoticons, decoration]
      }));
    }
  };

  /**
   * 应用装饰到文案
   */
  const applyDecorations = (content: string): string => {
    let decoratedContent = content;
    
    // 添加选中的emoji
    if (selectedDecorations.emojis.length > 0) {
      const randomEmojis = selectedDecorations.emojis
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .join(' ');
      decoratedContent = `${randomEmojis} ${decoratedContent}`;
    }
    
    // 添加选中的颜文字
    if (selectedDecorations.emoticons.length > 0) {
      const randomEmoticon = selectedDecorations.emoticons[
        Math.floor(Math.random() * selectedDecorations.emoticons.length)
      ];
      decoratedContent = `${decoratedContent} ${randomEmoticon}`;
    }
    
    return decoratedContent;
  };

  /**
   * 搜索建议选择
   */
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  /**
   * 快速筛选按钮
   */
  const quickFilters = [
    { id: 'popular', name: '热门文案', action: () => setSortBy('useCount') },
    { id: 'latest', name: '最新添加', action: () => setSortBy('created') },
    { id: 'favorites', name: t('momentsGenerator.tabs.favorites'), action: () => setShowFavoritesOnly(!showFavoritesOnly) },
    { id: 'romantic', name: '浪漫系列', action: () => setSelectedMood('romantic') },
    { id: 'motivational', name: t('components.text.励志正能量_lcj'), action: () => setSelectedMood('motivational') },
  ];

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
          <CardContent className="p-4 sm:p-6flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg w-full sm:w-auto">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      AI智能生成
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="border-2 hover:bg-accent w-full sm:w-auto">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      创建文案
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowDecorationPanel(!showDecorationPanel)}
                  className="border-2 hover:bg-accent w-full sm:w-auto"
                >
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  装饰元素
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
                    placeholder=$
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
              
              {/* 搜索建议 - 增强动画版 */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-10 mt-2 bg-background shadow-xl search-suggestions-enter-active border-0">
                  <CardContent className="p-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left hover:bg-blue-50 transition-all hover:scale-[1.02] fade-in"
                        onClick={() => selectSuggestion(suggestion)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Search className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="search-highlight$flex flex-wrap gap-2 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground self-center mr-1 sm:mr-2 w-full sm:w-auto mb-1 sm:mb-0">快速筛选：</span>
              {quickFilters.map((filter, index) => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(`quick-${filter.id}`, filter.action)}
                  className={`bg-background hover:bg-accent border-muted-foreground/20 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 tag-hover fade-in ${
                    buttonClickAnimation === `quick-${filter.id}` ? 'pulse-on-click' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {filter.name}
                </Button>
              ))}
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
                    onClick={() => {
                      handleButtonClick(`category-${category.id}`, () => setSelectedCategory(category.id));
                    }}
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 h-auto transition-all hover:scale-105 fade-in ${
                      selectedCategory === category.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-background filter-tag-active' 
                        : 'bg-background hover:bg-accent'
                    } ${buttonClickAnimation === `category-${category.id}` ? 'pulse-on-click' : ''}`}
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
              <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block$grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                <Button
                  variant={selectedMood === '' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleButtonClick('mood-all', () => setSelectedMood(''))}
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto transition-all hover:scale-105 fade-in ${
                    selectedMood === '' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-background filter-tag-active' 
                      : 'bg-background hover:bg-accent'
                  } ${buttonClickAnimation === 'mood-all' ? 'pulse-on-click' : ''}`}
                >
                  <span className="hidden sm:inline">全部心情</span>
                  <span className="sm:hidden">全部</span>
                </Button>
                {moodTags.map((mood, index) => (
                  <Button
                    key={mood.id}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleButtonClick(`mood-${mood.id}`, () => setSelectedMood(mood.id))}
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto transition-all hover:scale-105 fade-in ${
                      selectedMood === mood.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-background filter-tag-active' 
                        : `bg-background hover:bg-accent ${mood.color}`
                    } ${buttonClickAnimation === `mood-${mood.id}` ? 'pulse-on-click' : ''}`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <span className="mr-1 text-xs sm:text-sm">{mood.emoji}</span>
                    <span className="hidden sm:inline">{mood.name}</span>
                    <span className="sm:hidden text-xs">{mood.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 高级筛选面板 - 响应式优化 */}
            {showAdvancedFilters && (
              <Card className="p-3 sm:p-4 bg-accent/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* 行业选择 */}
                  <div>
                    <Label className="text-xs sm:text-sm font-medium mb-2 block">行业类型</Label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue placeholder="选择行业" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">所有行业</SelectItem>
                        {industryTemplates.map(industry => (
                          <SelectItem key={industry.id} value={industry.id}>
                            <div className="flex items-center gap-2">
                              <span>{industry.emoji}</span>
                              <span className="text-xs sm:text-sm">{industry.name}</span>
                              <Badge variant="secondary" className="ml-1 text-xs">{industry.count}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 节假日选择 */}
                  <div>
                    <Label className="text-xs sm:text-sm font-medium mb-2 block">节假日主题</Label>
                    <Select value={selectedHoliday} onValueChange={setSelectedHoliday}>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue placeholder="选择节假日" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">所有节日</SelectItem>
                        {holidayTemplates.map(holiday => (
                          <SelectItem key={holiday.id} value={holiday.id}>
                            <div className="flex items-center gap-2">
                              <span>{holiday.emoji}</span>
                              <span className="text-xs sm:text-sm">{holiday.name}</span>
                              {holiday.isActive && (
                                <Badge variant="default" className="ml-1 text-xs bg-success">热门</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 收藏开关 */}
                  <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                    <Switch 
                      id="favorites-only" 
                      checked={showFavoritesOnly}
                      onCheckedChange={setShowFavoritesOnly}
                    />
                    <Label htmlFor="favorites-only" className="text-xs sm:text-sm font-medium">
                      只显示收藏
                    </Label>
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* 装饰面板 */}
        {showDecorationPanel && (
          <Card className="mb-6 bg-background/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                装饰元素面板
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={decorationCategory} onValueChange={setDecorationCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Emoji</TabsTrigger>
                  <TabsTrigger value="gestures">手势</TabsTrigger>
                  <TabsTrigger value="objects">物品</TabsTrigger>
                  <TabsTrigger value="hearts">爱心</TabsTrigger>
                  <TabsTrigger value="emoticons">颜文字</TabsTrigger>
                </TabsList>
                
                {/* Emoji 分类 */}
                {['basic', 'gestures', 'objects', 'hearts'].map(category => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                      {decorationElements.emojis[category as keyof typeof decorationElements.emojis]?.map((emoji, index) => (
                        <Button
                          key={index}
                          variant={selectedDecorations.emojis.includes(emoji) ? "default" : "outline"}
                          className="w-12 h-12 text-xl"
                          onClick={() => addDecoration('emoji', emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
                
                {/* 颜文字分类 */}
                <TabsContent value="emoticons" className="mt-4">
                  <div className="space-y-4">
                    {Object.entries(decorationElements.emoticons).map(([type, emoticons]) => (
                      <div key={type}>
                        <h4 className="text-sm font-medium mb-2 capitalize">
                          {type === 'happy' ? '开心' : 
                           type === 'cute' ? '可爱' :
                           type === 'surprised' ? '惊讶' :
                           type === 'strong' ? '坚强' : '思考'}
                        </h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {emoticons.map((emoticon, index) => (
                            <Button
                              key={index}
                              variant={selectedDecorations.emoticons.includes(emoticon) ? "default" : "outline"}
                              className="h-10 text-sm"
                              onClick={() => addDecoration('emoticon', emoticon)}
                            >
                              {emoticon}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* 已选装饰 */}
              {(selectedDecorations.emojis.length > 0 || selectedDecorations.emoticons.length > 0) && (
                <div className="mt-4 p-4 bg-accent rounded-lg">
                  <h4 className="text-sm font-medium mb-2">已选装饰：</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDecorations.emojis.map((emoji, index) => (
                      <Badge key={index} variant="default" className="text-base">
                        {emoji}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => addDecoration('emoji', emoji)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                    {selectedDecorations.emoticons.map((emoticon, index) => (
                      <Badge key={index} variant="default">
                        {emoticon}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => addDecoration('emoticon', emoticon)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 行业模板展示 - 响应式优化 */}
        <Card className="mb-4 lg:mb-6 bg-background/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              行业模板推荐
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {industryTemplates.map(industry => (
                <Card 
                  key={industry.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedIndustry === industry.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedIndustry(selectedIndustry === industry.id ? '' : industry.id)}
                >
                  <CardContent className="p-2 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{industry.emoji}</div>
                    <div className="text-xs sm:text-sm font-medium line-clamp-2">{industry.name}</div>
                    <Badge variant="secondary" className="mt-1 text-xs px-1 py-0 h-4">
                      {industry.count}个模板
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 节假日模板展示 - 响应式优化 */}
        <Card className="mb-4 lg:mb-6 bg-background/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              节假日特别模板
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3">
              {holidayTemplates.map(holiday => (
                <Card 
                  key={holiday.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedHoliday === holiday.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-accent'
                  } ${holiday.isActive ? 'border-green-500 shadow-green-100' : ''}`}
                  onClick={() => setSelectedHoliday(selectedHoliday === holiday.id ? '' : holiday.id)}
                >
                  <CardContent className="p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-xl mb-1">{holiday.emoji}</div>
                    <div className="text-xs font-medium line-clamp-2">{holiday.name}</div>
                    {holiday.isActive && (
                      <Badge variant="default" className="mt-1 text-xs bg-success px-1 py-0 h-4">热门</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 文案模板网格 - 响应式优化 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredTemplates.map((template, index) => {
              const categoryStyle = getCategoryStyle(template.category);
              const moodTag = moodTags.find(m => m.id === template.mood);
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
                            className="text-xs bg-background/80 px-1 sm:px-2 py-0 h-5 sm:h-6 tag-hover"
                            style={{ borderColor: categoryStyle.color }}
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
                          variant="ghost"
                          size="sm"
                          onClick={() => previewTemplate(template)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareTemplate(template)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                        >
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          onClick={() => copyTemplate(template)}
                          disabled={isCopying}
                          size="sm"
                          className={`h-6 sm:h-8 px-2 sm:px-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm transition-all hover:scale-105 ${
                            isCopying ? 'copy-success button-loading' : ''
                          } ${buttonClickAnimation === `copy-${template.id}` ? 'pulse-on-click' : ''}`}
                        >
                          {isCopying ? (
                            <div className="loading-dots">复制中</div>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">$</span>
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
          <>
            {/* 列表视图 */}
            <div className="space-y-4">
            {filteredTemplates.map(template => {
              const categoryStyle = getCategoryStyle(template.category);
              const moodTag = moodTags.find(m => m.id === template.mood);
              
              return (
                <Card key={template.id} className="bg-background/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{template.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs" style={{ borderColor: categoryStyle.color }}>
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
                          variant="ghost"
                          size="sm"
                          onClick={() => previewTemplate(template)}
                          className="h-10 w-10 p-0"
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareTemplate(template)}
                          className="h-10 w-10 p-0"
                        >
                          <Share2 className="w-5 h-5" />
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
          </>
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
                  <Button onClick={() => setShowCreateDialog(true)} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Plus className="w-5 h-5 mr-2" />
                    创建文案
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* AI生成对话框 - 增强版 */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-6 h-6" />
              AI智能文案生成器
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium请详细描述你想要的文案内容，比如：关于周末慢生活的温馨文案，要有咖啡和阳光的元素..."
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">文案风格</Label>
                <Select value={aiStyle} onValueChange={setAIStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">
                      <div className="flex items-center gap-2">
                        <span>😎</span>
                        轻松随性
                      </div>
                    </SelectItem>
                    <SelectItem value="romantic">
                      <div className="flex items-center gap-2">
                        <span>💕</span>
                        浪漫温馨
                      </div>
                    </SelectItem>
                    <SelectItem value="motivational">
                      <div className="flex items-center gap-2">
                        <span>💪</span>
                        励志正能量
                      </div>
                    </SelectItem>
                    <SelectItem value="funny">
                      <div className="flex items-center gap-2">
                        <span>😂</span>
                        幽默搞笑
                      </div>
                    </SelectItem>
                    <SelectItem value="thoughtful">
                      <div className="flex items-center gap-2">
                        <span>🤔</span>
                        深度思考
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">文案长度</Label>
                <Select value={aiLength} onValueChange={setAILength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">简短（50字以内）</SelectItem>
                    <SelectItem value="medium">适中（50-100字）</SelectItem>
                    <SelectItem value="long">详细（100字以上）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">行业选择（可选）</Label>
                <Select value={aiIndustry} onValueChange={setAIIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择行业" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">通用文案</SelectItem>
                    {industryTemplates.map(industry => (
                      <SelectItem key={industry.id} value={industry.id}>
                        <div className="flex items-center gap-2">
                          <span>{industry.emoji}</span>
                          {industry.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-decorations" 
                checked={aiIncludeDecorations}
                onCheckedChange={setAIIncludeDecorations}
              />
              <Label htmlFor="include-decorations" className="text-sm">
                自动添加装饰元素（Emoji和颜文字）
              </Label>
            </div>
            
            <Button 
              onClick={generateAIText} 
              disabled={isGenerating || !aiPrompt.trim()}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  AI正在创作中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  生成文案
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 创建文案对话框 - 增强版 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-6 h-6" />
              创建新文案
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium给你的文案起个吸引人的名字..."
                value={newTemplate.title}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                className="h-12"
              />
            </div>
            
            <div>
              <Label className="text-base font-medium">文案内容</Label>
              <Textarea
                placeholder="在这里输入你的精彩文案内容..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">分类</Label>
                <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {category.icon}
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">心情</Label>
                <Select value={newTemplate.mood} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, mood: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moodTags.map(mood => (
                      <SelectItem key={mood.id} value={mood.id}>
                        <div className="flex items-center gap-2">
                          <span>{mood.emoji}</span>
                          {mood.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">行业（可选）</Label>
                <Select value={newTemplate.industry} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择行业" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">通用</SelectItem>
                    {industryTemplates.map(industry => (
                      <SelectItem key={industry.id} value={industry.id}>
                        <div className="flex items-center gap-2">
                          <span>{industry.emoji}</span>
                          {industry.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium{t('components.label.标签用逗号分_3ok')}标签1, 标签2, 标签3..."
                value={newTemplate.tags}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            
            <Button 
              onClick={addNewTemplate} 
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!newTemplate.title.trim() || !newTemplate.content.trim()}
            >
              <Plus className="w-5 h-5 mr-2" />
              添加文案
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              文案预览
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{selectedTemplate.title}</h3>
                <div className="flex items-center gap-2">
                  {categories.find(c => c.id === selectedTemplate.category) && (
                    <Badge variant="outline">
                      {categories.find(c => c.id === selectedTemplate.category)?.icon}
                      <span className="ml-1">{categories.find(c => c.id === selectedTemplate.category)?.name}</span>
                    </Badge>
                  )}
                  {moodTags.find(m => m.id === selectedTemplate.mood) && (
                    <Badge variant="outline" className={moodTags.find(m => m.id === selectedTemplate.mood)?.color}>
                      <span className="mr-1">{moodTags.find(m => m.id === selectedTemplate.mood)?.emoji}</span>
                      {moodTags.find(m => m.id === selectedTemplate.mood)?.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-lg border">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {selectedDecorations.emojis.length > 0 || selectedDecorations.emoticons.length > 0
                    ? applyDecorations(selectedTemplate.content)
                    : selectedTemplate.content
                  }
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  使用次数：{selectedTemplate.useCount}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => shareTemplate(selectedTemplate)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                  <Button onClick={() => copyTemplate(selectedTemplate)} className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
