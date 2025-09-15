import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Copy, 
  Trash2, 
  Filter,
  Download,
  Clock,
  Tag
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { startDialogPositionFix } from '@/utils/dialogPositionFixer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// 历史记录项类型定义
export interface ShareHistoryItem {
  id: string;
  platformId: string;
  platformName: string;
  content: string;
  time: string;
  title?: string;
  tags?: string[];
  success?: boolean;
  url?: string;
}

// 排序选项
type SortOption = 'time-desc' | 'time-asc' | 'platform' | 'content-length';


interface EnhancedHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareHistory: ShareHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  availablePlatforms: any[];
}

export function EnhancedHistoryDialog({ open,
  onOpenChange,
  shareHistory,
  onClearHistory,
  onDeleteItem,
  availablePlatforms
 }: EnhancedHistoryDialogProps) {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('time-desc');
  const dialogRef = useRef<HTMLDivElement>(null);

  // 🎯 精简修复器 - 遵循CLAUDE.md 3.6.4规范
  React.useEffect(() => {
    if (!open) return;

    const fixDialogPosition = () => {
      const dialogElement = (
        document.querySelector('[role="dialog"][class*="enhanced-history-dialog"]') ||
        document.querySelector('.enhanced-history-dialog') ||
        document.querySelector('[role="dialog"]')
      ) as HTMLElement;

      if (dialogElement) {
        console.log('🎯 历史记录Dialog定位修复已应用');

        // 清除inset冲突属性
        dialogElement.style.removeProperty('inset');
        dialogElement.style.removeProperty('inset-block');
        dialogElement.style.removeProperty('inset-inline');
        dialogElement.style.removeProperty('inset-block-start');
        dialogElement.style.removeProperty('inset-block-end');
        dialogElement.style.removeProperty('inset-inline-start');
        dialogElement.style.removeProperty('inset-inline-end');

        // 简单的视窗单位定位，保持响应式布局
        dialogElement.style.setProperty('position', 'fixed', 'important');
        dialogElement.style.setProperty('top', '50vh', 'important');
        dialogElement.style.setProperty('left', '50vw', 'important');
        dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        dialogElement.style.setProperty('z-index', '1055', 'important');
        dialogElement.style.setProperty('margin', '0', 'important');
        
        console.log('✅ 历史记录Dialog位置已修复');
      }
    };

    fixDialogPosition();
    setTimeout(fixDialogPosition, 100);
    setTimeout(fixDialogPosition, 300);
  }, [open]);

  // 获取唯一平台列表
  const uniquePlatforms = useMemo(() => {
    const platforms = new Set(shareHistory.map(item => item.platformId));
    return Array.from(platforms).map(platformId => {
      const platform = availablePlatforms.find(p => p.id === platformId);
      return {
        id: platformId,
        name: platform?.name || platformId
      };
    });
  }, [shareHistory, availablePlatforms]);

  // 筛选和排序历史记录
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = shareHistory;

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(query) ||
        item.platformName.toLowerCase().includes(query) ||
        (item.title && item.title.toLowerCase().includes(query))
      );
    }

    // 平台筛选
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(item => item.platformId === selectedPlatform);
    }

    // 日期范围筛选
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedDateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          filterDate.setTime(0);
      }
      
      filtered = filtered.filter(item => new Date(item.time) >= filterDate);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time-desc':
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        case 'time-asc':
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        case 'platform':
          return a.platformName.localeCompare(b.platformName);
        case 'content-length':
          return b.content.length - a.content.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [shareHistory, searchQuery, selectedPlatform, selectedDateRange, sortBy]);

  // 按日期分组
  const groupedHistory = useMemo(() => {
    return filteredAndSortedHistory.reduce((groups: Record<string, ShareHistoryItem[]>, item) => {
      const date = new Date(item.time).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
      return groups;
    }, {});
  }, [filteredAndSortedHistory]);

  // 复制内容
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: t('components.labels.已复制'),
        description: "内容已复制到剪贴板"
      });
    } catch (error) {
      toast({
        title: t('components.labels.复制失败'),
        description: "无法复制到剪贴板",
        variant: "destructive"
      });
    }
  };

  // 删除单个记录
  const handleDeleteItem = (id: string) => {
    onDeleteItem(id);
    toast({
      title: t('components.labels.已删除'),
      description: "历史记录已删除"
    });
  };

  // 导出历史记录
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredAndSortedHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('components.labels.导出成功'),
      description: "历史记录已导出到文件"
    });
  };

  // 重置筛选
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedDateRange('all');
    setSortBy('time-desc');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="enhanced-history-dialog max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            内容生成历史记录
          </DialogTitle>
          <DialogDescription>
            查看、搜索和管理您的内容适配历史记录
          </DialogDescription>
        </DialogHeader>

        {/* 搜索和筛选工具栏 */}
        <div className="space-y-4 border-b pb-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索内容、平台或标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 筛选和排序控件 */}
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="选择平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有平台</SelectItem>
                {uniquePlatforms.map(platform => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="week">最近一周</SelectItem>
                <SelectItem value="month">最近一月</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time-desc">最新优先</SelectItem>
                <SelectItem value="time-asc">最旧优先</SelectItem>
                <SelectItem value="platform">按平台</SelectItem>
                <SelectItem value="content-length">按长度</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={resetFilters}>
              重置筛选
            </Button>

            <div className="flex-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  更多操作
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  导出历史记录
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onClearHistory}
                  className="text-destructive"
                  disabled={shareHistory.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空所有记录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>共 {shareHistory.length} 条记录</span>
            {filteredAndSortedHistory.length !== shareHistory.length && (
              <span>筛选后 {filteredAndSortedHistory.length} 条</span>
            )}
          </div>
        </div>

        {/* 历史记录列表 - 修复滚动和尺寸问题 */}
        <div className="dialog-content-scrollable flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {filteredAndSortedHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {shareHistory.length === 0 ? '暂无生成记录' : '没有符合条件的记录'}
            </div>
          ) : (
            <div className="space-y-6 pr-2">
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-primary mb-3 border-b pb-1 sticky top-0 bg-background z-10">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline" className="text-xs">
                              {item.platformName || item.platformId}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.time).toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {item.title && (
                              <Badge variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {item.title}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(item.content)}
                              className="h-8 w-8 p-0"
                              title={t('components.labels.标题')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title={t('components.labels.删除记录')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                          {item.content}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
