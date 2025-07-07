/**
 * 内容抓取工具页面
 * 支持网页URL和文件上传的内容提取，集成AI自动总结功能
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
  Download,
  Upload,
  Copy,
  Sparkles,
  Search,
  File,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * 提取结果接口
 */
interface ExtractResult {
  id: string;
  source: string;
  sourceType: 'url' | 'file';
  content: string;
  summary?: string;
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
 * 内容抓取工具页面组件
 * @returns React 组件
 */
export default function ContentExtractorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状态管理
  const [extractMethod, setExtractMethod] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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
    setExtractResult(null);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟提取结果
      const mockResult: ExtractResult = {
        id: Date.now().toString(),
        source: url,
        sourceType: 'url',
        content: `# ${url.includes('xiaohongshu') ? '小红书内容提取' : '网页内容提取'}

## 主要内容

这是从 ${url} 提取的内容。

### 文章概述
这篇文章详细介绍了当前热门话题的核心观点和实用建议。内容涵盖了理论基础、实践方法和应用案例。

### 核心要点

#### 1. 理论基础
- **基本概念**：详细阐述了相关的核心概念和基本原理
- **发展历程**：梳理了该领域的发展脉络和重要节点
- **现状分析**：分析了当前的市场状况和发展趋势

#### 2. 实践方法
- **操作步骤**：提供了清晰的操作指南和实施流程
- **注意事项**：强调了实践过程中需要注意的关键问题
- **优化建议**：给出了进一步改进和优化的具体建议

#### 3. 应用案例
- **成功案例**：分享了多个实际应用的成功案例
- **问题分析**：分析了常见问题及其解决方案
- **经验总结**：总结了实践中的宝贵经验和教训

### 深入分析

#### 技术要点
1. **核心技术**：采用先进的技术方案和实现方法
2. **关键算法**：运用高效的算法优化处理效果
3. **性能优化**：通过多项优化措施提升整体性能

#### 应用价值
- **实用性强**：内容贴近实际需求，具有很强的实用价值
- **可操作性好**：提供的方法简单易行，便于实际操作
- **效果显著**：应用效果明显，能够带来预期的改善

### 相关链接
- [官方文档](${url})
- [技术论坛](https://forum.example.com)
- [开源项目](https://github.com/example/project)

### 结论

通过深入分析和实践验证，这套方法具有很强的可行性和实用性。建议在实际应用中结合具体情况进行适当调整，以达到最佳效果。

---

*提取时间：${new Date().toLocaleString('zh-CN')}*
*数据来源：${url}*`,
        metadata: {
          title: '网页内容提取示例',
          description: '从网页中提取结构化内容',
          keywords: ['内容提取', '网页解析', '数据抓取'],
          author: '网站编辑',
          date: '2024-02-15',
          wordCount: 350,
          charCount: 1200
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      setExtractResult(mockResult);
      
      toast({
        title: "内容提取成功",
        description: "已成功提取网页内容",
      });
    } catch {
      const errorResult: ExtractResult = {
        id: Date.now().toString(),
        source: url,
        sourceType: 'url',
        content: '',
        extractedAt: new Date().toISOString(),
        status: 'error',
        error: '提取失败，请检查URL是否有效'
      };
      
      setExtractResult(errorResult);
      
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
    setExtractResult(null);

    try {
      // 模拟文件处理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileContent = await readFileContent(selectedFile);
      
      const mockResult: ExtractResult = {
        id: Date.now().toString(),
        source: selectedFile.name,
        sourceType: 'file',
        content: `# 文件内容：${selectedFile.name}

## 文档结构

${fileContent}

## 内容分析

### 主要信息
- **文件类型**：${selectedFile.type || '未知'}
- **文件大小**：${(selectedFile.size / 1024).toFixed(1)} KB
- **处理时间**：${new Date().toLocaleString('zh-CN')}

### 内容特点
- 结构清晰，层次分明
- 信息丰富，内容详实
- 具有良好的可读性

### 应用建议
- 可作为参考资料使用
- 建议结合实际需求进行调整
- 注意保护原始格式`,
        metadata: {
          title: selectedFile.name,
          description: `从文件 ${selectedFile.name} 提取的内容`,
          wordCount: fileContent.split(/\s+/).length,
          charCount: fileContent.length
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      setExtractResult(mockResult);
      
      toast({
        title: "文件提取成功",
        description: `已成功提取 ${selectedFile.name} 的内容`,
      });
    } catch {
      const errorResult: ExtractResult = {
        id: Date.now().toString(),
        source: selectedFile.name,
        sourceType: 'file',
        content: '',
        extractedAt: new Date().toISOString(),
        status: 'error',
        error: '文件读取失败，请检查文件格式'
      };
      
      setExtractResult(errorResult);
      
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
   * 生成AI总结
   */
  const generateSummary = async () => {
    if (!extractResult || extractResult.status !== 'success') {
      toast({
        title: "请先提取内容",
        description: "需要先成功提取内容才能生成AI总结",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSummary(true);

    try {
      // 模拟AI总结过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const summary = `## AI智能总结

### 📋 内容概要
这是一份${extractResult.sourceType === 'url' ? '网页' : '文档'}内容的智能总结。原始内容包含丰富的信息和深入的分析，具有很强的参考价值。

### 🔍 核心观点
- **主要论点**：内容围绕核心主题展开，逻辑清晰
- **重要信息**：包含了关键的数据和事实依据  
- **实用价值**：提供了具体可行的方法和建议

### 💡 关键要点
1. **理论基础扎实**：具备完整的理论体系支撑
2. **实践指导性强**：提供了具体的操作指南
3. **案例分析详细**：通过实际案例加深理解

### 📈 应用建议
- 建议结合实际情况灵活运用
- 可作为决策参考和行动指南
- 注意关注后续发展和更新

### 🎯 价值评估
**推荐指数：⭐⭐⭐⭐⭐**

这份内容质量较高，信息丰富，具有很好的参考价值。建议收藏并深入学习。`;

      setExtractResult(prev => prev ? {
        ...prev,
        summary: summary
      } : null);

      toast({
        title: "AI总结完成",
        description: "已为您生成智能内容总结",
      });
    } catch {
      toast({
        title: "总结失败",
        description: "请稍后重试AI总结功能",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
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
    }
  };

  /**
   * 复制内容
   */
  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "内容已复制",
    });
  };

  /**
   * 下载内容
   */
  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载成功",
      description: "内容已下载到本地",
    });
  };

  /**
   * 重新提取
   */
  const handleRetry = () => {
    if (extractMethod === 'url') {
      extractFromUrl();
    } else {
      extractFromFile();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">内容提取工具</h1>
        <p className="text-gray-600">
          从网页或文件中提取内容，并生成AI智能总结
        </p>
      </div>

      {/* 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入区域 */}
        <div className="space-y-6">
          {/* 提取配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                内容来源
              </CardTitle>
              <CardDescription>
                选择提取方式并设置来源
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 提取方式选择 */}
              <div>
                <Label>提取方式</Label>
                <Select value={extractMethod} onValueChange={(value: 'url' | 'file') => setExtractMethod(value)}>
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
                  </SelectContent>
                </Select>
              </div>

              {/* URL输入 */}
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

              {/* 文件上传 */}
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
                    <div className="mt-2 p-3 bg-gray-50 rounded">
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

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button 
                  onClick={extractMethod === 'url' ? extractFromUrl : extractFromFile}
                  disabled={isExtracting}
                  className="flex-1"
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
                
                {extractResult && extractResult.status === 'success' && (
                  <Button 
                    variant="outline"
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI总结
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：结果区域 */}
        <div className="space-y-6">
          {extractResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {extractResult.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {extractResult.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    提取结果
                  </CardTitle>
                  <div className="flex gap-2">
                    {extractResult.status === 'error' && (
                      <Button variant="outline" size="sm" onClick={handleRetry}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        重试
                      </Button>
                    )}
                    {extractResult.status === 'success' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => copyContent(extractResult.content)}>
                          <Copy className="w-4 h-4 mr-1" />
                          复制
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadContent(extractResult.content, 'extracted-content.md')}>
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {extractResult.metadata && (
                  <div className="flex gap-4 text-sm text-gray-500">
                    {extractResult.metadata.wordCount && (
                      <span>字数: {extractResult.metadata.wordCount}</span>
                    )}
                    {extractResult.metadata.charCount && (
                      <span>字符: {extractResult.metadata.charCount}</span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {extractResult.status === 'success' ? (
                  <div className="space-y-4">
                    {/* 提取内容 */}
                    <div>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{extractResult.content}</pre>
                      </div>
                    </div>

                    {/* AI总结 */}
                    {extractResult.summary && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">AI智能总结</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyContent(extractResult.summary!)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            复制总结
                          </Button>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap">{extractResult.summary}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-500 p-4 bg-red-50 rounded">
                    {extractResult.error || '提取失败'}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 空状态提示 */}
          {!extractResult && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-2">等待内容提取</p>
                <p className="text-sm">请在左侧选择内容来源并开始提取</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 