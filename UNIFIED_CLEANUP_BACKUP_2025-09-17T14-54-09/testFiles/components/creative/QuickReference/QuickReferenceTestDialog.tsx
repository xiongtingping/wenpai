/**
 * 🧪 快速引用Dialog测试组件
 * 用于排查基本渲染问题的最小化版本
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AtSign, X } from "lucide-react";

interface QuickReferenceTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickReferenceTestDialog({ open, onOpenChange }: QuickReferenceTestDialogProps) {
  
  // 🚨 极简版修复器 - 确保Dialog可见
  useEffect(() => {
    if (!open) return;

    console.log('🧪 测试Dialog打开，开始修复...');

    const fixDialog = () => {
      try {
        // 查找所有可能的Dialog元素
        const selectors = [
          '[role="dialog"]',
          '[data-radix-dialog-content]',
          '.quick-reference-test'
        ];

        let dialogElement = null;
        for (const selector of selectors) {
          dialogElement = document.querySelector(selector);
          if (dialogElement) {
            console.log(`✅ 找到Dialog元素: ${selector}`, dialogElement);
            break;
          }
        }

        if (!dialogElement) {
          console.warn('❌ 未找到任何Dialog元素');
          return;
        }

        const htmlElement = dialogElement as HTMLElement;

        // 🚨 超强制可见性设置
        htmlElement.style.setProperty('position', 'fixed', 'important');
        htmlElement.style.setProperty('top', '50%', 'important');
        htmlElement.style.setProperty('left', '50%', 'important');
        htmlElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        htmlElement.style.setProperty('z-index', '999999', 'important');
        
        // 🚨 强制可见
        htmlElement.style.setProperty('display', 'block', 'important');
        htmlElement.style.setProperty('visibility', 'visible', 'important');
        htmlElement.style.setProperty('opacity', '1', 'important');
        htmlElement.style.setProperty('pointer-events', 'auto', 'important');
        
        // 🚨 明显的调试样式
        htmlElement.style.setProperty('background', '#ffffff', 'important');
        htmlElement.style.setProperty('border', '5px solid #ff0000', 'important');
        htmlElement.style.setProperty('border-radius', '8px', 'important');
        htmlElement.style.setProperty('box-shadow', '0 0 30px rgba(255, 0, 0, 0.8)', 'important');
        htmlElement.style.setProperty('padding', '20px', 'important');
        
        // 🚨 尺寸设置
        htmlElement.style.setProperty('width', '400px', 'important');
        htmlElement.style.setProperty('height', '300px', 'important');
        htmlElement.style.setProperty('min-width', '400px', 'important');
        htmlElement.style.setProperty('min-height', '300px', 'important');

        // 🚨 清除可能的隐藏属性
        htmlElement.style.removeProperty('clip-path');
        htmlElement.style.removeProperty('mask');
        htmlElement.style.removeProperty('filter');
        htmlElement.style.setProperty('overflow', 'visible', 'important');

        console.log('✅ 测试Dialog强制修复完成');

        // 输出位置信息
        const rect = htmlElement.getBoundingClientRect();
        console.log('📐 Dialog位置:', {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0
        });

      } catch (error) {
        console.error('❌ 测试Dialog修复失败:', error);
      }
    };

    // 立即执行并多次重试
    fixDialog();
    setTimeout(fixDialog, 100);
    setTimeout(fixDialog, 300);
    setTimeout(fixDialog, 500);
    setTimeout(fixDialog, 1000);

  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="quick-reference-test"
        style={{
          // 内联样式确保基本可见性
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          pointerEvents: 'auto',
          background: '#ffffff',
          border: '3px solid #ff0000',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
          padding: '20px',
          width: '400px',
          height: '300px',
          minWidth: '400px',
          minHeight: '300px'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#000000', fontSize: '18px', fontWeight: 'bold' }}>
            🧪 测试Dialog
          </DialogTitle>
        </DialogHeader>
        
        <div style={{ 
          color: '#000000', 
          fontSize: '16px', 
          padding: '20px 0',
          textAlign: 'center'
        }}>
          <p>如果你看到这个Dialog，说明基本渲染正常！</p>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            红色边框是调试标识
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button 
            onClick={() => onOpenChange(false)}
            style={{
              background: '#ff0000',
              color: '#ffffff',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            关闭测试Dialog
          </Button>
        </div>

        {/* 强制可见的关闭按钮 */}
        <button
          onClick={() => onOpenChange(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ff0000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </DialogContent>
    </Dialog>
  );
}

// 测试触发器组件
export function QuickReferenceTestTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        style={{
          background: '#ff0000',
          color: '#ffffff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        🧪 打开测试Dialog
      </Button>

      <QuickReferenceTestDialog 
        open={isOpen} 
        onOpenChange={setIsOpen} 
      />
    </>
  );
}