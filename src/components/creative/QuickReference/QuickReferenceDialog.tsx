/**
 * 快速引用对话框组件 - 完全复制历史记录弹窗结构
 * 使用现代化的React组件架构，支持主题适配和响应式设计
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogScrollLock } from '@/hooks/useDialogPositioning';
// ✅ 移除Floating UI，完全交由CSS控制定位
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Copy,
  Trash2,
  Filter,
  Download,
  Clock,
  Tag,
  X,
  AtSign,
  RefreshCw,
  Database,
  Bookmark,
  Radar,
  Check,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { quickReferenceDataService, QuickReferenceItem } from '@/services/quickReferenceDataService';

export type TabType = 'brand' | 'library' | 'radar';

interface QuickReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string) => void;
  multiSelect?: boolean;
  className?: string;
}

export function QuickReferenceDialog({
  open,
  onOpenChange,
  onSelect,
  multiSelect = false,
  className
}: QuickReferenceDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // ✅ 移除调试日志，保持组件简洁

  // 状态管理 - 完全复制历史记录弹窗的状态结构
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('brand');
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
  const dialogRef = useRef<HTMLDivElement>(null);

  // ✅ 遵循UI组件职责分离原则：
  // 定位逻辑完全交由 Radix UI 控制，移除所有手动修复
  // ✅ 定位逻辑完全交由CSS和Radix UI控制，移除手动定位修复


  // ✅ 使用统一的滚动锁定Hook
  useDialogScrollLock(open);




  // 标签页配置
  const tabs = useMemo(() => [
    {
      value: 'brand' as TabType,
      label: t('quickReference.tabs.brandLibrary'),
      icon: <Database className="h-4 w-4" />,
      description: t('quickReference.tabs.brandLibraryDesc'),
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      value: 'library' as TabType,
      label: t('quickReference.tabs.myLibrary'),
      icon: <Bookmark className="h-4 w-4" />,
      description: t('quickReference.tabs.myLibraryDesc'),
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      value: 'radar' as TabType,
      label: t('quickReference.tabs.webRadar'),
      icon: <Radar className="h-4 w-4" />,
      description: t('quickReference.tabs.webRadarDesc'),
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ], [t]);

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
  }, [tabs, toast, t]);

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
      onSelect(item.content);
      onOpenChange(false);
    }
  }, [multiSelect, onSelect, onOpenChange]);

  // 多选确认
  const handleMultiSelectConfirm = useCallback(() => {
    const selectedContents = Array.from(selectedItems)
      .map(id => items[activeTab].find(item => item.id === id)?.content)
      .filter(Boolean)
      .join('\n\n');

    if (selectedContents) {
      onSelect(selectedContents);
      onOpenChange(false);
    }
  }, [selectedItems, items, activeTab, onSelect, onOpenChange]);

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
  }, [toast, t]);

  // 重置状态
  const resetState = useCallback(() => {
    setSearchQuery('');
    setSelectedItems(new Set());
    setError(null);
  }, []);

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

  // 重置筛选（复制历史记录弹窗的函数）
  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('brand');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // ✅ 简化的BEM类名，交由CSS控制定位
          "enhanced-quick-reference-dialog",
          "quick-reference-dialog",
          "dialog__content--quick-reference",
          // 🚨 简化Tailwind类，移除可能的定位干扰
          "flex flex-col",
          "backdrop-blur-xl bg-gradient-to-br from-background via-background/98 to-background/95",
          "border-2 border-border/60 shadow-[0_20px_40px_-8px_rgba(0,0,0,0.25)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.1)]",
          "rounded-[24px] ring-1 ring-primary/10 ring-offset-1 ring-offset-background/80",
          "relative overflow-hidden"
        )}
        style={{
          width: 'min(92vw, 1100px)',
          height: 'auto',
          maxWidth: '1100px',
          maxHeight: '80vh',
          minWidth: '320px',
          minHeight: '500px',
          padding: '0',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1055,
          display: 'flex',
          flexDirection: 'column',
          visibility: 'visible',
          opacity: 1,
          margin: 0,
          borderRadius: '24px'
        }}
      >
        {/* 🎯 标题区 - 完全复制历史记录弹窗的结构 */}
        <DialogHeader className="border-border bg-background" style={{
          position: 'relative',
          borderBottom: '1px solid',
          paddingBottom: '24px',
          paddingTop: '32px',
          paddingLeft: '32px',
          paddingRight: '32px'
        }}>
          {/* 右上角关闭按钮 - 完全复制 */}
          <button
            onClick={() => onOpenChange(false)}
            className="border-border bg-background hover:bg-muted hover:border-border/80"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
          >
            <span className="text-muted-foreground" style={{
              fontSize: '16px',
              fontWeight: '500'
            }}>×</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            {/* 左侧标题区域 */}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground mb-3">
                <span className="text-foreground">🎯 快速引用</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base leading-relaxed">
                <span className="text-muted-foreground">从品牌库、资料库、雷达收藏快速导入内容</span>
              </DialogDescription>
            </div>

            {/* 右侧搜索框 - 完全复制 */}
            <div className="w-full lg:w-80 xl:w-96 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                <Input
                  placeholder="🔍 搜索标题、内容或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    // 🚨 防止focus触发滚动 - 解决用户分析的15%概率根因
                    e.target.focus({ preventScroll: true });
                  }}
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

        {/* 🎯 内容区 - 完全复制历史记录弹窗的操作栏结构 */}
        <div className="border-border bg-muted/50" style={{
          borderBottom: '1px solid',
          padding: '12px 32px'
        }}>
          {/* 所有操作按钮 - 完全复制布局结构 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* 标签页选择器组 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {/* 标签页 */}
              {tabs.map((tab, index) => (
                <div
                  key={tab.value}
                  className={cn(
                    "border transition-all",
                    activeTab === tab.value
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-foreground hover:bg-muted hover:border-primary"
                  )}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    fontSize: '12px',
                    fontWeight: '500',
                    minWidth: '100px',
                    maxWidth: '140px'
                  }}
                  onClick={() => setActiveTab(tab.value)}
                >
                  <span style={{marginRight: '6px', fontSize: '12px'}}>{tab.icon}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tab.label}
                  </span>
                </div>
              ))}

              {/* 刷新按钮 */}
              <div
                className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
                style={{
                  height: '36px',
                  border: '1px solid',
                  borderRadius: '8px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loading[activeTab] ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  fontSize: '12px',
                  fontWeight: '600',
                  opacity: loading[activeTab] ? 0.6 : 1
                }}
                onClick={handleRefresh}
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", loading[activeTab] && "animate-spin")} />
                <span style={{fontSize: '12px', fontWeight: '600'}}>刷新</span>
              </div>
            </div>

            {/* 统计信息和重置按钮组 - 完全复制 */}
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800" style={{
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '8px',
                height: '36px',
                display: 'flex',
                alignItems: 'center'
              }}>
                📊 共 {items[activeTab].length} 条
              </div>
              {filteredItems.length !== items[activeTab].length && (
                <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" style={{
                  padding: '6px 8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  🔍 筛选后 {filteredItems.length} 条
                </div>
              )}
              <button
                onClick={resetFilters}
                className="bg-background text-foreground border border-border hover:bg-muted hover:border-border/60"
                style={{
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{marginRight: '4px', fontSize: '12px'}}>↻</span>
                <span style={{fontSize: '12px', fontWeight: '500'}}>重置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 主内容列表 - 完全复制历史记录弹窗的结构 */}
        <div
          className="bg-muted/30"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {filteredItems.length === 0 ? (
            <div className="text-muted-foreground" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 32px',
              minHeight: '280px'
            }}>
              {/* 完全复制历史记录弹窗的空状态 */}
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

              <div style={{
                maxWidth: '400px',
                marginBottom: '24px'
              }}>
                <div className="text-foreground" style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {items[activeTab].length === 0 ? t('quickReference.empty.noContent') : t('quickReference.empty.noMatch')}
                </div>
                <div className="text-muted-foreground" style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '6px'
                }}>
                  {items[activeTab].length === 0
                    ? t('quickReference.empty.startCollecting', { tab: tabs.find(t => t.value === activeTab)?.label })
                    : t('quickReference.empty.tryAdjustSearch')}
                </div>
                {items[activeTab].length === 0 && (
                  <div className="text-muted-foreground" style={{
                    fontSize: '13px',
                    fontStyle: 'italic',
                    marginTop: '8px'
                  }}>
                    {t('quickReference.empty.journeyStarts')}
                  </div>
                )}
              </div>

              {/* 装饰性元素 - 完全复制 */}
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
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-border bg-background hover:bg-muted/50 hover:border-border/60"
                  style={{
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => handleItemSelect(item)}
                >
                  {/* 记录头部信息 - 完全复制历史记录弹窗的结构 */}
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
                        {/* 类型标签 */}
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
                          {tabs.find(t => t.value === activeTab)?.label || activeTab}
                        </div>

                        {/* 来源标签 */}
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
                          <span>📂</span>
                          {item.source || '未知来源'}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 - 完全复制 */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      {multiSelect && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '2px solid #e2e8f0',
                          backgroundColor: selectedItems.has(item.id) ? '#3b82f6' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedItems.has(item.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyContent(item.content);
                        }}
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
                    </div>
                  </div>

                  {/* 内容标题 */}
                  <div className="text-foreground" style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {item.title}
                  </div>

                  {/* 标签区域 */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      {item.tags.slice(0, 5).map((tag, index) => (
                        <div
                          key={index}
                          className="bg-muted/50 text-muted-foreground border border-border"
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          #{tag}
                        </div>
                      ))}
                      {item.tags.length > 5 && (
                        <div className="bg-muted/50 text-muted-foreground border border-border" style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          +{item.tags.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 记录内容预览 - 完全复制 */}
                  <div className="bg-muted/50 border border-border" style={{
                    borderRadius: '10px',
                    padding: '16px',
                    marginTop: '16px'
                  }}>
                    <div className="text-foreground" style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      wordBreak: 'break-word'
                    }}>
                      {item.content.length > 200 ? (
                        <>
                          {item.content.slice(0, 200)}...
                          <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800" style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}>
                            💡 点击复制按钮获取完整内容
                          </div>
                        </>
                      ) : (
                        item.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 多选模式的底部操作栏 - 完全复制历史记录弹窗的结构 */}
        {multiSelect && selectedItems.size > 0 && (
          <div className="border-t border-border bg-background" style={{
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span className="text-muted-foreground" style={{
              fontSize: '14px'
            }}>
              已选择 {selectedItems.size} 项
            </span>
            <div style={{display: 'flex', gap: '8px'}}>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="bg-card text-foreground border border-border"
                style={{
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                清除选择
              </button>
              <button
                onClick={handleMultiSelectConfirm}
                disabled={selectedItems.size === 0}
                className="bg-primary text-primary-foreground"
                style={{
                  height: '36px',
                  padding: '0 12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check className="h-4 w-4" />
                添加选中项
              </button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}