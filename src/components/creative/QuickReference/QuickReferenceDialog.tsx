/**
 * 快速引用对话框组件
 * 使用现代化的React组件架构，支持主题适配和响应式设计
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  AtSign, 
  Search, 
  RefreshCw, 
  Database, 
  Bookmark, 
  Radar, 
  Check,
  X,
  Plus,
  Copy,
  ExternalLink
} from "lucide-react";
import { quickReferenceDataService, QuickReferenceItem } from '@/services/quickReferenceDataService';
import { cn } from "@/lib/utils";

export type TabType = 'brand' | 'library' | 'radar';

interface QuickReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string) => void;
  multiSelect?: boolean;
  className?: string;
}

export function QuickReferenceDialog({ open,
  onOpenChange,
  onSelect,
  multiSelect = false,
  className
 }: QuickReferenceDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // 🎯 简化Dialog定位修复器 - 遵循CLAUDE.md规范
  useEffect(() => {
    if (!open) return;

    const fixDialogPosition = () => {
      const dialogElement = (
        document.querySelector('[role="dialog"][class*="quick-reference-dialog"]') ||
        document.querySelector('.quick-reference-dialog') ||
        document.querySelector('[role="dialog"]')
      ) as HTMLElement;

      if (dialogElement) {
        // 清除inset冲突属性
        dialogElement.style.removeProperty('inset');
        dialogElement.style.removeProperty('inset-block');
        dialogElement.style.removeProperty('inset-inline');
        dialogElement.style.removeProperty('inset-block-start');
        dialogElement.style.removeProperty('inset-block-end');
        dialogElement.style.removeProperty('inset-inline-start');
        dialogElement.style.removeProperty('inset-inline-end');

        // 使用视窗单位强制定位
        dialogElement.style.setProperty('position', 'fixed', 'important');
        dialogElement.style.setProperty('top', '50vh', 'important');
        dialogElement.style.setProperty('left', '50vw', 'important');
        dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        dialogElement.style.setProperty('z-index', '1055', 'important');
        dialogElement.style.setProperty('margin', '0', 'important');
      }
    };

    fixDialogPosition();
    setTimeout(fixDialogPosition, 100);
    setTimeout(fixDialogPosition, 300);
  }, [open]);
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<TabType>('brand');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Record<TabType, boolean>>({
    brand: false,
    library: false,
    radar: false
  });
  const [items, setItems] = useState<Record<TabType, QuickReferenceItem[]>>({
    brand: [],
    library: [],
    radar: []
  });
  const [error, setError] = useState<string | null>(null);

  // 标签页配置
  const tabs = useMemo(() => [
    {
      value: 'brand' as TabType,
      label: t('components.labels.品牌库'),
      icon: <Database className="h-4 w-4" />,
      description: '品牌资产和语料库内容',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      value: 'library' as TabType,
      label: t('components.labels.我的资料库'),
      icon: <Bookmark className="h-4 w-4" />,
      description: '个人收藏的资料内容',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      value: 'radar' as TabType,
      label: t('components.labels.全网雷达'),
      icon: <Radar className="h-4 w-4" />,
      description: '热点话题和雷达收藏',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ], []);

  // 加载数据
  const loadTabData = useCallback(async (tabType: TabType) => {
    setLoading(prev => ({ ...prev, [tabType]: true }));
    setError(null);
    
    try {
      let data: QuickReferenceItem[] = [];
      
      switch (tabType) {
        case 'brand':
          data = await quickReferenceDataService.getBrandItems();
          break;
        case 'library':
          data = await quickReferenceDataService.getLibraryItems();
          break;
        case 'radar':
          data = await quickReferenceDataService.getRadarItems();
          break;
      }
      
      setItems(prev => ({ ...prev, [tabType]: data }));
    } catch (err) {
      const errorMessage = `加载${tabs.find(t => t.value === tabType)?.label}数据失败`;
      setError(errorMessage);
      toast({
        title: t('components.labels.加载失败'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [tabType]: false }));
    }
  }, [tabs, toast]);

  // 搜索功能
  const filteredItems = useMemo(() => {
    const currentItems = items[activeTab];
    if (!searchQuery.trim()) return currentItems;
    
    const query = searchQuery.toLowerCase();
    return currentItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (item.summary && item.summary.toLowerCase().includes(query))
    );
  }, [items, activeTab, searchQuery]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    quickReferenceDataService.clearCache();
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  // 选择项目
  const handleItemSelect = useCallback((item: QuickReferenceItem) => {
    if (multiSelect) {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      // 单选模式直接选择并关闭
      onSelect(item.content);
      onOpenChange(false);
      resetState();
    }
  }, [multiSelect, onSelect, onOpenChange]);

  // 确认多选
  const handleMultiSelectConfirm = useCallback(() => {
    if (selectedItems.size === 0) {
      toast({
        title: t('components.labels.请选择内容'),
        description: "请至少选择一个引用内容",
        variant: "destructive"
      });
      return;
    }

    const selectedItemsData = Array.from(selectedItems)
      .map(id => filteredItems.find(item => item.id === id))
      .filter(Boolean) as QuickReferenceItem[];
    
    const combinedContent = selectedItemsData
      .map(item => `[${item.title}]\n${item.content}`)
      .join('\n\n');
    
    onSelect(combinedContent);
    onOpenChange(false);
    resetState();
    
    toast({
      title: t('components.labels.引用成功'),
      description: `已添加 ${selectedItems.size} 个引用内容`
    });
  }, [selectedItems, filteredItems, onSelect, onOpenChange, toast]);

  // 重置状态
  const resetState = useCallback(() => {
    setSearchQuery('');
    setSelectedItems(new Set());
    setError(null);
  }, []);

  // 复制内容
  const handleCopyContent = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: t('components.labels.复制成功'),
        description: "内容已复制到剪贴板"
      });
    } catch (err) {
      toast({
        title: t('components.labels.复制失败'),
        description: "无法复制到剪贴板",
        variant: "destructive"
      });
    }
  }, [toast]);

  // 初始化和标签页切换时加载数据
  useEffect(() => {
    if (open) {
      loadTabData(activeTab);
    }
  }, [open, activeTab, loadTabData]);

  // 对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // 🎯 修复尺寸和布局：使用响应式设计
          "quick-reference-dialog max-w-4xl flex flex-col",
          "bg-background border-border text-foreground",
          "shadow-2xl rounded-lg",
          "overflow-hidden"
        )}
        style={{
          // 🎯 统一的弹窗样式，与CSS系统保持一致
          maxHeight: '85vh',
          maxWidth: 'min(95vw, 1024px)',
          width: 'auto',
          height: 'auto',
          zIndex: 1055
        }}
      >
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AtSign className="h-5 w-5 text-primary" />
            快速引用
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            从品牌库、资料库、雷达收藏快速导入内容
          </DialogDescription>
        </DialogHeader>

        {/* 搜索和操作栏 */}
        <div className="flex items-center gap-2 pb-4 border-b border-border flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标题、内容或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10",
                "bg-background border-border text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-ring focus:ring-2 focus:ring-ring/20"
              )}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading[activeTab]}
            className="flex-shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4", loading[activeTab] && "animate-spin")} />
          </Button>
        </div>

        {/* 标签页和内容 */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0 mb-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 text-sm"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
                {items[tab.value].length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {items[tab.value].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="flex-1 mt-0 min-h-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <QuickReferenceItemList
                items={filteredItems}
                loading={loading[tab.value]}
                error={error}
                selectedItems={selectedItems}
                multiSelect={multiSelect}
                searchQuery={searchQuery}
                onItemSelect={handleItemSelect}
                onCopyContent={handleCopyContent}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* 多选模式的底部操作栏 */}
        {multiSelect && (
          <div className="flex items-center justify-between pt-4 border-t border-border flex-shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedItems.size} 个项目
              </span>
              {selectedItems.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                  className="text-xs"
                >
                  清空选择
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                size="sm"
              >
                取消
              </Button>
              <Button
                onClick={handleMultiSelectConfirm}
                disabled={selectedItems.size === 0}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                确认选择 ({selectedItems.size})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 项目列表组件
interface QuickReferenceItemListProps {
  items: QuickReferenceItem[];
  loading: boolean;
  error: string | null;
  selectedItems: Set<string>;
  multiSelect: boolean;
  searchQuery: string;
  onItemSelect: (item: QuickReferenceItem) => void;
  onCopyContent: (content: string) => void;
}

function QuickReferenceItemList({
  items,
  loading,
  error,
  selectedItems,
  multiSelect,
  searchQuery,
  onItemSelect,
  onCopyContent
}: QuickReferenceItemListProps) {
  if (loading) {
    return (
      <div className="flex-1 min-h-0 p-4">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg bg-background">
              <Skeleton className="h-4 w-3/4 mb-2 bg-muted" />
              <Skeleton className="h-3 w-full mb-1 bg-muted" />
              <Skeleton className="h-3 w-2/3 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-8 text-center">
        <X className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          重新加载
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-8 text-center">
        <Database className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          {searchQuery ? '没有找到匹配的内容' : '暂无数据'}
        </p>
        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            尝试使用不同的关键词搜索
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="dialog-content-scrollable flex-1 min-h-0">
      <ScrollArea className="h-full">
        <div className="space-y-3 pr-4 pb-4">
          {items.map((item) => (
            <QuickReferenceItemCard
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              multiSelect={multiSelect}
              searchQuery={searchQuery}
              onSelect={onItemSelect}
              onCopyContent={onCopyContent}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// 项目卡片组件
interface QuickReferenceItemCardProps {
  item: QuickReferenceItem;
  isSelected: boolean;
  multiSelect: boolean;
  searchQuery: string;
  onSelect: (item: QuickReferenceItem) => void;
  onCopyContent: (content: string) => void;
}

function QuickReferenceItemCard({
  item,
  isSelected,
  multiSelect,
  searchQuery,
  onSelect,
  onCopyContent
}: QuickReferenceItemCardProps) {
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
        isSelected && "border-primary bg-primary/5",
        "hover:border-primary/50"
      )}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-sm truncate">
              {highlightText(item.title, searchQuery)}
            </h4>
            {multiSelect && isSelected && (
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {highlightText(item.summary || item.content.substring(0, 100) + '...', searchQuery)}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {item.source || item.type}
            </Badge>
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCopyContent(item.content);
            }}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {item.format === 'link' && item.metadata?.url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.metadata?.url, '_blank');
              }}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
