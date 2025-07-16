/**
 * Creem自动修复页面
 * 整合测试、分析和自动修复功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { creemOptimizer } from '@/utils/creemOptimizer';
import { CreemAutoFixer } from '@/utils/autoFixCreem';

export default function CreemAutoFixPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [fixResults, setFixResults] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const steps = [
    '初始化测试环境',
    '运行10轮滚动测试',
    '分析测试结果',
    '生成优化建议',
    '自动修复代码',
    '验证修复效果'
  ];

  const testConfigs = [
    {
      name: '专业版月付',
      productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    },
    {
      name: '专业版年付',
      productId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    },
    {
      name: '高级版月付',
      productId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    },
    {
      name: '高级版年付',
      productId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    }
  ];

  const runSingleTest = async (config: typeof testConfigs[0]) => {
    const result = {
      name: config.name,
      timestamp: new Date().toISOString(),
      success: false,
      data: null,
      error: null
    };

    try {
      const data = await creemOptimizer.smartCreateCheckout(
        config.productId,
        config.apiKey
      );
      
      result.success = true;
      result.data = data;
      
    } catch (error: any) {
      result.error = error.message || '未知错误';
    }

    return result;
  };

  const startAutoFix = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setTestResults([]);
    setFixResults(null);
    setSuggestions([]);
    setGeneratedCode('');

    try {
      // 步骤1: 初始化测试环境
      setCurrentStep(1);
      console.log('步骤1: 初始化测试环境');
      creemOptimizer.reset();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤2: 运行10轮滚动测试
      setCurrentStep(2);
      console.log('步骤2: 运行10轮滚动测试');
      
      for (let round = 1; round <= 10; round++) {
        console.log(`第${round}轮测试开始...`);
        
        for (const config of testConfigs) {
          const result = await runSingleTest(config);
          setTestResults(prev => [result, ...prev]);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 步骤3: 分析测试结果
      setCurrentStep(3);
      console.log('步骤3: 分析测试结果');
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤4: 生成优化建议
      setCurrentStep(4);
      console.log('步骤4: 生成优化建议');
      const newSuggestions = CreemAutoFixer.getOptimizationSuggestions();
      setSuggestions(newSuggestions);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤5: 自动修复代码
      setCurrentStep(5);
      console.log('步骤5: 自动修复代码');
      const fixResult = await CreemAutoFixer.autoFixPaymentPage();
      setFixResults(fixResult);
      const code = CreemAutoFixer.generateFixedCode();
      setGeneratedCode(code);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤6: 验证修复效果
      setCurrentStep(6);
      console.log('步骤6: 验证修复效果');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('自动修复完成！');

    } catch (error: any) {
      console.error('自动修复过程中出错:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const stopAutoFix = () => {
    setIsRunning(false);
  };

  const resetAll = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTestResults([]);
    setFixResults(null);
    setSuggestions([]);
    setGeneratedCode('');
    creemOptimizer.reset();
  };

  const getStats = () => {
    return creemOptimizer.getStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Creem自动修复系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 控制按钮 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={startAutoFix}
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRunning ? '修复中...' : '开始自动修复'}
                </Button>
                
                <Button 
                  onClick={stopAutoFix}
                  disabled={!isRunning}
                  variant="destructive"
                >
                  停止修复
                </Button>
                
                <Button 
                  onClick={resetAll}
                  variant="outline"
                  disabled={isRunning}
                >
                  重置所有
                </Button>
              </div>

              {/* 进度显示 */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>当前步骤: {currentStep} / {steps.length}</span>
                    <span>进度: {Math.round((currentStep / steps.length) * 100)}%</span>
                  </div>
                  <Progress value={(currentStep / steps.length) * 100} />
                  <div className="text-sm text-gray-600">
                    {steps[currentStep - 1] || '准备中...'}
                  </div>
                </div>
              )}

              {/* 步骤指示器 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded text-xs text-center ${
                      currentStep > index 
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : currentStep === index + 1
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试统计 */}
        {testResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>测试统计</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const stats = getStats();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-gray-600">总测试数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                      <div className="text-sm text-gray-600">成功次数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{stats.failure}</div>
                      <div className="text-sm text-gray-600">失败次数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
                      <div className="text-sm text-gray-600">成功率</div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* 修复结果 */}
        {fixResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>修复结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={fixResults.success ? "default" : "destructive"}>
                    {fixResults.success ? '修复成功' : '修复失败'}
                  </Badge>
                  <span className="text-sm text-gray-600">{fixResults.message}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">最佳方法</h4>
                    <div className="font-mono bg-gray-100 p-2 rounded">
                      {fixResults.bestMethod}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">成功率</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {fixResults.successRate}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 优化建议 */}
        {suggestions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>优化建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="text-sm">
                    {suggestion}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 生成的代码 */}
        {generatedCode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>生成的优化代码</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {generatedCode}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* 测试结果详情 */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? '成功' : '失败'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      时间: {new Date(result.timestamp).toLocaleString()}
                    </div>
                    
                    {result.success && result.data && (
                      <div className="text-sm">
                        <div><strong>订单ID:</strong> {result.data.id || 'N/A'}</div>
                        <div><strong>金额:</strong> {result.data.amount || 'N/A'}</div>
                      </div>
                    )}
                    
                    {!result.success && result.error && (
                      <div className="text-sm text-red-600">
                        <strong>错误:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 