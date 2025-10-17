import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
// Dialog components removed - using custom modal
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X, Minus, Square, ExternalLink, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { toast } from 'sonner';
// 移除废弃的状态管理依赖，简化组件逻辑
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Platform {
  id: string;
  name: string;
  icon: string;
  url: string;
  title: string;
  content: string;
  tags: string[];
}

interface BatchForwardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: Platform[];
}

export const BatchForwardModal: React.FC<BatchForwardModalProps> = ({ open,
  onOpenChange,
  platforms }) => {
  const { t } = useTranslation();
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  // 简化后的组件逻辑，移除废弃的内容同步依赖
  // 直接使用平台提供的内容，无需复杂的同步状态管理

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string, platformName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = `${platformName}-${type}`;
      setCopiedItems(prev => new Set([...prev, key]));
      toast.success(`${platformName} ${type}已复制到剪贴板`);

      // 3秒后清除复制状态
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 3000);
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  // 确认关闭弹窗（使用 AlertDialog）
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const handleClose = () => setCloseConfirmOpen(true);
  const confirmClose = () => {
    onOpenChange(false);
    setCopiedItems(new Set());
    setCloseConfirmOpen(false);
  };

  // 获取复制按钮状态
  const getCopyButtonState = (platformName: string, type: string) => {
    const key = `${platformName}-${type}`;
    return copiedItems.has(key);
  };

  // 切换平台展开状态
  const togglePlatformExpanded = (platformId: string) => {
    setExpandedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
      } else {
        newSet.add(platformId);
      }
      return newSet;
    });
  };

  // 打开平台发布页
  const openPlatformPage = (platform: Platform) => {
    window.open(platform.url, `_blank_${platform.id}`);
  };

  // 移除了内联样式覆盖的useEffect，完全依赖CSS定位
  // CSS已修改为标准居中定位，遵循项目规范

  // 🔧 FIX: 确保有专门的容器用于渲染弹窗（只在组件挂载时创建一次）
  useEffect(() => {
    let container = document.getElementById('batch-forward-modal-container') as HTMLDivElement | null;
    if (!container) {
      container = document.createElement('div');
      container.id = 'batch-forward-modal-container';
      // 🔧 FIX: 容器本身不占据可点击区域，但子元素可以接收点击事件
      // pointer-events: none 会传递给子元素，需要在子元素上设置 pointer-events: auto
      container.style.pointerEvents = 'none';
      // 🔧 FIX: 确保容器不会产生黑色背景
      container.style.background = 'transparent';
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.zIndex = '1100'; // 低于modal内容，仅作为挂载点
      document.body.appendChild(container);
    }
  }, []); // 🔧 FIX: 空依赖数组，只在mount时执行一次，避免重复操作

  // 🔧 FIX: 重置最小化状态（当modal关闭时）
  useEffect(() => {
    if (!open) {
      setIsMinimized(false);
      setCloseConfirmOpen(false);
    }
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <>
      {/* 最小化状态 - 固定在右下角 */}
      {isMinimized && (
        <div className="batch-modal-minimized">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-primary to-primary/80 rounded"></div>
              <span className="text-sm font-medium text-foreground">批量转发工作台 ({platforms.length}个平台)</span>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMinimized(false);
                      }}
                      className="h-6 w-6 p-0"
                      aria-label="还原窗口"
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>还原窗口</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClose();
                      }}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      aria-label="关闭窗口"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>关闭窗口</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* 正常状态 - 相对定位弹窗，出现在触发按钮附近 */}
      {!isMinimized && (
        <>
          {/* 🔧 FIX: 半透明遮罩层 - 当AlertDialog打开时不渲染，避免z-index冲突 */}
          {!closeConfirmOpen && (
            <div
              className="batch-modal-overlay"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
            />
          )}

          {/* 弹窗内容 - 居中定位（遵循项目标准） */}
          <div
            className="batch-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 隐藏的描述元素，用于CSS选择器 */}
            <div id="batch-forward-modal-description" className="sr-only">批量转发工作台模态框</div>

            {/* 优化后的紧凑头部 - 去除冗余留白 */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-gradient-to-r from-violet-500/10 to-violet-500/5">
              <h2 className="text-base font-semibold text-foreground">
                批量转发工作台 ({platforms.length}个平台)
              </h2>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsMinimized(true);
                        }}
                        className="h-7 w-7 p-0 hover:bg-accent"
                        aria-label={t('components.actions.minimize', '最小化')}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('components.actions.minimize', '最小化')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClose();
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-accent"
                        aria-label={t('components.actions.close', '关闭')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('components.actions.close', '关闭')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* 优化后的紧凑内容区域 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 batch-modal-scroll-content">
              {/* 弱化的使用说明 - 紧凑单行提示 */}
              <div className="mb-4 px-3 py-2 bg-violet-500/5 rounded border border-violet-500/20 flex items-center gap-2">
                <Info className="h-4 w-4 text-violet-500 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">快速操作：</span>
                  点击"跳转"打开平台页面，使用"复制"按钮获取内容，切换到平台粘贴发布
                </p>
              </div>

              {/* 优化后的平台网格 - 增加分组边框 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="border border-border hover:border-violet-500/30 transition-all">
                    {/* 优化后的卡片头部 */}
                    <CardHeader className="pb-3 pt-3 px-4 border-b border-border bg-violet-50/30 dark:bg-violet-950/10">
                      <CardTitle className="flex items-center gap-2 text-sm w-full">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {platform.icon}
                          </span>
                        </div>
                        <span className="flex-1 font-semibold text-foreground overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{platform.name}</span>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPlatformPage(platform)}
                                  className="h-6 px-2 text-xs border-violet-500/50 hover:border-violet-500 hover:bg-violet-50"
                                  aria-label={`跳转到${platform.name}平台`}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  跳转
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>在新标签页打开平台发布页</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePlatformExpanded(platform.id)}
                                  className="h-6 w-6 p-0 hover:bg-violet-100 dark:hover:bg-violet-950/30"
                                  aria-label={expandedPlatforms.has(platform.id) ? "收起详情" : "展开详情"}
                                >
                                  {expandedPlatforms.has(platform.id) ?
                                    <ChevronUp className="h-3.5 w-3.5" /> :
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  }
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{expandedPlatforms.has(platform.id) ? "收起详情" : "展开详情"}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    {/* 优化后的卡片内容 */}
                    <CardContent className="pt-3 pb-3 px-4">
                      {/* 快速复制按钮区域 - 紧凑垂直布局 */}
                      <div className="flex flex-col gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  platform.title,
                                  t('components.actions.title', '标题'),
                                  platform.name
                                )}
                                className="w-full h-7 text-xs border-border hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors justify-start"
                                aria-label={`复制${platform.name}的标题`}
                              >
                                {getCopyButtonState(platform.name, t('components.actions.title', '标题')) ? (
                                  <Check className="h-3 w-3 text-success mr-2" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-2" />
                                )}
                                <span className="font-medium">复制标题</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>复制{platform.name}的标题到剪贴板</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  platform.content,
                                  t('components.actions.content', '内容'),
                                  platform.name
                                )}
                                className="w-full h-7 text-xs border-border hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors justify-start"
                                aria-label={`复制${platform.name}的内容`}
                              >
                                {getCopyButtonState(platform.name, t('components.actions.content', '内容')) ? (
                                  <Check className="h-3 w-3 text-success mr-2" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-2" />
                                )}
                                <span className="font-medium">复制内容</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>复制{platform.name}的内容到剪贴板</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  platform.tags.join(' '),
                                  t('components.actions.tags', '标签'),
                                  platform.name
                                )}
                                className="w-full h-7 text-xs border-border hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors justify-start"
                                aria-label={`复制${platform.name}的标签`}
                              >
                                {getCopyButtonState(platform.name, t('components.actions.tags', '标签')) ? (
                                  <Check className="h-3 w-3 text-success mr-2" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-2" />
                                )}
                                <span className="font-medium">复制标签</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>复制{platform.name}的标签到剪贴板</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* 优化后的详细内容区域 - 可折叠 */}
                      {expandedPlatforms.has(platform.id) && (
                        <div className="space-y-3 border-t border-border pt-3 mt-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                              📝 标题预览
                            </label>
                            <div className="p-2 bg-violet-50/50 dark:bg-violet-950/10 rounded text-xs border border-violet-200/50 dark:border-violet-800/30 max-h-16 overflow-y-auto">
                              {platform.title}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                              📄 内容预览
                            </label>
                            <div className="p-2 bg-violet-50/50 dark:bg-violet-950/10 rounded text-xs border border-violet-200/50 dark:border-violet-800/30 max-h-24 overflow-y-auto whitespace-pre-wrap">
                              {platform.content}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                              🏷️ 标签列表
                            </label>
                            <div className="p-2 bg-violet-50/50 dark:bg-violet-950/10 rounded border border-violet-200/50 dark:border-violet-800/30">
                              <div className="flex flex-wrap gap-1">
                                {platform.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 🔧 FIX: 关闭确认 AlertDialog - 手动控制Portal来提升z-index，确保在batch-modal之上可见 */}
      <AlertDialog open={closeConfirmOpen}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[1102]" />
          <AlertDialogContent className="z-[1103]">
            <AlertDialogHeader>
              <AlertDialogTitle>确认关闭</AlertDialogTitle>
              <AlertDialogDescription>
                确定要关闭批量转发窗口吗？已打开的平台页面将保持打开状态。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCloseConfirmOpen(false)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClose}>确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );

  // 使用Portal将模态框渲染到专门的容器，确保不受父容器样式影响
  if (import.meta.env.DEV) console.log('🔍 批量转发popup渲染state:', { open, isMinimized });

  const portalContainer = document.getElementById('batch-forward-modal-container') || document.body;
  return createPortal(modalContent, portalContainer);
};
