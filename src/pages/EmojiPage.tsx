/**
 * Emoji生成器页面
 * 基于Google Noto Emoji项目的设计理念
 * 支持Unicode标准的emoji分类和生成
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { UnifiedEmojiItem } from '@/types/emoji';
import { BackToTop } from '@/components/ui/BackToTop';

/**
 * Emoji生成器主组件
 */
const EmojiPage: React.FC = () => {
  const { t } = useTranslation();
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
  const [brandEmojiCurrentStep, setBrandEmojiCurrentStep] = useState<'upload' | 'build' | 'generate' | 'gallery'>('upload');

  const { toast } = useToast();

  /**
   * 获取步骤索引
   */
  const getStepIndex = (step: 'upload' | 'build' | 'generate' | 'gallery'): number => {
    const stepOrder = ['upload', 'build', 'generate', 'gallery'];
    return stepOrder.indexOf(step);
  };

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
        title: t('emoji.copySuccess'),
        description: t('emoji.copySuccessDescription', { emoji: emojiToCopy }),
      });
    } catch (_err) {
      toast({
        title: t('emoji.copyFailed'),
        description: t('emoji.copyFailedDescription'),
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
        throw new Error(t('pages.errors.下载失败'));
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
        title: t('emoji.downloadSuccess'),
        description: t('emoji.downloadSuccessDescription', { name: emoji.name }),
      });
    } catch (_err) {
      toast({
        title: t('emoji.downloadFailed'),
        description: t('emoji.downloadFailedDescription'),
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
        title: t('emoji.batchGenerateSuccess'),
        description: t('emoji.batchGenerateSuccessDescription', { count: urls.length }),
      });
    } catch (_err) {
      toast({
        title: t('emoji.generateFailed'),
        description: t('emoji.generateFailedDescription'),
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
      title: t('emoji.exportSuccess'),
      description: t('emoji.exportSuccessDescription'),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 space-y-6">
        {/* 主标签页 - 全宽布局 */}
        <div className="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="unified-tabs-list grid w-full grid-cols-2">
            <TabsTrigger value="gallery" className="unified-tab-trigger">
              <Grid3X3 className="w-5 h-5" />
              <span>Emoji图库</span>
            </TabsTrigger>
            <TabsTrigger value="brand-emoji" className="unified-tab-trigger">
              <Building2 className="w-5 h-5" />
              <span>品牌Emoji</span>
            </TabsTrigger>
          </TabsList>

            {/* Emoji图库 */}
            <TabsContent value="gallery" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Grid3X3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {t('emoji.gallery')}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      浏览和搜索海量Emoji表情，一键复制使用
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <UnifiedEmojiManager
                  mode="gallery"
                  showSearch={true}
                  showCategories={true}
                  showStats={true}
                  showActions={true}
                  gridCols={viewMode === 'grid' ? 12 : 8}
                  maxHeight="500px"
                  compact={false}
                  allowMultiSelect={false}
                  allowCopy={true}
                  allowRandom={true}
                  source="all"
                  onEmojiSelect={(emoji: UnifiedEmojiItem) => {
                    // 默认行为：复制到剪贴板
                    navigator.clipboard.writeText(emoji.emoji).then(() => {
                      toast({
                        title: t('emoji.copySuccess'),
                        description: t('emoji.copyWithNameDescription', { name: emoji.name, emoji: emoji.emoji }),
                      });
                    }).catch(() => {
                      toast({
                        title: t('emoji.copyFailed'),
                        description: t('emoji.copyFailedDescription'),
                        variant: "destructive",
                      });
                    });
                  }}
                  onCategoryChange={(category) => {
                    console.log('切换到category:', category);
                  }}
                  onSearchChange={(query) => {
                    console.log('searching:', query);
                  }}
                  className="bg-card"
                />
              </CardContent>
            </Card>
            </TabsContent>

            {/* 品牌Emoji - 全宽布局 */}
            <TabsContent value="brand-emoji" className="mt-0">
          <div className="w-full bg-gradient-to-br from-background via-accent/5 to-background">
            {/* 顶部步骤指示器 */}
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="brand-emoji-steps-indicator steps-indicator-fade-in max-w-5xl mx-auto">
                {/* 步骤项容器 */}
                <div className="flex items-start justify-between w-full gap-2">
                  {[
                    { step: 1, id: 'upload', label: '品牌角色设定' },
                    { step: 2, id: 'build', label: '智能提示构建' },
                    { step: 3, id: 'generate', label: 'AI批量生成' },
                    { step: 4, id: 'gallery', label: '作品集展示' }
                  ].map((item, index) => {
                    const isActive = brandEmojiCurrentStep === item.id;
                    const isCompleted = getStepIndex(brandEmojiCurrentStep) > index;

                    return (
                      <div key={item.step} className="flex-1 relative">
                        <div className="flex flex-col items-center gap-2">
                          {/* 步骤圆圈 */}
                          <div className={`brand-emoji-step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <span className="brand-emoji-step-number">{item.step}</span>
                          </div>

                          {/* 步骤文字 */}
                          <span className="brand-emoji-step-label">{item.label}</span>
                        </div>

                        {/* 连接线 */}
                        {index < 3 && (
                          <div className={`brand-emoji-step-connector ${isCompleted ? 'completed' : ''}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 主要内容区域 - 完全全宽 */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                    {/* 标题区域 */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          品牌专属Emoji
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                          {t('emoji.brandEmojiDescription')}
                        </CardDescription>
                      </div>
                    </div>

                {/* 主要内容 */}
                <PersonalizedEmojiGenerator 
                  onStepChange={setBrandEmojiCurrentStep}
                />
            </div>
          </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 返回顶部按钮 */}
      <BackToTop />
    </div>
  );
};

export default EmojiPage;
