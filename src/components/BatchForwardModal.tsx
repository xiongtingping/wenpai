import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X, Minus, Square, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

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

  // 确认关闭弹窗
  const handleClose = () => {
    if (confirm('确定要关闭批量转发窗口吗？已打开的平台页面将保持打开状态。')) {
      onOpenChange(false);
      setOpenedPlatforms(new Set());
      setCopiedItems(new Set());
    }
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

  if (!open) return null;

  return (
    <>
      {/* 最小化状态 - 固定在右下角 */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              <span className="text-sm font-medium">批量转发工作台 ({platforms.length}个平台)</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-6 w-6 p-0"
              >
                <Square className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 正常状态 - 模态弹窗 */}
      {!isMinimized && (
        <Dialog open={open} onOpenChange={() => {}}>
          <DialogContent
            className="max-w-6xl max-h-[90vh] overflow-hidden h-[90vh] p-0"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            {/* 优化后的紧凑头部 */}
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 border-b bg-gray-50/50">
              <DialogTitle className="text-lg font-semibold text-gray-800">
                批量转发工作台 ({platforms.length}个平台)
              </DialogTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                  title="最小化"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="关闭"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogHeader>

            {/* 优化后的紧凑内容区域 */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {/* 紧凑的使用说明 */}
              <div className="text-xs text-gray-600 mb-2 p-2 bg-blue-50/80 rounded border border-blue-200/60">
                <div className="flex items-center gap-1 mb-0.5">
                  <ExternalLink className="h-3 w-3 text-blue-600" />
                  <span className="font-medium text-blue-800">使用说明</span>
                </div>
                <div className="text-blue-700 leading-tight text-xs">
                  点击"发布"→复制内容→粘贴至平台→发布→重复下一个
                </div>
              </div>

              {/* 优化后的紧凑平台网格 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-1.5">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="border hover:border-blue-300 transition-colors shadow-sm">
                    {/* 紧凑的卡片头部 */}
                    <CardHeader className="pb-0.5 pt-1.5 px-2">
                      <CardTitle className="flex items-center gap-1 text-sm">
                        <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {platform.icon}
                          </span>
                        </div>
                        <span className="flex-1 text-xs font-medium">{platform.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPlatformPage(platform)}
                          className="h-4 px-1 text-xs border-gray-300 hover:border-blue-400"
                        >
                          <ExternalLink className="h-2 w-2 mr-0.5" />
                          发布
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePlatformExpanded(platform.id)}
                          className="h-4 w-4 p-0 hover:bg-gray-100"
                        >
                          {expandedPlatforms.has(platform.id) ?
                            <ChevronUp className="h-2 w-2" /> :
                            <ChevronDown className="h-2 w-2" />
                          }
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    {/* 紧凑的卡片内容 */}
                    <CardContent className="pt-0 pb-1.5 px-2">
                      {/* 紧凑的快速复制按钮区域 */}
                      <div className="flex gap-0.5 mb-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(platform.title, '标题', platform.name)}
                          className="flex-1 h-5 text-xs border-gray-300 hover:border-blue-400"
                        >
                          {getCopyButtonState(platform.name, '标题') ? (
                            <Check className="h-2 w-2 text-green-600" />
                          ) : (
                            <Copy className="h-2 w-2" />
                          )}
                          <span className="ml-0.5">标题</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(platform.content, '内容', platform.name)}
                          className="flex-1 h-5 text-xs border-gray-300 hover:border-blue-400"
                        >
                          {getCopyButtonState(platform.name, '内容') ? (
                            <Check className="h-2 w-2 text-green-600" />
                          ) : (
                            <Copy className="h-2 w-2" />
                          )}
                          <span className="ml-0.5">内容</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(platform.tags.join(' '), '标签', platform.name)}
                          className="flex-1 h-5 text-xs border-gray-300 hover:border-blue-400"
                        >
                          {getCopyButtonState(platform.name, '标签') ? (
                            <Check className="h-2 w-2 text-green-600" />
                          ) : (
                            <Copy className="h-2 w-2" />
                          )}
                          <span className="ml-0.5">标签</span>
                        </Button>
                      </div>

                      {/* 紧凑的详细内容区域 - 可折叠 */}
                      {expandedPlatforms.has(platform.id) && (
                        <div className="space-y-1.5 border-t border-gray-200 pt-1.5 mt-1.5">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-0.5">标题</label>
                            <div className="p-1 bg-gray-50/80 rounded text-xs max-h-6 overflow-y-auto border">
                              {platform.title}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-0.5">内容</label>
                            <div className="p-1 bg-gray-50/80 rounded text-xs max-h-12 overflow-y-auto border">
                              {platform.content.length > 60 ? platform.content.substring(0, 60) + '...' : platform.content}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-0.5">标签</label>
                            <div className="p-1 bg-gray-50/80 rounded text-xs min-h-[1rem] flex flex-wrap gap-0.5 border">
                              {platform.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs h-3 px-1 py-0">{tag}</Badge>
                              ))}
                              {platform.tags.length > 3 && (
                                <span className="text-gray-500 text-xs">+{platform.tags.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
