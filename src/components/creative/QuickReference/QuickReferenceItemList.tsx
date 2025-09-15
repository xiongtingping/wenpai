/**
 * 快速引用项目列表组件
 * 统一的内容列表展示和管理
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Bookmark, Radar, RefreshCw, Plus } from "lucide-react";
import { QuickReferenceItem } from '@/services/quickReferenceDataService';
import { QuickReferenceItemCard } from './QuickReferenceItemCard';
import { TabType } from './QuickReferenceTabList';

interface QuickReferenceItemListProps {
  items: QuickReferenceItem[];
  type: TabType;
  loading?: boolean;
  error?: string | null;
  selectedItems?: Set<string>;
  multiSelect?: boolean;
  searchQuery?: string;
  onItemSelect: (item: QuickReferenceItem) => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function QuickReferenceItemList({ items,
  type,
  loading = false,
  error = null,
  selectedItems = new Set(),
  multiSelect = false,
  searchQuery = '',
  onItemSelect,
  onRefresh,
  onAddNew
 }: QuickReferenceItemListProps) {

  /**
   * 获取类型信息
   */
  const getTypeInfo = (type: TabType) => {
    switch (type) {
      case 'brand':
        return {
          icon: Database,
          label: t('components.labels.品牌库'),
          emptyTitle: t('components.labels.暂无品牌库内容'),
          emptyDescription: '您还没有添加任何品牌资产或语料库内容',
          addButtonText: t('components.actions.添加品牌资产')
        };
      case 'library':
        return {
          icon: Bookmark,
          label: t('components.labels.资料库'),
          emptyTitle: t('components.labels.暂无资料库内容'),
          emptyDescription: '您还没有收藏任何资料到个人资料库',
          addButtonText: t('components.actions.添加资料')
        };
      case 'radar':
        return {
          icon: Radar,
          label: t('components.labels.雷达收藏'),
          emptyTitle: t('components.labels.暂无雷达收藏内容'),
          emptyDescription: '您还没有收藏任何热点话题或雷达内容',
          addButtonText: t('components.actions.浏览热点')
        };
      default:
        return {
          icon: Database,
          label: t('components.labels.内容'),
          emptyTitle: t('components.labels.暂无内容'),
          emptyDescription: '暂时没有可用的内容',
          addButtonText: t('components.actions.添加内容')
        };
    }
  };

  const typeInfo = getTypeInfo(type);
  const IconComponent = typeInfo.icon;

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="space-y-3 pr-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <div className="text-center py-8">
      <div className="text-destructive mb-4">
        <IconComponent className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">加载失败</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
      {onRefresh && (
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          重试
        </Button>
      )}
    </div>
  );

  /**
   * 渲染空状态
   */
  const renderEmpty = () => (
    <div className="text-center py-8">
      <IconComponent className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="font-medium text-foreground mb-2">{typeInfo.emptyTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        {typeInfo.emptyDescription}
      </p>
      <div className="flex gap-2 justify-center">
        {onAddNew && (
          <Button variant="outline" onClick={onAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            {typeInfo.addButtonText}
          </Button>
        )}
        {onRefresh && (
          <Button variant="ghost" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        )}
      </div>
    </div>
  );

  /**
   * 渲染内容列表
   */
  const renderItems = () => (
    <div className="space-y-3 pr-4">
      {items.map((item) => (
        <QuickReferenceItemCard
          key={item.id}
          item={item}
          isSelected={selectedItems.has(item.id)}
          multiSelect={multiSelect}
          searchQuery={searchQuery}
          onSelect={onItemSelect}
        />
      ))}
    </div>
  );

  return (
    <ScrollArea className="h-full max-h-[50vh]">
      {loading ? renderLoading() : 
       error ? renderError() : 
       items.length === 0 ? renderEmpty() : 
       renderItems()}
    </ScrollArea>
  );
}

export default QuickReferenceItemList;
