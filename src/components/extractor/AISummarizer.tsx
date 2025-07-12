/**
 * AI智能总结器组件
 * 使用统一AI服务进行内容总结
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Check, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import aiService from '@/api/aiService';

interface AISummarizerProps {
  initialContent?: string;
  onSummaryGenerated?: (summary: string) => void;
}

export default function AISummarizer({ initialContent = '', onSummaryGenerated }: AISummarizerProps) {
  const [content, setContent] = useState(initialContent);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 计算字数统计
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  /**
   * 生成AI总结
   */
  const generateSummary = async () => {
    if (!content.trim()) {
      toast.error('请输入要总结的内容');
      return;
    }

    if (content.length < 10) {
      toast.error('内容太短，无法生成有效总结');
      return;
    }

    setIsGenerating(true);
    setSummary('');

    try {
      console.log('开始生成AI总结，内容长度:', content.length);
      
      const response = await aiService.summarizeContent(content);
      
      const responseData = response.data as Record<string, unknown>;
      const choices = responseData?.data as Record<string, unknown>;
      if (response.success && choices?.choices?.[0]?.message?.content) {
        const generatedSummary = choices.choices[0].message.content;
        setSummary(generatedSummary);
        
        // 调用回调函数
        if (onSummaryGenerated) {
          onSummaryGenerated(generatedSummary);
        }
        
        toast.success('AI总结生成成功！');
        console.log('AI总结生成成功，长度:', generatedSummary.length);
      } else {
        console.error('AI服务响应异常:', response);
        throw new Error(response.error || 'AI总结生成失败');
      }
    } catch (error) {
      console.error('AI总结生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      toast.error(`总结生成失败: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 复制总结内容
   */
  const copySummary = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      toast.success('总结已复制到剪贴板');
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  };

  /**
   * 下载总结内容
   */
  const downloadSummary = () => {
    if (!summary) return;
    
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI总结_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('总结已下载');
  };

  /**
   * 清空内容
   */
  const clearContent = () => {
    setContent('');
    setSummary('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    toast.info('内容已清空');
  };

  /**
   * 重新生成总结
   */
  const regenerateSummary = () => {
    if (content.trim()) {
      generateSummary();
    } else {
      toast.error('请先输入内容');
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            AI智能总结器
          </CardTitle>
          <CardDescription>
            输入任意内容，AI将为您生成简洁有用的智能总结
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium">
                输入内容
              </label>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{wordCount} 字</Badge>
                <Badge variant="secondary">{charCount} 字符</Badge>
              </div>
            </div>
            <Textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入要总结的内容..."
              className="min-h-[200px] resize-none"
              disabled={isGenerating}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateSummary} 
              disabled={isGenerating || !content.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成AI总结'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearContent}
              disabled={isGenerating}
            >
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 总结结果 */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI总结结果</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySummary}
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      复制
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSummary}
                >
                  <Download className="mr-1 h-4 w-4" />
                  下载
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateSummary}
                  disabled={isGenerating}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  重新生成
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              基于输入内容生成的AI智能总结
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {summary}
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>总结字数: {summary.length}</span>
              <span>生成时间: {new Date().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用提示 */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">使用提示</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 支持任意长度的文本内容总结</li>
            <li>• AI会自动提取核心观点和关键信息</li>
            <li>• 总结结果可以复制、下载或重新生成</li>
            <li>• 建议输入至少10个字符以获得更好的总结效果</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 