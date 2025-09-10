/**
 * 快速引用项目卡片组件
 * 统一的内容项展示组件
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Link,
  Image,
  Clock,
  Tag,
  ExternalLink
} from "lucide-react";
import { QuickReferenceItem } from '@/services/quickReferenceDataService';

interface QuickReferenceItemCardProps {
  item: QuickReferenceItem;
  isSelected?: boolean;
  multiSelect?: boolean;
  onSelect: (item: QuickReferenceItem) => void;
  searchQuery?: string;
}

/**
 * 获取格式图标
 */
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

/**
 * 获取类型颜色和标签
 */
const getTypeInfo = (type: string) => {
  switch (type) {
    case 'brand':
      return {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: '品牌库'
      };
    case 'library':
      return {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: '资料库'
      };
    case 'radar':
      return {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        label: '雷达收藏'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        label: '未知'
      };
  }
};

/**
 * 高亮搜索关键词
 */
const highlightText = (text: string, searchQuery?: string) => {
  if (!searchQuery || !text) return text;
  
  const regex = new RegExp(`(${searchQuery})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

/**
 * 快速引用项目卡片组件
 */
export function QuickReferenceItemCard({
  item,
  isSelected = false,
  multiSelect = false,
  onSelect,
  searchQuery
}: QuickReferenceItemCardProps) {
  const typeInfo = getTypeInfo(item.type);

  const handleClick = () => {
    onSelect(item);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item);
  };

  return (
    <Card 
      className={`
        cursor-pointer hover:shadow-md transition-all duration-200 
        ${isSelected ? 'ring-2 ring-primary bg-accent/50' : 'hover:bg-accent/20'}
        ${multiSelect ? 'select-none' : ''}
      `} 
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {multiSelect && (
              <Checkbox
                checked={isSelected}
                onChange={handleCheckboxChange}
                onClick={handleCheckboxChange}
                className="flex-shrink-0"
              />
            )}
            <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0">
                {getFormatIcon(item.format)}
              </span>
              <span className="truncate">
                {highlightText(item.title, searchQuery)}
              </span>
            </CardTitle>
          </div>
          <Badge className={`${typeInfo.color} flex-shrink-0 ml-2`}>
            {typeInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* 内容摘要 */}
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {item.summary ? 
            highlightText(item.summary, searchQuery) : 
            (item.content ? 
              highlightText(item.content.substring(0, 100) + '...', searchQuery) : 
              '暂无内容'
            )
          }
        </p>
        
        {/* 标签和时间 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 min-w-0 flex-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {highlightText(tag, searchQuery)}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground ml-2 flex-shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {/* 来源链接 */}
        {item.source && item.metadata?.url && (
          <div className="flex items-center mt-2 text-xs text-primary">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span className="truncate">{item.source}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuickReferenceItemCard;
