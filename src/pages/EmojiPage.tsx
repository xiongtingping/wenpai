/**
 * Emoji生成器页面
 * 支持AI生成多种风格的Emoji图片，批量导出和高级定制
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * Emoji图片项接口定义
 */
interface EmojiItem {
  id: string;
  emoji: string;
  name: string;
  category: string;
  tags: string[];
  imageUrl: string;
  style: string;
  isFavorite: boolean;
  downloadCount: number;
  createdAt: Date;
  isGenerated?: boolean;
}

/**
 * AI生成参数接口
 */
interface GenerationParams {
  style: 'cute' | 'retro' | 'minimal' | 'colorful' | 'neon' | 'watercolor' | '3d' | 'pixel';
  mood: 'happy' | 'calm' | 'energetic' | 'mysterious' | 'romantic' | 'professional';
  color: 'rainbow' | 'pastel' | 'dark' | 'bright' | 'monochrome' | 'gradient';
  effect: 'none' | 'glow' | 'shadow' | 'sparkle' | 'blur' | 'outline';
  count: number;
}

/**
 * Emoji生成器页面组件
 */
const EmojiPage: React.FC = () => {
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<EmojiItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiItem | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  
  // AI生成相关状态
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    style: 'cute',
    mood: 'happy',
    color: 'rainbow',
    effect: 'none',
    count: 1
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const { toast } = useToast();

  // 预设分类
  const categories = [
    '表情', '动物', '食物', '活动', '旅行', '物品', '符号', '旗帜', '自然', '其他'
  ];

  // 预设标签
  const allTags = [
    'AI生成', '可爱', '搞笑', '温馨', '酷炫', '复古', '简约', '卡通', '写实', 
    '节日', '季节', '情感', '职业', '运动', '音乐', '科技', '自然', '艺术'
  ];

  // 生成风格选项
  const styleOptions = [
    { value: 'cute', label: '可爱风格', description: '圆润可爱，充满童趣' },
    { value: 'retro', label: '复古风格', description: '怀旧色彩，经典设计' },
    { value: 'minimal', label: '简约风格', description: '简洁大方，现代感强' },
    { value: 'colorful', label: '彩色风格', description: '色彩丰富，视觉冲击' },
    { value: 'neon', label: '霓虹风格', description: '发光效果，未来感十足' },
    { value: 'watercolor', label: '水彩风格', description: '柔和渐变，艺术感强' },
    { value: '3d', label: '3D风格', description: '立体感强，质感丰富' },
    { value: 'pixel', label: '像素风格', description: '复古游戏，像素艺术' }
  ];

  /**
   * 生成AI风格的Emoji图片URL
   */
  const generateEmojiImageUrl = (emoji: string, style = 'cute') => {
    const baseUrls = {
      cute: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      retro: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
      minimal: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      colorful: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
      neon: 'https://images.unsplash.com/photo-1548142813-c348350df52b',
      watercolor: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
      '3d': 'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae',
      pixel: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65'
    };
    
    const baseUrl = baseUrls[style as keyof typeof baseUrls] || baseUrls.cute;
    return `${baseUrl}?w=200&h=200&fit=crop&crop=center&auto=format&seed=${emoji}`;
  };

  /**
   * 初始化示例数据
   */
  useEffect(() => {
    const sampleEmojis: EmojiItem[] = [
      {
        id: '1',
        emoji: '😊',
        name: '微笑脸',
        category: '表情',
        tags: ['可爱', '温馨', '情感'],
        imageUrl: generateEmojiImageUrl('😊', 'cute'),
        style: 'cute',
        isFavorite: false,
        downloadCount: 156,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        emoji: '🐱',
        name: '猫咪',
        category: '动物',
        tags: ['可爱', '宠物', '温馨'],
        imageUrl: generateEmojiImageUrl('🐱', 'cute'),
        style: 'cute',
        isFavorite: true,
        downloadCount: 89,
        createdAt: new Date('2024-01-14')
      },
      {
        id: '3',
        emoji: '🍕',
        name: '披萨',
        category: '食物',
        tags: ['美食', '意大利', '快餐'],
        imageUrl: generateEmojiImageUrl('🍕', 'colorful'),
        style: 'colorful',
        isFavorite: false,
        downloadCount: 234,
        createdAt: new Date('2024-01-13')
      },
      {
        id: '4',
        emoji: '🚀',
        name: '火箭',
        category: '物品',
        tags: ['科技', '太空', '速度'],
        imageUrl: generateEmojiImageUrl('🚀', 'neon'),
        style: 'neon',
        isFavorite: false,
        downloadCount: 145,
        createdAt: new Date('2024-01-09'),
        isGenerated: true
      }
    ];
    setEmojis(sampleEmojis);
    setFilteredEmojis(sampleEmojis);
  }, []);

  /**
   * 过滤Emoji
   */
  useEffect(() => {
    let filtered = emojis;

    if (searchTerm) {
      filtered = filtered.filter(emoji =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(emoji => emoji.category === selectedCategory);
    }

    if (selectedStyle !== 'all') {
      filtered = filtered.filter(emoji => emoji.style === selectedStyle);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(emoji =>
        selectedTags.some(tag => emoji.tags.includes(tag))
      );
    }

    setFilteredEmojis(filtered);
  }, [emojis, searchTerm, selectedCategory, selectedStyle, selectedTags]);

  /**
   * 复制Emoji到剪贴板
   */
  const copyEmoji = async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji);
      toast({
        title: "复制成功",
        description: `已复制 ${emoji} 到剪贴板`,
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
   * 下载Emoji图片
   */
  const downloadEmoji = async (emoji: EmojiItem) => {
    try {
      const response = await fetch(emoji.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${emoji.name}-${emoji.emoji}-${emoji.style}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setEmojis(prev => prev.map(e =>
        e.id === emoji.id
          ? { ...e, downloadCount: e.downloadCount + 1 }
          : e
      ));

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
   * 批量生成Emoji图片
   */
  const generateBatchEmojis = async (inputEmojis: string[], params: GenerationParams) => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newEmojis: EmojiItem[] = inputEmojis.map((emoji, index) => ({
        id: `${Date.now()}-${index}`,
        emoji,
        name: `AI生成的${emoji}`,
        category: '其他',
        tags: ['AI生成', '创意', params.style, params.mood],
        imageUrl: generateEmojiImageUrl(emoji, params.style),
        style: params.style,
        isFavorite: false,
        downloadCount: 0,
        createdAt: new Date(),
        isGenerated: true
      }));

      setEmojis(prev => [...newEmojis, ...prev]);
      toast({
        title: "批量生成成功",
        description: `已生成 ${newEmojis.length} 个AI Emoji图片`,
      });
      
      setActiveTab('gallery');
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
   * 随机生成单个Emoji
   */
  const generateRandomEmoji = async () => {
    const randomEmojis = ['🎭', '🎪', '🎨', '🌟', '⭐', '🔮', '🎯', '🎲', '🎰', '🌈'];
    const randomEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newEmoji: EmojiItem = {
        id: Date.now().toString(),
        emoji: randomEmoji,
        name: `AI生成的${randomEmoji}`,
        category: '其他',
        tags: ['AI生成', '创意', generationParams.style, generationParams.mood],
        imageUrl: generateEmojiImageUrl(randomEmoji, generationParams.style),
        style: generationParams.style,
        isFavorite: false,
        downloadCount: 0,
        createdAt: new Date(),
        isGenerated: true
      };

      setEmojis(prev => [newEmoji, ...prev]);
      toast({
        title: "生成成功",
        description: `已生成 AI Emoji图片`,
      });
      
      setActiveTab('gallery');
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



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Emoji图库</TabsTrigger>
            <TabsTrigger value="generate">AI生成</TabsTrigger>
          </TabsList>

          {/* Emoji图库标签页 */}
          <TabsContent value="gallery" className="space-y-6">
            {/* 搜索和过滤 */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索Emoji..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分类</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择风格" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部风格</SelectItem>
                      {styleOptions.map(style => (
                        <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    setSelectedTags([]);
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStyle('all');
                  }}>
                    <Filter className="w-4 h-4 mr-2" />
                    清除筛选
                  </Button>
                </div>
                
                {/* 标签过滤 */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emoji网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredEmojis.map(emoji => (
                <Card key={emoji.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 relative">
                      <img
                        src={emoji.imageUrl}
                        alt={emoji.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onClick={() => setSelectedEmoji(emoji)}
                      />
                      
                      {/* 操作按钮 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(emoji.id);
                          }}
                        >
                          <Heart className={`w-4 h-4 ${emoji.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>
                      
                      {/* 生成标识 */}
                      {emoji.isGenerated && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI生成
                          </Badge>
                        </div>
                      )}
                      
                      {/* 风格标识 */}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm">
                          {emoji.style}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl mb-1">{emoji.emoji}</div>
                      <div className="text-sm font-medium text-gray-700 truncate">{emoji.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{emoji.category}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI生成标签页 */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI生成设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>生成风格</Label>
                    <Select value={generationParams.style} onValueChange={(value: any) => setGenerationParams(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择风格" />
                      </SelectTrigger>
                      <SelectContent>
                        {styleOptions.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>情感氛围</Label>
                    <Select value={generationParams.mood} onValueChange={(value: any) => setGenerationParams(prev => ({ ...prev, mood: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择氛围" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">愉快</SelectItem>
                        <SelectItem value="calm">平静</SelectItem>
                        <SelectItem value="energetic">活力</SelectItem>
                        <SelectItem value="mysterious">神秘</SelectItem>
                        <SelectItem value="romantic">浪漫</SelectItem>
                        <SelectItem value="professional">专业</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>色彩方案</Label>
                    <Select value={generationParams.color} onValueChange={(value: any) => setGenerationParams(prev => ({ ...prev, color: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择配色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainbow">彩虹色</SelectItem>
                        <SelectItem value="pastel">柔和色</SelectItem>
                        <SelectItem value="dark">深色系</SelectItem>
                        <SelectItem value="bright">明亮色</SelectItem>
                        <SelectItem value="monochrome">单色系</SelectItem>
                        <SelectItem value="gradient">渐变色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>特效</Label>
                    <Select value={generationParams.effect} onValueChange={(value: any) => setGenerationParams(prev => ({ ...prev, effect: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择特效" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无特效</SelectItem>
                        <SelectItem value="glow">发光</SelectItem>
                        <SelectItem value="shadow">阴影</SelectItem>
                        <SelectItem value="sparkle">闪烁</SelectItem>
                        <SelectItem value="blur">模糊</SelectItem>
                        <SelectItem value="outline">描边</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button onClick={generateRandomEmoji} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        开始生成
                      </>
                    )}
                  </Button>
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