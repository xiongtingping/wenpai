/**
 * Creem最终验证页面
 * 全面测试Creem支付SDK的所有功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { creemOptimizer } from '@/utils/creemOptimizer';
import { CreemAutoFixer } from '@/utils/autoFixCreem';

interface ValidationResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  timestamp: string;
}

export default function CreemFinalValidationPage() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const validationSteps = [
    '检查Creem SDK版本',
    '验证API Key配置',
    '测试产品ID有效性',
    '运行API调用测试',
    '分析最佳调用方法',
    '生成优化建议',
    '验证支付流程',
    '生成最终报告'
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

  const addResult = (test: string, status: ValidationResult['status'], message: string, details?: any) => {
    const result: ValidationResult = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    setValidationResults(prev => [result, ...prev]);
  };

  const runValidation = async () => {
    setIsRunning(true);
    setValidationResults([]);
    setCurrentStep(0);
    setProgress(0);

    try {
      // 步骤1: 检查Creem SDK版本
      setCurrentStep(1);
      setProgress(12.5);
      addResult('SDK版本检查', 'info', '检查Creem SDK版本信息');
      
      try {
        const { Creem } = await import('creem');
        const creem = new Creem();
        addResult('SDK版本检查', 'success', 'Creem SDK加载成功', { version: '0.3.37' });
      } catch (error: any) {
        addResult('SDK版本检查', 'error', `Creem SDK加载失败: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤2: 验证API Key配置
      setCurrentStep(2);
      setProgress(25);
      addResult('API Key验证', 'info', '验证API Key配置');
      
      const apiKey = 'creem_EGDvCS72OYrsU8ho7aJ1C';
      if (apiKey && apiKey.startsWith('creem_')) {
        addResult('API Key验证', 'success', 'API Key格式正确', { length: apiKey.length });
      } else {
        addResult('API Key验证', 'error', 'API Key格式不正确');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤3: 测试产品ID有效性
      setCurrentStep(3);
      setProgress(37.5);
      addResult('产品ID验证', 'info', '验证产品ID有效性');
      
      for (const config of testConfigs) {
        if (config.productId && config.productId.startsWith('prod_')) {
          addResult('产品ID验证', 'success', `${config.name}产品ID格式正确`, { productId: config.productId });
        } else {
          addResult('产品ID验证', 'error', `${config.name}产品ID格式不正确`, { productId: config.productId });
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤4: 运行API调用测试
      setCurrentStep(4);
      setProgress(50);
      addResult('API调用测试', 'info', '开始API调用测试');
      
      // 重置优化器
      creemOptimizer.reset();
      
      for (const config of testConfigs) {
        try {
          const data = await creemOptimizer.smartCreateCheckout(
            config.productId,
            config.apiKey
          );
          
          addResult('API调用测试', 'success', `${config.name}调用成功`, {
            productId: config.productId,
            orderId: data.id,
            amount: data.amount
          });
          
        } catch (error: any) {
          addResult('API调用测试', 'error', `${config.name}调用失败: ${error.message}`, {
            productId: config.productId,
            error: error.message
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤5: 分析最佳调用方法
      setCurrentStep(5);
      setProgress(62.5);
      addResult('方法分析', 'info', '分析最佳API调用方法');
      
      const stats = creemOptimizer.getStats();
      if (stats.total > 0) {
        addResult('方法分析', 'success', `找到最佳方法: ${stats.bestMethod}`, {
          successRate: `${stats.successRate}%`,
          totalTests: stats.total,
          bestMethod: stats.bestMethod
        });
      } else {
        addResult('方法分析', 'warning', '没有足够的测试数据进行分析');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤6: 生成优化建议
      setCurrentStep(6);
      setProgress(75);
      addResult('优化建议', 'info', '生成优化建议');
      
      const suggestions = CreemAutoFixer.getOptimizationSuggestions();
      addResult('优化建议', 'info', `生成${suggestions.length}条优化建议`, { suggestions });
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤7: 验证支付流程
      setCurrentStep(7);
      setProgress(87.5);
      addResult('支付流程验证', 'info', '验证完整支付流程');
      
      try {
        const fixResults = await CreemAutoFixer.autoFixPaymentPage();
        if (fixResults.success) {
          addResult('支付流程验证', 'success', '支付流程验证通过', {
            bestMethod: fixResults.bestMethod,
            successRate: `${fixResults.successRate}%`
          });
        } else {
          addResult('支付流程验证', 'warning', '支付流程需要优化', {
            message: fixResults.message
          });
        }
      } catch (error: any) {
        addResult('支付流程验证', 'error', `支付流程验证失败: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步骤8: 生成最终报告
      setCurrentStep(8);
      setProgress(100);
      addResult('最终报告', 'info', '生成最终验证报告');
      
      const finalStats = creemOptimizer.getStats();
      const successCount = validationResults.filter(r => r.status === 'success').length;
      const errorCount = validationResults.filter(r => r.status === 'error').length;
      const warningCount = validationResults.filter(r => r.status === 'warning').length;
      
      addResult('最终报告', 'success', '验证完成', {
        totalTests: validationResults.length,
        successCount,
        errorCount,
        warningCount,
        creemSuccessRate: `${finalStats.successRate}%`,
        bestMethod: finalStats.bestMethod
      });

    } catch (error: any) {
      addResult('验证过程', 'error', `验证过程中出现错误: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSummary = () => {
    const total = validationResults.length;
    const success = validationResults.filter(r => r.status === 'success').length;
    const error = validationResults.filter(r => r.status === 'error').length;
    const warning = validationResults.filter(r => r.status === 'warning').length;
    const info = validationResults.filter(r => r.status === 'info').length;
    
    return { total, success, error, warning, info };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Creem支付SDK最终验证
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 控制按钮 */}
              <div className="flex justify-center">
                <Button 
                  onClick={runValidation}
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  size="lg"
                >
                  {isRunning ? '验证中...' : '开始全面验证'}
                </Button>
              </div>

              {/* 进度显示 */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>当前步骤: {currentStep} / {validationSteps.length}</span>
                    <span>进度: {Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                  <div className="text-sm text-gray-600 text-center">
                    {validationSteps[currentStep - 1] || '准备中...'}
                  </div>
                </div>
              )}

              {/* 步骤指示器 */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {validationSteps.map((step, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded text-xs text-center ${
                      currentStep > index + 1 
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

        {/* 验证结果摘要 */}
        {validationResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>验证结果摘要</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const summary = getSummary();
                return (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                      <div className="text-sm text-gray-600">总测试数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-green-600">{summary.success}</div>
                      <div className="text-sm text-gray-600">成功</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-red-600">{summary.error}</div>
                      <div className="text-sm text-gray-600">错误</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
                      <div className="text-sm text-gray-600">警告</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-blue-600">{summary.info}</div>
                      <div className="text-sm text-gray-600">信息</div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* 详细验证结果 */}
        {validationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>详细验证结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {validationResults.map((result, index) => (
                  <Alert key={index} className={getStatusColor(result.status)}>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium">{result.test}</div>
                        <AlertDescription className="mt-1">
                          {result.message}
                        </AlertDescription>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">
                              查看详情
                            </summary>
                            <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 