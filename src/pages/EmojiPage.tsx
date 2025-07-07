import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Copy, Heart, Search, Filter, Palette, Sparkles, Image as ImageIcon } from 'lucide-react';
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
  isFavorite: boolean;
  downloadCount: number;
  createdAt: Date;
}

/**
 * Emoji图片页面组件
 */
const EmojiPage: React.FC = () => {
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<EmojiItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiItem | null>(null);
  const { toast } = useToast();

  // 预设分类
  const categories = [
    '表情', '动物', '食物', '活动', '旅行', '物品', '符号', '旗帜', '其他'
  ];

  // 预设标签
  const allTags = [
    '可爱', '搞笑', '温馨', '酷炫', '复古', '简约', '卡通', '写实', 
    '节日', '季节', '情感', '职业', '运动', '音乐', '科技', '自然'
  ];

  /**
   * 生成AI风格的Emoji图片URL
   */
  const generateEmojiImageUrl = (emoji: string, style: string = 'cute') => {
    // 这里使用占位图片，实际项目中可以调用AI图片生成API
    const styles = {
      cute: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center',
      retro: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center',
      minimal: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center&sat=-100',
      colorful: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center&sat=50'
    };
    return styles[style as keyof typeof styles] || styles.cute;
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
        isFavorite: false,
        downloadCount: 234,
        createdAt: new Date('2024-01-13')
      },
      {
        id: '4',
        emoji: '⚽',
        name: '足球',
        category: '活动',
        tags: ['运动', '足球', '竞技'],
        imageUrl: generateEmojiImageUrl('⚽', 'minimal'),
        isFavorite: false,
        downloadCount: 67,
        createdAt: new Date('2024-01-12')
      },
      {
        id: '5',
        emoji: '🎨',
        name: '调色板',
        category: '物品',
        tags: ['艺术', '创意', '设计'],
        imageUrl: generateEmojiImageUrl('🎨', 'colorful'),
        isFavorite: true,
        downloadCount: 123,
        createdAt: new Date('2024-01-11')
      },
      {
        id: '6',
        emoji: '🌙',
        name: '月亮',
        category: '自然',
        tags: ['夜晚', '浪漫', '神秘'],
        imageUrl: generateEmojiImageUrl('🌙', 'minimal'),
        isFavorite: false,
        downloadCount: 178,
        createdAt: new Date('2024-01-10')
      },
      {
        id: '7',
        emoji: '🚀',
        name: '火箭',
        category: '物品',
        tags: ['科技', '太空', '速度'],
        imageUrl: generateEmojiImageUrl('🚀', 'retro'),
        isFavorite: false,
        downloadCount: 145,
        createdAt: new Date('2024-01-09')
      },
      {
        id: '8',
        emoji: '🎵',
        name: '音符',
        category: '物品',
        tags: ['音乐', '艺术', '创意'],
        imageUrl: generateEmojiImageUrl('🎵', 'colorful'),
        isFavorite: true,
        downloadCount: 92,
        createdAt: new Date('2024-01-08')
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

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(emoji =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(emoji => emoji.category === selectedCategory);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(emoji =>
        selectedTags.some(tag => emoji.tags.includes(tag))
      );
    }

    setFilteredEmojis(filtered);
  }, [emojis, searchTerm, selectedCategory, selectedTags]);

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
      a.download = `${emoji.name}-${emoji.emoji}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // 更新下载次数
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
   * 生成新的Emoji图片
   */
  const generateNewEmoji = async (emoji: string, style: string) => {
    setIsGenerating(true);
    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newEmoji: EmojiItem = {
        id: Date.now().toString(),
        emoji,
        name: `AI生成的${emoji}`,
        category: '其他',
        tags: ['AI生成', '创意'],
        imageUrl: generateEmojiImageUrl(emoji, style),
        isFavorite: false,
        downloadCount: 0,
        createdAt: new Date()
      };

      setEmojis(prev => [newEmoji, ...prev]);
      toast({
        title: "生成成功",
        description: `已生成新的 ${emoji} 图片`,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="Emoji生成器"
        description="AI生成精美Emoji图片，支持多种风格和样式"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                AI生成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI生成Emoji图片</DialogTitle>
              </DialogHeader>
              <GenerateEmojiForm onSubmit={generateNewEmoji} isGenerating={isGenerating} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 搜索和过滤 */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button variant="outline" onClick={() => setSelectedTags([])}>
                <Filter className="w-4 h-4 mr-2" />
                清除标签过滤
              </Button>
            </div>
            
            {/* 标签过滤 */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
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
            <EmojiCard
              key={emoji.id}
              emoji={emoji}
              onCopy={copyEmoji}
              onDownload={downloadEmoji}
              onToggleFavorite={toggleFavorite}
              onSelect={setSelectedEmoji}
            />
          ))}
        </div>

        {/* 详情对话框 */}
        {selectedEmoji && (
          <Dialog open={!!selectedEmoji} onOpenChange={() => setSelectedEmoji(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedEmoji.emoji}</span>
                  <span>{selectedEmoji.name}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedEmoji.imageUrl}
                    alt={selectedEmoji.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedEmoji.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>下载次数: {selectedEmoji.downloadCount}</span>
                  <span>分类: {selectedEmoji.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyEmoji(selectedEmoji.emoji)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制Emoji
                  </Button>
                  <Button
                    onClick={() => downloadEmoji(selectedEmoji)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载图片
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {filteredEmojis.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无Emoji</h3>
              <p className="text-muted-foreground">尝试调整搜索条件或生成新的Emoji</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

/**
 * Emoji卡片组件
 */
interface EmojiCardProps {
  emoji: EmojiItem;
  onCopy: (emoji: string) => void;
  onDownload: (emoji: EmojiItem) => void;
  onToggleFavorite: (id: string) => void;
  onSelect: (emoji: EmojiItem) => void;
}

const EmojiCard: React.FC<EmojiCardProps> = ({
  emoji,
  onCopy,
  onDownload,
  onToggleFavorite,
  onSelect
}) => {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 relative">
          <img
            src={emoji.imageUrl}
            alt={emoji.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onClick={() => onSelect(emoji)}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(emoji.id);
              }}
            >
              <Heart className={`w-4 h-4 ${emoji.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-2xl">{emoji.emoji}</div>
          <div className="text-sm font-medium truncate">{emoji.name}</div>
          
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(emoji.emoji);
              }}
              title="复制Emoji"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(emoji);
              }}
              title="下载图片"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 生成Emoji表单组件
 */
interface GenerateEmojiFormProps {
  onSubmit: (emoji: string, style: string) => void;
  isGenerating: boolean;
}

const GenerateEmojiForm: React.FC<GenerateEmojiFormProps> = ({ onSubmit, isGenerating }) => {
  const [emoji, setEmoji] = useState('');
  const [style, setStyle] = useState('cute');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emoji.trim()) {
      onSubmit(emoji.trim(), style);
      setEmoji('');
    }
  };

  const popularEmojis = ['😊', '🐱', '🍕', '⚽', '🎨', '🌙', '🚀', '🎵', '🌸', '🌈', '🎮', '📱'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Emoji</label>
        <Input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="输入Emoji或选择下方常用Emoji"
          required
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {popularEmojis.map(e => (
            <button
              key={e}
              type="button"
              className="text-2xl hover:scale-110 transition-transform"
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">生成风格</label>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cute">可爱风格</SelectItem>
            <SelectItem value="retro">复古风格</SelectItem>
            <SelectItem value="minimal">简约风格</SelectItem>
            <SelectItem value="colorful">彩色风格</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isGenerating} className="w-full">
        {isGenerating ? (
          <>
            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            开始生成
          </>
        )}
      </Button>
    </form>
  );
};

export default EmojiPage; 