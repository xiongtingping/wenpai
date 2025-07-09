import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callOpenAIDevProxy } from '@/api/devApiProxy';

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
      // 调用AI API生成总结
      const messages = [{
        role: 'user',
        content: `请为以下内容生成AI智能总结：

${content}

请生成一个简洁有用的AI总结，包含内容概要、核心观点、关键要点和应用价值。`
      }];

      const response = await callOpenAIDevProxy(messages, 'gpt-4o', 0.7, 500);
      
      if (response.success && response.data?.data?.choices?.[0]?.message?.content) {
        setSummary(response.data.data.choices[0].message.content);
        toast({
          title: "总结完成",
          description: "AI已为您生成内容总结",
        });
      } else {
        throw new Error('AI响应格式异常');
      }
    } catch (error) {
      console.error('AI总结失败:', error);
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
    } catch {
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