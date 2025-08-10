/**
 * 品牌Emoji生成器 - 第四步结果展示画廊组件
 * 展示生成的emoji结果，支持查看、下载、删除、重新生成等操作
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Share2, 
  Heart,
  Star,
  Filter,
  Grid3X3,
  List,
  Search,
  Image,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Emoji结果接口
 */
interface EmojiResult {
  emotion: string;
  url: string;
  prompt?: string;
  brand?: string;
  character?: string;
  createdAt?: string;
  isFavorite?: boolean;
}

/**
 * Emoji画廊属性
 */
interface BrandEmojiGalleryProps {
  /** Emoji结果列表 */
  emojis: EmojiResult[];
  /** 删除回调 */
  onDelete?: (emotion: string) => void;
  /** 重新生成回调 */
  onRegenerate?: (emotion: string) => void;
  /** 收藏回调 */
  onToggleFavorite?: (emotion: string) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 品牌Emoji画廊组件
 */
export default function BrandEmojiGallery({
  emojis,
  onDelete,
  onRegenerate,
  onToggleFavorite,
  className = ''
}: BrandEmojiGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  
  const { toast } = useToast();

  /**
   * 过滤emoji列表
   */
  const filteredEmojis = emojis.filter(emoji => {
    const matchesSearch = emoji.emotion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = !filterFavorites || emoji.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  /**
   * 复制图片链接
   */
  const handleCopyLink = async (url: string, emotion: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "复制成功",
        description: `${emotion} 图片链接已复制到剪贴板`,
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制链接",
        variant: "destructive"
      });
    }
  };

  /**
   * 下载图片
   */
  const handleDownload = (emoji: EmojiResult) => {
    const a = document.createElement('a');
    a.href = emoji.url;
    a.download = `${emoji.brand || 'brand'}-${emoji.emotion}.png`;
    a.click();
    
    toast({
      title: "下载成功",
      description: `${emoji.emotion} emoji 已下载`,
    });
  };

