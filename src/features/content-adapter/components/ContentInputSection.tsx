/**
 * 内容输入区域组件
 * 负责原始内容输入和基础设置
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UsageStateWrapper } from '@/components/ui/StateLoadingWrapper';
import { QuickReferenceTrigger } from '@/components/creative/QuickReference/QuickReferenceTrigger';
import { cn } from '@/lib/utils';

interface ContentInputSectionProps {
  // 内容状态
  originalContent: string;
  onContentChange: (content: string) => void;

  // 使用次数状态
  usageRemaining: number;
  currentTier: string;

  // 品牌库配置
  useBrandLibrary: boolean;
  onBrandLibraryChange: (enabled: boolean) => void;

  // 配置
  placeholder?: string;
  minHeight?: string;

  // 国际化
  t: (key: string) => string;
}

/**
 * 格式化剩余使用次数显示
 * 🔧 FIX: 修复高级版无限制显示问题
 */
function formatRemainingUses(remaining: number | undefined, tier: string): string {
  // 安全检查：处理undefined、null等情况
  if (remaining === undefined || remaining === null || isNaN(remaining)) {
    // 🔧 FIX: 高级版用户应该显示无限制而不是0
    if (tier === 'premium') {
      return "∞";
    }
    return "0";
  }

  // 🔧 FIX: 高级版无限制的正确判断
  if (remaining === -1 || remaining === Infinity) {
    return "∞";
  }

  if (remaining <= 0) {
    return "0";
  }

  return remaining.toString();
}

/**
 * 内容输入区域组件
 */
export function ContentInputSection({
  originalContent,
  onContentChange,
  usageRemaining,
  currentTier,
  useBrandLibrary,
  onBrandLibraryChange,
  placeholder = "请输入要适配的原始内容...",
  minHeight = "200px",
  t
}: ContentInputSectionProps) {
  
  return (
    <div className="mb-8">
      <Card variant="soft" className="rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">
              输入原始内容
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                剩余使用次数
              </span>
              <Badge variant={usageRemaining <= 5 ? "destructive" : "default"}>
                {formatRemainingUses(usageRemaining, currentTier)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder={placeholder}
              className={cn(
                `min-h-[${minHeight}] resize-none`,
                // 使用设计令牌的主题适配样式
                "bg-background border-border text-foreground",
                "placeholder:text-muted-foreground",
                "focus:border-ring focus:ring-2 focus:ring-ring/20",
                "transition-all duration-200",
                // 响应式字体大小
                "text-sm md:text-base",
                // 错误状态样式
                originalContent.length > 5000 && "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
              value={originalContent}
              onChange={(e) => onContentChange(e.target.value)}
              data-testid="original-content-input"
            />
            
            {/* 内容统计信息 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  字符数: {originalContent.length}
                </span>
                {originalContent.length > 0 && (
                  <span>
                    预计生成时间: {Math.ceil(originalContent.length / 100)}秒
                  </span>
                )}
              </div>
              
              {originalContent.length > 5000 && (
                <Badge variant="outline" className="text-amber-600">
                  内容较长，建议分段处理
                </Badge>
              )}
            </div>
            
            {/* 内容提示 */}
            {originalContent.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <p className="font-medium mb-1">💡 内容输入建议：</p>
                <ul className="space-y-1 text-xs">
                  <li>• 输入您想要适配的原始内容</li>
                  <li>• 支持文本、链接、图片描述等多种形式</li>
                  <li>• 内容越详细，生成的适配效果越好</li>
                  <li>• 建议单次输入内容不超过5000字符</li>
                </ul>
              </div>
            )}
            
            {/* 快速引用功能 - 使用新的现代化组件 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QuickReferenceTrigger
                  multiSelect={true}
                  onSelect={(content) => {
                    // 在当前内容后追加引用内容
                    const newContent = originalContent ?
                      `${originalContent}\n\n${content}` :
                      content;
                    onContentChange(newContent);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                />
                <span className="text-xs text-muted-foreground">
                  从品牌库、资料库、雷达收藏快速导入内容
                </span>
              </div>

              {/* 字符计数显示 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  字符数: {originalContent.length}
                </span>
                {originalContent.length > 5000 && (
                  <span className="text-xs text-destructive">
                    建议控制在5000字符以内
                  </span>
                )}
              </div>
            </div>

            {/* 快速模板 */}
            {originalContent.length === 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">快速模板:</span>
                {[
                  "产品推荐: 今天要给大家推荐一个超好用的...",
                  "经验分享: 最近发现了一个提高效率的方法...",
                  "教程指南: 手把手教你如何...",
                  "观点评论: 关于最近热议的话题，我的看法是..."
                ].map((template, index) => (
                  <button
                    key={index}
                    onClick={() => onContentChange(template)}
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    {template.split(':')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 品牌库选择区域 - 从原版完整迁移 */}
      <Card variant="soft" className="mt-4 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-start gap-3 flex-1">
                <Checkbox
                  id="use-brand-library"
                  checked={useBrandLibrary}
                  onCheckedChange={(checked) => {
                    // 🔧 FIX: 允许用户勾选/取消勾选，权限验证移到生成阶段
                    onBrandLibraryChange(!!checked);
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor="use-brand-library" className="text-sm text-primary cursor-pointer">
                    使用品牌库资料进行创作
                  </Label>
                  <p className="text-xs text-secondary mt-1">
                    AI自动遵循品牌语言规范，融入品牌价值，规避公关风险
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentInputSection;
