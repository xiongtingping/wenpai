/**
 * AI配置测试页面
 * 用于调试环境变量配置问题
 * ✅ FIXED: 创建AI配置测试页面，用于调试环境变量问题
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

import React, { useState, useEffect } from 'react';
import { getAPIConfig, getConfigSummary } from '@/config/apiConfig';
import { callAI } from '@/api/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * AI配置测试页面组件
 */
const AIConfigTestPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [configSummary, setConfigSummary] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 获取配置信息
    const apiConfig = getAPIConfig();
    const summary = getConfigSummary();
    
    setConfig(apiConfig);
    setConfigSummary(summary);
  }, []);

  /**
   * 测试AI调用
   */
  const testAICall = async () => {
    setLoading(true);
    try {
      const result = await callAI({
        prompt: '请回复"AI配置测试成功"',
        model: 'gpt-4',
        maxTokens: 50
      });
      
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取配置状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  /**
   * 获取配置状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'missing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI配置测试页面</h1>
        <p className="text-gray-600">用于调试环境变量配置问题</p>
      </div>

      {/* 配置概览 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            配置概览
          </CardTitle>
          <CardDescription>
            当前环境变量配置状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{configSummary.totalConfigs}</div>
                <div className="text-sm text-gray-500">总配置项</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{configSummary.validConfigs}</div>
                <div className="text-sm text-gray-500">有效配置</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{configSummary.requiredConfigs}</div>
                <div className="text-sm text-gray-500">必需配置</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{configSummary.requiredValid}</div>
                <div className="text-sm text-gray-500">必需有效</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详细配置 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>详细配置</CardTitle>
          <CardDescription>
            各API配置的详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configSummary?.details.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
                <span className="text-sm text-gray-500">{item.description}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* OpenAI配置详情 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenAI配置详情</CardTitle>
          <CardDescription>
            OpenAI API配置的详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">API Key:</span>
              <span className="text-sm font-mono">
                {config?.openai?.apiKey ? 
                  (config.openai.apiKey.includes('{{') ? 
                    '❌ 环境变量未正确注入' : 
                    `${config.openai.apiKey.substring(0, 8)}...${config.openai.apiKey.substring(config.openai.apiKey.length - 4)}`
                  ) : 
                  '❌ 未配置'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Base URL:</span>
              <span className="text-sm">{config?.openai?.baseURL || '未配置'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Model:</span>
              <span className="text-sm">{config?.openai?.model || '未配置'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Timeout:</span>
              <span className="text-sm">{config?.openai?.timeout || '未配置'}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI测试 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI功能测试</CardTitle>
          <CardDescription>
            测试AI调用是否正常工作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAICall} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? '测试中...' : '测试AI调用'}
          </Button>

          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {testResult.success ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <XCircle className="w-4 h-4 text-red-500" />
                }
                <AlertDescription>
                  {testResult.success ? (
                    <div>
                      <div className="font-medium text-green-800">AI调用成功</div>
                      <div className="text-sm text-green-600 mt-1">响应内容: {testResult.content}</div>
                      <div className="text-sm text-green-600">响应时间: {testResult.responseTime}ms</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-red-800">AI调用失败</div>
                      <div className="text-sm text-red-600 mt-1">错误信息: {testResult.error}</div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 环境信息 */}
      <Card>
        <CardHeader>
          <CardTitle>环境信息</CardTitle>
          <CardDescription>
            当前运行环境信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">环境:</span>
              <span className="text-sm">{config?.environment?.nodeEnv || '未知'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">开发模式:</span>
              <span className="text-sm">{config?.environment?.isDev ? '是' : '否'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">生产模式:</span>
              <span className="text-sm">{config?.environment?.isProd ? '是' : '否'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">调试模式:</span>
              <span className="text-sm">{config?.environment?.debugMode ? '开启' : '关闭'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">日志级别:</span>
              <span className="text-sm">{config?.environment?.logLevel || 'info'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigTestPage; 