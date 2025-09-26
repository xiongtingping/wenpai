/**
 * Dialog调试页面
 * 用于深度分析Dialog定位问题的根本原因
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function DialogDebugPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const analyzeDialog = () => {
    const info: string[] = [];
    
    // 查找所有可能的Dialog元素
    const dialogElements = document.querySelectorAll('[role="dialog"]');
    info.push(`=== 找到 ${dialogElements.length} 个Dialog元素 ===`);
    
    dialogElements.forEach((element, index) => {
      const el = element as HTMLElement;
      info.push(`\n--- Dialog ${index + 1} ---`);
      info.push(`ID: ${el.id || '无'}`);
      info.push(`Classes: ${el.className}`);
      info.push(`Data attributes: ${Array.from(el.attributes).filter(attr => attr.name.startsWith('data-')).map(attr => `${attr.name}="${attr.value}"`).join(', ')}`);
      
      // 计算样式
      const computedStyle = window.getComputedStyle(el);
      info.push(`Position: ${computedStyle.position}`);
      info.push(`Top: ${computedStyle.top}`);
      info.push(`Left: ${computedStyle.left}`);
      info.push(`Transform: ${computedStyle.transform}`);
      info.push(`Z-index: ${computedStyle.zIndex}`);
      info.push(`Inset: ${computedStyle.inset}`);
      info.push(`Display: ${computedStyle.display}`);
      
      // 检查父容器
      const parent = el.parentElement;
      if (parent) {
        info.push(`Parent tagName: ${parent.tagName}`);
        info.push(`Parent ID: ${parent.id || '无'}`);
        info.push(`Parent Classes: ${parent.className}`);
      }
    });
    
    // 检查CSS层级
    info.push(`\n=== CSS Layer 信息 ===`);
    info.push(`支持 @layer: ${CSS.supports('@layer', 'test')}`);
    
    // 检查Portal容器
    const portalRoot = document.getElementById('dialog-portal-root');
    if (portalRoot) {
      info.push(`\n=== Portal 容器信息 ===`);
      info.push(`Portal存在: true`);
      info.push(`Portal子元素数量: ${portalRoot.children.length}`);
      const portalStyle = window.getComputedStyle(portalRoot);
      info.push(`Portal Position: ${portalStyle.position}`);
      info.push(`Portal Z-index: ${portalStyle.zIndex}`);
    } else {
      info.push(`\n=== Portal 容器信息 ===`);
      info.push(`Portal存在: false`);
    }
    
    setDebugInfo(info);
  };

  useEffect(() => {
    if (isDialogOpen) {
      // 等待DOM渲染完成
      setTimeout(analyzeDialog, 100);
    }
  }, [isDialogOpen]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    // 实时分析
    setTimeout(() => {
      analyzeDialog();
      // 持续监控
      const interval = setInterval(() => {
        if (document.querySelector('[role="dialog"]')) {
          analyzeDialog();
        } else {
          clearInterval(interval);
        }
      }, 500);
    }, 50);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Dialog 定位问题调试</h1>
      
      <div className="space-y-4">
        <Button onClick={handleOpenDialog}>
          打开测试Dialog
        </Button>
        
        <Button onClick={analyzeDialog} variant="outline">
          重新分析
        </Button>
        
        {debugInfo.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">调试信息:</h3>
            <pre className="text-sm whitespace-pre-wrap">
              {debugInfo.join('\n')}
            </pre>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="subscription-dialog">
          <DialogHeader>
            <DialogTitle>测试Dialog</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>这是一个用于调试定位问题的测试Dialog。</p>
            <p>检查它是否出现在屏幕中央。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}