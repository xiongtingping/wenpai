import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistoryDialogPositioning } from '@/hooks/useDialogPositioning';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Copy, 
  Trash2, 
  Filter,
  Download,
  Clock,
  Tag,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
  const { t } = useTranslation();
  
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('time-desc');
  const dialogRef = useRef<HTMLDivElement>(null);

  // 🎯 使用统一的Dialog定位Hook - 遵循React命名规范
  const dialogPositioning = useHistoryDialogPositioning(open, true);



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
        className={cn(
          // 🎯 BEM命名规范 + 原有样式
          "dialog dialog__content dialog__content--history",
          "enhanced-history-dialog flex flex-col overflow-hidden",
          "backdrop-blur-xl bg-gradient-to-br from-background via-background/98 to-background/95",
          "border-2 border-border/60 shadow-[0_20px_40px_-8px_rgba(0,0,0,0.25)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.1)]",
          "rounded-[24px] ring-1 ring-primary/10 ring-offset-1 ring-offset-background/80",
          "relative overflow-hidden"
        )}
        style={{
          width: 'min(85vw, 1000px)',
          height: 'auto',
          maxWidth: '1000px',
          maxHeight: '70vh',
          minWidth: '600px',
          minHeight: '450px',
          padding: '0',  // 移除默认内边距，让我们自己控制
          position: 'fixed',
          top: '16vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1055,
          display: 'flex',
          flexDirection: 'column',
          visibility: 'visible',
          opacity: 1,
          margin: 0,
          borderRadius: '24px'  // 圆润的圆角
        }}
      >
        {/* 🎯 标题区 - 标题和搜索框布局 */}
        <DialogHeader style={{
          position: 'relative',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '24px',
          paddingTop: '32px',
          paddingLeft: '32px',
          paddingRight: '32px',
          backgroundColor: '#ffffff'
        }}>
          {/* 右上角关闭按钮 */}
          <button
            onClick={() => onOpenChange(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <span style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '500'
            }}>×</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            {/* 左侧标题区域 */}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground mb-3">
                <span className="text-foreground">历史记录筛选</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base leading-relaxed">
                <span className="text-muted-foreground">查看和管理您的内容适配历史记录，支持多维度筛选和快速操作</span>
              </DialogDescription>
            </div>
            
            {/* 右侧搜索框 - 响应式宽度 */}
            <div className="w-full lg:w-80 xl:w-96 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                <Input
                  placeholder="🔍 搜索内容或平台..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 pr-4 h-10 text-sm",
                    "bg-background/60 backdrop-blur-sm",
                    "border border-border/40 hover:border-border/60",
                    "focus:border-primary/50 focus:bg-background/80",
                    "rounded-lg shadow-sm hover:shadow-md",
                    "transition-all duration-300",
                    "placeholder:text-muted-foreground/60"
                  )}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 🎯 内容区 - 紧凑操作栏 */}
        <div style={{
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#fbfcfd',
          padding: '12px 32px'
        }}>
            {/* 所有操作按钮 - 统一单行布局 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* 筛选操作按钮组 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
              {/* 平台选择 - 紧凑 */}
              <div style={{
                height: '36px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                color: '#1e293b',
                fontSize: '12px',
                fontWeight: '500',
                minWidth: '100px',
                maxWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              >
                <span style={{marginRight: '4px', fontSize: '12px'}}>🏷️</span>
                <span style={{color: '#1e293b', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {selectedPlatform === 'all' ? '所有平台' : 
                   uniquePlatforms.find(p => p.id === selectedPlatform)?.name || '选择平台'}
                </span>
              </div>

              {/* 时间范围 - 紧凑 */}
              <div style={{
                height: '36px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                color: '#1e293b',
                fontSize: '12px',
                fontWeight: '500',
                minWidth: '90px',
                maxWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              >
                <span style={{marginRight: '4px', fontSize: '12px'}}>📅</span>
                <span style={{color: '#1e293b', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap'}}>
                  {selectedDateRange === 'all' ? '全部时间' :
                   selectedDateRange === 'today' ? '今天' :
                   selectedDateRange === 'week' ? '最近一周' :
                   selectedDateRange === 'month' ? '最近一月' : '时间范围'}
                </span>
              </div>

              {/* 排序方式 - 紧凑 */}
              <div style={{
                height: '36px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                color: '#1e293b',
                fontSize: '12px',
                fontWeight: '500',
                minWidth: '90px',
                maxWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              >
                <span style={{marginRight: '4px', fontSize: '12px'}}>🔄</span>
                <span style={{color: '#1e293b', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap'}}>
                  {sortBy === 'time-desc' ? '最新优先' :
                   sortBy === 'time-asc' ? '最旧优先' :
                   sortBy === 'platform' ? '按平台' :
                   sortBy === 'content-length' ? '按长度' : '排序方式'}
                </span>
              </div>

              {/* 导出按钮 - 紧凑 */}
              <div 
                style={{
                  height: '36px',
                  backgroundColor: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
                onClick={handleExport}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Filter className="h-3 w-3 mr-1" style={{color: 'white'}} />
                <span style={{color: 'white', fontSize: '12px', fontWeight: '600'}}>导出</span>
              </div>
              </div>

              {/* 统计信息和重置按钮组 */}
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={{
                  backgroundColor: '#eff6ff', 
                  color: '#1d4ed8', 
                  padding: '6px 10px', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  borderRadius: '8px', 
                  border: '1px solid #bfdbfe',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  📊 共 {shareHistory.length} 条
                </div>
                {filteredAndSortedHistory.length !== shareHistory.length && (
                  <div style={{
                    backgroundColor: '#f0fdf4', 
                    color: '#15803d', 
                    border: '1px solid #bbf7d0', 
                    padding: '6px 8px', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    borderRadius: '8px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    🔍 筛选后 {filteredAndSortedHistory.length} 条
                  </div>
                )}
                <button 
                  onClick={resetFilters}
                  style={{
                    height: '36px', 
                    padding: '0 12px', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    backgroundColor: '#ffffff', 
                    color: '#374151', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    border: '1px solid #d1d5db', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <span style={{marginRight: '4px', fontSize: '12px'}}>↻</span>
                  <span style={{color: '#374151', fontSize: '12px', fontWeight: '500'}}>重置</span>
                </button>
              </div>
            </div>
        </div>

        {/* 历史记录列表 */}
        <div 
          style={{ 
            flex: 1, 
            minHeight: 0, 
            overflowY: 'auto',
            backgroundColor: '#fafbfc',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {filteredAndSortedHistory.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 32px',  // 适中的上下内边距
              color: '#64748b',
              minHeight: '280px'  // 合适的最小高度
            }}>
              {/* 大图标区域 - 紧凑布局 */}
              <div style={{
                marginBottom: '24px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '72px',
                  marginBottom: '12px',
                  opacity: '0.8',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}>📝</div>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  opacity: '0.1',
                  zIndex: '-1'
                }}></div>
              </div>

              {/* 文字内容区域 - 紧凑布局 */}
              <div style={{
                maxWidth: '400px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {shareHistory.length === 0 ? '🎯 暂无生成记录' : '🔍 没有符合条件的记录'}
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#64748b',
                  lineHeight: '1.6',
                  marginBottom: '6px'
                }}>
                  {shareHistory.length === 0 
                    ? '开始使用内容适配器生成精彩内容后，历史记录将在这里闪亮登场！' 
                    : '请尝试调整筛选条件，或清除搜索关键词来查看更多记录'}
                </div>
                {shareHistory.length === 0 && (
                  <div style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    marginTop: '8px'
                  }}>
                    您的创作历程从这里开始 ✨
                  </div>
                )}
              </div>

              {/* 装饰性元素 - 紧凑布局 */}
              <div style={{
                display: 'flex',
                gap: '6px',
                opacity: '0.3'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6'
                }}></div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              padding: '24px 32px',
              display: 'grid',
              gap: '16px'
            }}>
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date} style={{ marginBottom: '32px' }}>
                  {/* 日期标题 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6'
                    }}></div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      📅 {date}
                    </span>
                    <div style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: '#e2e8f0'
                    }}></div>
                    <div style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe'
                    }}>
                      {items.length} 条
                    </div>
                  </div>

                  {/* 历史记录卡片 */}
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {items.map((item) => (
                      <div 
                        key={item.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '24px',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* 记录头部信息 */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '12px'
                            }}>
                              {/* 平台标签 */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe'
                              }}>
                                <span>🏷️</span>
                                {item.platformName || item.platformId}
                              </div>
                              
                              {/* 时间标签 */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#374151',
                                border: '1px solid #d1d5db'
                              }}>
                                <span>🕐</span>
                                {new Date(item.time).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>

                              {/* 标题标签 */}
                              {item.title && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 12px',
                                  backgroundColor: '#f0fdf4',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#15803d',
                                  border: '1px solid #bbf7d0'
                                }}>
                                  <span>🏷️</span>
                                  {item.title}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 操作按钮 */}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                          }}>
                            <button
                              onClick={() => handleCopy(item.content)}
                              style={{
                                height: '36px',
                                padding: '0 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <span>📋</span>
                              复制
                            </button>
                            
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              style={{
                                height: '36px',
                                padding: '0 12px',
                                backgroundColor: '#f8fafc',
                                color: '#dc2626',
                                border: '1px solid #fee2e2',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fecaca';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.borderColor = '#fee2e2';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <span>🗑️</span>
                              删除
                            </button>
                          </div>
                        </div>
                        
                        {/* 记录内容预览 */}
                        <div style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '16px',
                          marginTop: '16px'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            color: '#334155',
                            lineHeight: '1.6',
                            wordBreak: 'break-word'
                          }}>
                            {item.content.length > 200 ? (
                              <>
                                {item.content.slice(0, 200)}...
                                <div style={{
                                  marginTop: '8px',
                                  padding: '6px 12px',
                                  backgroundColor: '#eff6ff',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe'
                                }}>
                                  💡 点击复制按钮获取完整内容
                                </div>
                              </>
                            ) : (
                              item.content
                            )}
                          </div>
                        </div>

                        {/* 标签区域 */}
                        {item.tags && item.tags.length > 0 && (
                          <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              {item.tags.map((tag, index) => (
                                <div
                                  key={index}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0'
                                  }}
                                >
                                  #{tag}
                                </div>
                              ))}
                            </div>
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

      </DialogContent>
    </Dialog>
  );
}
