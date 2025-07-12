/**
 * Emoji 测试页面
 * 展示 emoji 选择器、搜索、平台图标等功能
 * @module EmojiTestPage
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmojiPicker, EmojiButton } from '@/components/ui/EmojiPicker';
import { 
  getAllEmojis, 
  searchEmojis, 
  getPlatformIcons, 
  getEmojiCategories,
  getEmojiDisplay,
  getCDNConfigs,
  type EmojiItem,
  type EmojiDisplayMode
} from '@/services/emojiService';

/**
 * Emoji 测试页面组件
 */
export default function EmojiTestPage() {
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EmojiItem[]>([]);
  const [displayMode, setDisplayMode] = useState<EmojiDisplayMode>('unicode');
  const [cdnType, setCdnType] = useState<keyof ReturnType<typeof getCDNConfigs>>('noto-color');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const allEmojis = getAllEmojis();
  const platformIcons = getPlatformIcons();
  const categories = getEmojiCategories();
  const cdnConfigs = getCDNConfigs();

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchEmojis(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // 处理 emoji 选择
  const handleEmojiSelect = (emoji: EmojiItem) => {
    setSelectedEmoji(emoji);
  };

  // 渲染 emoji 显示
  const renderEmojiDisplay = (emoji: EmojiItem) => {
    const display = getEmojiDisplay(emoji.unified, displayMode, cdnType);
    
    if (displayMode === 'unicode') {
      return <span className="text-3xl emoji-font">{display}</span>;
    } else {
      return (
        <img 
          src={display} 
          alt={emoji.short_name}
          className="w-12 h-12 object-contain"
          onError={(e) => {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Emoji 功能测试</h1>
        <p className="text-muted-foreground">测试 emoji 选择器、搜索、平台图标等功能</p>
      </div>

      <Tabs defaultValue="picker" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="picker">选择器</TabsTrigger>
          <TabsTrigger value="search">搜索</TabsTrigger>
          <TabsTrigger value="platforms">平台图标</TabsTrigger>
          <TabsTrigger value="display">显示模式</TabsTrigger>
        </TabsList>

        {/* Emoji 选择器测试 */}
        <TabsContent value="picker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emoji 选择器</CardTitle>
              <CardDescription>测试 emoji 选择器的各种功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <EmojiButton 
                  onSelect={handleEmojiSelect}
                  displayMode={displayMode}
                  defaultCDNType={cdnType}
                >
                  打开选择器
                </EmojiButton>
                
                <Button onClick={() => setIsPickerOpen(true)}>
                  手动打开选择器
                </Button>
              </div>

              {selectedEmoji && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">选中的 Emoji:</h4>
                  <div className="flex items-center gap-4">
                    {renderEmojiDisplay(selectedEmoji)}
                    <div>
                      <p><strong>名称:</strong> {selectedEmoji.short_name}</p>
                      <p><strong>分类:</strong> {selectedEmoji.category}</p>
                      <p><strong>统一码:</strong> {selectedEmoji.unified}</p>
                      <p><strong>关键词:</strong> {selectedEmoji.keywords.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 搜索功能测试 */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emoji 搜索</CardTitle>
              <CardDescription>测试 emoji 搜索功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="搜索 emoji..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1"
                />
              </div>

              {searchResults.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">搜索结果 ({searchResults.length}):</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {searchResults.slice(0, 32).map((emoji) => (
                      <button
                        key={emoji.unified}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded transition-colors"
                        title={emoji.short_name}
                      >
                        {renderEmojiDisplay(emoji)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 平台图标测试 */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>平台图标</CardTitle>
              <CardDescription>测试平台图标功能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {platformIcons.map((icon) => (
                  <div key={icon.name} className="text-center p-4 border rounded-lg">
                    <div 
                      className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: icon.color }}
                    >
                      {icon.icon}
                    </div>
                    <p className="font-semibold">{icon.name}</p>
                    <p className="text-sm text-muted-foreground">{icon.shortName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 显示模式测试 */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>显示模式测试</CardTitle>
              <CardDescription>测试不同的 emoji 显示模式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <label className="text-sm font-medium">显示模式:</label>
                <Select value={displayMode} onValueChange={(value: EmojiDisplayMode) => setDisplayMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unicode">Unicode</SelectItem>
                    <SelectItem value="image">本地图片</SelectItem>
                    <SelectItem value="cdn">CDN图片</SelectItem>
                  </SelectContent>
                </Select>

                {displayMode === 'cdn' && (
                  <>
                    <label className="text-sm font-medium">CDN类型:</label>
                    <Select value={cdnType} onValueChange={(value: keyof typeof cdnConfigs) => setCdnType(value)}>
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
                  </>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-4">测试 Emoji 显示:</h4>
                <div className="grid grid-cols-6 gap-4">
                  {allEmojis.slice(0, 12).map((emoji) => (
                    <div key={emoji.unified} className="text-center">
                      <div className="mb-2">
                        {renderEmojiDisplay(emoji)}
                      </div>
                      <p className="text-xs text-muted-foreground">{emoji.short_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">统计信息:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>总 emoji 数量:</strong> {allEmojis.length}</p>
                    <p><strong>分类数量:</strong> {categories.length}</p>
                  </div>
                  <div>
                    <p><strong>当前显示模式:</strong> {displayMode}</p>
                    {displayMode === 'cdn' && (
                      <p><strong>CDN类型:</strong> {cdnConfigs[cdnType].name}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 手动控制的 Emoji 选择器 */}
      <EmojiPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleEmojiSelect}
        displayMode={displayMode}
        defaultCDNType={cdnType}
      />
    </div>
  );
} 