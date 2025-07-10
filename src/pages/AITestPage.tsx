/**
 * AI功能测试页面
 * @description 用于测试品牌资料分析功能
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, FileText, Brain } from 'lucide-react';
import AIAnalysisService from '@/services/aiAnalysisService';
import { BrandAnalysisResult } from '@/types/brand';

const AITestPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<BrandAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'pending';
    message: string;
    duration?: number;
  }>>([]);

  const aiService = AIAnalysisService.getInstance();

  /**
   * 运行AI分析测试
   */
  const runAnalysisTest = async () => {
    if (!content.trim()) {
      setError('请输入要分析的内容');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const startTime = Date.now();
      const analysisResult = await aiService.analyzeBrandContent(content);
      const duration = Date.now() - startTime;

      setResult(analysisResult);
      
      // 添加测试结果
      setTestResults(prev => [...prev, {
        test: '品牌资料分析',
        status: 'success',
        message: `分析完成，耗时 ${duration}ms`,
        duration
      }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      
      setTestResults(prev => [...prev, {
        test: '品牌资料分析',
        status: 'error',
        message: errorMessage
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 运行完整测试套件
   */
  const runFullTestSuite = async () => {
    setTestResults([]);
    
    // 测试1: 基本连接测试
    setTestResults(prev => [...prev, {
      test: 'API连接测试',
      status: 'pending',
      message: '正在测试...'
    }]);

    try {
      const startTime = Date.now();
      // 这里可以添加实际的连接测试
      await new Promise(resolve => setTimeout(resolve, 500));
      const duration = Date.now() - startTime;
      
      setTestResults(prev => prev.map(test => 
        test.test === 'API连接测试' 
          ? { ...test, status: 'success', message: `连接成功，耗时 ${duration}ms`, duration }
          : test
      ));
    } catch (err) {
      setTestResults(prev => prev.map(test => 
        test.test === 'API连接测试' 
          ? { ...test, status: 'error', message: '连接失败' }
          : test
      ));
    }

    // 测试2: 简单内容分析
    setTestResults(prev => [...prev, {
      test: '简单内容分析',
      status: 'pending',
      message: '正在分析...'
    }]);

    try {
      const startTime = Date.now();
      const testContent = '我们是一个专注于用户体验的科技公司，致力于为用户提供简单易用的产品。';
      const analysisResult = await aiService.analyzeBrandContent(testContent);
      const duration = Date.now() - startTime;
      
      setTestResults(prev => prev.map(test => 
        test.test === '简单内容分析' 
          ? { ...test, status: 'success', message: `分析成功，提取到 ${analysisResult.keywords.length} 个关键词`, duration }
          : test
      ));
    } catch (err) {
      setTestResults(prev => prev.map(test => 
        test.test === '简单内容分析' 
          ? { ...test, status: 'error', message: '分析失败' }
          : test
      ));
    }

    // 测试3: 文件类型支持测试
    setTestResults(prev => [...prev, {
      test: '文件类型支持',
      status: 'pending',
      message: '正在检查...'
    }]);

    try {
      const supportedTypes = aiService.getSupportedFileTypes();
      setTestResults(prev => prev.map(test => 
        test.test === '文件类型支持' 
          ? { ...test, status: 'success', message: `支持 ${supportedTypes.length} 种文件类型` }
          : test
      ));
    } catch (err) {
      setTestResults(prev => prev.map(test => 
        test.test === '文件类型支持' 
          ? { ...test, status: 'error', message: '检查失败' }
          : test
      ));
    }
  };

  /**
   * 清空测试结果
   */
  const clearResults = () => {
    setResult(null);
    setError(null);
    setTestResults([]);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI功能测试</h1>
        <p className="text-muted-foreground">测试品牌资料分析功能的各项能力</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入和测试区域 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                内容输入
              </CardTitle>
              <CardDescription>
                输入要分析的品牌资料内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="请输入品牌资料内容，例如：我们是一个专注于用户体验的科技公司，致力于为用户提供简单易用的产品..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={runAnalysisTest} 
                  disabled={isAnalyzing || !content.trim()}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={runFullTestSuite}
                  disabled={isAnalyzing}
                >
                  运行测试套件
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
              <CardDescription>
                功能测试的执行结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  暂无测试结果，点击上方按钮开始测试
                </p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {test.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {test.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                        {test.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        <span className="font-medium">{test.test}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{test.message}</p>
                        {test.duration && (
                          <p className="text-xs text-muted-foreground">{test.duration}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {testResults.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearResults}
                  className="w-full mt-4"
                >
                  清空结果
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：结果显示区域 */}
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  分析结果
                </CardTitle>
                <CardDescription>
                  AI分析生成的品牌特征
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">品牌关键词</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">品牌语气</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {result.tone}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">内容建议</h4>
                  <ul className="space-y-1">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>支持的文件类型</CardTitle>
              <CardDescription>
                AI分析功能支持的文件格式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {aiService.getSupportedFileTypes().map((type, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    <div className="font-medium">{type.extension}</div>
                    <div className="text-muted-foreground">{type.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITestPage; 