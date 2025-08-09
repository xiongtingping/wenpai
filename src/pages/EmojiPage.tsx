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
import { callAI } from '@/api/aiService';
import PersonalizedEmojiGenerator from '@/components/creative/PersonalizedEmojiGenerator';
import UnifiedEmojiManager from '@/components/shared/UnifiedEmojiManager';
import { UnifiedEmojiItem } from '@/services/unifiedEmojiSystem';

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
  
  // AI推荐相关状态
  const [contentContext, setContentContext] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedEmojis, setRecommendedEmojis] = useState<string[]>([]);
  const [recommendationReason, setRecommendationReason] = useState('');

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

  /**
   * AI推荐Emoji
   */
  const recommendEmojisWithAI = async () => {
    if (!contentContext.trim()) {
      toast({
        title: "请输入内容",
        description: "请提供需要推荐emoji的内容场景",
        variant: "destructive"
      });
      return;
    }

    setIsRecommending(true);
    try {
      const response = await callAI({
        prompt: `请为以下内容推荐合适的表情符号：\n\n${contentContext}\n\n请推荐5-10个相关的表情符号，并说明推荐理由。`
      });
      
      const responseData = response as unknown as Record<string, unknown>;
      const choices = responseData?.data as Record<string, unknown>;
      if (response.success && choices?.choices?.[0]?.message?.content) {
        const content = choices.choices[0].message.content;
        
        // 提取推荐的emoji
        const emojiMatch = content.match(/推荐emoji[:：]\s*(.+?)(?:\n|推荐理由|$)/i);
        if (emojiMatch) {
          const emojis = emojiMatch[1].split(/\s+/).filter(emoji => emoji.trim());
          setRecommendedEmojis(emojis);
        }
        
        // 提取推荐理由
        const reasonMatch = content.match(/推荐理由[:：]\s*(.+?)$/is);
        if (reasonMatch) {
          setRecommendationReason(reasonMatch[1].trim());
        } else {
          setRecommendationReason(content);
        }

        toast({
          title: "AI推荐完成",
          description: `已为您推荐 ${recommendedEmojis.length} 个emoji`,
        });
      } else {
        throw new Error('AI响应格式异常');
      }
    } catch (error) {
      console.error('AI推荐失败:', error);
      toast({
        title: "推荐失败",
        description: "请稍后重试AI推荐功能",
        variant: "destructive"
      });
    } finally {
      setIsRecommending(false);
    }
  };

  /**
   * 复制推荐的emoji
   */
  const copyRecommendedEmojis = async () => {
    try {
      const emojiString = recommendedEmojis.join(' ');
      await navigator.clipboard.writeText(emojiString);
      toast({
        title: "复制成功",
        description: `已复制推荐的emoji: ${emojiString}`,
      });
    } catch (_err) {
      toast({
        title: "复制失败",
        description: "请手动复制",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Emoji图库
            </TabsTrigger>
            <TabsTrigger value="ai-recommend" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI推荐
            </TabsTrigger>
            <TabsTrigger value="brand-emoji" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              品牌Emoji生成器
            </TabsTrigger>
          </TabsList>

          {/* Emoji图库 */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  Emoji图库
                </CardTitle>
                <CardDescription>
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
                  allowDownload={true}
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
                  className="bg-white"
                />
              </CardContent>
            </Card>


          </TabsContent>

          {/* AI推荐 */}
          <TabsContent value="ai-recommend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Emoji推荐
                </CardTitle>
                <CardDescription>
                  输入内容场景，AI将为您推荐最合适的emoji表情符号
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">内容场景</Label>
                  <Textarea
                    placeholder="请输入需要emoji的内容场景，例如：分享一个健身减肥的成功案例、庆祝项目完成、表达对美食的喜爱等..."
                    value={contentContext}
                    onChange={(e) => setContentContext(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={recommendEmojisWithAI} 
                  disabled={isRecommending || !contentContext.trim()}
                  className="w-full"
                >
                  {isRecommending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      AI推荐中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      获取AI推荐
                    </>
                  )}
                </Button>

                {/* 推荐结果 */}
                {recommendedEmojis.length > 0 && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        AI推荐结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">推荐的Emoji</Label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recommendedEmojis.map((emoji, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="lg"
                              className="text-2xl h-12 w-12 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(emoji);
                                toast({ title: "已复制", description: `已复制 ${emoji}` });
                              }}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={copyRecommendedEmojis} variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            复制所有
                          </Button>
                          <Button 
                            onClick={() => {
                              setRecommendedEmojis([]);
                              setRecommendationReason('');
                            }} 
                            variant="outline" 
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            清空结果
                          </Button>
                        </div>
                      </div>

                      {recommendationReason && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">推荐理由</Label>
                          <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendationReason}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 使用建议 */}
                <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-green-600" />
                      使用建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>• <strong>标题使用：</strong>在标题中放置1-2个最关键的emoji增强吸引力</p>
                      <p>• <strong>正文穿插：</strong>在正文段落间适量使用emoji增加节奏感</p>
                      <p>• <strong>结尾强化：</strong>在结尾使用emoji增强情感表达和互动性</p>
                      <p>• <strong>平台适配：</strong>不同平台的emoji使用习惯有差异，注意调整</p>
                    </div>
                  </CardContent>
                </Card>
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
    </div>
  );
};

export default EmojiPage; 