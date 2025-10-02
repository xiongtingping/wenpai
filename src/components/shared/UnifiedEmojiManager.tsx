/**
 * 统一Emoji管理组件
 * 沿用旧版动物头像系统的UI风格和生成逻辑
 * 增加模糊搜索、筛选、标签分类、收藏、切换视图等功能
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Search,
  Shuffle,
  Heart,
  Apple,
  Car,
  Smile,
  Sun,
  Sparkles,
  Copy,
  Grid3X3,
  List,
  Star,
  Eye,
  RotateCcw
} from 'lucide-react';

import type {
  UnifiedEmojiItem,
  EmojiCategory
} from '@/types/emoji';

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

const UnifiedEmojiManager: React.FC<UnifiedEmojiManagerProps> = ({ mode = 'selector',
  showSearch = true,
  showCategories = true,
  showStats = false,
  showActions = true,
  gridCols = 8,
  maxHeight = '600px',
  compact = false,
  allowMultiSelect = false,
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
  const [subcategories, setSubcategories] = useState<any[]>([]);
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

  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

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
    const initializeEmojiData = async () => {
      try {
        const { getCategories, getAllEmojis, getEmojiStats } = await import('@/services/unifiedEmojiSystem');
        
        // 计算最新分类统计，避免显示与实际不一致
        const allCategoriesComputed = getCategories();
        let filteredCategories = allCategoriesComputed;

        if (categories) {
          filteredCategories = allCategoriesComputed.filter((cat: any) => categories.includes(cat.id));
        }

        if (excludeCategories) {
          filteredCategories = filteredCategories.filter((cat: any) => !excludeCategories.includes(cat.id));
        }

        const all = getAllEmojis();
        let totalCount = all.length;
        if (categories) {
          totalCount = all.filter((e: any) => categories.includes(e.category)).length;
        }
        if (excludeCategories) {
          totalCount = all.filter((e: any) => !excludeCategories.includes(e.category)).length;
        }
        setEmojiCategories([
          { id: 'all', name: '全部', icon: '🎨', color: 'hsl(var(--accent))', count: totalCount, description: '所有emoji' },
          ...filteredCategories
        ]);

        if (showStats) {
          setStats(getEmojiStats());
        }
      } catch (error) {
        console.error('initializationEmojidatafailed:', error);
      }
    };

    initializeEmojiData();

    // 从localStorage加载收藏 - 支持用户ID隔离
    const userId = user?.id || 'guest';
    const favoritesKey = `emoji-favorites-${userId}`;
    const savedFavorites = localStorage.getItem(favoritesKey);
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    // 加载使用次数
    const savedUsage = localStorage.getItem('emoji-usage-counts');
    if (savedUsage) {
      try { setUsageCounts(JSON.parse(savedUsage)); } catch { /* noop */ }
    }

    updateDisplayEmojis();
  }, [categories, excludeCategories, source]);

  // 更新显示的emoji
  const updateDisplayEmojis = async () => {
    try {
      const { getAllEmojis, getEmojisByCategory, matchesSubcategory } = await import('@/services/unifiedEmojiSystem');
      
      let emojis: UnifiedEmojiItem[] = [];

      // 基础过滤
      if (searchQuery) {
        emojis = getAllEmojis().filter((emoji: any) =>
          fuzzySearch(emoji.name, searchQuery) ||
          emoji.keywords.some((keyword: any) => fuzzySearch(keyword, searchQuery))
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

      // 去重: 使用emoji字符作为唯一标识
      const uniqueEmojis = Array.from(
        new Map(emojis.map(item => [item.emoji, item])).values()
      );

      setDisplayEmojis(uniqueEmojis);
    } catch (error) {
      console.error('updatingdisplayEmojifailed:', error);
    }
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

  const handleCategoryChange = async (category: string) => {
    exitRandomView();
    setShowFavoritesOnly(false); // 退出收藏视图
    setSelectedCategory(category);
    setSelectedSubcategory(null); // 切换主分类时重置子分类
    setSearchQuery('');
    
    // 加载子分类
    if (category !== 'all') {
      try {
        const { getSubcategories } = await import('@/services/unifiedEmojiSystem');
        const subs = getSubcategories(category as any);
        setSubcategories(subs);
      } catch (error) {
        console.error('loadingchildcategoryfailed:', error);
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
    
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
    // ✅ FIXED: 改为单选模式 - 点击预设关键词时替换当前搜索内容
    const currentTokens = tokenize(searchQuery);
    if (currentTokens.includes(token)) {
      // 如果当前关键词已选中，则清空搜索
      handleSearchChange('');
    } else {
      // 否则替换为该关键词
      handleSearchChange(token);
    }
  };
  useEffect(() => {
    // 统计全量emoji关键词频次，取Top 20作为引导关键词
    const loadKeywords = async () => {
      try {
        const { getAllEmojis } = await import('@/services/unifiedEmojiSystem');
        const all = getAllEmojis();
        const freq: Record<string, number> = {};
        for (const e of all) {
          for (const k of (e.keywords || [])) {
            const key = (k || '').trim();
            // 过滤颜色代码(#开头的十六进制颜色值)
            if (!key || key.startsWith('#')) continue;
            freq[key] = (freq[key] || 0) + 1;
          }
        }
        const top = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([k]) => k);
        setChipKeywords(top);
      } catch (error) {
        console.error('loading关key词failed:', error);
      }
    };

    loadKeywords();
  }, []);

  // 切换收藏状态
  const handleToggleFavoritesOnly = () => {
    exitRandomView();
    setShowFavoritesOnly(prev => !prev);
  };
  const toggleFavorite = (emojiId: string) => {
    const newFavorites = new Set(favorites);
    const userId = user?.id || 'guest';
    const favoritesKey = `emoji-favorites-${userId}`;

    if (newFavorites.has(emojiId)) {
      newFavorites.delete(emojiId);
      toast({
        title: t('components.labels.取消收藏'),
        description: "已从收藏中移除",
        duration: 1500,
      });
    } else {
      newFavorites.add(emojiId);
      toast({
        title: t('components.labels.添加收藏'),
        description: "已添加到收藏",
        duration: 1500,
      });
    }
    setFavorites(newFavorites);
    localStorage.setItem(favoritesKey, JSON.stringify(Array.from(newFavorites)));
  };

  // 清除所有过滤器（并退出随机视图）
  const clearFilters = () => {
    exitRandomView();
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setSelectedCategory('all');
    setSelectedSubcategory(null);
  };

  // 监听用户变化，重新加载收藏数据
  useEffect(() => {
    const userId = user?.id || 'guest';
    const favoritesKey = `emoji-favorites-${userId}`;
    const savedFavorites = localStorage.getItem(favoritesKey);
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    } else {
      setFavorites(new Set());
    }
  }, [user?.id]);

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
      try { localStorage.setItem('emoji-usage-counts', JSON.stringify(next)); } catch { /* noop */ }

      // 更明显的成功提示
      toast({
        title: "✅ 复制成功",
        description: `${emoji.name} ${emoji.emoji} 已成功复制到剪贴板`,
        duration: 3000,
      });
    } catch (error) {
      console.error('copyingfailed:', error);
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
        console.error('备用copying方案也failed:', fallbackError);

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
  const handleRandomSelect = async () => {
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
      const { getRandomEmojis, getAllEmojis } = await import('@/services/unifiedEmojiSystem');
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
        title: t('components.labels.随机选择失败'),
        description: "暂时无法获取emoji，请稍后重试",
        variant: "destructive",
        duration: 4000,
      });
    } catch (error) {
      console.error('随机选择failed:', error);
      toast({
        title: t('components.labels.随机选择失败'),
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
        title: t('components.labels.复制成功'),
        description: `${emoji.name} ${emoji.emoji} 已复制到剪贴板`,
      });
    } catch (error) {
      toast({
        title: t('components.errors.复制失败'),
        description: "请手动复制emoji",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen bg-background emoji-manager-container ${className}`}>
      {/* 头部标题区 - 调整图片/文字排版与层级 */}
      {/* 顶部留白（移除标题与统计文案） */}
      <div className="pt-6" />

      {/* 统计和控制区 - 使用统一令牌 */}
      <div className="mb-8 mx-auto max-w-6xl px-1 sm:px-2 lg:px-3 xl:px-4 pb-6">
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          {/* 顶部工具条：排序 + 操作（随机/收藏/清除） + 视图图标 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* 查看全部：最高级，任何状态下都恢复完整列表（放在最左侧） */}
            <Button
              onClick={() => {
                exitRandomView();
                setSearchQuery('');
                setShowFavoritesOnly(false);
                setSelectedCategory('all');
              }}
              className="px-3.5 py-1.5 text-sm font-semibold"
              title={t('components.labels.标题')}
            >
              📋 查看全部
            </Button>

            {/* 排序分段 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">排序</span>
              <div className="unified-tabs-list flex items-center">
                {([
                  { key: 'name', label: t('components.labels.名称') },
                  { key: 'category', label: t('components.labels.分类') },
                  { key: 'color', label: t('components.labels.颜色') },
                  { key: 'popularity', label: t('components.labels.热度') },
                ] as Array<{key: SortMode; label: string}>).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setShowFavoritesOnly(false); // 退出收藏视图
                      setSortMode(opt.key);
                    }}
                    className={`unified-tab-trigger ${
                      sortMode === opt.key ? 'data-[state=active]' : ''
                    }`}
                    data-state={sortMode === opt.key ? 'active' : 'inactive'}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 随机选择 */}
            {allowRandom && (
              <Button
                onClick={handleRandomSelect}
                variant="outline"
                size="sm"
                title={t('components.labels.标题')}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            )}

            {/* 仅显示收藏 */}
            {allowFavorites && (
              <Button
                onClick={handleToggleFavoritesOnly}
                variant={showFavoritesOnly ? "destructive" : "outline"}
                size="sm"
                title={showFavoritesOnly ? t('components.labels.退出收藏视图') : t('components.labels.仅显示收藏')}
              >
                <Star className="w-4 h-4" />
              </Button>
            )}

            {/* 清除过滤 */}
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              title={t('components.labels.标题')}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* 视图图标组在右侧 */}
            {allowViewSwitch && (
              <div className="ml-auto flex items-center gap-2">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  title={t('components.labels.标题')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  title={t('components.labels.标题')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('large')}
                  variant={viewMode === 'large' ? 'default' : 'outline'}
                  size="sm"
                  title={t('components.labels.标题')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 搜索 */}
          {showSearch && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6 z-10" />
                <input
                  type="text"
                  placeholder="搜索emoji名称或关键词..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-xl text-base text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent shadow-sm"
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'}`}
                      title={active ? t('components.labels.点击清空搜索') : t('components.labels.点击搜索该关键词')}
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
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted text-foreground hover:bg-accent'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background text-foreground'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
              {/* 子分类分段按钮：默认折叠（通过selectedSubcategory为null实现），仅选中主分类时显示 */}
              {selectedCategory !== 'all' && (
                <div className="mt-3 flex flex-wrap gap-2 overflow-x-auto">
                  {subcategories.map((sc: any) => (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedSubcategory(prev => prev === sc.id ? null : sc.id)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        selectedSubcategory === sc.id
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent'
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
          background: hsl(var(--background));
          border-radius: var(--spacing-4); /* 更紧凑圆角 */
          padding: var(--spacing-3-5);       /* 减少内边距 */
          text-align: center;
          box-shadow: 0 var(--spacing-1-5) var(--spacing-6) hsl(var(--foreground) / 0.08);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          cursor: pointer;
          position: relative;
        }
        .avatar-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 var(--spacing-2-5) var(--spacing-8) hsl(var(--foreground) / 0.16);
        }
        .avatar-card:hover .hover-button { opacity: 1; }
        .avatar-display {
          width: 72px; height: 72px; border-radius: var(--radius-full); margin: 0 auto var(--spacing-3); /* 更紧凑的图标与间距 */
          display: flex; align-items: center; justify-content: center;
          font-size: var(--spacing-12); box-shadow: 0 3px var(--spacing-3) hsl(var(--foreground) / 0.08);
        }
        .avatar-name { font-weight: 600; color: hsl(var(--foreground)); margin-bottom: var(--spacing-1); }
        .avatar-emoji { margin-bottom: var(--spacing-2); }
        .avatar-color { font-size: 0.85rem; color: hsl(var(--muted-foreground)); background: hsl(var(--muted)); padding: 3px var(--spacing-2); border-radius: var(--spacing-2-5); display: inline-block; }
        .hover-button { opacity: 0; transition: opacity 0.2s ease; }
      `}</style>

      {/* 随机选择结果视图 - 优化布局 */}
      {showRandomResult && randomSelected && (
        <div className="mx-auto max-w-4xl px-4 pb-8">
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            {/* 标题区域 */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                🎲 随机选择结果
              </h2>
            </div>

            {/* 内容区域 */}
            <div className="p-8 text-center">
              {/* Emoji展示卡片 - 可点击复制 */}
              <div
                className="bg-background rounded-xl p-6 shadow-sm border border-border max-w-sm mx-auto mb-6 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group relative"
                onClick={() => handleCopyEmoji(randomSelected)}
                title="点击复制emoji"
              >
                {/* 收藏按钮 */}
                {allowFavorites && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(randomSelected.id);
                    }}
                    className="emoji-favorite-btn"
                    data-favorited={favorites.has(randomSelected.id)}
                  >
                    <Heart
                      className={favorites.has(randomSelected.id) ? 'favorited' : 'not-favorited'}
                    />
                  </button>
                )}

                <div className="text-7xl mb-4 leading-none group-hover:scale-105 transition-transform duration-200">
                  {randomSelected.emoji}
                </div>
                <div className="text-xl font-semibold text-foreground mb-2">{randomSelected.name}</div>
                <div className="text-sm text-muted-foreground mb-2">颜色: {randomSelected.color}</div>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  点击复制到剪贴板
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={() => handleRandomSelect()}
                  className="px-6 py-2.5 text-sm font-medium"
                  size="default"
                >
                  🔄 再次随机
                </Button>
                <Button
                  onClick={() => exitRandomView()}
                  variant="outline"
                  className="px-6 py-2.5 text-sm font-medium"
                  size="default"
                >
                  📋 查看全部
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 复刻动物头像系统：头像网格 */}
      {!showRandomResult && (
        <>
          {viewMode === 'grid' && (
            <div className="mx-auto max-w-6xl px-1 sm:px-2 lg:px-3 xl:px-4 pb-8">
              <div className="emoji-grid-container">
              {displayEmojis.map((emoji) => {
              const isSelected = allowMultiSelect && selectedEmojis.some(e => e.id === emoji.id);
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  data-emoji-id={emoji.id}
                  className={`avatar-card group ${highlightedId === emoji.id ? 'ring-4 ring-primary' : ''}`}
                  onClick={(e) => handleEmojiClick(emoji, e)}
                  data-emoji-color={emoji.color}
                >
                  {/* 收藏按钮 */}
                  {allowFavorites && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite(emoji.id);
                      }}
                      className="emoji-favorite-btn"
                      data-favorited={isFavorited}
                    >
                      <Heart
                        className={isFavorited ? 'favorited' : 'not-favorited'}
                      />
                    </button>
                  )}

                  {/* 复制成功动画指示器 */}
                  <div className="absolute inset-0 bg-accent opacity-0 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm transition-opacity duration-300 copy-success-indicator pointer-events-none">
                    已复制!
                  </div>

                  {/* 复刻动物头像卡片内容 */}
                  <div
                    className="avatar-display"
                    style={{
                      backgroundColor: emoji.color.startsWith('#') || emoji.color.startsWith('rgb') || emoji.color.startsWith('hsl')
                        ? emoji.color
                        : 'hsl(var(--accent))',
                      borderRadius: '50%'
                    } as React.CSSProperties}
                  >
                    <span style={{ fontSize: '3rem' }}>{emoji.emoji}</span>
                  </div>
                  <div className="avatar-name">{emoji.name}</div>
                  <div className="avatar-emoji" style={{ fontSize: '1.5rem' }}>{emoji.emoji}</div>
                  <div className="avatar-color">
                    <div
                      className="w-4 h-4 rounded-full border border-border/30 mx-auto"
                      style={{ backgroundColor: emoji.color }}
                      title={emoji.color}
                    />
                  </div>

                  {/* 操作按钮组 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 flex justify-center gap-2">
                  </div>
                </div>
              );
              })}
              </div>
            </div>
          )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="mx-auto max-w-6xl px-1 sm:px-2 lg:px-3 xl:px-4 pb-8">
            <div className="space-y-3">

            {displayEmojis.map((emoji) => {
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  data-emoji-id={emoji.id}
                  className={`bg-card rounded-lg p-3.5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md flex items-center gap-3 group ${highlightedId === emoji.id ? 'ring-4 ring-primary' : ''}`}
                  onClick={(e) => handleEmojiClick(emoji, e)}
                >
                  {/* Emoji显示 */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm emoji-avatar-bg"
                    style={{ '--emoji-bg-color': emoji.color } as React.CSSProperties}
                  >
                    {emoji.emoji}
                  </div>

                  {/* 信息区域 */}
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{emoji.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>分类: {emoji.category}</span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        颜色:
                        <div
                          className="w-3 h-3 rounded-full border border-border/30 inline-block"
                          style={{ backgroundColor: emoji.color }}
                          title={emoji.color}
                        />
                      </span>
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
                          e.preventDefault();
                          toggleFavorite(emoji.id);
                        }}
                        className="emoji-favorite-btn"
                        data-favorited={isFavorited}
                      >
                        <Heart className={isFavorited ? 'favorited' : 'not-favorited'} />
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
          <div className="mx-auto max-w-6xl px-1 sm:px-2 lg:px-3 xl:px-4 pb-8">
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
                        e.preventDefault();
                        toggleFavorite(emoji.id);
                      }}
                      className="emoji-favorite-btn"
                      data-favorited={isFavorited}
                    >
                      <Heart
                        className={isFavorited ? 'favorited' : 'not-favorited'}
                      />
                    </button>
                  )}

                  {/* 大尺寸Emoji显示 */}
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl shadow-lg transition-transform duration-200 group-hover:scale-110 emoji-avatar-bg"
                    style={{ '--emoji-bg-color': emoji.color } as React.CSSProperties}
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

                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* 空状态 - 根据不同情况显示不同消息 */}
        {displayEmojis.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              {/* 根据当前状态显示不同的图标和消息 */}
              {showFavoritesOnly ? (
                <>
                  <div className="text-6xl mb-6">⭐</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">还没有收藏的emoji</h3>
                  <p className="text-muted-foreground mb-6">
                    点击emoji右上角的星星图标来收藏您喜欢的emoji
                  </p>
                  <Button
                    onClick={() => setShowFavoritesOnly(false)}
                    variant="outline"
                    className="px-6 py-2.5 font-medium"
                  >
                    查看所有emoji
                  </Button>
                </>
              ) : searchQuery ? (
                <>
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">没有找到相关emoji</h3>
                  <p className="text-muted-foreground mb-6">
                    尝试使用其他关键词搜索，或者清除搜索条件查看所有emoji
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                      className="px-6 py-2.5 font-medium"
                    >
                      清除搜索
                    </Button>
                    <Button
                      onClick={clearFilters}
                      className="px-6 py-2.5 font-medium"
                    >
                      查看全部
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-6">😅</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">当前分类没有emoji</h3>
                  <p className="text-muted-foreground mb-6">
                    尝试选择其他分类或查看所有emoji
                  </p>
                  <Button
                    onClick={clearFilters}
                    className="px-6 py-2.5 font-medium"
                  >
                    查看全部emoji
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default UnifiedEmojiManager;
