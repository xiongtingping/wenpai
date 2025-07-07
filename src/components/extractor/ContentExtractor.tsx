/**
 * 内容提取组件
 * 支持 Markdown、JSON、HTML、图片、网页内容提取
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText,
  Globe,
  Image,
  Download,
  Upload,
  Copy,
  Search,
  File,
  Code,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 提取结果接口
 */
interface ExtractResult {
  id: string;
  source: string;
  sourceType: 'url' | 'file' | 'text';
  contentType: 'markdown' | 'json' | 'html' | 'image' | 'webpage';
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    date?: string;
    wordCount?: number;
    charCount?: number;
  };
  extractedAt: string;
  status: 'success' | 'error' | 'processing';
  error?: string;
}

/**
 * 内容提取组件
 * @returns React 组件
 */
export function ContentExtractor() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状态管理
  const [extractMethod, setExtractMethod] = useState<'url' | 'file' | 'text'>('url');
  const [contentType, setContentType] = useState<'markdown' | 'json' | 'html' | 'image' | 'webpage'>('webpage');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [extractResults, setExtractResults] = useState<ExtractResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /**
   * 从URL提取内容
   */
  const extractFromUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "请输入URL",
        description: "请提供有效的网页地址",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    const resultId = Date.now().toString();

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟提取结果
      const mockResult: ExtractResult = {
        id: resultId,
        source: url,
        sourceType: 'url',
        contentType: contentType,
        content: `# 网页标题

## 主要内容

这是从 ${url} 提取的内容。

### 关键信息
- 发布日期：2024年2月15日
- 作者：网站编辑
- 分类：技术文章

### 文章摘要
这是一篇关于内容提取技术的文章，介绍了如何从网页中提取有用的信息。

### 技术要点
1. **网页解析**：使用先进的解析算法
2. **内容识别**：智能识别主要内容区域
3. **格式转换**：支持多种输出格式

### 应用场景
- 内容聚合
- 信息收集
- 数据分析
- 知识管理

> 注意：提取的内容仅供参考，请确保遵守相关法律法规。`,
        metadata: {
          title: '网页内容提取示例',
          description: '从网页中提取结构化内容',
          keywords: ['内容提取', '网页解析', '数据抓取'],
          author: '网站编辑',
          date: '2024-02-15',
          wordCount: 150,
          charCount: 800
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      setExtractResults(prev => [mockResult, ...prev]);
      
      toast({
        title: "内容提取成功",
        description: "已成功提取网页内容",
      });
    } catch {
      const errorResult: ExtractResult = {
        id: resultId,
        source: url,
        sourceType: 'url',
        contentType: contentType,
        content: '',
        extractedAt: new Date().toISOString(),
        status: 'error',
        error: '提取失败，请检查URL是否有效'
      };
      
      setExtractResults(prev => [errorResult, ...prev]);
      
      toast({
        title: "提取失败",
        description: "请检查URL是否有效或稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * 从文件提取内容
   */
  const extractFromFile = async () => {
    if (!selectedFile) {
      toast({
        title: "请选择文件",
        description: "请上传要提取内容的文件",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    const resultId = Date.now().toString();

    try {
      // 模拟文件处理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileContent = await readFileContent(selectedFile);
      
      const mockResult: ExtractResult = {
        id: resultId,
        source: selectedFile.name,
        sourceType: 'file',
        contentType: contentType,
        content: fileContent,
        metadata: {
          title: selectedFile.name,
          description: `从文件 ${selectedFile.name} 提取的内容`,
          wordCount: fileContent.split(/\s+/).length,
          charCount: fileContent.length
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      setExtractResults(prev => [mockResult, ...prev]);
      
      toast({
        title: "文件提取成功",
        description: `已成功提取 ${selectedFile.name} 的内容`,
      });
    } catch {
      const errorResult: ExtractResult = {
        id: resultId,
        source: selectedFile.name,
        sourceType: 'file',
        contentType: contentType,
        content: '',
        extractedAt: new Date().toISOString(),
        status: 'error',
        error: '文件读取失败，请检查文件格式'
      };
      
      setExtractResults(prev => [errorResult, ...prev]);
      
      toast({
        title: "文件提取失败",
        description: "请检查文件格式或稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * 从文本提取内容
   */
  const extractFromText = async () => {
    if (!text.trim()) {
      toast({
        title: "请输入文本",
        description: "请提供要处理的文本内容",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    const resultId = Date.now().toString();

    try {
      // 模拟文本处理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult: ExtractResult = {
        id: resultId,
        source: '手动输入',
        sourceType: 'text',
        contentType: contentType,
        content: text,
        metadata: {
          title: '文本内容',
          description: '从手动输入的文本中提取的内容',
          wordCount: text.split(/\s+/).length,
          charCount: text.length
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      setExtractResults(prev => [mockResult, ...prev]);
      
      toast({
        title: "文本处理成功",
        description: "已成功处理文本内容",
      });
    } catch {
      const errorResult: ExtractResult = {
        id: resultId,
        source: '手动输入',
        sourceType: 'text',
        contentType: contentType,
        content: '',
        extractedAt: new Date().toISOString(),
        status: 'error',
        error: '文本处理失败'
      };
      
      setExtractResults(prev => [errorResult, ...prev]);
      
      toast({
        title: "文本处理失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * 读取文件内容
   */
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // 根据文件扩展名自动设置内容类型
      if (file.name.endsWith('.md')) {
        setContentType('markdown');
      } else if (file.name.endsWith('.json')) {
        setContentType('json');
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        setContentType('html');
      } else if (file.type.startsWith('image/')) {
        setContentType('image');
      }
    }
  };

  /**
   * 复制提取结果
   */
  const copyResult = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "提取内容已复制",
    });
  };

  /**
   * 下载提取结果
   */
  const downloadResult = (result: ExtractResult) => {
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-content-${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载成功",
      description: "提取内容已下载",
    });
  };

  /**
   * 格式化时间
   */
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  /**
   * 获取内容类型图标
   */
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'markdown':
        return <FileText className="w-4 h-4" />;
      case 'json':
        return <Code className="w-4 h-4" />;
      case 'html':
        return <File className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'webpage':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 提取配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            内容提取配置
          </CardTitle>
          <CardDescription>
            选择提取方式和内容类型
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 提取方式选择 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>提取方式</Label>
              <Select value={extractMethod} onValueChange={(value: 'url' | 'file' | 'text') => setExtractMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      网页URL
                    </div>
                  </SelectItem>
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      文件上传
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      文本输入
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>内容类型</Label>
              <Select value={contentType} onValueChange={(value: 'markdown' | 'json' | 'html' | 'image' | 'webpage') => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webpage">网页内容</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="image">图片</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  if (extractMethod === 'url') {
                    extractFromUrl();
                  } else if (extractMethod === 'file') {
                    extractFromFile();
                  } else {
                    extractFromText();
                  }
                }}
                disabled={isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提取中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    开始提取
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 输入区域 */}
          {extractMethod === 'url' && (
            <div>
              <Label>网页URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => setUrl('')}>
                  清空
                </Button>
              </div>
            </div>
          )}

          {extractMethod === 'file' && (
            <div>
              <Label>文件上传</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".md,.json,.html,.htm,.txt,image/*"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  选择文件
                </Button>
              </div>
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {extractMethod === 'text' && (
            <div>
              <Label>文本内容</Label>
              <Textarea
                placeholder="输入要提取内容的文本..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提取结果 */}
      {extractResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              提取结果 ({extractResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {extractResults.map((result) => (
                <Card key={result.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(result.contentType)}
                        <span className="font-medium">{result.source}</span>
                        <Badge variant="outline">
                          {result.contentType}
                        </Badge>
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyResult(result.content)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadResult(result)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {result.status === 'success' ? (
                      <div>
                        {result.metadata && (
                          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              {result.metadata.title && (
                                <div><strong>标题：</strong>{result.metadata.title}</div>
                              )}
                              {result.metadata.wordCount && (
                                <div><strong>字数：</strong>{result.metadata.wordCount}</div>
                              )}
                              {result.metadata.charCount && (
                                <div><strong>字符数：</strong>{result.metadata.charCount}</div>
                              )}
                              {result.metadata.date && (
                                <div><strong>日期：</strong>{result.metadata.date}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="max-h-60 overflow-y-auto">
                          <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                            {result.content}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-500">
                        {result.error || '提取失败'}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      提取时间：{formatTime(result.extractedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 