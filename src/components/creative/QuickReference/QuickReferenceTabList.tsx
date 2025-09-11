/**
 * 快速引用标签页列表组件
 * 管理不同数据源的标签页切换
 */

import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Database, Bookmark, Radar } from "lucide-react";

export type TabType = 'brand' | 'library' | 'radar';

interface TabInfo {
  value: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
  count?: number;
}

interface QuickReferenceTabListProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts?: Record<TabType, number>;
  loading?: Record<TabType, boolean>;
  disabled?: boolean;
}

export function QuickReferenceTabList({
  activeTab,
  onTabChange,
  counts = {} as Record<TabType, number>,
  loading = {} as Record<TabType, boolean>,
  disabled = false
}: QuickReferenceTabListProps) {
  
  const tabs: TabInfo[] = [
    {
      value: 'brand',
      label: '品牌库',
      icon: <Database className="h-4 w-4" />,
      description: '品牌资产和语料库内容',
      count: counts.brand
    },
    {
      value: 'library',
      label: '我的资料库',
      icon: <Bookmark className="h-4 w-4" />,
      description: '个人收藏的资料内容',
      count: counts.library
    },
    {
      value: 'radar',
      label: '全网雷达',
      icon: <Radar className="h-4 w-4" />,
      description: '热点话题和雷达收藏',
      count: counts.radar
    }
  ];

  return (
    <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-lg shadow-sm mb-4 h-auto p-1">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          disabled={disabled}
          className={`
            relative flex flex-col items-center gap-1 py-3 px-2 rounded-md
            transition-all duration-200 text-xs
            ${activeTab === tab.value 
              ? 'bg-background shadow-sm text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${loading[tab.value] ? 'animate-pulse' : ''}
          `}
          onClick={() => !disabled && onTabChange(tab.value)}
        >
          {/* 图标和标签 */}
          <div className="flex items-center gap-1">
            <span className={`
              transition-colors duration-200
              ${activeTab === tab.value ? 'text-primary' : 'text-muted-foreground'}
            `}>
              {tab.icon}
            </span>
            <span className="font-medium">
              {tab.label}
            </span>
          </div>
          
          {/* 数量徽章 */}
          {typeof tab.count === 'number' && (
            <Badge 
              variant={activeTab === tab.value ? "default" : "secondary"}
              className={`
                text-xs px-1.5 py-0.5 h-5 min-w-[20px] rounded-full
                ${activeTab === tab.value 
                  ? 'bg-primary/10 text-primary border-primary/20' 
                  : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {tab.count}
            </Badge>
          )}
          
          {/* 加载指示器 */}
          {loading[tab.value] && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export default QuickReferenceTabList;
