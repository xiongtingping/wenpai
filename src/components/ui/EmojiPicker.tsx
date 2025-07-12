/**
 * Emoji 选择器组件
 * 支持分类浏览、搜索、选择等功能
 * @module EmojiPicker
 */

import React, { useState, useMemo } from 'react';
import { Search, Smile, Heart, Star, Zap, Image, Globe } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  getPopularEmojis, 
  getSmileysEmojis, 
  getAnimalsEmojis, 
  getFoodEmojis, 
  getActivityEmojis, 
  getTravelEmojis, 
  getObjectsEmojis, 
  getSymbolsEmojis, 
  getFlagsEmojis,
  searchEmojis,
  getEmojiDisplay,
  getCDNConfigs,
  type EmojiItem,
  type EmojiDisplayMode
} from '@/services/emojiService';

/**
 * Emoji 选择器属性
 */
interface EmojiPickerProps {
  /** 选择 emoji 的回调函数 */
  onSelect?: (emoji: EmojiItem) => void;
  /** 是否显示 */
  open?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义样式类名 */
  className?: string;
  /** 显示模式 */
  displayMode?: EmojiDisplayMode;
  /** 默认CDN类型 */
  defaultCDNType?: keyof ReturnType<typeof getCDNConfigs>;
}

/**
 * Emoji 选择器组件
 */
export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  open = false,
  onClose,
  className = '',
  displayMode = 'unicode',
  defaultCDNType = 'noto-color'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [currentDisplayMode, setCurrentDisplayMode] = useState<EmojiDisplayMode>(displayMode);
  const [currentCDNType, setCurrentCDNType] = useState(defaultCDNType);

  const cdnConfigs = getCDNConfigs();

  // 根据搜索查询过滤 emoji
  const filteredEmojis = useMemo(() => {
    if (searchQuery.trim()) {
      return searchEmojis(searchQuery);
    }
    
    switch (selectedCategory) {
      case 'popular':
        return getPopularEmojis();
      case 'smileys':
        return getSmileysEmojis();
      case 'animals':
        return getAnimalsEmojis();
      case 'food':
        return getFoodEmojis();
      case 'activity':
        return getActivityEmojis();
      case 'travel':
        return getTravelEmojis();
      case 'objects':
        return getObjectsEmojis();
      case 'symbols':
        return getSymbolsEmojis();
      case 'flags':
        return getFlagsEmojis();
      default:
        return getPopularEmojis();
    }
  }, [searchQuery, selectedCategory]);

  // 处理 emoji 选择
  const handleEmojiSelect = (emoji: EmojiItem) => {
    onSelect?.(emoji);
    onClose?.();
  };

  // 渲染 emoji 显示内容
  const renderEmoji = (emoji: EmojiItem) => {
    const display = getEmojiDisplay(emoji.unified, currentDisplayMode, currentCDNType);
    
    if (currentDisplayMode === 'unicode') {
      return (
        <span className="text-2xl emoji-font" title={emoji.short_name}>
          {display}
        </span>
      );
    } else {
      return (
        <img 
          src={display} 
          alt={emoji.short_name}
          className="w-8 h-8 object-contain"
          title={emoji.short_name}
          onError={(e) => {
            // 如果图片加载失败，回退到Unicode显示
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'block';
            }
          }}
        />
      );
    }
  };

  // 分类配置
  const categories = [
    { id: 'popular', label: '热门', icon: Star },
    { id: 'smileys', label: '表情', icon: Smile },
    { id: 'animals', label: '动物', icon: Heart },
    { id: 'food', label: '食物', icon: Zap },
    { id: 'activity', label: '活动', icon: Zap },
    { id: 'travel', label: '旅行', icon: Zap },
    { id: 'objects', label: '物体', icon: Zap },
    { id: 'symbols', label: '符号', icon: Zap },
    { id: 'flags', label: '旗帜', icon: Zap }
  ];

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}>
      <div className="bg-background border rounded-lg shadow-lg w-96 max-h-[600px] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">选择 Emoji</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          
          {/* 搜索框 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索 emoji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 显示模式选择 */}
          <div className="flex items-center gap-2">
            <Select value={currentDisplayMode} onValueChange={(value: EmojiDisplayMode) => setCurrentDisplayMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unicode">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    Unicode
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    本地图片
                  </div>
                </SelectItem>
                <SelectItem value="cdn">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    CDN图片
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {currentDisplayMode === 'cdn' && (
              <Select value={currentCDNType} onValueChange={(value: keyof typeof cdnConfigs) => setCurrentCDNType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cdnConfigs).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* 分类标签 */}
        <div className="px-4 py-2 border-b">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.slice(0, 5).map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Emoji 列表 */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji.unified}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded transition-colors relative"
                title={emoji.short_name}
              >
                {renderEmoji(emoji)}
                {/* Unicode 回退显示 */}
                {currentDisplayMode !== 'unicode' && (
                  <span 
                    className="text-2xl emoji-font absolute inset-0 flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    {getEmojiDisplay(emoji.unified, 'unicode')}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {filteredEmojis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              没有找到匹配的 emoji
            </div>
          )}
        </ScrollArea>

        {/* 底部信息 */}
        <div className="p-4 border-t text-xs text-muted-foreground">
          共 {filteredEmojis.length} 个 emoji • {currentDisplayMode === 'cdn' ? cdnConfigs[currentCDNType].name : currentDisplayMode}
        </div>
      </div>
    </div>
  );
};

/**
 * Emoji 按钮组件
 * 点击后显示 emoji 选择器
 */
export const EmojiButton: React.FC<{
  onSelect?: (emoji: EmojiItem) => void;
  children?: React.ReactNode;
  className?: string;
  displayMode?: EmojiDisplayMode;
  defaultCDNType?: keyof ReturnType<typeof getCDNConfigs>;
}> = ({ onSelect, children, className = '', displayMode, defaultCDNType }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Smile className="h-4 w-4 mr-2" />
        {children || '选择 Emoji'}
      </Button>
      
      <EmojiPicker
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={onSelect}
        displayMode={displayMode}
        defaultCDNType={defaultCDNType}
      />
    </>
  );
};

export default EmojiPicker; 