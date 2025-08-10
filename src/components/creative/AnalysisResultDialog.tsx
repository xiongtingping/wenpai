/**
 * ✅ FIXED: 2025-08-06 分析结果查看对话框组件
 * 用于显示AI分析的详细结果
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  FileText, 
  Brain, 
  Target, 
  Copy,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * 分析结果数据接口
 */
interface AnalysisResult {
  extractedFields?: { [key: string]: { value: any; excerpt: string; confidence: number } };
  overallConfidence?: number;
  version?: string;
  timestamp?: string;
  processingTime?: number;
  summary?: string;
}

/**
 * 品牌资产接口
 */
interface BrandAsset {
  id: string;
  name: string;
  type: string;
  size?: string;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'analyzed' | 'error';
  analysisResult?: AnalysisResult;
}

/**
 * 组件属性接口
 */
interface AnalysisResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BrandAsset | null;
}

/**
 * 分析结果查看对话框组件
 */
export function AnalysisResultDialog({ 
  isOpen, 
  onOpenChange, 
  asset 
}: AnalysisResultDialogProps) {
  const { toast } = useToast();

  if (!asset || !asset.analysisResult) {
    return null;
  }

  const result = asset.analysisResult;
  const extractedFields = result.extractedFields || {};
  const fieldCount = Object.keys(extractedFields).length;

  /**
   * 复制结果到剪贴板
   */
  const copyToClipboard = () => {
    const content = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制",
      description: "分析结果已复制到剪贴板",
      duration: 3000,
    });
  };

  /**
   * 下载结果为JSON文件
   */
  const downloadResult = () => {
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.name}_analysis_result.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载完成",
      description: "分析结果已下载为JSON文件",
      duration: 3000,
    });
  };

  /**
   * 获取置信度颜色
   */
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-accent text-green-800';
    if (confidence >= 0.6) return 'bg-accent text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  /**
   * 获取置信度图标
   */
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl font-semibold">AI分析结果</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {asset.name} • {fieldCount} 个提取字段
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 mr-1" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadResult}
              >
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 概览信息 */}
        <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-accent rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{fieldCount}</div>
            <div className="text-sm text-muted-foreground">提取字段</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {result.overallConfidence ? Math.round(result.overallConfidence * 100) : 'N/A'}%
            </div>
            <div className="text-sm text-muted-foreground">整体置信度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{result.version || 'v1.0'}</div>
            <div className="text-sm text-muted-foreground">分析版本</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {result.processingTime ? `${result.processingTime}s` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">处理时间</div>
          </div>
        </div>

        {/* 详细结果 */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-1">
              {Object.entries(extractedFields).map(([fieldName, fieldData]) => (
                <div key={fieldName} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">{fieldName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConfidenceIcon(fieldData.confidence)}
                      <Badge className={getConfidenceColor(fieldData.confidence)}>
                        {Math.round(fieldData.confidence * 100)}% 置信度
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">提取值:</label>
                      <div className="mt-1 p-2 bg-accent rounded border text-sm">
                        {typeof fieldData.value === 'object' 
                          ? JSON.stringify(fieldData.value, null, 2)
                          : String(fieldData.value)
                        }
                      </div>
                    </div>
                    
                    {fieldData.excerpt && (
                      <div>
                        <label className="text-sm font-medium text-foreground">原文摘录:</label>
                        <div className="mt-1 p-2 bg-accent rounded border text-sm text-muted-foreground">
                          "{fieldData.excerpt}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {fieldCount === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>暂无提取字段数据</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
