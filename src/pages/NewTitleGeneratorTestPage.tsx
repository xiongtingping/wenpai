/**
 * 新标题生成器测试页面
 * 测试重构后的标题生成系统
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react';

// 导入新的标题生成系统
import {
  TitleGenerator,
  titleGenerationService,
  SYSTEM_INFO
} from '@/features/titleGeneration';
import { titleCache } from '@/features/titleGeneration/services/CacheService';
import PerformanceMonitorComponent from '@/features/titleGeneration/components/PerformanceMonitor';

const NewTitleGeneratorTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    result?: any;
    error?: string;
    duration?: number;
  }>>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // 测试用例
  const testCases = [
    {
      name: '基础功能测试',
      test: async () => {
        const result = await titleGenerationService.generateTitles({
          content: '今天学习了React Hook的使用方法，包括useState、useEffect等常用Hook，感觉对组件状态管理有了更深的理解。',
          platform: 'xiaohongshu',
          stylePreference: ['informative', 'engaging'],
          outputCount: 3
        });
        
        if (result.titles.length !== 3) {
          throw new Error(`期望生成3个标题，实际生成${result.titles.length}个`);
        }
        
        return result;
      }
    },
    {
      name: '缓存机制测试',
      test: async () => {
        const input = {
          content: '测试缓存功能的内容，这是一个用于验证缓存是否正常工作的测试用例。',
          platform: 'weibo' as const,
          stylePreference: ['informative' as const],
          outputCount: 2
        };
        
        // 第一次调用
        const result1 = await titleGenerationService.generateTitles(input);
        
        // 第二次调用应该命中缓存
        const result2 = await titleGenerationService.generateTitles(input);
        
        if (!result2.cacheHit) {
          throw new Error('缓存未命中');
        }
        
        return { result1, result2, cacheHit: result2.cacheHit };
      }
    },
    {
      name: '质量评分测试',
      test: async () => {
        const score = await titleGenerationService.evaluateQuality(
          'React Hook 学习指南：从入门到精通',
          'React Hook是React 16.8引入的新特性，让函数组件也能使用状态和其他React特性。',
          'zhihu'
        );
        
        if (score.overallScore < 0 || score.overallScore > 1) {
          throw new Error(`评分超出范围: ${score.overallScore}`);
        }
        
        return score;
      }
    },
    {
      name: '平台配置测试',
      test: async () => {
        const xiaohongshuConfig = titleGenerationService.getPlatformConfig('xiaohongshu');
        const zhihuConfig = titleGenerationService.getPlatformConfig('zhihu');
        
        if (xiaohongshuConfig.maxLength === zhihuConfig.maxLength) {
          throw new Error('不同平台配置应该不同');
        }
        
        return { xiaohongshuConfig, zhihuConfig };
      }
    },
    {
      name: '错误处理测试',
      test: async () => {
        try {
          await titleGenerationService.generateTitles({
            content: '', // 空内容应该抛出错误
            platform: 'default',
            outputCount: 1
          });
          throw new Error('应该抛出错误但没有');
        } catch (error) {
          if (error instanceof Error && error.message.includes('内容长度')) {
            return { errorHandled: true, errorMessage: error.message };
          }
          throw error;
        }
      }
    }
  ];

  const runTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      // 更新状态为运行中
      setTestResults(prev => [
        ...prev,
        { name: testCase.name, status: 'running' }
      ]);

      try {
        const startTime = performance.now();
        const result = await testCase.test();
        const duration = performance.now() - startTime;

        // 更新状态为成功
        setTestResults(prev => prev.map((item, index) => 
          index === i 
            ? { ...item, status: 'success', result, duration }
            : item
        ));
      } catch (error) {
        // 更新状态为失败
        setTestResults(prev => prev.map((item, index) => 
          index === i 
            ? { 
                ...item, 
                status: 'error', 
                error: error instanceof Error ? error.message : String(error) 
              }
            : item
        ));
      }

      // 添加延迟以便观察进度
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
  };

  const clearCache = () => {
    titleCache.clear();
    alert('缓存已清空');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-foreground" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-border bg-accent';
      case 'success':
        return 'border-border bg-accent';
      case 'error':
        return 'border-border bg-accent';
      default:
        return 'border-border';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testCases.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">新标题生成器测试</h1>
        <p className="text-muted-foreground">测试重构后的标题生成系统</p>
      </div>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">版本:</span>
              <span className="ml-2 font-medium">{SYSTEM_INFO.version}</span>
            </div>
            <div>
              <span className="text-muted-foreground">构建日期:</span>
              <span className="ml-2 font-medium">{SYSTEM_INFO.buildDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">支持平台:</span>
              <span className="ml-2 font-medium">{SYSTEM_INFO.supportedPlatforms.length}个</span>
            </div>
            <div>
              <span className="text-muted-foreground">支持风格:</span>
              <span className="ml-2 font-medium">{SYSTEM_INFO.supportedStyles.length}个</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-muted-foreground">功能特性:</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {SYSTEM_INFO.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 测试控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            测试控制
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={runTests} 
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  运行测试
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={clearCache}>
              清空缓存
            </Button>

            {testResults.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span className="text-foreground">✅ {successCount}</span>
                <span className="text-destructive">❌ {errorCount}</span>
                <span className="text-muted-foreground">总计: {totalTests}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                      {result.duration && (
                        <Badge variant="outline" className="text-xs">
                          {result.duration.toFixed(0)}ms
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result.result && result.status === 'success' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <pre className="bg-accent p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能监控 */}
      <PerformanceMonitorComponent />

      {/* 实际组件测试 */}
      <Card>
        <CardHeader>
          <CardTitle>组件测试</CardTitle>
        </CardHeader>
        <CardContent>
          <TitleGenerator
            content="这是一个测试内容，用于验证新的标题生成器组件是否正常工作。包含了React、TypeScript、性能优化等技术要点。"
            platform="xiaohongshu"
            stylePreference={['engaging', 'creative']}
            outputCount={3}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTitleGeneratorTestPage;
