/**
 * Dialog定位测试页面
 * 专门用于测试和调试Dialog组件的定位问题
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickReferenceTrigger } from '@/components/creative/QuickReference/QuickReferenceTrigger';

export default function DialogTestPage() {
  const [selectedContent, setSelectedContent] = useState('');

  const handleSelect = (content: string) => {
    setSelectedContent(content);
    console.log('选择的content:', content);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面标题 */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <h1 className="text-2xl font-bold">Dialog定位测试页面</h1>
        <p className="mt-2 text-primary-foreground/80">
          测试快速引用Dialog的定位和显示效果
        </p>
      </div>

      {/* 简化的测试组件 */}
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>快速引用Dialog测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <QuickReferenceTrigger
                onSelect={handleSelect}
                multiSelect={false}
              />
              
              <QuickReferenceTrigger
                onSelect={handleSelect}
                multiSelect={true}
                variant="default"
              />
            </div>

            {/* 选择的内容显示 */}
            {selectedContent && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">选择的内容:</h4>
                <pre className="text-sm whitespace-pre-wrap">{selectedContent}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
