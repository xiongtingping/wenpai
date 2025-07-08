/**
 * Noto风格Emoji生成器页面
 * 基于Google Noto Emoji项目的设计理念
 * 支持Unicode标准的emoji分类和生成
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Download, 
  Copy, 
  Heart, 
  Search, 
  Filter, 
  Sparkles, 
  Wand2,
  Grid3X3,
  Shuffle,
  Package,
  Zap,
  Settings,
  RefreshCw,
  Palette,
  Code,
  FileImage,
  Smile,
  Eye,
  Star,
  Upload,
  Share2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { notoEmojiService, UNICODE_EMOJI_GROUPS, SKIN_TONE_MODIFIERS, NOTO_STYLES, type NotoEmojiData } from '@/services/notoEmojiService';

/**
 * 生成参数接口
 */
interface GenerationParams {
  style: keyof typeof NOTO_STYLES;
  size: number;
  format: 'png' | 'svg' | 'webp';
  skinTone: keyof typeof SKIN_TONE_MODIFIERS | '';
  background: 'transparent' | 'white' | 'custom';
  customBg?: string;
  padding: number;
  effects: string[];
}

/**
 * Emoji生成器主组件
 */
const EmojiPage: React.FC = () => {
  const [emojis, setEmojis] = useState<NotoEmojiData[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<NotoEmojiData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof NOTO_STYLES>('color');
  const [selectedEmoji, setSelectedEmoji] = useState<NotoEmojiData | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // 生成参数
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    style: 'color',
    size: 128,
    format: 'png',
    skinTone: '',
    background: 'transparent',
    padding: 8,
    effects: []
  });

  const { toast } = useToast();

  /**
   * 获取emoji分类统计
   */
  const categoryStats = useMemo(() => {
    const stats = notoEmojiService.getEmojiStats();
    return stats.byGroup;
  }, []);

  /**
   * 初始化emoji数据
   */
  useEffect(() => {
    const allEmojis = notoEmojiService.getAllEmojis();
    setEmojis(allEmojis);
    setFilteredEmojis(allEmojis);
  }, []);

  /**
   * 过滤emoji
   */
  useEffect(() => {
    let filtered = emojis;

    if (searchTerm) {
      filtered = notoEmojiService.searchEmojis(searchTerm);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(emoji => emoji.group === selectedCategory);
    }

    setFilteredEmojis(filtered);
  }, [emojis, searchTerm, selectedCategory]);

  /**
   * 复制emoji到剪贴板
   */
  const copyEmoji = async (emoji: NotoEmojiData) => {
    try {
      let emojiToCopy = emoji.unicode;
      
      // 应用肤色修饰符
      if (generationParams.skinTone && emoji.hasSkinTone) {
        emojiToCopy = notoEmojiService.applySkinToneModifier(emoji.unicode, generationParams.skinTone);
      }
      
      await navigator.clipboard.writeText(emojiToCopy);
      toast({
        title: "复制成功",
        description: `已复制 ${emojiToCopy} 到剪贴板`,
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
   * 下载emoji
   */
  const downloadEmoji = async (emoji: NotoEmojiData) => {
    try {
      const imageUrl = notoEmojiService.generateEmojiUrl(emoji.codepoint, generationParams.style, generationParams.size);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${emoji.name.replace(/\s+/g, '-')}-${emoji.unicode}-noto-${generationParams.style}.${generationParams.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "下载成功",
        description: `已下载 ${emoji.name}`,
      });
    } catch (err) {
      toast({
        title: "下载失败",
        description: "图片资源可能不可用，请稍后重试",
        variant: "destructive",
      });
    }
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (unicode: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(unicode)) {
        newFavorites.delete(unicode);
      } else {
        newFavorites.add(unicode);
      }
      return newFavorites;
    });
  };

  /**
   * 批量生成emoji
   */
  const generateBatchEmojis = async () => {
    setIsGenerating(true);
    try {
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 批量生成URLs
      const codepoints = filteredEmojis.map(emoji => emoji.codepoint);
      const urls = notoEmojiService.batchGenerateUrls(codepoints, generationParams.style, generationParams.size);
      
      toast({
        title: "批量生成完成",
        description: `已为 ${urls.length} 个emoji生成 ${NOTO_STYLES[generationParams.style].name} 风格图片`,
      });
    } catch (err) {
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 应用肤色修饰符
   */
  const applyModifier = (emoji: NotoEmojiData) => {
    if (generationParams.skinTone && emoji.hasSkinTone) {
      return notoEmojiService.applySkinToneModifier(emoji.unicode, generationParams.skinTone);
    }
    return emoji.unicode;
  };

  /**
   * 导出emoji数据
   */
  const exportEmojiData = () => {
    const dataStr = notoEmojiService.exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'noto-emoji-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "导出成功",
      description: "Emoji数据已导出为JSON文件",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="Noto Emoji 生成器"
        description="基于Google Noto Emoji项目的专业emoji生成工具"
        showAdaptButton={false}
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Emoji统计信息卡片 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">项目信息</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Code className="h-3 w-3 mr-1" />
                  Unicode 15.0
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Star className="h-3 w-3 mr-1" />
                  Google Noto
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{emojis.length}</div>
                <div className="text-sm text-gray-600">总计Emoji</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{UNICODE_EMOJI_GROUPS.length}</div>
                <div className="text-sm text-gray-600">Unicode分类</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Object.keys(SKIN_TONE_MODIFIERS).length}</div>
                <div className="text-sm text-gray-600">肤色修饰符</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Object.keys(NOTO_STYLES).length}</div>
                <div className="text-sm text-gray-600">可用风格</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Emoji图库
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              风格生成器
            </TabsTrigger>
            <TabsTrigger value="variants" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              变体浏览器
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              开发工具
            </TabsTrigger>
          </TabsList>

          {/* Emoji图库 */}
          <TabsContent value="gallery" className="space-y-6">
            {/* 搜索和过滤工具栏 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索emoji、名称或关键词..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分类</SelectItem>
                      {UNICODE_EMOJI_GROUPS.map(group => (
                        <SelectItem key={group} value={group}>
                          {group} ({categoryStats[group] || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStyle} onValueChange={(value: keyof typeof NOTO_STYLES) => setSelectedStyle(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="选择风格" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NOTO_STYLES).map(([key, style]) => (
                        <SelectItem key={key} value={key}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 分类快速导航 */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                全部
              </Button>
              {UNICODE_EMOJI_GROUPS.map(group => (
                <Button
                  key={group}
                  variant={selectedCategory === group ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(group)}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">{group}</span>
                  <Badge variant="secondary" className="text-xs">
                    {categoryStats[group] || 0}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Emoji网格/列表 */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4"
                : "space-y-2"
            }>
              {filteredEmojis.map(emoji => (
                <Card 
                  key={emoji.codepoint} 
                  className={`group cursor-pointer hover:shadow-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'aspect-square' : 'flex-row'
                  }`}
                >
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                    <div className={`relative ${viewMode === 'grid' ? 'aspect-square mb-2' : 'w-12 h-12'} flex items-center justify-center`}>
                      <div 
                        className="text-4xl cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => copyEmoji(emoji)}
                        title={`${emoji.name} (${emoji.unicode})`}
                      >
                        {applyModifier(emoji)}
                      </div>
                      
                      {/* 收藏按钮 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-0 right-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                          viewMode === 'list' ? 'relative opacity-100' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(emoji.unicode);
                        }}
                      >
                        <Heart className={`w-3 h-3 ${favorites.has(emoji.unicode) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className={`text-center ${viewMode === 'list' ? 'flex-1 text-left' : ''}`}>
                      <div className="text-sm font-medium text-gray-700 truncate">
                        {emoji.name}
                      </div>
                      {viewMode === 'list' && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="mr-2">{emoji.group}</span>
                          {emoji.hasSkinTone && <Badge variant="outline" className="text-xs mr-1">肤色</Badge>}
                          {emoji.hasGender && <Badge variant="outline" className="text-xs">性别</Badge>}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮（列表模式） */}
                    {viewMode === 'list' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyEmoji(emoji);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadEmoji(emoji);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 空状态 */}
            {filteredEmojis.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关emoji</h3>
                <p className="text-gray-500">尝试调整搜索条件或选择其他分类</p>
              </div>
            )}
          </TabsContent>

          {/* 风格生成器 */}
          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Noto Emoji 生成器
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">风格选择</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(NOTO_STYLES).map(([key, style]) => (
                        <Button
                          key={key}
                          variant={generationParams.style === key ? 'default' : 'outline'}
                          className="h-auto p-4 text-left"
                          onClick={() => setGenerationParams(prev => ({ ...prev, style: key as keyof typeof NOTO_STYLES }))}
                        >
                          <div>
                            <div className="font-medium text-sm">{style.name}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">肤色修饰符</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={generationParams.skinTone === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGenerationParams(prev => ({ ...prev, skinTone: '' }))}
                      >
                        默认
                      </Button>
                      {Object.entries(SKIN_TONE_MODIFIERS).map(([key, tone]) => (
                        <Button
                          key={key}
                          variant={generationParams.skinTone === key ? 'default' : 'outline'}
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setGenerationParams(prev => ({ ...prev, skinTone: key as keyof typeof SKIN_TONE_MODIFIERS }))}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: `#${tone.hex}` }}
                          />
                          <span>{tone.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">尺寸: {generationParams.size}px</Label>
                    <Slider
                      value={[generationParams.size]}
                      onValueChange={([value]) => setGenerationParams(prev => ({ ...prev, size: value }))}
                      min={32}
                      max={512}
                      step={32}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">格式</Label>
                    <Select 
                      value={generationParams.format} 
                      onValueChange={(value: 'png' | 'svg' | 'webp') => 
                        setGenerationParams(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (推荐)</SelectItem>
                        <SelectItem value="svg">SVG (矢量)</SelectItem>
                        <SelectItem value="webp">WebP (小尺寸)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">背景</Label>
                    <Select 
                      value={generationParams.background} 
                      onValueChange={(value: 'transparent' | 'white' | 'custom') => 
                        setGenerationParams(prev => ({ ...prev, background: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transparent">透明背景</SelectItem>
                        <SelectItem value="white">白色背景</SelectItem>
                        <SelectItem value="custom">自定义颜色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {generationParams.background === 'custom' && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">自定义背景色</Label>
                    <Input
                      type="color"
                      value={generationParams.customBg || '#ffffff'}
                      onChange={(e) => setGenerationParams(prev => ({ ...prev, customBg: e.target.value }))}
                      className="w-20 h-10"
                    />
                  </div>
                )}

                <div className="flex justify-center">
                  <Button size="lg" onClick={generateBatchEmojis} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        批量生成Noto风格Emoji
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 变体浏览器 */}
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Emoji变体浏览器
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">肤色和性别变体浏览</h3>
                  <p className="text-gray-500 mb-4">浏览emoji的所有肤色和性别变体</p>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    功能开发中
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 开发工具 */}
          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  开发者工具
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={exportEmojiData}
                  >
                    <div>
                      <div className="font-medium">导出Emoji数据</div>
                      <div className="text-sm text-gray-500">下载完整的emoji数据集</div>
                    </div>
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto p-4 text-left">
                        <div>
                          <div className="font-medium">API信息</div>
                          <div className="text-sm text-gray-500">查看API使用方法</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Noto Emoji API</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">基础用法</h4>
                          <code className="text-sm bg-gray-100 p-2 rounded block">
                            {`import { notoEmojiService } from '@/services/notoEmojiService';`}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">获取emoji数据</h4>
                          <code className="text-sm bg-gray-100 p-2 rounded block">
                            {`const emojis = notoEmojiService.getAllEmojis();`}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">生成图片URL</h4>
                          <code className="text-sm bg-gray-100 p-2 rounded block">
                            {`const url = notoEmojiService.generateEmojiUrl('1f600', 'color', 128);`}
                          </code>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmojiPage; 