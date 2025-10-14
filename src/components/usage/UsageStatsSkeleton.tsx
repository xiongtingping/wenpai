/**
 * 使用统计Skeleton加载组件
 * 提供平滑的加载体验，避免直接渲染错误状态
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface UsageStatsSkeletonProps {
  /** 是否显示详细统计 */
  showDetails?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 使用统计卡片骨架屏
 */
export function UsageStatsCardSkeleton({ showDetails = true, className = '' }: UsageStatsSkeletonProps) {
  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 进度条骨架 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {showDetails && (
          <>
            {/* 统计数据骨架 */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>

            {/* 操作按钮骨架 */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 使用次数统计内联骨架屏
 */
export function UsageCountInlineSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

/**
 * Token统计内联骨架屏
 */
export function TokenStatsInlineSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  );
}

/**
 * 通用统计网格骨架屏
 */
export function UsageStatsGridSkeleton({ columns = 3, className = '' }: { columns?: number; className?: string }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Card key={i} className="bg-card border-border">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UsageStatsCardSkeleton;
