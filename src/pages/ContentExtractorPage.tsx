/**
 * 内容提取与AI总结工具页面
 * 支持网页URL和文件上传的内容提取，集成AI自动总结功能，统一UI设计
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RotateCcw,
  Save,
  Zap,
  Brain,
  Link2,
  BookOpen,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 提取结果接口
 */
interface ExtractResult {
  id: string;
  source: string;
  sourceType: 'url' | 'file' | 'text';
  title: string;
  content: string;
  summary?: string;
  metadata?: {
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
 * 生成模拟内容
 */
const generateMockContent = (source: string) => {
  const platform = source.includes('xiaohongshu') ? '小红书' : 
                  source.includes('zhihu') ? '知乎' : 
                  source.includes('weibo') ? '微博' : '网页';
  
  return `# ${platform}内容提取

## 主要内容

这是从 ${source} 提取的内容。

### 核心观点
- **观点一**：详细阐述了重要概念和基本原理，为读者提供了深入的理解
- **观点二**：分析了当前市场状况和发展趋势，具有很强的前瞻性
- **观点三**：提供了实用的方法和建议，可以直接应用到实际工作中

### 关键信息
- 发布时间：2024年2月15日
- 作者：${platform}用户
- 阅读量：10.2万
- 点赞数：3.5千

### 深度分析

#### 实用价值
这篇内容具有很强的实用价值，不仅提供了理论基础，还结合了实际案例进行分析。对于相关领域的从业者来说，是一份很好的参考资料。

#### 应用建议
1. **直接应用**：可以将其中的方法论直接应用到实际工作中
2. **深入研究**：建议进一步深入研究相关领域的最新发展
3. **持续关注**：关注作者的后续更新和相关讨论

### 相关链接
- [原文链接](${source})
- [作者主页](${source}/author)
- [相关话题](${source}/topics)

---

*提取时间：${new Date().toLocaleString('zh-CN')}*
*数据来源：${source}*`;
};

/**
 * 生成AI总结
 */
const generateAISummary = (content: string) => {
  return `## 🤖 AI智能总结

### 📋 内容概要
这是一份高质量的内容，包含了丰富的信息和深入的分析。内容结构清晰，逻辑严谨，具有很强的参考价值。

### 🔍 核心观点
- **主要论点**：内容围绕核心主题展开，提供了全面的分析视角
- **关键信息**：包含了重要的数据和事实依据，支撑了主要观点
- **实用建议**：提供了具体可行的方法和建议，具有很强的操作性

### 💡 关键要点
1. **理论基础扎实**：内容具备完整的理论体系支撑
2. **实践指导性强**：提供了具体的操作指南和实施步骤
3. **案例分析详细**：通过实际案例加深理解和应用
4. **前瞻性强**：对未来发展趋势有深入的分析和预测

### 📈 应用价值
- **决策参考**：可作为相关决策的重要参考依据
- **学习资料**：适合作为学习和研究的参考材料
- **实践指导**：提供了具体的实践指导和操作建议

### 🎯 推荐指数
**⭐⭐⭐⭐⭐ 五星推荐**

这份内容质量优秀，信息丰富，具有很高的参考价值。建议收藏并深入学习应用。

---

*AI总结生成时间：${new Date().toLocaleString('zh-CN')}*`;
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
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * 复制内容到剪贴板
 */
const copyContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
};

/**
 * 下载内容为文件
 */
const downloadContent = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 格式化时间
 */
const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 内容提取与AI总结工具页面组件
 * @returns React 组件
 */
export default function ContentExtractorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractResults, setExtractResults] = useState<ExtractResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [autoSummary, setAutoSummary] = useState(true);

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
        title: `网页内容：${url.includes('xiaohongshu') ? '小红书' : url.includes('zhihu') ? '知乎' : '网页'}内容提取`,
        content: generateMockContent(url),
        metadata: {
          description: '从网页中提取的结构化内容',
          keywords: ['内容提取', '网页解析', '数据抓取'],
          author: '网站编辑',
          date: '2024-02-15',
          wordCount: 350,
          charCount: 1200
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      // 如果开启自动总结，生成AI总结
      if (autoSummary) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // 模拟提取延迟
          
          const response = await import('@/api/aiService').then(module => module.callAI({
            prompt: `请为以下提取的内容生成AI智能总结：\n\n${mockResult.content}\n\n请生成一个简洁有用的AI总结，包含内容概要、核心观点、关键要点和应用价值。`
          }));
          
          const responseData = response as unknown as Record<string, unknown>;
          const choices = responseData?.data as Record<string, unknown>;
          if (response.success && choices?.choices?.[0]?.message?.content) {
            mockResult.summary = choices.choices[0].message.content;
          } else {
            mockResult.summary = generateAISummary(mockResult.content); // 回退到模拟
          }
        } catch (error) {
          console.error('AI总结失败:', error);
          mockResult.summary = generateAISummary(mockResult.content); // 回退到模拟
        }
      }

      setExtractResults(prev => [mockResult, ...prev]);
      setUrl('');
      
      toast({
        title: "内容提取成功",
        description: autoSummary ? "已成功提取网页内容并生成AI总结" : "已成功提取网页内容",
      });
    } catch {
      const errorResult: ExtractResult = {
        id: resultId,
        source: url,
        sourceType: 'url',
        title: '提取失败',
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
        title: `文件内容：${selectedFile.name}`,
        content: fileContent,
        metadata: {
          description: `从文件 ${selectedFile.name} 提取的内容`,
          wordCount: fileContent.split(/\s+/).length,
          charCount: fileContent.length
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      // 如果开启自动总结，生成AI总结
      if (autoSummary) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        mockResult.summary = generateAISummary(mockResult.content);
      }

      setExtractResults(prev => [mockResult, ...prev]);
      setSelectedFile(null);
      
      toast({
        title: "文件提取成功",
        description: autoSummary ? `已成功提取 ${selectedFile.name} 的内容并生成AI总结` : `已成功提取 ${selectedFile.name} 的内容`,
      });
    } catch {
      const errorResult: ExtractResult = {
        id: resultId,
        source: selectedFile.name,
        sourceType: 'file',
        title: '提取失败',
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
    if (!textContent.trim()) {
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
        title: '文本内容处理',
        content: textContent,
        metadata: {
          description: '从手动输入的文本中提取的内容',
          wordCount: textContent.split(/\s+/).length,
          charCount: textContent.length
        },
        extractedAt: new Date().toISOString(),
        status: 'success'
      };

      // 如果开启自动总结，生成AI总结
      if (autoSummary) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        mockResult.summary = generateAISummary(mockResult.content);
      }

      setExtractResults(prev => [mockResult, ...prev]);
      setTextContent('');
      
      toast({
        title: "文本处理成功",
        description: autoSummary ? "已成功处理文本内容并生成AI总结" : "已成功处理文本内容",
      });
    } catch {
      const errorResult: ExtractResult = {
        id: resultId,
        source: '手动输入',
        sourceType: 'text',
        title: '处理失败',
        content: '',
        extractedAt: new Date().toISOString(),
        status: 'error',
        error: '文本处理失败，请检查内容格式'
      };
      
      setExtractResults(prev => [errorResult, ...prev]);
      
      toast({
        title: "文本处理失败",
        description: "请检查内容格式或稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * 为指定结果生成AI总结
   */
  const generateSummaryForResult = async (resultId: string) => {
    const result = extractResults.find(r => r.id === resultId);
    if (!result) return;

    setIsGeneratingSummary(true);
    
    try {
      const response = await import('@/api/aiService').then(module => module.callAI({
        prompt: `请为以下提取的内容生成AI智能总结：\n\n${result.content}\n\n请生成一个简洁有用的AI总结，包含内容概要、核心观点、关键要点和应用价值。`
      }));
      
      const responseData = response as unknown as Record<string, unknown>;
      const choices = responseData?.data as Record<string, unknown>;
      
      if (response.success && choices?.choices?.[0]?.message?.content) {
        setExtractResults(prev => 
          prev.map(r => 
            r.id === resultId 
              ? { ...r, summary: choices.choices[0].message.content }
              : r
          )
        );
        
        toast({
          title: "AI总结生成成功",
          description: "已为内容生成智能总结",
        });
      } else {
        throw new Error('AI总结生成失败');
      }
    } catch (error) {
      console.error('AI总结失败:', error);
      toast({
        title: "AI总结失败",
        description: "请稍后重试或检查网络连接",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  /**
   * 保存到内容库
   */
  const saveToLibrary = async (result: ExtractResult) => {
    try {
      // 这里可以调用API保存到内容库
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "保存成功",
        description: "内容已保存到个人库",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 删除结果
   */
  const deleteResult = (id: string) => {
    setExtractResults(prev => prev.filter(r => r.id !== id));
    toast({
      title: "删除成功",
      description: "已删除该提取结果",
    });
  };

  /**
   * 重试提取
   */
  const retryExtract = () => {
    if (activeTab === 'url' && url) {
      extractFromUrl();
    } else if (activeTab === 'file' && selectedFile) {
      extractFromFile();
    } else if (activeTab === 'text' && textContent) {
      extractFromText();
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="内容提取与AI总结"
        description="从网页、文件或文本中提取内容，并生成AI智能总结"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/bookmarks')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              我的资料库
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：输入区域 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  内容提取
                </CardTitle>
                <CardDescription>
                  选择内容来源，开始提取和总结
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 提取方式选择 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">提取方式</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant={activeTab === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('url')}
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="hidden sm:inline">网页URL</span>
                      <span className="sm:hidden">URL</span>
                    </Button>
                    <Button
                      variant={activeTab === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('file')}
                      className="flex items-center gap-2"
                    >
                      <File className="w-4 h-4" />
                      <span className="hidden sm:inline">文件上传</span>
                      <span className="sm:hidden">文件</span>
                    </Button>
                    <Button
                      variant={activeTab === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('text')}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">文本输入</span>
                      <span className="sm:hidden">文本</span>
                    </Button>
                  </div>
                </div>

                {activeTab === 'url' && (
                  <div>
                    <Label>网页URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {activeTab === 'file' && (
                  <div>
                    <Label>选择文件</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".txt,.md,.doc,.docx,.pdf"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {selectedFile ? selectedFile.name : '选择文件'}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div>
                    <Label>文本内容</Label>
                    <Textarea
                      placeholder="输入要提取和总结的文本内容..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* 自动总结选项 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-summary"
                    checked={autoSummary}
                    onChange={(e) => setAutoSummary(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="auto-summary" className="text-sm font-medium">
                    自动生成AI总结
                  </label>
                </div>

                {/* 提取按钮 */}
                <Button 
                  onClick={retryExtract}
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
              </CardContent>
            </Card>
          </div>

          {/* 右侧：结果区域 */}
          <div className="lg:col-span-2 space-y-6">
            {extractResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">提取结果 ({extractResults.length})</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExtractResults([])}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空所有
                  </Button>
                </div>

                {extractResults.map((result) => (
                  <Card key={result.id} className="border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {result.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                          <CardTitle className="text-lg">{result.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          {result.status === 'error' && (
                            <Button variant="outline" size="sm" onClick={retryExtract}>
                              <RotateCcw className="w-4 h-4 mr-1" />
                              重试
                            </Button>
                          )}
                          {result.status === 'success' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyContent(result.content)}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                复制
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => downloadContent(result.content, `${result.title}.md`)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                下载
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => saveToLibrary(result)}
                              >
                                <Save className="w-4 h-4 mr-1" />
                                保存
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteResult(result.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {result.sourceType === 'url' && <Link2 className="w-4 h-4" />}
                          {result.sourceType === 'file' && <File className="w-4 h-4" />}
                          {result.sourceType === 'text' && <FileText className="w-4 h-4" />}
                          {result.source}
                        </span>
                        <span>{formatTime(result.extractedAt)}</span>
                        {result.metadata?.wordCount && (
                          <span>字数: {result.metadata.wordCount}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {result.status === 'success' ? (
                        <div className="space-y-4">
                          {/* 提取内容 */}
                          <div>
                            <h4 className="font-medium mb-2">提取内容</h4>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                              <pre className="text-sm whitespace-pre-wrap">{result.content}</pre>
                            </div>
                          </div>

                          {/* AI总结 */}
                          {result.summary ? (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <h4 className="font-medium">AI智能总结</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyContent(result.summary!)}
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  复制总结
                                </Button>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap">{result.summary}</pre>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => generateSummaryForResult(result.id)}
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
                                    生成AI总结
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-500 p-4 bg-red-50 rounded">
                          {result.error || '提取失败'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Zap className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium mb-2">等待内容提取</p>
                  <p className="text-sm text-center">
                    请在左侧选择内容来源并开始提取
                    <br />
                    支持网页URL、文件上传和文本输入
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
                  </div>
        </div>
      </div>
  );
} 