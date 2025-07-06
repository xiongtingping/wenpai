import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * AI总结组件
 */
export const AISummarizer: React.FC = () => {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSummary = async () => {
    if (!content.trim()) {
      toast({
        title: "请输入内容",
        description: "请先输入需要总结的内容",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 模拟AI总结过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSummary = `基于您提供的内容，AI总结如下：

主要观点：
• 内容涵盖了多个重要方面
• 信息结构清晰，逻辑性强
• 具有实用价值和参考意义

关键要点：
• 重点突出了核心概念
• 提供了具体的实施建议
• 包含了相关的背景信息

总结：这是一份内容丰富、结构合理的文档，值得深入学习和参考。`;

      setSummary(mockSummary);
      toast({
        title: "总结完成",
        description: "AI已为您生成内容总结",
      });
    } catch (error) {
      toast({
        title: "总结失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "复制成功",
        description: "总结已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制",
        variant: "destructive",
      });
    }
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI总结.txt';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "下载成功",
      description: "总结已下载到本地",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI智能总结
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">输入内容</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入需要总结的内容..."
              rows={8}
              className="mt-2"
            />
          </div>
          
          <Button 
            onClick={generateSummary} 
            disabled={isGenerating || !content.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                开始总结
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI总结结果</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copySummary}>
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSummary}>
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 