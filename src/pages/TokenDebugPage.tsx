/**
 * Token统计调试页面
 * 临时页面用于测试Token统计修复
 */

import React from 'react';
import TokenStatsDebugPanel from '@/components/debug/TokenStatsDebugPanel';

export function TokenDebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Token统计调试
          </h1>
          <p className="text-muted-foreground">
            测试和调试Token使用量统计功能
          </p>
        </div>
        
        <TokenStatsDebugPanel />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          这是临时调试页面，用于修复Token统计功能
        </div>
      </div>
    </div>
  );
}

export default TokenDebugPage;