/**
 * Emoji生成器页面
 * 基于Google Noto Emoji项目的设计理念
 * 支持Unicode标准的emoji分类和生成
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Copy, 
  Heart, 
  Search, 
  Filter, 
  Sparkles, 
  Grid3X3,
  Shuffle,
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
  Info,
  Trash2,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { notoEmojiService, UNICODE_EMOJI_GROUPS, NOTO_STYLES, type NotoEmojiData } from '@/services/notoEmojiService';

import PersonalizedEmojiGenerator from '@/components/creative/PersonalizedEmojiGenerator';
import UnifiedEmojiManager from '@/components/shared/UnifiedEmojiManager';
import { UnifiedEmojiItem } from '@/services/unifiedEmojiSystem';
import { BackToTop } from '@/components/ui/BackToTop';

/**
 * Emoji生成器主组件
 */
const EmojiPage: React.FC = () => {
  const [emojis, setEmojis] = useState<NotoEmojiData[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<NotoEmojiData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof NOTO_STYLES>('color');
  const [_selectedEmoji, _setSelectedEmoji] = useState<NotoEmojiData | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  


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
      if (emoji.hasSkinTone) {
        emojiToCopy = notoEmojiService.applySkinToneModifier(emoji.unicode, 'medium'); // 默认肤色
      }
      
      await navigator.clipboard.writeText(emojiToCopy);
      toast({
        title: "复制成功",
        description: `已复制 ${emojiToCopy} 到剪贴板`,
      });
    } catch (_err) {
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
      const imageUrl = notoEmojiService.generateEmojiUrl(emoji.codepoint, 'color', 128); // 默认风格和尺寸
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${emoji.name.replace(/\s+/g, '-')}-${emoji.unicode}-noto-color.png`; // 默认风格和格式
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "下载成功",
        description: `已下载 ${emoji.name}`,
      });
    } catch (_err) {
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
      const urls = notoEmojiService.batchGenerateUrls(codepoints, 'color', 128); // 默认风格和尺寸
      
      toast({
        title: "批量生成完成",
        description: `已为 ${urls.length} 个emoji生成图片`,
      });
    } catch (_err) {
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
    if (emoji.hasSkinTone) {
      return notoEmojiService.applySkinToneModifier(emoji.unicode, 'medium'); // 默认肤色
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-6 py-8 space-y-6">
        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="unified-tabs-list grid w-full grid-cols-2">
            <TabsTrigger value="gallery" className="unified-tab-trigger">
              <Grid3X3 className="tab-icon" />
              <span>Emoji图库</span>
            </TabsTrigger>
            <TabsTrigger value="brand-emoji" className="unified-tab-trigger">
              <Building2 className="tab-icon" />
              <span className="tab-text-mobile">品牌Emoji</span>
              <span className="tab-text-desktop">品牌Emoji生成器</span>
            </TabsTrigger>
          </TabsList>

          {/* Emoji图库 */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="emoji-gallery-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 creative-module-title">
                  <Grid3X3 className="w-5 h-5" />
                  Emoji图库
                </CardTitle>
                <CardDescription className="creative-module-description">
                  从500个精美emoji中选择，支持搜索、分类、点击复制等功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedEmojiManager
                  mode="gallery"
                  showSearch={true}
                  showCategories={true}
                  showStats={true}
                  showActions={true}
                  gridCols={viewMode === 'grid' ? 10 : 6}
                  maxHeight="600px"
                  compact={false}
                  allowMultiSelect={false}

                  allowCopy={true}
                  allowRandom={true}
                  source="all"
                  onEmojiSelect={(emoji: UnifiedEmojiItem) => {
                    // 默认行为：复制到剪贴板
                    navigator.clipboard.writeText(emoji.emoji).then(() => {
                      toast({
                        title: "复制成功",
                        description: `${emoji.name} ${emoji.emoji} 已复制到剪贴板`,
                      });
                    }).catch(() => {
                      toast({
                        title: "复制失败",
                        description: "请手动复制emoji",
                        variant: "destructive",
                      });
                    });
                  }}
                  onCategoryChange={(category) => {
                    console.log('切换到分类:', category);
                  }}
                  onSearchChange={(query) => {
                    console.log('搜索:', query);
                  }}
                  className="bg-card"
                />
              </CardContent>
            </Card>


          </TabsContent>





          {/* 品牌Emoji生成器 */}
          <TabsContent value="brand-emoji" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  品牌Emoji生成器
                </CardTitle>
                <CardDescription>
                  输入品牌角色和品牌名，AI将为您生成专属的品牌emoji
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PersonalizedEmojiGenerator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 返回顶部按钮 */}
      <BackToTop />
    </div>
  );
};

export default EmojiPage; 