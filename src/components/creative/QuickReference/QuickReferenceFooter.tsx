/**
 * 快速引用底部操作栏组件
 * 处理多选模式下的批量操作
 */

import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Download, Share } from "lucide-react";

interface QuickReferenceFooterProps {
  multiSelect: boolean;
  selectedCount: number;
  onConfirm: () => void;
  onClear: () => void;
  onCancel?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function QuickReferenceFooter({
  multiSelect,
  selectedCount,
  onConfirm,
  onClear,
  onCancel,
  onExport,
  onShare,
  loading = false,
  disabled = false
}: QuickReferenceFooterProps) {
  
  // 如果不是多选模式，不显示底部栏
  if (!multiSelect) {
    return null;
  }

  return (
    <DialogFooter className="flex-shrink-0 border-t pt-4">
      <div className="flex items-center justify-between w-full gap-4">
        {/* 左侧：选择状态信息 */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            已选择 
            <Badge variant="secondary" className="ml-1 px-2">
              {selectedCount}
            </Badge>
            项内容
          </div>
          
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={loading || disabled}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              清空选择
            </Button>
          )}
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 导出按钮 */}
          {onExport && selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={loading || disabled}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              导出
            </Button>
          )}

          {/* 分享按钮 */}
          {onShare && selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              disabled={loading || disabled}
              className="gap-2"
            >
              <Share className="h-4 w-4" />
              分享
            </Button>
          )}

          {/* 取消按钮 */}
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </Button>
          )}

          {/* 确认按钮 */}
          <Button
            onClick={onConfirm}
            disabled={selectedCount === 0 || loading || disabled}
            className="gap-2 min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                确认引用 ({selectedCount})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 选择提示 */}
      {selectedCount === 0 && (
        <div className="w-full text-center">
          <p className="text-xs text-muted-foreground">
            请选择要引用的内容，然后点击"确认引用"按钮
          </p>
        </div>
      )}
    </DialogFooter>
  );
}

export default QuickReferenceFooter;
