import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 内容预览组件
 */
export const ContentPreview: React.FC = () => {
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'text' | 'markdown' | 'html'>('text');
  const { toast } = useToast();

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      });
    } catch {
      toast({
        title: "复制失败",
        description: "请手动复制",
        variant: "destructive",
      });
    }
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.txt';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "下载成功",
      description: "内容已下载到本地",
    });
  };

  const renderPreview = () => {
    switch (previewMode) {
      case 'markdown':
        return (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      case 'html':
        return (
          <div 
            className="border rounded p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      default:
        return (
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
            {content}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            内容预览
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">输入内容</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入需要预览的内容..."
              rows={6}
              className="mt-2"
            />
          </div>
          
          <div className="flex gap-2">
            <Badge
              variant={previewMode === 'text' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPreviewMode('text')}
            >
              纯文本
            </Badge>
            <Badge
              variant={previewMode === 'markdown' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPreviewMode('markdown')}
            >
              Markdown
            </Badge>
            <Badge
              variant={previewMode === 'html' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPreviewMode('html')}
            >
              HTML
            </Badge>
          </div>
        </CardContent>
      </Card>

      {content && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>预览结果</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyContent}>
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
                <Button variant="outline" size="sm" onClick={downloadContent}>
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderPreview()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 