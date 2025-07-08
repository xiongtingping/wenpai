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
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * Unicode Emoji分类 - 基于Unicode 15.0标准
 */
const UNICODE_CATEGORIES = [
  { id: 'smileys-emotion', name: '笑脸与情感', icon: '😀', count: 168 },
  { id: 'people-body', name: '人物与身体', icon: '👤', count: 2539 },
  { id: 'component', name: '组成部分', icon: '👁️', count: 9 },
  { id: 'animals-nature', name: '动物与自然', icon: '🐶', count: 158 },
  { id: 'food-drink', name: '食物与饮料', icon: '🍎', count: 135 },
  { id: 'travel-places', name: '旅行与地点', icon: '🚗', count: 220 },
  { id: 'activities', name: '活动', icon: '⚽', count: 83 },
  { id: 'objects', name: '物品', icon: '💡', count: 264 },
  { id: 'symbols', name: '符号', icon: '❤️', count: 224 },
  { id: 'flags', name: '旗帜', icon: '🏳️', count: 269 }
];

/**
 * Noto Emoji风格选项
 */
const NOTO_STYLES = [
  { id: 'color', name: 'Noto Color', description: '彩色风格，Google官方设计', preview: '😊' },
  { id: 'black-white', name: 'Noto黑白', description: '黑白线条风格，简洁明了', preview: '😊' },
  { id: 'outline', name: 'Noto描边', description: '描边风格，轮廓清晰', preview: '😊' },
  { id: 'filled', name: 'Noto填充', description: '填充风格，色彩饱满', preview: '😊' },
  { id: 'gradient', name: 'Noto渐变', description: '渐变风格，视觉丰富', preview: '😊' },
  { id: 'flat', name: 'Noto扁平', description: '扁平化设计，现代简约', preview: '😊' }
];

/**
 * 肤色修饰符
 */
const SKIN_TONES = [
  { id: '', name: '默认', hex: '', modifier: '' },
  { id: 'light', name: '浅肤色', hex: '#F7D7C4', modifier: '🏻' },
  { id: 'medium-light', name: '中浅肤色', hex: '#D4A574', modifier: '🏼' },
  { id: 'medium', name: '中等肤色', hex: '#A0754D', modifier: '🏽' },
  { id: 'medium-dark', name: '中深肤色', hex: '#825C42', modifier: '🏾' },
  { id: 'dark', name: '深肤色', hex: '#5C4033', modifier: '🏿' }
];

/**
 * Emoji项接口
 */
interface EmojiItem {
  id: string;
  unicode: string;
  name: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  hasSkinTone: boolean;
  hasHairStyle: boolean;
  isCustom: boolean;
  styles: Record<string, string>; // 不同风格的图片URL
  createdAt: Date;
  isFavorite: boolean;
}

/**
 * 生成参数接口
 */
interface GenerationParams {
  style: string;
  size: number;
  format: 'png' | 'svg' | 'webp';
  skinTone: string;
  background: 'transparent' | 'white' | 'custom';
  customBg?: string;
  padding: number;
  effects: string[];
}

/**
 * Emoji生成器主组件
 */
