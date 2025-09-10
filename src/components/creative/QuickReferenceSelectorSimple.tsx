/**
 * 快速引用选择器组件 - 简化测试版本
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AtSign } from "lucide-react";

interface QuickReferenceSelectorSimpleProps {
  onSelect: (content: string) => void;
  className?: string;
  multiSelect?: boolean;
}

export function QuickReferenceSelectorSimple({ 
  onSelect, 
  className, 
  multiSelect = false 
}: QuickReferenceSelectorSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTestSelect = () => {
    onSelect("这是一个测试内容");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          onClick={() => {
            console.log('🔍 简化版快速引用按钮被点击');
            setIsOpen(true);
          }}
        >
          <AtSign className="h-4 w-4 mr-2" />
          快速引用(测试)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            快速引用内容 - 测试版
          </DialogTitle>
          <DialogDescription>
            这是一个简化的测试版本
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>弹窗正常工作！</p>
          <div className="flex gap-2">
            <Button onClick={handleTestSelect}>
              选择测试内容
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuickReferenceSelectorSimple;
