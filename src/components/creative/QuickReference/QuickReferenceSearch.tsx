/**
 * 快速引用搜索组件
 * 提供搜索功能和搜索状态管理
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { debounce } from 'lodash-es';

interface QuickReferenceSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showFilters?: boolean;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
}

export function QuickReferenceSearch({
  value,
  onChange,
  onSearch,
  placeholder = "搜索内容、标题或标签...",
  disabled = false,
  showFilters = false,
  activeFilters = [],
  onFilterChange
}: QuickReferenceSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      onSearch?.(query);
    }, 300),
    [onSearch]
  );

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    debouncedSearch(newValue);
  }, [onChange, debouncedSearch]);

  // 清空搜索
  const handleClear = useCallback(() => {
    onChange('');
    onSearch?.('');
  }, [onChange, onSearch]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(value);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  }, [value, onSearch, handleClear]);

  // 可用的过滤器选项
  const filterOptions = [
    { value: 'recent', label: '最近添加' },
    { value: 'popular', label: '热门内容' },
    { value: 'text', label: '文本内容' },
    { value: 'link', label: '链接内容' },
    { value: 'image', label: '图片内容' }
  ];

  // 切换过滤器
  const toggleFilter = useCallback((filterValue: string) => {
    if (!onFilterChange) return;
    
    const newFilters = activeFilters.includes(filterValue)
      ? activeFilters.filter(f => f !== filterValue)
      : [...activeFilters, filterValue];
    
    onFilterChange(newFilters);
  }, [activeFilters, onFilterChange]);

  return (
    <div className="space-y-3">
      {/* 搜索输入框 */}
      <div className={`
        relative transition-all duration-200
        ${isFocused ? 'ring-2 ring-primary/20' : ''}
      `}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            pl-10 pr-10 transition-all duration-200
            ${value ? 'pr-20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        
        {/* 清空按钮 */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* 搜索过滤器 */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>过滤:</span>
          </div>
          
          {filterOptions.map((option) => (
            <Badge
              key={option.value}
              variant={activeFilters.includes(option.value) ? "default" : "outline"}
              className={`
                cursor-pointer transition-all duration-200 text-xs
                ${activeFilters.includes(option.value) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => toggleFilter(option.value)}
            >
              {option.label}
            </Badge>
          ))}
          
          {/* 清空过滤器 */}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange?.([])}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              清空过滤
            </Button>
          )}
        </div>
      )}

      {/* 搜索提示 */}
      {value && (
        <div className="text-xs text-muted-foreground">
          搜索 "{value}" 的结果
        </div>
      )}
    </div>
  );
}

export default QuickReferenceSearch;
