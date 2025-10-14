/**
 * AI内容适配器使用统计集成示例
 * 展示如何在ContentAdapterPage中集成优化后的使用统计
 */

import React from 'react';
import { OptimizedUsageCountInline, OptimizedUsageDisplay } from '@/components/usage/OptimizedUsageDisplay';
import { useOptimizedUsageStats } from '@/hooks/useOptimizedUsageStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Play, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 示例1：工具栏中的内联显示
 */
export function AdapterToolbarExample() {
  const {
    consumeUsage,
    isInitialLoading,
    usageCountStats,
    userTier
  } = useOptimizedUsageStats();

  const { toast } = useToast();

  const handleGenerate = async () => {
    // 1. 检查剩余次数
    if (usageCountStats.remainingUses === 0) {
      toast({
        title: '使用次数已用完',
        description: '请升级套餐以继续使用',
        variant: 'destructive'
      });
      return;
    }

    // 2. 消费使用次数（自动节流保护）
    const success = await consumeUsage(1);

    if (!success) {
      toast({
        title: '操作失败',
        description: '使用次数扣减失败，请重试',
        variant: 'destructive'
      });
      return;
    }

    // 3. 执行实际的生成操作
    try {
      // ... AI生成逻辑 ...

      toast({
        title: '生成成功',
        description: `已使用 ${usageCountStats.usedCount + 1} 次`,
      });
    } catch (error) {
      // 生成失败时，应该退还使用次数
      // 由于使用了乐观更新，如果失败需要刷新真实状态
      toast({
        title: '生成失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border">
      {/* 左侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isInitialLoading || usageCountStats.remainingUses === 0}
        >
          <Play className="h-4 w-4 mr-2" />
          生成内容
        </Button>

        {usageCountStats.remainingUses === 0 && (
          <Badge variant="destructive" className="animate-pulse">
            次数已用完
          </Badge>
        )}
      </div>

      {/* 右侧：使用次数显示 */}
      <OptimizedUsageCountInline userTier={userTier} />
    </div>
  );
}

/**
 * 示例2：侧边栏中的详细统计
 */
export function AdapterSidebarExample() {
  const handleUpgrade = () => {
    // 跳转到升级页面
    window.location.href = '/pricing';
  };

  return (
    <aside className="w-80 p-4 space-y-4 bg-muted/30">
      <OptimizedUsageDisplay
        showDetails={true}
        showRefreshButton={true}
        onUpgrade={handleUpgrade}
      />

      {/* 其他侧边栏内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">使用提示</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>• 使用次数每月重置</p>
          <p>• 升级套餐可获得更多额度</p>
          <p>• 高级套餐享有无限使用</p>
        </CardContent>
      </Card>
    </aside>
  );
}

/**
 * 示例3：生成前的使用次数检查
 */
export function UsageCheckExample() {
  const {
    usageCountStats,
    consumeUsage,
    userTier,
    isInitialLoading
  } = useOptimizedUsageStats();

  /**
   * 统一的使用次数检查和消费逻辑
   */
  const checkAndConsume = async (): Promise<boolean> => {
    // 1. 检查是否正在加载
    if (isInitialLoading) {
      return false;
    }

    // 2. 检查剩余次数（高级套餐无限制）
    if (userTier !== 'premium' && usageCountStats.remainingUses <= 0) {
      return false;
    }

    // 3. 消费使用次数（带节流保护）
    const success = await consumeUsage(1);

    return success;
  };

  return { checkAndConsume };
}

/**
 * 示例4：批量生成时的使用次数管理
 */
export function BatchGenerationExample() {
  const { consumeUsage, usageCountStats, userTier } = useOptimizedUsageStats();
  const { toast } = useToast();

  const handleBatchGenerate = async (platformCount: number) => {
    // 1. 高级套餐无限制，直接执行
    if (userTier === 'premium') {
      // ... 执行批量生成 ...
      return;
    }

    // 2. 检查剩余次数是否足够
    if (usageCountStats.remainingUses < platformCount) {
      toast({
        title: '使用次数不足',
        description: `需要 ${platformCount} 次，剩余 ${usageCountStats.remainingUses} 次`,
        variant: 'destructive'
      });
      return;
    }

    // 3. 批量消费使用次数
    try {
      const success = await consumeUsage(platformCount);

      if (!success) {
        toast({
          title: '操作失败',
          description: '使用次数扣减失败',
          variant: 'destructive'
        });
        return;
      }

      // 4. 执行批量生成
      // ... 批量生成逻辑 ...

      toast({
        title: '批量生成成功',
        description: `已消费 ${platformCount} 次使用次数`,
      });
    } catch (error) {
      toast({
        title: '生成失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  return { handleBatchGenerate };
}

/**
 * 示例5：完整的ContentAdapterPage集成
 */
export function CompleteIntegrationExample() {
  const {
    usageCountStats,
    consumeUsage,
    userTier,
    isInitialLoading,
    isRefreshing,
    isStale,
    refresh
  } = useOptimizedUsageStats();

  const { toast } = useToast();

  const handleGenerate = async (platformCount: number = 1) => {
    // 使用次数检查和消费
    if (isInitialLoading) {
      toast({
        title: '请稍候',
        description: '正在加载使用统计...',
      });
      return;
    }

    if (userTier !== 'premium' && usageCountStats.remainingUses < platformCount) {
      toast({
        title: '使用次数不足',
        description: `需要 ${platformCount} 次，剩余 ${usageCountStats.remainingUses} 次`,
        variant: 'destructive'
      });
      return;
    }

    const success = await consumeUsage(platformCount);
    if (!success) {
      toast({
        title: '操作失败',
        description: '使用次数扣减失败',
        variant: 'destructive'
      });
      return;
    }

    // 执行生成逻辑
    try {
      // ... AI生成 ...
      toast({
        title: '生成成功',
        description: `已使用 ${platformCount} 次`,
      });
    } catch (error) {
      // 生成失败，刷新真实状态
      await refresh();
      throw error;
    }
  };

  return (
    <div className="flex h-screen">
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 工具栏 */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button onClick={() => handleGenerate(1)}>
                <Zap className="h-4 w-4 mr-2" />
                生成单个
              </Button>
              <Button onClick={() => handleGenerate(3)} variant="outline">
                批量生成(3个)
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* 缓存提示 */}
              {isStale && (
                <Badge variant="outline" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  显示缓存数据
                </Badge>
              )}

              {/* 内联使用次数 */}
              <OptimizedUsageCountInline userTier={userTier} />
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="flex-1 p-6">
          {/* 生成表单和结果展示 */}
        </div>
      </main>

      {/* 侧边栏统计 */}
      <aside className="w-80 border-l border-border bg-muted/30 p-4">
        <OptimizedUsageDisplay
          userTier={userTier}
          showDetails={true}
          showRefreshButton={true}
          onUpgrade={() => window.location.href = '/pricing'}
        />
      </aside>
    </div>
  );
}

export default CompleteIntegrationExample;
