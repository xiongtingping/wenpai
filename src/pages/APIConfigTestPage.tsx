/**
 * API配置测试页面
 * 用于测试和验证所有API配置是否正确
 */

import React, { useState, useEffect } from 'react';
import { checkAPIConfig, getConfigSummary, validateAPIProvider, getConfigSuggestions } from '@/utils/apiConfigChecker';
import { getAPIConfig } from '@/config/apiConfig';

/**
 * API配置测试页面组件
 */
const APIConfigTestPage: React.FC = () => {
  const [configResult, setConfigResult] = useState<ReturnType<typeof checkAPIConfig> | null>(null);
  const [configSummary, setConfigSummary] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    // 初始化配置检查
    const result = checkAPIConfig();
    const summary = getConfigSummary();
    const configSuggestions = getConfigSuggestions();
    
    setConfigResult(result);
    setConfigSummary(summary);
    setSuggestions(configSuggestions);
    setLoading(false);
  }, []);

  /**
   * 测试OpenAI API连接
   */
  const testOpenAI = async () => {
    setTestResults(prev => ({ ...prev, openai: { loading: true } }));
    
    try {
      const response = await fetch('/.netlify/functions/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai',
          action: 'status'
        })
      });
      
      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        openai: { 
          loading: false, 
          success: response.ok, 
          data 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        openai: { 
          loading: false, 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        } 
      }));
    }
  };

  /**
   * 测试DeepSeek API连接
   */
  const testDeepSeek = async () => {
    setTestResults(prev => ({ ...prev, deepseek: { loading: true } }));
    
    try {
      const response = await fetch('/.netlify/functions/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'deepseek',
          action: 'status'
        })
      });
      
      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        deepseek: { 
          loading: false, 
          success: response.ok, 
          data 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        deepseek: { 
          loading: false, 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        } 
      }));
    }
  };

  /**
   * 测试Authing配置
   */
  const testAuthing = async () => {
    setTestResults(prev => ({ ...prev, authing: { loading: true } }));
    
    try {
      const config = getAPIConfig();
      const isValid = !!(config.authing.appId && config.authing.host && config.authing.redirectUri);
      
      setTestResults(prev => ({ 
        ...prev, 
        authing: { 
          loading: false, 
          success: isValid, 
          data: { 
            appId: config.authing.appId,
            host: config.authing.host,
            redirectUri: config.authing.redirectUri
          } 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        authing: { 
          loading: false, 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        } 
      }));
    }
  };

  /**
   * 测试后端API连接
   */
  const testBackend = async () => {
    setTestResults(prev => ({ ...prev, backend: { loading: true } }));
    
    try {
      const config = getAPIConfig();
      const response = await fetch(`${config.backend.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        backend: { 
          loading: false, 
          success: response.ok, 
          data 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        backend: { 
          loading: false, 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        } 
      }));
    }
  };

  /**
   * 重新检查配置
   */
  const refreshConfig = () => {
    setLoading(true);
    setTimeout(() => {
      const result = checkAPIConfig();
      const summary = getConfigSummary();
      const configSuggestions = getConfigSuggestions();
      
      setConfigResult(result);
      setConfigSummary(summary);
      setSuggestions(configSuggestions);
      setLoading(false);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在检查API配置...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API配置测试</h1>
          <p className="text-gray-600">验证所有API配置是否正确设置</p>
        </div>

        {/* 配置状态概览 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">配置状态概览</h2>
            <button
              onClick={refreshConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              刷新配置
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${configResult?.config.openai.configured && configResult?.config.openai.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-medium text-gray-900">OpenAI</h3>
              <p className="text-sm text-gray-600">
                {configResult?.config.openai.configured 
                  ? (configResult?.config.openai.valid ? '✅ 已配置' : '⚠️ 格式错误') 
                  : '❌ 未配置'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${configResult?.config.deepseek.configured && configResult?.config.deepseek.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <h3 className="font-medium text-gray-900">DeepSeek</h3>
              <p className="text-sm text-gray-600">
                {configResult?.config.deepseek.configured 
                  ? (configResult?.config.deepseek.valid ? '✅ 已配置' : '⚠️ 格式错误') 
                  : '❌ 未配置'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${configResult?.config.gemini.configured && configResult?.config.gemini.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <h3 className="font-medium text-gray-900">Gemini</h3>
              <p className="text-sm text-gray-600">
                {configResult?.config.gemini.configured 
                  ? (configResult?.config.gemini.valid ? '✅ 已配置' : '⚠️ 格式错误') 
                  : '❌ 未配置'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${configResult?.config.authing.configured && configResult?.config.authing.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-medium text-gray-900">Authing</h3>
              <p className="text-sm text-gray-600">
                {configResult?.config.authing.configured 
                  ? (configResult?.config.authing.valid ? '✅ 已配置' : '⚠️ 回调地址缺失') 
                  : '❌ 未配置'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${configResult?.config.backend.configured && configResult?.config.backend.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-medium text-gray-900">后端API</h3>
              <p className="text-sm text-gray-600">
                {configResult?.config.backend.configured 
                  ? (configResult?.config.backend.valid ? '✅ 已配置' : '⚠️ 格式错误') 
                  : '❌ 未配置'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${configResult?.config.payment.configured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <h3 className="font-medium text-gray-900">支付服务</h3>
              <p className="text-sm text-gray-600">
                {configResult?.config.payment.configured ? '✅ 已配置' : '❌ 未配置'}
              </p>
            </div>
          </div>

          {/* 错误和警告 */}
          {configResult?.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-red-600 font-medium mb-2">❌ 配置错误:</h3>
              <ul className="list-disc list-inside text-red-600 space-y-1">
                {configResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {configResult?.warnings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-yellow-600 font-medium mb-2">⚠️ 配置警告:</h3>
              <ul className="list-disc list-inside text-yellow-600 space-y-1">
                {configResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* API连接测试 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API连接测试</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">OpenAI API</h3>
              <button
                onClick={testOpenAI}
                disabled={testResults.openai?.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {testResults.openai?.loading ? '测试中...' : '测试连接'}
              </button>
              {testResults.openai && (
                <div className="mt-2 text-sm">
                  {testResults.openai.success ? (
                    <span className="text-green-600">✅ 连接成功</span>
                  ) : (
                    <span className="text-red-600">❌ 连接失败: {testResults.openai.error}</span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">DeepSeek API</h3>
              <button
                onClick={testDeepSeek}
                disabled={testResults.deepseek?.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {testResults.deepseek?.loading ? '测试中...' : '测试连接'}
              </button>
              {testResults.deepseek && (
                <div className="mt-2 text-sm">
                  {testResults.deepseek.success ? (
                    <span className="text-green-600">✅ 连接成功</span>
                  ) : (
                    <span className="text-red-600">❌ 连接失败: {testResults.deepseek.error}</span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Authing配置</h3>
              <button
                onClick={testAuthing}
                disabled={testResults.authing?.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {testResults.authing?.loading ? '测试中...' : '测试配置'}
              </button>
              {testResults.authing && (
                <div className="mt-2 text-sm">
                  {testResults.authing.success ? (
                    <span className="text-green-600">✅ 配置正确</span>
                  ) : (
                    <span className="text-red-600">❌ 配置错误: {testResults.authing.error}</span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">后端API</h3>
              <button
                onClick={testBackend}
                disabled={testResults.backend?.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {testResults.backend?.loading ? '测试中...' : '测试连接'}
              </button>
              {testResults.backend && (
                <div className="mt-2 text-sm">
                  {testResults.backend.success ? (
                    <span className="text-green-600">✅ 连接成功</span>
                  ) : (
                    <span className="text-red-600">❌ 连接失败: {testResults.backend.error}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 配置建议 */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">配置建议</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 详细配置信息 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">详细配置信息</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
            {configSummary}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default APIConfigTestPage; 