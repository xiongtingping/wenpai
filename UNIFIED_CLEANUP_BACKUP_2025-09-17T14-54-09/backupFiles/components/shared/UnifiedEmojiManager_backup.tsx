/**
 * 统一Emoji管理组件
 * 沿用旧版动物头像系统的UI风格和生成逻辑
 * 增加模糊搜索、筛选、标签分类、收藏、切换视图等功能
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Filter,
  List,
  Star,
  Tag,
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
  getEmojiStats
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

const UnifiedEmojiManager: React.FC<UnifiedEmojiManagerProps> = ({ mode = 'selector',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmojis, setSelectedEmojis] = useState<UnifiedEmojiItem[]>([]);
  const [displayEmojis, setDisplayEmojis] = useState<UnifiedEmojiItem[]>([]);
  const [emojiCategories, setEmojiCategories] = useState<EmojiCategory[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 新增功能状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { toast } = useToast();

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

  // 获取所有可用标签
  const availableTags = useMemo(() => {
    const allEmojis = getAllEmojis();
    const tagSet = new Set<string>();

    allEmojis.forEach(emoji => {
      emoji.keywords.forEach(keyword => tagSet.add(keyword));
    });

    return Array.from(tagSet).sort();
  }, []);

  // 初始化数据
  useEffect(() => {
    const allCategories = getCategories();
    let filteredCategories = allCategories;

    if (categories) {
      filteredCategories = allCategories.filter(cat => categories.includes(cat.id));
    }

    if (excludeCategories) {
      filteredCategories = filteredCategories.filter(cat => !excludeCategories.includes(cat.id));
    }

    setEmojiCategories([
      { id: 'all', name: '全部', icon: '🎨', color: 'hsl(var(--accent))', count: 0, description: '所有emoji' },
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

    // 按标签过滤
    if (selectedTags.length > 0) {
      emojis = emojis.filter(emoji =>
        selectedTags.some(tag => emoji.keywords.includes(tag))
      );
    }

    // 收藏过滤
    if (showFavoritesOnly) {
      emojis = emojis.filter(emoji => favorites.has(emoji.id));
    }

    // 排序
    emojis.sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'color':
          return a.color.localeCompare(b.color);
        case 'popularity':
          return 0;
        default:
          return 0;
      }
    });

    setDisplayEmojis(emojis);
  };

  // 处理分类变化
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    onCategoryChange?.(category);
  };

  // 处理搜索变化
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // 切换收藏状态
  const toggleFavorite = (emojiId: string) => {
    const newFavorites = new Set(favorites);
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
    localStorage.setItem('emoji-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 清除所有过滤器
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setShowFavoritesOnly(false);
    setSelectedCategory('all');
  };

  // 监听状态变化，更新显示
  useEffect(() => {
    updateDisplayEmojis();
  }, [searchQuery, selectedCategory, selectedTags, showFavoritesOnly, sortMode, favorites]);

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

    // 首先执行复制操作
    try {
      await navigator.clipboard.writeText(emoji.emoji);
      toast({
        title: t('components.labels.复制成功'),
        description: `${emoji.name} ${emoji.emoji} 已复制到剪贴板`,
        duration: 2000,
      });
    } catch (error) {
      console.error('复制失败:', error);
      // 回退方案：创建临时文本区域
      try {
        const textArea = document.createElement('textarea');
        textArea.value = emoji.emoji;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        toast({
          title: t('components.labels.复制成功'),
          description: `${emoji.name} ${emoji.emoji} 已复制到剪贴板`,
          duration: 2000,
        });
      } catch (fallbackError) {
        toast({
          title: t('components.errors.复制失败'),
          description: "请手动复制emoji",
          variant: "destructive",
          duration: 3000,
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

  // 随机选择emoji
  const handleRandomSelect = () => {
    const randomEmojis = getRandomEmojis(1, selectedCategory === 'all' ? undefined : selectedCategory);
    if (randomEmojis.length > 0) {
      handleEmojiClick(randomEmojis[0]);
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
      title: t('components.labels.下载成功'),
      description: `${emoji.name} SVG已下载`,
    });
  };

  return (
    <div className={`min-h-screen ${className}`} style={{
      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* 头部标题区 - 沿用旧版风格 */}
      <div className="text-center text-primary-foreground mb-8 pt-8">
        <h1 className="text-4xl font-bold mb-4" style={{
          textShadow: 'var(--spacing-0-5) var(--spacing-0-5) var(--spacing-1) hsl(var(--foreground) / 0.3)'
        }}>
          🎨 Emoji管理系统
        </h1>
        <p className="text-xl opacity-90">
          {displayEmojis.length} 个emoji可用
          {stats && ` | 总计 ${stats.total} 个`}
          {favorites.size > 0 && ` | 已收藏 ${favorites.size} 个`}
        </p>
      </div>

      {/* 统计和控制区 - 沿用旧版毛玻璃风格 */}
      <div className="mb-8 mx-auto max-w-6xl px-4">
        <div className="bg-card bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-primary-foreground text-center">
          <h3 className="text-xl font-semibold mb-4">📊 功能控制台</h3>

          {/* 操作按钮组 */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {allowRandom && (
              <button
                onClick={handleRandomSelect}
                className="btn-gradient-primary text-primary-foreground border-none px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                🎲 随机选择
              </button>
            )}

            {allowViewSwitch && (
              <>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 ${
                    viewMode === 'grid'
                      ? 'btn-gradient-accent text-primary-foreground'
                      : 'bg-card bg-opacity-20 text-primary-foreground hover:bg-opacity-30'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 inline mr-2" />
                  网格视图
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 ${
                    viewMode === 'list'
                      ? 'btn-gradient-accent text-primary-foreground'
                      : 'bg-card bg-opacity-20 text-primary-foreground hover:bg-opacity-30'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-2" />
                  列表视图
                </button>
                <button
                  onClick={() => setViewMode('large')}
                  className={`px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 ${
                    viewMode === 'large'
                      ? 'btn-gradient-accent text-primary-foreground'
                      : 'bg-card bg-opacity-20 text-primary-foreground hover:bg-opacity-30'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  大图视图
                </button>
              </>
            )}

            {allowFavorites && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 ${
                  showFavoritesOnly
                    ? 'btn-gradient-destructive text-primary-foreground'
                    : 'bg-card bg-opacity-20 text-primary-foreground hover:bg-opacity-30'
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                {showFavoritesOnly ? '显示全部' : '仅显示收藏'}
              </button>
            )}

            <button
              onClick={clearFilters}
              className="bg-card bg-opacity-20 text-primary-foreground px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-opacity-30"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              清除过滤
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和过滤区域 */}
      <div className="mb-8 mx-auto max-w-6xl px-4">
        <div className="bg-card rounded-2xl p-6 shadow-lg">
          {/* 搜索栏 */}
          {showSearch && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索emoji名称或关键词..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 排序和标签过滤 */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* 排序选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">排序:</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">按名称</option>
                <option value="category">按分类</option>
                <option value="color">按颜色</option>
                <option value="popularity">按热度</option>
              </select>
            </div>

            {/* 标签过滤 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">标签:</span>
              <div className="flex flex-wrap gap-2 max-w-md">
                {availableTags.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-foreground hover:bg-muted'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 活动过滤器显示 */}
          {(selectedTags.length > 0 || showFavoritesOnly || searchQuery) && (
            <div className="mb-4 p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Filter className="w-4 h-4" />
                <span>活动过滤器:</span>
                {searchQuery && <span className="bg-primary px-2 py-1 rounded">搜索: {searchQuery}</span>}
                {showFavoritesOnly && <span className="bg-primary px-2 py-1 rounded">仅收藏</span>}
                {selectedTags.map(tag => (
                  <span key={tag} className="bg-primary px-2 py-1 rounded">
                    标签: {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分类标签区域 */}
      {showCategories && (
        <div className="mb-8 mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {emojiCategories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-card text-foreground shadow-lg'
                    : 'bg-card bg-opacity-20 text-primary-foreground hover:bg-opacity-30'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-muted text-foreground'
                    : 'bg-card bg-opacity-30 text-primary-foreground'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji展示区域 - 沿用旧版动物头像卡片风格 */}
      <div className="mx-auto max-w-6xl px-4">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {displayEmojis.map((emoji) => {
              const isSelected = allowMultiSelect && selectedEmojis.some(e => e.id === emoji.id);
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  className="bg-card rounded-2xl p-5 text-center shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative group"
                  onClick={(e) => handleEmojiClick(emoji, e)}
                  style={{
                    transform: isSelected ? 'translateY(-5px)' : 'none',
                    boxShadow: isSelected ? '0 var(--spacing-3) var(--spacing-10) hsl(var(--foreground) / 0.2)' : '0 var(--spacing-2) var(--spacing-8) hsl(var(--foreground) / 0.1)'
                  }}
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
                        className={`w-3 h-3 ${isFavorited ? 'fill-hsl(var(--destructive))-500 text-destructive' : 'text-muted-foreground'}`}
                      />
                    </button>
                  )}

                  {/* 复制成功动画指示器 */}
                  <div className="absolute inset-0 bg-accent opacity-0 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm transition-opacity duration-300 copy-success-indicator">
                    已复制!
                  </div>

                  {/* Emoji显示区域 - 沿用旧版圆形背景风格 */}
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-md transition-transform duration-200 group-hover:scale-110 inline-style-converted" 
                  >
                    {emoji.emoji}
                  </div>

                  {/* Emoji名称 */}
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {emoji.name}
                  </div>

                  {/* Emoji字符显示 */}
                  <div className="text-2xl mb-2">
                    {emoji.emoji}
                  </div>

                  {/* 颜色标签 */}
                  <div
                    className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded-xl inline-block"
                  >
                    {emoji.color}
                  </div>

                  {/* 操作按钮组 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 flex justify-center gap-2">
                    {allowDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadEmoji(emoji);
                        }}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary transition-colors"
                        title=$
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {displayEmojis.map((emoji) => {
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  className="bg-card rounded-xl p-4 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg flex items-center gap-4 group"
                  onClick={(e) => handleEmojiClick(emoji, e)}
                >
                  {/* Emoji显示 */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm inline-style-converted" 
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
                        <Heart
                          className={`w-4 h-4 ${isFavorited ? 'fill-hsl(var(--destructive))-500 text-destructive' : 'text-muted-foreground'}`}
                        />
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
        )}

        {/* 大图视图 */}
        {viewMode === 'large' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEmojis.map((emoji) => {
              const isFavorited = favorites.has(emoji.id);

              return (
                <div
                  key={emoji.id}
                  className="bg-card rounded-2xl p-8 text-center shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative group"
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
                        className={`w-4 h-4 ${isFavorited ? 'fill-hsl(var(--destructive))-500 text-destructive' : 'text-muted-foreground'}`}
                      />
                    </button>
                  )}

                  {/* 大尺寸Emoji显示 */}
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl shadow-lg transition-transform duration-200 group-hover:scale-110 inline-style-converted" 
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
      </div>

      {/* 统计信息 */}
      {showStats && stats && (
        <div className="mt-8 mx-auto max-w-6xl px-4">
          <div className="bg-card bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-primary-foreground">
            <h3 className="text-xl font-semibold mb-4 text-center">📊 统计信息</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-80">总计</div>
              </div>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category}>
                  <div className="text-2xl font-bold">{count as number}</div>
                  <div className="text-sm opacity-80">{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedEmojiManager;
