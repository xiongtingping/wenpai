/**
 * 快速引用选择器组件
 * 支持从品牌库、我的资料库、全网雷达收藏中快速导入内容
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AtSign,
  Database,
  Bookmark,
  Radar,
  FileText,
  Link,
  Image,
  Search,
  Plus,
  Clock,
  Tag,
  ExternalLink,
  Check
} from "lucide-react";

interface QuickReferenceItem {
  id: string;
  title: string;
  content: string;
  type: 'brand' | 'library' | 'radar';
  format: 'text' | 'link' | 'image' | 'pdf';
  source?: string;
  tags: string[];
  createdAt: string;
  summary?: string;
}

interface QuickReferenceSelectorProps {
  onSelect: (content: string) => void;
  className?: string;
  multiSelect?: boolean;
}

/**
 * 快速引用选择器组件
 */
export function QuickReferenceSelector({ onSelect, className, multiSelect = false }: QuickReferenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('brand');
  const [brandItems, setBrandItems] = useState<QuickReferenceItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<QuickReferenceItem[]>([]);
  const [radarItems, setRadarItems] = useState<QuickReferenceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // 初始化示例数据
  useEffect(() => {
    // 品牌库示例数据
    setBrandItems([
      {
        id: 'brand-1',
        title: '品牌核心价值观',
        content: '我们致力于为用户提供专业、可靠、创新的解决方案，以用户体验为中心，持续创新，追求卓越。',
        type: 'brand',
        format: 'text',
        tags: ['品牌价值', '核心理念'],
        createdAt: '2024-01-15T10:30:00Z',
        summary: '品牌核心价值观和理念描述'
      },
      {
        id: 'brand-2',
        title: '产品特色介绍',
        content: '🎯 核心卖点：\n• 高效便捷的操作体验\n• 专业可靠的技术支持\n• 性价比超高的解决方案\n• 7×24小时客户服务',
        type: 'brand',
        format: 'text',
        tags: ['产品特色', '卖点'],
        createdAt: '2024-01-14T14:20:00Z',
        summary: '产品核心特色和卖点总结'
      }
    ]);

    // 我的资料库示例数据
    setLibraryItems([
      {
        id: 'library-1',
        title: '小红书营销策略分析',
        content: '深度分析小红书平台的用户特征、内容偏好和营销机会，包括用户画像、内容形式、发布时机等关键要素...',
        type: 'library',
        format: 'text',
        source: 'https://example.com/xiaohongshu-analysis',
        tags: ['小红书', '营销策略', '社交媒体'],
        createdAt: '2024-01-15T10:30:00Z',
        summary: '小红书平台营销策略深度分析'
      },
      {
        id: 'library-2',
        title: '2024年内容营销趋势报告',
        content: '# 2024年内容营销趋势报告\n\n## 主要趋势\n1. AI辅助内容创作\n2. 短视频持续火热\n3. 互动式内容增长...',
        type: 'library',
        format: 'pdf',
        source: '2024-content-marketing-report.pdf',
        tags: ['内容营销', '趋势报告', '2024'],
        createdAt: '2024-01-13T09:15:00Z',
        summary: '2024年内容营销主要趋势和发展方向'
      }
    ]);

    // 全网雷达收藏示例数据
    setRadarItems([
      {
        id: 'radar-1',
        title: 'AI工具推荐：提升工作效率的10个神器',
        content: '分享10个能够显著提升工作效率的AI工具，包括写作助手、图像生成、数据分析等多个领域...',
        type: 'radar',
        format: 'link',
        source: 'https://example.com/ai-tools-recommendation',
        tags: ['AI工具', '效率提升', '推荐'],
        createdAt: '2024-01-16T16:45:00Z',
        summary: '10个提升工作效率的AI工具推荐'
      },
      {
        id: 'radar-2',
        title: '2024年社交媒体营销新趋势',
        content: '最新的社交媒体营销趋势分析，包括短视频营销、直播带货、KOL合作等新兴模式的发展...',
        type: 'radar',
        format: 'text',
        tags: ['社交媒体', '营销趋势', '2024'],
        createdAt: '2024-01-12T11:20:00Z',
        summary: '2024年社交媒体营销的最新趋势和发展方向'
      }
    ]);
  }, []);

  // 获取当前标签页的数据
  const getCurrentItems = () => {
    switch (activeTab) {
      case 'brand':
        return brandItems;
      case 'library':
        return libraryItems;
      case 'radar':
        return radarItems;
      default:
        return [];
    }
  };

  // 过滤搜索结果
  const filteredItems = getCurrentItems().filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 处理选择项目
  const handleSelectItem = (item: QuickReferenceItem) => {
    if (multiSelect) {
      const newSelectedItems = new Set(selectedItems);
      if (newSelectedItems.has(item.id)) {
        newSelectedItems.delete(item.id);
      } else {
        newSelectedItems.add(item.id);
      }
      setSelectedItems(newSelectedItems);
    } else {
      onSelect(item.content);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // 处理确认选择（多选模式）
  const handleConfirmSelection = () => {
    const allItems = [...brandItems, ...libraryItems, ...radarItems];
    const selectedContents = Array.from(selectedItems)
      .map(id => allItems.find(item => item.id === id))
      .filter(Boolean)
      .map(item => item!.content)
      .join('\n\n');

    onSelect(selectedContents);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedItems(new Set());
  };

  // 获取格式图标
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'link':
        return <Link className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'brand':
        return 'bg-accent text-primary';
      case 'library':
        return 'bg-accent text-foreground';
      case 'radar':
        return 'bg-accent text-primary';
      default:
        return 'bg-accent text-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <AtSign className="h-4 w-4 mr-2" />
          快速引用
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            快速引用内容
          </DialogTitle>
          <DialogDescription>
            从品牌库、我的资料库、全网雷达收藏中快速导入内容到编辑器
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* 搜索框 */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索内容、标题或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0 bg-accent rounded-lg shadow-sm mb-2">
              <TabsTrigger
                value="brand"
                className={activeTab === 'brand' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
              >
                <Database className="h-4 w-4" />
                品牌库
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className={activeTab === 'library' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
              >
                <Bookmark className="h-4 w-4" />
                我的资料库
              </TabsTrigger>
              <TabsTrigger
                value="radar"
                className={activeTab === 'radar' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
              >
                <Radar className="h-4 w-4" />
                全网雷达
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full max-h-[50vh]">
                <div className="space-y-3 pr-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>暂无品牌库内容</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-shadow ${multiSelect && selectedItems.has(item.id) ? 'ring-2 ring-primary bg-accent' : ''}`} onClick={() => handleSelectItem(item)}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {multiSelect && (
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onChange={() => handleSelectItem(item)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                {getFormatIcon(item.format)}
                                {item.title}
                              </CardTitle>
                            </div>
                            <Badge className={getTypeColor(item.type)}>
                              品牌库
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {item.summary || (item.content ? item.content.substring(0, 100) + '...' : '暂无内容')}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="library" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full max-h-[50vh]">
                <div className="space-y-3 pr-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>暂无资料库内容</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-shadow ${multiSelect && selectedItems.has(item.id) ? 'ring-2 ring-primary bg-accent' : ''}`} onClick={() => handleSelectItem(item)}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {multiSelect && (
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onChange={() => handleSelectItem(item)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                {getFormatIcon(item.format)}
                                {item.title}
                              </CardTitle>
                            </div>
                            <Badge className={getTypeColor(item.type)}>
                              资料库
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {item.summary || (item.content ? item.content.substring(0, 100) + '...' : '暂无内容')}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {item.source && (
                            <div className="flex items-center mt-2 text-xs text-primary">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {item.source}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="radar" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full max-h-[50vh]">
                <div className="space-y-3 pr-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Radar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>暂无雷达收藏内容</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-shadow ${multiSelect && selectedItems.has(item.id) ? 'ring-2 ring-primary bg-accent' : ''}`} onClick={() => handleSelectItem(item)}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {multiSelect && (
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onChange={() => handleSelectItem(item)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                {getFormatIcon(item.format)}
                                {item.title}
                              </CardTitle>
                            </div>
                            <Badge className={getTypeColor(item.type)}>
                              雷达收藏
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {item.summary || (item.content ? item.content.substring(0, 100) + '...' : '暂无内容')}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {item.source && (
                            <div className="flex items-center mt-2 text-xs text-primary">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {item.source}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* 多选模式下的确认按钮 */}
        {multiSelect && (
          <DialogFooter className="flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                已选择 {selectedItems.size} 项内容
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItems(new Set())}>
                  清空选择
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  disabled={selectedItems.size === 0}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  确认引用 ({selectedItems.size})
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default QuickReferenceSelector;