  /**
   * 批量下载
   */
  const handleBatchDownload = () => {
    if (filteredEmojis.length === 0) {
      toast({
        title: "没有可下载的图片",
        description: "请先选择要下载的emoji",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "批量下载",
      description: `开始下载 ${filteredEmojis.length} 个emoji图片`,
    });
    
    // 逐个下载
    filteredEmojis.forEach((emoji, index) => {
      setTimeout(() => {
        handleDownload(emoji);
      }, index * 100);
    });
  };

  /**
   * 分享emoji
   */
  const handleShare = async (emoji: EmojiResult) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${emoji.brand} - ${emoji.emotion}`,
          text: `查看这个${emoji.brand}品牌的${emoji.emotion}表情！`,
          url: emoji.url
        });
      } catch (error) {
        // 用户取消分享
      }
    } else {
      // 回退到复制链接
      handleCopyLink(emoji.url, emoji.emotion);
    }
  };

  /**
   * 打开图片预览
   */
  const handlePreview = (emoji: EmojiResult) => {
    setSelectedEmoji(emoji);
    setShowPreview(true);
  };

  /**
   * 渲染网格视图
   */
  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filteredEmojis.map((emoji) => (
        <div
          key={emoji.emotion}
          className="group relative p-3 border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
        >
          {/* 收藏标记 */}
          {emoji.isFavorite && (
            <div className="absolute top-1 right-1 z-10">
              <Heart className="w-4 h-4 text-destructive fill-current" />
            </div>
          )}
          
          {/* 图片 */}
          <div className="relative">
            <img
              src={emoji.url}
              alt={emoji.emotion}
              className="w-full h-16 object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handlePreview(emoji)}
              title="点击预览大图"
            />
            
            {/* 悬停操作按钮 */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-6 h-6 p-0"
                  onClick={() => handlePreview(emoji)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-6 h-6 p-0"
                  onClick={() => handleDownload(emoji)}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-6 h-6 p-0"
                  onClick={() => handleCopyLink(emoji.url, emoji.emotion)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* 表情名称 */}
          <p className="text-xs font-medium text-center mt-2 truncate" title={emoji.emotion}>
            {emoji.emotion}
          </p>
          
          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-primary hover:text-primary"
              onClick={() => onToggleFavorite?.(emoji.emotion)}
              title={emoji.isFavorite ? "取消收藏" : "收藏"}
            >
              <Heart className={`w-3 h-3 ${emoji.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            {onRegenerate && (
              <Button
                size="sm"
                variant="ghost"
                className="w-6 h-6 p-0 text-foreground hover:text-foreground"
                onClick={() => onRegenerate(emoji.emotion)}
                title="重新生成"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="w-6 h-6 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(emoji.emotion)}
                title="删除"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * 渲染列表视图
   */
  const renderListView = () => (
    <div className="space-y-2">
      {filteredEmojis.map((emoji) => (
        <div
          key={emoji.emotion}
          className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent transition-colors"
        >
          {/* 图片 */}
          <img
            src={emoji.url}
            alt={emoji.emotion}
            className="w-12 h-12 object-contain cursor-pointer"
            onClick={() => handlePreview(emoji)}
            title="点击预览大图"
          />
          
          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{emoji.emotion}</p>
              {emoji.isFavorite && <Heart className="w-4 h-4 text-destructive fill-current" />}
            </div>
            {emoji.brand && (
              <p className="text-sm text-muted-foreground">品牌：{emoji.brand}</p>
            )}
            {emoji.createdAt && (
              <p className="text-xs text-muted-foreground">创建时间：{emoji.createdAt}</p>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreview(emoji)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(emoji)}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare(emoji)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {onToggleFavorite && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleFavorite(emoji.emotion)}
              >
                <Heart className={`w-4 h-4 ${emoji.isFavorite ? 'fill-current text-destructive' : ''}`} />
              </Button>
            )}
            {onRegenerate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRegenerate(emoji.emotion)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(emoji.emotion)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={`w-full max-w-7xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Image className="w-6 h-6" />
          Step 4：品牌 Emoji 画廊
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索表情..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* 收藏过滤 */}
            <Button
              variant={filterFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterFavorites(!filterFavorites)}
            >
              <Heart className="w-4 h-4 mr-1" />
              收藏
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 视图切换 */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {/* 批量下载 */}
            <Button
              variant="outline"
              onClick={handleBatchDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              批量下载
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>总计：{emojis.length} 个</span>
          <span>显示：{filteredEmojis.length} 个</span>
          <span>收藏：{emojis.filter(e => e.isFavorite).length} 个</span>
        </div>

        {/* 内容区域 */}
        {filteredEmojis.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">暂无emoji结果</p>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                没有找到包含 "{searchTerm}" 的emoji
              </p>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}

        {/* 图片预览对话框 */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                {selectedEmoji?.emotion} - 预览
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEmoji && (
                <>
                  <div className="flex justify-center">
                    <img
                      src={selectedEmoji.url}
                      alt={selectedEmoji.emotion}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>表情名称</Label>
                      <p className="font-medium">{selectedEmoji.emotion}</p>
                    </div>
                    {selectedEmoji.brand && (
                      <div>
                        <Label>品牌</Label>
                        <p>{selectedEmoji.brand}</p>
                      </div>
                    )}
                    {selectedEmoji.character && (
                      <div>
                        <Label>角色描述</Label>
                        <p>{selectedEmoji.character}</p>
                      </div>
                    )}
                    {selectedEmoji.createdAt && (
                      <div>
                        <Label>创建时间</Label>
                        <p>{selectedEmoji.createdAt}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={() => handleDownload(selectedEmoji)}>
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>
                    <Button variant="outline" onClick={() => handleCopyLink(selectedEmoji.url, selectedEmoji.emotion)}>
                      <Copy className="w-4 h-4 mr-1" />
                      复制链接
                    </Button>
                    <Button variant="outline" onClick={() => handleShare(selectedEmoji)}>
                      <Share2 className="w-4 h-4 mr-1" />
                      分享
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 提示信息 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 提示：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>点击图片可预览大图</li>
            <li>支持网格和列表两种查看模式</li>
            <li>可以搜索表情名称快速找到需要的emoji</li>
            <li>收藏功能帮助您管理喜欢的emoji</li>
            <li>支持单个下载和批量下载</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 