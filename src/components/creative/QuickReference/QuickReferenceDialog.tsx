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

  // 🚨 滚动锁定和弹窗生命周期管理
  useEffect(() => {
    if (open) {
      console.log('🎯 快速引用弹窗已打开 - 纯React渲染');
      
      // 🔥 关键修复：锁定页面滚动
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const scrollY = window.scrollY;
      
      // 锁定滚动
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      console.log('🔒 页面滚动已锁定', { scrollY, originalOverflow, originalPosition });
      
      // 🔥 添加滚动事件监听器，强制阻止滚动
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // 监听所有可能的滚动事件
      document.addEventListener('scroll', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      window.addEventListener('scroll', preventScroll, { passive: false });
      
      console.log('🚫 所有滚动事件已阻止');
      
      // 清理函数：恢复页面滚动
      return () => {
        // 移除滚动事件监听器
        document.removeEventListener('scroll', preventScroll);
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        window.removeEventListener('scroll', preventScroll);
        
        // 恢复样式
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = '';
        document.body.style.width = '';
        
        // 恢复滚动位置
        window.scrollTo(0, scrollY);
        
        console.log('🔓 页面滚动已恢复', { scrollY });
      };
    }
  }, [open]);

  // 🎯 CLAUDE.md 3.6.2节：JavaScript运行时修复器 - 双重保护机制
  useEffect(() => {
    if (!open) return;

    const fixDialogPosition = () => {
      // 多选择器查找Dialog元素
      const dialogElement = document.querySelector('[role="dialog"].quick-reference-dialog') ||
                           document.querySelector('[role="dialog"]') ||
                           document.querySelector('[data-radix-dialog-content].quick-reference-dialog');

      if (dialogElement) {
        console.log('🎯 Dialog定位修复已应用', dialogElement);
        
        // 清除冲突样式
        dialogElement.style.removeProperty('top');
        dialogElement.style.removeProperty('left');
        dialogElement.style.removeProperty('transform');
        dialogElement.style.removeProperty('inset');
        dialogElement.style.removeProperty('inset-block');
        dialogElement.style.removeProperty('inset-inline');
        dialogElement.style.removeProperty('inset-block-start');
        dialogElement.style.removeProperty('inset-block-end');
        dialogElement.style.removeProperty('inset-inline-start');
        dialogElement.style.removeProperty('inset-inline-end');

        // 🔥 使用视窗单位强制应用正确定位
        dialogElement.style.setProperty('position', 'fixed', 'important');
        dialogElement.style.setProperty('top', '50vh', 'important');
        dialogElement.style.setProperty('left', '50vw', 'important');
        dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        dialogElement.style.setProperty('z-index', '1055', 'important');
        dialogElement.style.setProperty('margin', '0', 'important');
        
        // 验证Dialog位置
        const rect = dialogElement.getBoundingClientRect();
        const viewportCenter = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        const dialogCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        console.log('🎯 Dialog位置验证:', {
          viewport: viewportCenter,
          dialog: dialogCenter,
          offset: {
            x: Math.abs(dialogCenter.x - viewportCenter.x),
            y: Math.abs(dialogCenter.y - viewportCenter.y)
          }
        });
      }
    };

    // 🔥 CLAUDE.md规范：多时机执行修复
    fixDialogPosition();
    setTimeout(fixDialogPosition, 50);
    setTimeout(fixDialogPosition, 150);
    setTimeout(fixDialogPosition, 300);
  }, [open]);

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


  // 🎯 按照CLAUDE.md 3.6.2节实现根本性解决方案：双重保护机制
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="quick-reference-dialog">
        <DialogHeader>
          <DialogTitle>🎯 快速引用</DialogTitle>
          <DialogDescription>
            从品牌库、资料库、雷达收藏快速导入内容
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标题、内容或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  <div className="flex items-center gap-1">
                    {tab.icon}
                    {tab.label}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="flex-1 min-h-0">
                <QuickReferenceItemList
                  items={filteredItems}
                  loading={loading[activeTab]}
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
          
          {multiSelect && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={handleMultiSelectConfirm}
                disabled={selectedItems.size === 0}
              >
                确认 ({selectedItems.size})
              </Button>
            </div>
          )}
        </div>
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
      <div className="flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 border border-border rounded-md bg-background">
              <Skeleton className="h-3 w-3/4 mb-2 bg-muted" />
              <Skeleton className="h-2 w-full mb-1 bg-muted" />
              <Skeleton className="h-2 w-2/3 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 text-center">
        <X className="h-6 w-6 text-destructive mb-2" />
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-3 h-7 px-3 text-xs"
        >
          重新加载
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 text-center">
        <Database className="h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground mb-1">
          {searchQuery ? '没有找到匹配的内容' : '暂无数据'}
        </p>
        {searchQuery && (
          <p className="text-[10px] text-muted-foreground">
            尝试使用不同的关键词搜索
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="dialog-content-scrollable flex-1 min-h-0">
      <ScrollArea className="h-full">
        <div className="space-y-2 pr-3 pb-3">
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
        "p-3 border rounded-md cursor-pointer transition-all hover:shadow-sm",
        isSelected && "border-primary bg-primary/5",
        "hover:border-primary/50"
      )}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <h4 className="font-medium text-sm truncate leading-tight">
              {highlightText(item.title, searchQuery)}
            </h4>
            {multiSelect && isSelected && (
              <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            )}
          </div>
          
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1.5 leading-tight">
            {highlightText(item.summary || item.content.substring(0, 80) + '...', searchQuery)}
          </p>
          
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {item.source || item.type}
            </Badge>
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCopyContent(item.content);
            }}
            className="h-6 w-6 p-0 hover:bg-muted/50"
          >
            <Copy className="h-2.5 w-2.5" />
          </Button>
          {item.format === 'link' && item.metadata?.url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.metadata?.url, '_blank');
              }}
              className="h-6 w-6 p-0 hover:bg-muted/50"
            >
              <ExternalLink className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
