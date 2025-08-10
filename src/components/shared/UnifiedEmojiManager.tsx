/**
 * 统一Emoji管理组件
 * 沿用旧版动物头像系统的UI风格和生成逻辑
 * 增加模糊搜索、筛选、标签分类、收藏、切换视图等功能
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Shuffle,
  Heart,
  Apple,
  Car,
  Smile,
  Sun,
  Sparkles,
  Download,
  Copy,
  Grid3X3,
  List,
  Star,
  Eye,
  RotateCcw
} from 'lucide-react';

import {
  UnifiedEmojiItem,
  EmojiCategory,
  getAllEmojis,
  getEmojisByCategory,
  searchEmojis,
  getRandomEmojis,
  getCategories,
  generateEmojiSVG,
  getEmojiStats,
  getSubcategories,
  matchesSubcategory
} from '@/services/unifiedEmojiSystem';

// 视图模式类型
type ViewMode = 'grid' | 'list' | 'large';

// 排序方式类型
type SortMode = 'name' | 'category' | 'color' | 'popularity';

interface UnifiedEmojiManagerProps {
  // 基础配置
  mode?: 'selector' | 'gallery' | 'picker';
  showSearch?: boolean;
  showCategories?: boolean;
  showStats?: boolean;
  showActions?: boolean;

  // 显示配置
  gridCols?: number;
  maxHeight?: string;
  compact?: boolean;

  // 功能配置
  allowMultiSelect?: boolean;
  allowDownload?: boolean;
  allowCopy?: boolean;
  allowRandom?: boolean;
  allowFavorites?: boolean;
  allowViewSwitch?: boolean;

  // 过滤配置
  categories?: string[];
  excludeCategories?: string[];
  source?: 'system' | 'user' | 'ai' | 'all';

  // 回调函数
  onEmojiSelect?: (emoji: UnifiedEmojiItem) => void;
  onEmojiMultiSelect?: (emojis: UnifiedEmojiItem[]) => void;
  onCategoryChange?: (category: string) => void;
  onSearchChange?: (query: string) => void;

  // 自定义样式
  className?: string;
  cardClassName?: string;
  emojiClassName?: string;
}

const UnifiedEmojiManager: React.FC<UnifiedEmojiManagerProps> = ({
  mode = 'selector',
  showSearch = true,
  showCategories = true,
  showStats = false,
  showActions = true,
  gridCols = 8,
  maxHeight = '600px',
  compact = false,
  allowMultiSelect = false,
  allowDownload = true,
  allowCopy = true,
  allowRandom = true,
  allowFavorites = true,
  allowViewSwitch = true,
  categories,
  excludeCategories,
  source = 'all',
  onEmojiSelect,
  onEmojiMultiSelect,
  onCategoryChange,
  onSearchChange,
  className = '',
  cardClassName = '',
  emojiClassName = ''
}) => {
  // 基础状态
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmojis, setSelectedEmojis] = useState<UnifiedEmojiItem[]>([]);
  const [displayEmojis, setDisplayEmojis] = useState<UnifiedEmojiItem[]>([]);
  const [emojiCategories, setEmojiCategories] = useState<EmojiCategory[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 新增功能状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  // 记录使用次数（用于“按热度”排序）
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  // 用于随机选择后的视觉反馈（高亮并滚动）
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  // 复刻“动物头像系统”随机结果视图
  const [showRandomResult, setShowRandomResult] = useState(false);
  const [randomSelected, setRandomSelected] = useState<UnifiedEmojiItem | null>(null);

  const { toast } = useToast();

  // 使用中文拼音排序器，兼容数字和大小写
  const collatorZh = new Intl.Collator('zh', { sensitivity: 'base', numeric: true });
  const categoryOrder: Array<UnifiedEmojiItem['category']> = ['animals', 'food', 'objects', 'emotions', 'nature'];

  // 模糊搜索函数
  const fuzzySearch = (text: string, query: string): boolean => {
    if (!query) return true;

    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    // 直接匹配
    if (normalizedText.includes(normalizedQuery)) return true;

    // 拼音首字母匹配（简单实现）
    const pinyinMap: Record<string, string> = {
      '动物': 'dongwu', '食物': 'shiwu', '物品': 'wupin',
      '表情': 'biaoqing', '自然': 'ziran', '可爱': 'keai',
      '开心': 'kaixin', '笑': 'xiao', '哭': 'ku'
    };

    for (const [chinese, pinyin] of Object.entries(pinyinMap)) {
      if (normalizedText.includes(chinese) && pinyin.includes(normalizedQuery)) {
        return true;
      }
    }

    return false;
  };



  // 初始化数据
  useEffect(() => {
    // 计算最新分类统计，避免显示与实际不一致
    const allCategoriesComputed = getCategories();
    let filteredCategories = allCategoriesComputed;

    if (categories) {
      filteredCategories = allCategoriesComputed.filter(cat => categories.includes(cat.id));
    }

    if (excludeCategories) {
      filteredCategories = filteredCategories.filter(cat => !excludeCategories.includes(cat.id));
    }

    const all = getAllEmojis();
    let totalCount = all.length;
    if (categories) {
      totalCount = all.filter(e => categories.includes(e.category)).length;
    }
    if (excludeCategories) {
      totalCount = all.filter(e => !excludeCategories.includes(e.category)).length;
    }
    setEmojiCategories([
      { id: 'all', name: '全部', icon: '🎨', color: '#6C5CE7', count: totalCount, description: '所有emoji' },
      ...filteredCategories
    ]);

    if (showStats) {
      setStats(getEmojiStats());
    }

    // 从localStorage加载收藏
    const savedFavorites = localStorage.getItem('emoji-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    // 加载使用次数
    const savedUsage = localStorage.getItem('emoji-usage-counts');
    if (savedUsage) {
      try { setUsageCounts(JSON.parse(savedUsage)); } catch {}
    }

    updateDisplayEmojis();
  }, [categories, excludeCategories, source]);

  // 更新显示的emoji
  const updateDisplayEmojis = () => {
    let emojis: UnifiedEmojiItem[] = [];

    // 基础过滤
    if (searchQuery) {
      emojis = getAllEmojis().filter(emoji =>
        fuzzySearch(emoji.name, searchQuery) ||
        emoji.keywords.some(keyword => fuzzySearch(keyword, searchQuery))
      );
    } else if (selectedCategory === 'all') {
      emojis = getAllEmojis();
    } else {
      emojis = getEmojisByCategory(selectedCategory);
    }

    // 子分类过滤（仅在选择了主分类时启用）
    if (selectedCategory !== 'all' && selectedSubcategory) {
      emojis = emojis.filter(e => matchesSubcategory(e, selectedCategory as any, selectedSubcategory));
    }

    // 按来源过滤
    if (source !== 'all') {
      emojis = emojis.filter(emoji => emoji.source === source);
    }

    // 按分类过滤
    if (categories) {
      emojis = emojis.filter(emoji => categories.includes(emoji.category));
    }

    if (excludeCategories) {
      emojis = emojis.filter(emoji => !excludeCategories.includes(emoji.category));
    }



    // 收藏过滤
    if (showFavoritesOnly) {
      emojis = emojis.filter(emoji => favorites.has(emoji.id));
    }

    // 排序
    const hue = (col: string): number => {
      // 解析 #RRGGBB / #RGB；无法解析则返回 -1
      const hex = col.startsWith('#') ? col.slice(1) : '';
      const to255 = (h: string) => parseInt(h.length === 1 ? h + h : h, 16);
      if (hex.length === 3 || hex.length === 6) {
        const r = to255(hex.length === 3 ? hex[0] : hex.slice(0,2));
        const g = to255(hex.length === 3 ? hex[1] : hex.slice(2,4));
        const b = to255(hex.length === 3 ? hex[2] : hex.slice(4,6));
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        const d = max - min;
        if (d === 0) return 0;
        let hVal = 0;
        switch (max) {
          case r: hVal = (g - b) / d + (g < b ? 6 : 0); break;
          case g: hVal = (b - r) / d + 2; break;
          case b: hVal = (r - g) / d + 4; break;
        }
        return Math.round(hVal * 60);
      }
      return -1;
    };

    const popularityScore = (id: string): number => {
      const base = usageCounts[id] || 0;
      const favBonus = favorites.has(id) ? 1000 : 0; // 收藏强加权，确保收藏优先
      return base + favBonus;
    };

    emojis.sort((a, b) => {
      let res = 0;
      switch (sortMode) {
        case 'name':
          res = collatorZh.compare(a.name, b.name); break;
        case 'category':
          res = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category); break;
        case 'color': {
          const ha = hue(a.color), hb = hue(b.color);
          if (ha !== -1 && hb !== -1) {
            res = ha - hb;
          } else if (ha !== -1) {
            res = -1;
          } else if (hb !== -1) {
            res = 1;
          } else {
            res = collatorZh.compare(a.color, b.color);
          }
          break;
        }
        case 'popularity':
          res = popularityScore(b.id) - popularityScore(a.id); break;
        default:
          res = 0;
      }
      // 稳定兜底：若相等则按名称 -> id
      if (res === 0) {
        res = collatorZh.compare(a.name, b.name);
        if (res === 0) res = a.id.localeCompare(b.id);
      }
      return res;
    });

    setDisplayEmojis(emojis);
  };

  // 处理分类变化
  // 退出随机结果视图，恢复正常列表
  const exitRandomView = () => {
    if (showRandomResult) {
      setShowRandomResult(false);
      setRandomSelected(null);
      setHighlightedId(null);
    }
  };

  const handleCategoryChange = (category: string) => {
    exitRandomView();
    setSelectedCategory(category);
    setSelectedSubcategory(null); // 切换主分类时重置子分类
    setSearchQuery('');
    onCategoryChange?.(category);
  };

  // 处理搜索变化
  const handleSearchChange = (query: string) => {
    exitRandomView();
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // 引导关键词：统计Top N并支持点击开关（再次点击移除）
  const [chipKeywords, setChipKeywords] = useState<string[]>([]);
  const tokenize = (s: string) => s.split(/\s+/).filter(Boolean);
  const isTokenActive = (t: string) => tokenize(searchQuery).includes(t);
  const toggleSearchToken = (token: string) => {
    const tokens = tokenize(searchQuery);
    const next = tokens.includes(token)
      ? tokens.filter(x => x !== token).join(' ')
      : [...tokens, token].join(' ');
    handleSearchChange(next);
  };
  useEffect(() => {
    // 统计全量emoji关键词频次，取Top 20作为引导关键词
    const all = getAllEmojis();
    const freq: Record<string, number> = {};
    for (const e of all) {
      for (const k of (e.keywords || [])) {
        const key = (k || '').trim();
        if (!key) continue;
        freq[key] = (freq[key] || 0) + 1;
      }
    }
    const top = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([k]) => k);
    setChipKeywords(top);
  }, []);


  // 切换收藏状态
  const handleToggleFavoritesOnly = () => {
    exitRandomView();
    setShowFavoritesOnly(prev => !prev);
  };
  const toggleFavorite = (emojiId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(emojiId)) {
      newFavorites.delete(emojiId);
      toast({
        title: "取消收藏",
        description: "已从收藏中移除",
        duration: 1500,
      });
    } else {
      newFavorites.add(emojiId);
      toast({
        title: "添加收藏",
        description: "已添加到收藏",
        duration: 1500,
      });
    }
    setFavorites(newFavorites);
    localStorage.setItem('emoji-favorites', JSON.stringify(Array.from(newFavorites)));
  };



  // 清除所有过滤器（并退出随机视图）
  const clearFilters = () => {
    exitRandomView();
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setSelectedCategory('all');
    setSelectedSubcategory(null);
  };

  // 监听状态变化，更新显示
  useEffect(() => {
    updateDisplayEmojis();
  }, [searchQuery, selectedCategory, selectedSubcategory, showFavoritesOnly, sortMode, favorites]);

  // 处理emoji选择 - 默认行为是复制到剪贴板
  const handleEmojiClick = async (emoji: UnifiedEmojiItem, event?: React.MouseEvent) => {
    // 显示复制成功动画
    if (event) {
      const card = event.currentTarget as HTMLElement;
      const indicator = card.querySelector('.copy-success-indicator') as HTMLElement;
      if (indicator) {
        indicator.style.opacity = '1';
        setTimeout(() => {
          indicator.style.opacity = '0';
        }, 1000);
      }
    }

    // 首先执行复制操作 - 增强版本
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emoji.emoji);
      } else {
        // 立即使用备用方案
        const textArea = document.createElement('textarea');
        textArea.value = emoji.emoji;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // 记录一次使用（用于“按热度”）
      const next = { ...usageCounts, [emoji.id]: (usageCounts[emoji.id] || 0) + 1 };
      setUsageCounts(next);
      try { localStorage.setItem('emoji-usage-counts', JSON.stringify(next)); } catch {}

      // 更明显的成功提示
      toast({
        title: "✅ 复制成功",
        description: `${emoji.name} ${emoji.emoji} 已成功复制到剪贴板`,
        duration: 3000,
      });
    } catch (error) {
      console.error('复制失败:', error);
      // 回退方案：创建临时文本区域
      try {
        const textArea = document.createElement('textarea');
        textArea.value = emoji.emoji;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // 更明显的成功提示
        toast({
          title: "✅ 复制成功",
          description: `${emoji.name} ${emoji.emoji} 已成功复制到剪贴板`,
          duration: 3000,
        });
      } catch (fallbackError) {
        console.error('备用复制方案也失败:', fallbackError);

        // 更详细的错误提示
        toast({
          title: "❌ 复制失败",
          description: `无法复制 ${emoji.emoji}，请手动选择并复制`,
          variant: "destructive",
          duration: 4000,
        });
      }
    }

    // 然后处理选择逻辑
    if (allowMultiSelect) {
      const isSelected = selectedEmojis.some(e => e.id === emoji.id);
      let newSelected: UnifiedEmojiItem[];

      if (isSelected) {
        newSelected = selectedEmojis.filter(e => e.id !== emoji.id);
      } else {
        newSelected = [...selectedEmojis, emoji];
      }

      setSelectedEmojis(newSelected);
      onEmojiMultiSelect?.(newSelected);
    } else {
      onEmojiSelect?.(emoji);
    }
  };

  // 随机选择emoji - 增强版本
  const handleRandomSelect = () => {
    try {
      // 首先尝试从当前显示的emoji中随机选择
      if (displayEmojis.length > 0) {
        const randomIndex = Math.floor(Math.random() * displayEmojis.length);
        const selectedEmoji = displayEmojis[randomIndex];
        setRandomSelected(selectedEmoji);
        setShowRandomResult(true);
        toast({
          title: "🎲 随机选择成功",
          description: `已为您选择了 ${selectedEmoji.name} ${selectedEmoji.emoji}`,
          duration: 2000,
        });
        return;
      }

      // 备用机制：使用系统的随机emoji API
      const randomEmojis = getRandomEmojis(1, selectedCategory === 'all' ? undefined : selectedCategory);
      if (randomEmojis.length > 0) {
        setRandomSelected(randomEmojis[0]);
        setShowRandomResult(true);
        toast({
          title: "🎲 随机选择成功",
          description: `已为您选择了 ${randomEmojis[0].name} ${randomEmojis[0].emoji}`,
          duration: 2000,
        });
        return;
      }

      // 最后的备用机制：从所有emoji中手动随机选择
      const allEmojis = getAllEmojis();
      if (allEmojis.length > 0) {
        const randomIndex = Math.floor(Math.random() * allEmojis.length);
        const selectedEmoji = allEmojis[randomIndex];
        setRandomSelected(selectedEmoji);
        setShowRandomResult(true);
        toast({
          title: "🎲 随机选择成功",
          description: `已为您选择了 ${selectedEmoji.name} ${selectedEmoji.emoji}`,
          duration: 2000,
        });
        return;
      }

      // 如果所有方法都失败
      toast({
        title: "随机选择失败",
        description: "暂时无法获取emoji，请稍后重试",
        variant: "destructive",
        duration: 4000,
      });
    } catch (error) {
      console.error('随机选择失败:', error);
      toast({
        title: "随机选择失败",
        description: "生成随机emoji时出现错误，请稍后重试",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  // 复制emoji
  const handleCopyEmoji = async (emoji: UnifiedEmojiItem) => {
    try {
      await navigator.clipboard.writeText(emoji.emoji);
      toast({
        title: "复制成功",
        description: `${emoji.name} ${emoji.emoji} 已复制到剪贴板`,
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制emoji",
        variant: "destructive",
      });
    }
  };

  // 下载emoji SVG
  const handleDownloadEmoji = (emoji: UnifiedEmojiItem) => {
    const svgData = generateEmojiSVG(emoji);
    const link = document.createElement('a');
    link.href = svgData;
    link.download = `${emoji.name}-emoji.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "下载成功",
      description: `${emoji.name} SVG已下载`,
    });
  };



  return (
    <div className={`min-h-screen ${className}`} style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* 头部标题区 - 调整图片/文字排版与层级 */}
      {/* 顶部留白（移除标题与统计文案） */}
      <div className="pt-6" />

      {/* 统计和控制区 - 沿用旧版毛玻璃风格 */}
      <div className="mb-8 mx-auto max-w-6xl px-4 pb-6">
        <div className="bg-card bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-primary-foreground">
          {/* 顶部工具条：排序 + 操作（随机/收藏/清除） + 视图图标 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* 查看全部：最高级，任何状态下都恢复完整列表（放在最左侧） */}
            <button
              onClick={() => {
                exitRandomView();
                setSearchQuery('');
                setShowFavoritesOnly(false);
                setSelectedCategory('all');
              }}
              className="px-3.5 py-1.5 rounded-full text-sm font-semibold btn-gradient-primary text-primary-foreground hover:opacity-90 shadow"
              title="查看全部"
            >
              📋 查看全部
            </button>

            {/* 排序分段 */}
            <div className="flex items-center gap-2 bg-card/15 rounded-full px-3 py-2">
              <span className="text-sm font-medium">排序</span>
              <div className="flex items-center gap-1">
                {([
                  { key: 'name', label: '名称' },
                  { key: 'category', label: '分类' },
                  { key: 'color', label: '颜色' },
                  { key: 'popularity', label: '热度' },
                ] as Array<{key: SortMode; label: string}>).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortMode(opt.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      sortMode === opt.key
                        ? 'bg-card text-foreground ring-2 ring-white ring-offset-2 ring-offset-white/20'
                        : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 随机选择 */}
            {allowRandom && (
              <button
                onClick={handleRandomSelect}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-card/20 text-primary-foreground hover:bg-card/30"
                title="随机选择"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            )}

            {/* 仅显示收藏 */}
            {allowFavorites && (
              <button
                onClick={handleToggleFavoritesOnly}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  showFavoritesOnly ? 'btn-gradient-destructive text-primary-foreground' : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                }`}
                title={showFavoritesOnly ? '退出收藏视图' : '仅显示收藏'}
              >
                <Star className="w-4 h-4" />
              </button>
            )}

            {/* 清除过滤 */}
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-full text-sm font-semibold bg-card/20 text-primary-foreground hover:bg-card/30"
              title="清除过滤"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* 视图图标组在右侧 */}
            {allowViewSwitch && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-card text-foreground' : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                  }`}
                  title="网格视图"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-card text-foreground' : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                  }`}
                  title="列表视图"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('large')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    viewMode === 'large' ? 'bg-card text-foreground' : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                  }`}
                  title="大图视图"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 搜索 */}
          {showSearch && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-foreground/90 w-6 h-6 z-10" />
                <input
                  type="text"
                  placeholder="🔍 搜索emoji名称或关键词..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-xl text-base text-foreground bg-card/90 backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-transparent shadow"
                />
              </div>
              {/* 引导关键词 Chips（动态 Top N，可二次点击移除） */}
              <div className="mt-3 flex flex-wrap gap-2">
                {chipKeywords.map(token => {
                  const active = isTokenActive(token);
                  return (
                    <button
                      key={token}
                      onClick={() => toggleSearchToken(token)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-card text-foreground shadow' : 'bg-card/20 text-primary-foreground hover:bg-card/30'}`}
                      title={active ? '点击移除该关键词' : '点击添加该关键词'}
                    >
                      {token}
                      {active && <span className="ml-1">✕</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 分类 */}
          {showCategories && (
            <div className="mt-1">
              <div className="flex flex-wrap justify-start gap-3 overflow-x-auto">
                {emojiCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-card text-foreground shadow-lg'
                        : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-muted text-foreground'
                        : 'bg-card/30 text-primary-foreground'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
              {/* 子分类分段按钮：默认折叠（通过selectedSubcategory为null实现），仅选中主分类时显示 */}
              {selectedCategory !== 'all' && (
                <div className="mt-3 flex flex-wrap gap-2 overflow-x-auto">
                  {getSubcategories(selectedCategory as any).map(sc => (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedSubcategory(prev => prev === sc.id ? null : sc.id)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        selectedSubcategory === sc.id
                          ? 'bg-card text-foreground shadow'
                          : 'bg-card/20 text-primary-foreground hover:bg-card/30'
                      }`}
                      title={`${sc.name}（${sc.count}）`}
                    >
                      {sc.name}
                      <span className="ml-2 text-xs opacity-80">{sc.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>



      </div>
      {/* 复刻动物头像系统样式 */}
      <style>{`
        .avatar-card {
          background: white;
          border-radius: 16px; /* 更紧凑圆角 */
          padding: 14px;       /* 减少内边距 */
          text-align: center;
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          cursor: pointer;
          position: relative;
        }
        .avatar-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 32px rgba(0,0,0,0.16);
        }
        .avatar-card:hover .hover-button { opacity: 1; }
        .avatar-display {
          width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 12px; /* 更紧凑的图标与间距 */
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem; box-shadow: 0 3px 12px rgba(0,0,0,0.08);
        }
        .avatar-name { font-weight: 600; color: #333; margin-bottom: 4px; }
        .avatar-emoji { margin-bottom: 8px; }
        .avatar-color { font-size: 0.85rem; color: #666; background: #f8f9fa; padding: 3px 8px; border-radius: 10px; display: inline-block; }
        .hover-button { opacity: 0; transition: opacity 0.2s ease; }
      `}</style>




      {/* 复刻动物头像系统：随机结果视图 */}
      {showRandomResult && randomSelected && (
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'white', padding: '40px' }}>
            <h2>🎲 随机选择结果</h2>
            <div style={{ background: 'white', borderRadius: '20px', padding: '30px', display: 'inline-block', margin: '20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{randomSelected.emoji}</div>
              <div style={{ fontSize: '1.5rem', color: '#333', fontWeight: 600 }}>{randomSelected.name}</div>
              <div style={{ color: '#666', marginTop: '10px' }}>颜色: {randomSelected.color}</div>
            </div>
            <br/>
            <button
              className="test-button"
              onClick={() => handleRandomSelect()}
              style={{
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white', border: 'none', padding: '12px 24px', borderRadius: '25px', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.3s ease', margin: '10px'
              }}
            >🔄 再次随机</button>
            <button
              className="test-button"
              onClick={() => exitRandomView()}
              style={{
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white', border: 'none', padding: '12px 24px', borderRadius: '25px', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.3s ease', margin: '10px'
              }}
            >📋 查看全部</button>
          </div>
        </div>
      )}

      {/* 复刻动物头像系统：头像网格 */}
      {!showRandomResult && (
        <>
          {viewMode === 'grid' && (
            <div className="mx-auto max-w-6xl px-4 pb-8">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginTop: '24px'
                }}
              >
              {displayEmojis.map((emoji) => {
              const isSelected = allowMultiSelect && selectedEmojis.some(e => e.id === emoji.id);
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  data-emoji-id={emoji.id}
                  className={`avatar-card ${highlightedId === emoji.id ? 'ring-4 ring-yellow-400' : ''}`}
                  onClick={(e) => handleEmojiClick(emoji, e)}
                  style={{}}
                >
                  {/* 收藏按钮 */}
                  {allowFavorites && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(emoji.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Heart
                        className={`w-3 h-3 ${isFavorited ? 'fill-red-500 text-destructive' : 'text-muted-foreground'}`}
                      />
                    </button>
                  )}

                  {/* 复制成功动画指示器 */}
                  <div className="absolute inset-0 bg-accent opacity-0 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm transition-opacity duration-300 copy-success-indicator">
                    已复制!
                  </div>

                  {/* 复刻动物头像卡片内容 */}
                  <div className="avatar-display" style={{ backgroundColor: emoji.color }}>
                    {emoji.emoji}
                  </div>
                  <div className="avatar-name">{emoji.name}</div>
                  <div className="avatar-emoji">{emoji.emoji}</div>
                  <div className="avatar-color">{emoji.color}</div>

                  {/* 操作按钮组 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 flex justify-center gap-2">
                    {allowDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadEmoji(emoji);
                        }}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary transition-colors"
                        title="下载SVG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
              })}
              </div>
            </div>
          )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="mx-auto max-w-6xl px-4 pb-8">
            <div className="space-y-3">

            {displayEmojis.map((emoji) => {
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  data-emoji-id={emoji.id}
                  className={`bg-card rounded-lg p-3.5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md flex items-center gap-3 group ${highlightedId === emoji.id ? 'ring-4 ring-yellow-400' : ''}`}
                  onClick={(e) => handleEmojiClick(emoji, e)}
                >
                  {/* Emoji显示 */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: emoji.color }}
                  >
                    {emoji.emoji}
                  </div>

                  {/* 信息区域 */}
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{emoji.name}</div>
                    <div className="text-sm text-muted-foreground">
                      分类: {emoji.category} | 颜色: {emoji.color}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      关键词: {emoji.keywords.join(', ')}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    {allowFavorites && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(emoji.id);
                        }}
                        className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-destructive' : 'text-muted-foreground'}`} />
                      </button>
                    )}
                      {allowDownload && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadEmoji(emoji);
                          }}
                          className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:bg-primary transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
              );
            })}
            </div>
          </div>
        )}

        {/* 大图视图 */}
        {viewMode === 'large' && (
          <div className="mx-auto max-w-6xl px-4 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEmojis.map((emoji) => {
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  className="bg-card rounded-xl p-6 text-center shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative group"
                  onClick={(e) => handleEmojiClick(emoji, e)}
                >
                  {/* 收藏按钮 */}
                  {allowFavorites && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(emoji.id);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-destructive' : 'text-muted-foreground'}`}
                      />
                    </button>
                  )}

                  {/* 大尺寸Emoji显示 */}
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl shadow-lg transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: emoji.color }}
                  >
                    {emoji.emoji}
                  </div>

                  {/* 详细信息 */}
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {emoji.name}
                  </div>

                  <div className="text-4xl mb-4">
                    {emoji.emoji}
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    <div className="mb-2">分类: <span className="font-medium">{emoji.category}</span></div>
                    <div className="mb-2">颜色: <span className="font-medium">{emoji.color}</span></div>
                    <div>关键词: <span className="font-medium">{emoji.keywords.join(', ')}</span></div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-center gap-3">
                    {allowDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadEmoji(emoji);
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        下载SVG
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* 空状态 */}
        {displayEmojis.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">没有找到相关emoji</h3>
            <p className="text-primary-foreground opacity-80 text-lg">尝试调整搜索条件或选择其他分类</p>
            <button
              onClick={clearFilters}
              className="mt-6 bg-card text-foreground px-6 py-3 rounded-full font-semibold hover:bg-accent transition-colors"
            >
              清除所有过滤器
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default UnifiedEmojiManager;