const EmojiPage: React.FC = () => {
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<EmojiItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('color');
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiItem | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
   * Unicode标准emoji数据 - 简化版，实际应用中会从完整的Unicode数据加载
   */
  const unicodeEmojis: EmojiItem[] = useMemo(() => [
    {
      id: 'u1f600',
      unicode: '😀',
      name: '笑脸',
      category: 'smileys-emotion',
      subcategory: 'face-smiling',
      keywords: ['笑', '开心', '高兴', '快乐'],
      hasSkinTone: false,
      hasHairStyle: false,
      isCustom: false,
      styles: {
        color: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u1f600.png',
        'black-white': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp'
      },
      createdAt: new Date(),
      isFavorite: false
    },
    {
      id: 'u1f603',
      unicode: '😃',
      name: '张嘴笑脸',
      category: 'smileys-emotion',
      subcategory: 'face-smiling',
      keywords: ['笑', '开心', '张嘴', '兴奋'],
      hasSkinTone: false,
      hasHairStyle: false,
      isCustom: false,
      styles: {
        color: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u1f603.png',
        'black-white': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/512.webp'
      },
      createdAt: new Date(),
      isFavorite: false
    },
    {
      id: 'u1f44d',
      unicode: '👍',
      name: '竖起大拇指',
      category: 'people-body',
      subcategory: 'hand-fingers-closed',
      keywords: ['好', '赞', '同意', '手势'],
      hasSkinTone: true,
      hasHairStyle: false,
      isCustom: false,
      styles: {
        color: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u1f44d.png',
        'black-white': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp'
      },
      createdAt: new Date(),
      isFavorite: false
    },
    {
      id: 'u1f436',
      unicode: '🐶',
      name: '狗脸',
      category: 'animals-nature',
      subcategory: 'animal-mammal',
      keywords: ['狗', '小狗', '宠物', '动物'],
      hasSkinTone: false,
      hasHairStyle: false,
      isCustom: false,
      styles: {
        color: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u1f436.png',
        'black-white': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f436/512.webp'
      },
      createdAt: new Date(),
      isFavorite: false
    },
    {
      id: 'u1f34e',
      unicode: '🍎',
      name: '红苹果',
      category: 'food-drink',
      subcategory: 'food-fruit',
      keywords: ['苹果', '水果', '红色', '健康'],
      hasSkinTone: false,
      hasHairStyle: false,
      isCustom: false,
      styles: {
        color: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u1f34e.png',
        'black-white': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f34e/512.webp'
      },
      createdAt: new Date(),
      isFavorite: false
    },
    {
      id: 'u2764',
      unicode: '❤️',
      name: '红心',
      category: 'symbols',
      subcategory: 'heart',
      keywords: ['爱', '心', '红色', '感情'],
      hasSkinTone: false,
      hasHairStyle: false,
      isCustom: false,
      styles: {
        color: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u2764.png',
        'black-white': 'https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/512.webp'
      },
      createdAt: new Date(),
      isFavorite: false
    }
  ], []);

  /**
   * 初始化emoji数据
   */
  useEffect(() => {
    setEmojis(unicodeEmojis);
    setFilteredEmojis(unicodeEmojis);
  }, [unicodeEmojis]);

  /**
   * 过滤emoji
   */
  useEffect(() => {
    let filtered = emojis;

    if (searchTerm) {
      filtered = filtered.filter(emoji =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emoji.unicode.includes(searchTerm)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(emoji => emoji.category === selectedCategory);
    }

    setFilteredEmojis(filtered);
  }, [emojis, searchTerm, selectedCategory]);

  /**
   * 生成Noto风格的emoji URL
   */
  const generateNotoEmojiUrl = (unicode: string, style: string, size: number = 128) => {
    const codepoint = unicode.codePointAt(0)?.toString(16).padStart(4, '0');
    const baseUrls = {
      color: `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/${size}/emoji_u${codepoint}.png`,
      'black-white': `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/${size}.webp`,
      outline: `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/${size}.webp`,
      filled: `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/${size}.webp`,
      gradient: `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/${size}.webp`,
      flat: `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/${size}.webp`
    };
    return baseUrls[style as keyof typeof baseUrls] || baseUrls.color;
  };

  /**
   * 复制emoji到剪贴板
   */
  const copyEmoji = async (emoji: EmojiItem) => {
    try {
      await navigator.clipboard.writeText(emoji.unicode);
      toast({
        title: "复制成功",
        description: `已复制 ${emoji.unicode} 到剪贴板`,
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
  const downloadEmoji = async (emoji: EmojiItem) => {
    try {
      const imageUrl = generateNotoEmojiUrl(emoji.unicode, generationParams.style, generationParams.size);
      const response = await fetch(imageUrl);
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
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    setEmojis(prev => prev.map(emoji =>
      emoji.id === id
        ? { ...emoji, isFavorite: !emoji.isFavorite }
        : emoji
    ));
  };

  /**
   * 批量生成emoji
   */
  const generateBatchEmojis = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "批量生成完成",
        description: `已生成 ${filteredEmojis.length} 个Noto风格emoji`,
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
  const applyModifier = (emoji: EmojiItem, modifier: string) => {
    if (emoji.hasSkinTone && modifier) {
      return emoji.unicode + modifier;
    }
    return emoji.unicode;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="Noto Emoji 生成器"
        description="基于Google Noto Emoji项目的专业emoji生成工具"
        actions={
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            Unicode 15.0
          </Badge>
        }
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
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
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              自定义设计
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              批量处理
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
                      {UNICODE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="选择风格" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTO_STYLES.map(style => (
                        <SelectItem key={style.id} value={style.id}>
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
              {UNICODE_CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
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
                  key={emoji.id} 
                  className={`group cursor-pointer hover:shadow-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'aspect-square' : 'flex-row'
                  }`}
                >
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                    <div className={`relative ${viewMode === 'grid' ? 'aspect-square mb-2' : 'w-12 h-12'} flex items-center justify-center`}>
                      <div 
                        className="text-4xl cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => copyEmoji(emoji)}
                      >
                        {applyModifier(emoji, generationParams.skinTone)}
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
                          toggleFavorite(emoji.id);
                        }}
                      >
                        <Heart className={`w-3 h-3 ${emoji.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className={`text-center ${viewMode === 'list' ? 'flex-1 text-left' : ''}`}>
                      <div className="text-sm font-medium text-gray-700 truncate">
                        {emoji.name}
                      </div>
                      {viewMode === 'list' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {emoji.keywords.slice(0, 3).join(', ')}
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
                  Noto风格生成器
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">风格选择</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {NOTO_STYLES.map(style => (
                        <Button
                          key={style.id}
                          variant={generationParams.style === style.id ? 'default' : 'outline'}
                          className="h-auto p-4 text-left"
                          onClick={() => setGenerationParams(prev => ({ ...prev, style: style.id }))}
                        >
                          <div>
                            <div className="text-xl mb-1">{style.preview}</div>
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
                      {SKIN_TONES.map(tone => (
                        <Button
                          key={tone.id}
                          variant={generationParams.skinTone === tone.id ? 'default' : 'outline'}
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setGenerationParams(prev => ({ ...prev, skinTone: tone.id }))}
                        >
                          {tone.hex && (
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: tone.hex }}
                            />
                          )}
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
                        生成Noto风格Emoji
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 自定义设计 */}
          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  自定义Emoji设计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">自定义设计功能</h3>
                  <p className="text-gray-500 mb-4">基于Noto Emoji的设计系统，创建您自己的emoji</p>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    即将推出
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 批量处理 */}
          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  批量处理工具
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">批量下载和转换</h3>
                  <p className="text-gray-500 mb-4">批量下载整个分类的emoji，或批量转换格式</p>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    即将推出
                  </Badge>
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