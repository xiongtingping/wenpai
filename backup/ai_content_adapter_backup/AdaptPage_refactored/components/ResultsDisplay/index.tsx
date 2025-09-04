/**
 * 结果展示组件
 * 负责生成结果的展示和管理
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Copy, 
  Edit3, 
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Hash,
  Type
} from 'lucide-react';
import { GeneratedContent } from '../../types';
import { useAdaptPage } from '../../AdaptPageProvider';
import { cn } from '@/lib/utils';

// ========================================================================================
// 组件Props
// ========================================================================================

interface ResultsDisplayProps {
  className?: string;
  results: GeneratedContent[];
}

// ========================================================================================
// 主组件
// ========================================================================================

export function ResultsDisplay({ className, results }: ResultsDisplayProps) {
  const { events } = useAdaptPage();
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [editingResults, setEditingResults] = useState<Set<string>>(new Set());
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const { onRegenerate, onForward } = events;

  const handleToggleExpanded = (platformId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(platformId)) {
      newExpanded.delete(platformId);
    } else {
      newExpanded.add(platformId);
    }
    setExpandedResults(newExpanded);
  };

  const handleStartEdit = (platformId: string, content: string) => {
    setEditingResults(prev => new Set([...prev, platformId]));
    setEditedContent(prev => ({ ...prev, [platformId]: content }));
  };

  const handleSaveEdit = (platformId: string) => {
    // 这里应该调用更新内容的方法
    setEditingResults(prev => {
      const newSet = new Set(prev);
      newSet.delete(platformId);
      return newSet;
    });
  };

  const handleCancelEdit = (platformId: string) => {
    setEditingResults(prev => {
      const newSet = new Set(prev);
      newSet.delete(platformId);
      return newSet;
    });
    setEditedContent(prev => {
      const newContent = { ...prev };
      delete newContent[platformId];
      return newContent;
    });
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以添加toast提示
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">生成结果</CardTitle>
            <Badge variant="outline" className="text-xs">
              {results.length} 个平台
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {results.map((result) => {
          const isExpanded = expandedResults.has(result.platformId);
          const isEditing = editingResults.has(result.platformId);
          const content = result.content || (result.versions && result.versions[0]?.content) || '';
          const currentContent = isEditing ? (editedContent[result.platformId] || content) : content;

          return (
            <Card key={result.platformId} className="border-border">
              <CardContent className="p-4">
                {/* 平台标题和操作 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{result.platformName}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Type className="h-3 w-3 mr-1" />
                      {content.length} 字符
                    </Badge>
                    {result.tags && result.tags.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {result.tags.length} 标签
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContent(currentContent)}
                      className="h-8 w-8 p-0"
                      title="复制内容"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(result.platformId, content)}
                      className="h-8 w-8 p-0"
                      title="编辑内容"
                      disabled={isEditing}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegenerate(result.platformId)}
                      className="h-8 w-8 p-0"
                      title="重新生成"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleExpanded(result.platformId)}
                      className="h-8 w-8 p-0"
                      title={isExpanded ? "收起" : "展开"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 内容预览 */}
                <div className="space-y-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={currentContent}
                        onChange={(e) => setEditedContent(prev => ({
                          ...prev,
                          [result.platformId]: e.target.value
                        }))}
                        className="min-h-[120px] text-sm"
                        placeholder="编辑内容..."
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(result.platformId)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelEdit(result.platformId)}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={cn(
                        'text-sm text-foreground bg-accent/30 rounded-lg p-3',
                        !isExpanded && 'line-clamp-3'
                      )}>
                        {currentContent}
                      </div>
                      
                      {!isExpanded && content.length > 150 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpanded(result.platformId)}
                          className="text-xs text-muted-foreground"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          查看完整内容
                        </Button>
                      )}
                    </div>
                  )}

                  {/* 标签显示 */}
                  {result.tags && result.tags.length > 0 && isExpanded && (
                    <div className="flex flex-wrap gap-1">
                      {result.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 元数据 */}
                  {result.metadata && isExpanded && (
                    <div className="text-xs text-muted-foreground bg-accent/20 rounded p-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>生成时间: {new Date(result.metadata.generatedAt).toLocaleString()}</div>
                        <div>使用模型: {result.metadata.modelUsed}</div>
                        <div>字符数: {result.metadata.characterCount}</div>
                        <div>词数: {result.metadata.wordCount}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onForward(result.platformId)}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" />
                    转发到{result.platformName}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* 批量操作提示 */}
        <div className="text-center py-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">
            生成完成！您可以编辑内容或直接转发到各平台
          </div>
          <div className="text-xs text-muted-foreground">
            💡 提示：使用右侧的"一键转发"面板可以批量转发到多个平台
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResultsDisplay;
