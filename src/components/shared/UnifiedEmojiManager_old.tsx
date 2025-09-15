/**
 * 统一Emoji管理组件
 * 沿用旧版动物头像系统的UI风格和生成逻辑
 * 增加模糊搜索、筛选、标签分类、收藏、切换视图等功能
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Shuffle, 
  Heart, 
  Download,
  Grid3X3,
  Filter,
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

  return (
    <div>
      <h1>Emoji Manager - 新版本正在开发中</h1>
      <p>显示 {displayEmojis.length} 个emoji</p>
    </div>
  );
};

export default UnifiedEmojiManager;
