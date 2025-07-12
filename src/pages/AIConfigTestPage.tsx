import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { callOpenAIProxy } from '@/api/localApiProxy';
import aiService from '@/api/aiService';

/**
 * AI配置测试页面
 * @description 用于测试AI API配置是否正确
 */
const AIConfigTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    netlify: { status: 'idle' | 'testing' | 'success' | 'error'; message?: string };
    dev: { status: 'idle' | 'testing' | 'success' | 'error'; message?: string };
  }>({
    netlify: { status: 'idle' },
    dev: { status: 'idle' }
  });

  const [isTesting, setIsTesting] = useState(false);

  /**
   * 测试Netlify Functions API
   */
  const testNetlifyAPI = async () => {
    setTestResults(prev => ({
      ...prev,
      netlify: { status: 'testing' }
    }));

    try {
      const response = await callOpenAIProxy([
        { role: 'user', content: '请回复"测试成功"三个字' }
      ], 'gpt-4o', 0.1, 50);

      if (response.success) {
        setTestResults(prev => ({
          ...prev,
          netlify: { status: 'success', message: 'Netlify Functions API 配置正确' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          netlify: { status: 'error', message: response.error || '未知错误' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        netlify: { 
          status: 'error', 
          message: error instanceof Error ? error.message : '测试失败' 
        }
      }));
    }
  };

  /**
   * 测试开发环境API
   */
  const testDevAPI = async () => {
    setTestResults(prev => ({
      ...prev,
      dev: { status: 'testing' }
    }));

    try {
      const response = await aiService.generateText({
        messages: [
          { role: 'user', content: '请用一句话介绍一下你自己。' }
        ],
        provider: 'openai'
      });

      if (response.success) {
        setTestResults(prev => ({
          ...prev,
          dev: { status: 'success', message: '开发环境 API 配置正确' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          dev: { status: 'error', message: response.error || '未知错误' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        dev: { 
          status: 'error', 
          message: error instanceof Error ? error.message : '测试失败' 
        }
      }));
    }
  };

  /**
   * 运行所有测试
   */
  const runAllTests = async () => {
    setIsTesting(true);
    await Promise.all([testNetlifyAPI(), testDevAPI()]);
    setIsTesting(false);
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 AI API 配置测试</h1>
        <p className="text-gray-600">
          测试您的 AI API 配置是否正确，确保所有 AI 功能正常工作。
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>重要提示：</strong> 请确保您已配置正确的 API 密钥。如果测试失败，请参考{' '}
          <a href="/ai-api-setup" className="text-blue-600 hover:underline">AI_API_SETUP.md</a> 进行配置。
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Netlify Functions 测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(testResults.netlify.status)}
              Netlify Functions API
            </CardTitle>
            <CardDescription>
              测试生产环境的 Netlify Functions API 配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className={getStatusColor(testResults.netlify.status)}>
                {testResults.netlify.status === 'idle' && '未测试'}
                {testResults.netlify.status === 'testing' && '测试中...'}
                {testResults.netlify.status === 'success' && '配置正确'}
                {testResults.netlify.status === 'error' && '配置错误'}
              </Badge>
              
              {testResults.netlify.message && (
                <p className="text-sm text-gray-600">
                  {testResults.netlify.message}
                </p>
              )}

              <Button 
                onClick={testNetlifyAPI}
                disabled={testResults.netlify.status === 'testing'}
                variant="outline"
                className="w-full"
              >
                {testResults.netlify.status === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    测试中...
                  </>
                ) : (
                  '测试 Netlify Functions'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 开发环境 API 测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(testResults.dev.status)}
              开发环境 API
            </CardTitle>
            <CardDescription>
              测试开发环境的直接 API 调用配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className={getStatusColor(testResults.dev.status)}>
                {testResults.dev.status === 'idle' && '未测试'}
                {testResults.dev.status === 'testing' && '测试中...'}
                {testResults.dev.status === 'success' && '配置正确'}
                {testResults.dev.status === 'error' && '配置错误'}
              </Badge>
              
              {testResults.dev.message && (
                <p className="text-sm text-gray-600">
                  {testResults.dev.message}
                </p>
              )}

              <Button 
                onClick={testDevAPI}
                disabled={testResults.dev.status === 'testing'}
                variant="outline"
                className="w-full"
              >
                {testResults.dev.status === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    测试中...
                  </>
                ) : (
                  '测试开发环境 API'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 批量测试按钮 */}
      <div className="mt-8 text-center">
        <Button 
          onClick={runAllTests}
          disabled={isTesting}
          size="lg"
          className="px-8"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              运行所有测试...
            </>
          ) : (
            '运行所有测试'
          )}
        </Button>
      </div>

      {/* 配置说明 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📋 配置说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">开发环境配置：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>编辑 <code className="bg-gray-100 px-1 rounded">src/api/devApiProxy.ts</code> 文件</li>
                <li>或创建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件</li>
                <li>运行 <code className="bg-gray-100 px-1 rounded">./setup-ai-api.sh</code> 快速配置</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">生产环境配置：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>在 Netlify 控制台设置环境变量</li>
                <li>确保 <code className="bg-gray-100 px-1 rounded">netlify/functions/api.js</code> 正确部署</li>
                <li>验证 Netlify Functions 是否正常工作</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">获取 API 密钥：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI API Keys</a></li>
                <li><a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DeepSeek API Keys</a></li>
                <li><a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Gemini API Keys</a></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigTestPage; 