import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// Dialog components removed - using custom modal
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X, Minus, Square, ExternalLink, ChevronDown, ChevronUp, Info, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useContentSyncStore, contentSyncUtils } from '@/stores/contentSyncStore';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

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

export const BatchForwardModal: React.FC<BatchForwardModalProps> = ({
  open,
  onOpenChange,
  platforms
}) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const [openedPlatforms, setOpenedPlatforms] = useState<Set<string>>(new Set());
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  // 内容同步store
  const contentSync = useContentSyncStore();
  
  // ref用于强制设置样式
  const modalRef = useRef<HTMLDivElement>(null);

  // 实时同步的内容
  const [syncedContent, setSyncedContent] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    platformId: ''
  });

  // 监听内容同步store的变化
  useEffect(() => {
    const currentContent = contentSync.getCurrentContent();
    setSyncedContent(currentContent);
  }, [contentSync.selectedTitle, contentSync.selectedContent, contentSync.selectedTags, contentSync.lastUpdated]);

  // 检查内容是否已同步
  const isContentSynced = contentSyncUtils.isContentReady(contentSync);

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
    setOpenedPlatforms(new Set());
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
    setOpenedPlatforms(prev => new Set([...prev, platform.id]));
  };

  // 添加滑入动画的CSS - 移到组件顶部避免条件性hooks
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInFromBottom {
        from {
          transform: translateX(-50%) translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // 🔧 FIXED: 正确的cleanup函数返回类型
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []); // 永远执行，避免条件性hooks

  // 强制设置弹窗位置在底部 - 使用更高的z-index和更强制的定位
  useEffect(() => {
    if (modalRef.current && open && !isMinimized) {
      const modal = modalRef.current;
      // 移除可能影响定位的类名
      modal.classList.remove('fixed', 'absolute', 'relative');
      
      // 使用极高优先级的样式设置
      modal.style.setProperty('position', 'fixed', 'important');
      modal.style.setProperty('bottom', 'var(--batch-modal-bottom-offset)', 'important');
      modal.style.setProperty('left', '50%', 'important');
      modal.style.setProperty('transform', 'translateX(-50%)', 'important');
      modal.style.setProperty('top', 'auto', 'important');
      modal.style.setProperty('right', 'auto', 'important');
      modal.style.setProperty('z-index', 'var(--batch-modal-z-index)', 'important');
      modal.style.setProperty('margin', '0', 'important');
      modal.style.setProperty('background', 'white', 'important');
      modal.style.setProperty('border', 'var(--batch-modal-border)', 'important');
      modal.style.setProperty('border-radius', 'var(--batch-modal-border-radius)', 'important');
      modal.style.setProperty('box-shadow', 'var(--batch-modal-shadow)', 'important');
      
      console.log('🔍 批量转发弹窗已强制定位到底部，位置:', modal.getBoundingClientRect());
    }
  }, [open, isMinimized]);

  // 确保有专门的容器用于渲染弹窗
  useEffect(() => {
    let container = document.getElementById('batch-forward-modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'batch-forward-modal-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.pointerEvents = 'none';
      container.style.zIndex = 'var(--z-critical)';
      document.body.appendChild(container);
    }
  }, []);

  if (!open) return null;

  const modalContent = (
    <>
      {/* 最小化状态 - 固定在右下角 */}
      {isMinimized && (
        <div className="batch-modal-minimized">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 btn-gradient-primary rounded"></div>
              <span className="text-sm font-medium">批量转发工作台 ({platforms.length}个平台)</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                className="h-6 w-6 p-0"
              >
                <Square className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 正常状态 - 相对定位弹窗，出现在触发按钮附近 */}
      {!isMinimized && open && (
        <>
          {/* 半透明遮罩层 */}
          <div
            className="batch-modal-overlay"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
          />
          
          {/* 弹窗内容 - 强制定位在页面底部 */}
          <div
            ref={modalRef}
            className="batch-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 隐藏的描述元素，用于CSS选择器 */}
            <div id="batch-forward-modal-description" className="sr-only">批量转发工作台模态框</div>

            {/* 优化后的紧凑头部 - 去除冗余留白 */}
            <div className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <h2 className="text-lg font-semibold text-foreground">
                批量转发工作台 ({platforms.length}个平台)
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="h-7 w-7 p-0 hover:bg-accent"
                  title="最小化"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-accent"
                  title="关闭"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* 确认关闭对话框 */}
            <AlertDialog open={closeConfirmOpen}>
              <AlertDialogContent>
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
            </AlertDialog>

            {/* 优化后的紧凑内容区域 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 batch-modal-scroll-content">
              {/* 优化后的使用说明 - 移至主标题下方，单行展示 */}
              <div className="flex items-center gap-2 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">使用说明：</span>
                <span className="text-sm text-primary">
                  点击"跳转"→跳转至对应平台→分别复制标题、内容和标签→粘贴至对应平台→在对应平台完成发布→返回重复下一个平台
                </span>
              </div>

              {/* 优化后的平台网格 - 增加分组边框 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                    {/* 优化后的卡片头部 */}
                    <CardHeader className="pb-3 pt-4 px-4 border-b border-border bg-accent/30">
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-6 h-6 rounded btn-gradient-primary flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-bold">
                            {platform.icon}
                          </span>
                        </div>
                        <span className="flex-1 font-semibold text-foreground">{platform.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPlatformPage(platform)}
                          className="h-7 px-3 text-sm border-primary hover:border-primary hover:bg-accent"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          跳转平台
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePlatformExpanded(platform.id)}
                          className="h-7 w-7 p-0 hover:bg-accent"
                        >
                          {expandedPlatforms.has(platform.id) ?
                            <ChevronUp className="h-4 w-4" /> :
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </CardTitle>
                    </CardHeader>

                    {/* 优化后的卡片内容 */}
                    <CardContent className="pt-4 pb-4 px-4">
                      {/* 内容同步状态提示 */}
                      {isContentSynced && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-accent rounded-lg border border-border">
                          <RefreshCw className="h-4 w-4 text-foreground" />
                          <span className="text-sm text-foreground font-medium">内容已同步</span>
                          <Badge variant="outline" className="text-xs text-foreground border-border">
                            {contentSync.selectedVersion ? `版本${contentSync.selectedVersion}` : '已选择'}
                          </Badge>
                        </div>
                      )}

                      {/* 优化后的快速复制按钮区域 - 优先使用同步内容 */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(
                            isContentSynced && syncedContent.title ? syncedContent.title : platform.title,
                            '标题',
                            platform.name
                          )}
                          className="flex-1 h-8 text-sm border-border hover:border-primary hover:bg-accent"
                        >
                          {getCopyButtonState(platform.name, '标题') ? (
                            <Check className="h-3 w-3 text-foreground mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          复制标题
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(
                            isContentSynced && syncedContent.content ? syncedContent.content : platform.content,
                            '内容',
                            platform.name
                          )}
                          className="flex-1 h-8 text-sm border-border hover:border-primary hover:bg-accent"
                        >
                          {getCopyButtonState(platform.name, '内容') ? (
                            <Check className="h-3 w-3 text-foreground mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          复制内容
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(
                            isContentSynced && syncedContent.tags.length > 0
                              ? syncedContent.tags.join(' ')
                              : platform.tags.join(' '),
                            '标签',
                            platform.name
                          )}
                          className="flex-1 h-8 text-sm border-border hover:border-primary hover:bg-accent"
                        >
                          {getCopyButtonState(platform.name, '标签') ? (
                            <Check className="h-3 w-3 text-foreground mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          复制标签
                        </Button>
                      </div>

                      {/* 优化后的详细内容区域 - 可折叠，优先显示同步内容 */}
                      {expandedPlatforms.has(platform.id) && (
                        <div className="space-y-4 border-t border-border pt-4">
                          <div>
                            <label className="text-sm font-semibold text-foreground block mb-2">
                              📝 标题
                              {isContentSynced && syncedContent.title && (
                                <Badge variant="outline" className="ml-2 text-xs text-foreground border-border">
                                  已同步
                                </Badge>
                              )}
                            </label>
                            <div className="p-3 bg-accent/80 rounded-lg text-sm border border-border max-h-20 overflow-y-auto">
                              {isContentSynced && syncedContent.title ? syncedContent.title : platform.title}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-foreground block mb-2">
                              📄 内容
                              {isContentSynced && syncedContent.content && (
                                <Badge variant="outline" className="ml-2 text-xs text-foreground border-border">
                                  已同步 - {contentSync.selectedVersion ? `版本${contentSync.selectedVersion}` : ''}
                                </Badge>
                              )}
                            </label>
                            <div className="p-3 bg-accent/80 rounded-lg text-sm border border-border max-h-32 overflow-y-auto">
                              {isContentSynced && syncedContent.content ? syncedContent.content : platform.content}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-foreground block mb-2">
                              🏷️ 标签
                              {isContentSynced && syncedContent.tags.length > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs text-foreground border-border">
                                  已同步
                                </Badge>
                              )}
                            </label>
                            <div className="p-3 bg-accent/80 rounded-lg border border-border">
                              <div className="flex flex-wrap gap-1">
                                {(isContentSynced && syncedContent.tags.length > 0 ? syncedContent.tags : platform.tags).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
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

      {/* 关闭确认 AlertDialog */}
      <AlertDialog open={closeConfirmOpen}>
        <AlertDialogContent>
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
      </AlertDialog>
    </>
  );

  // 使用Portal将模态框渲染到专门的容器，确保不受父容器样式影响
  console.log('🔍 批量转发弹窗渲染状态:', { open, isMinimized, modalRef: !!modalRef.current });
  
  const portalContainer = document.getElementById('batch-forward-modal-container') || document.body;
  return createPortal(modalContent, portalContainer);
};
