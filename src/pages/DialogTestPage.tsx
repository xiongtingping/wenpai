/**
 * Dialog定位测试页面
 * 专门用于测试和调试Dialog组件的定位问题
 */

import React from 'react';
import { QuickReferenceTest } from '@/components/creative/QuickReference/QuickReferenceTest';

export default function DialogTestPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 页面标题 */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <h1 className="text-2xl font-bold">Dialog定位测试页面</h1>
        <p className="mt-2 text-primary-foreground/80">
          测试快速引用Dialog的定位和显示效果
        </p>
      </div>

      {/* 测试组件 */}
      <QuickReferenceTest />
    </div>
  );
}
