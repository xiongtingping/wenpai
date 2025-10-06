/**
 * 诊断页面 - 用于检查生产环境配置
 */

import React, { useState } from 'react';
import { getAPIKey } from '@/config/apiKeyManager';
import { buildAPIURL, getAPIHeaders } from '@/config/aiEndpoints';

export const DiagnosticPage: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      apiKeys: {},
      endpoints: {},
      testCalls: {}
    };

    // 1. 检查环境变量
    results.environment = {
      VITE_AIMLAPI_BASE_URL: import.meta.env.VITE_AIMLAPI_BASE_URL,
      VITE_AIMLAPI_KEY_EXISTS: !!import.meta.env.VITE_AIMLAPI_KEY,
      VITE_AIMLAPI_KEY_LENGTH: import.meta.env.VITE_AIMLAPI_KEY?.length || 0,
      VITE_DEEPSEEK_BASE_URL: import.meta.env.VITE_DEEPSEEK_BASE_URL,
      VITE_DEEPSEEK_API_KEY_EXISTS: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
      hostname: window.location.hostname,
      isProduction: !window.location.hostname.includes('localhost')
    };

    // 2. 检查API密钥
    try {
      results.apiKeys.aimlapi = {
        exists: !!getAPIKey('aimlapi'),
        length: getAPIKey('aimlapi')?.length || 0,
        preview: getAPIKey('aimlapi')?.substring(0, 10) + '...'
      };
    } catch (error) {
      results.apiKeys.aimlapi = { error: String(error) };
    }

    try {
      results.apiKeys.deepseek = {
        exists: !!getAPIKey('deepseek'),
        length: getAPIKey('deepseek')?.length || 0,
        preview: getAPIKey('deepseek')?.substring(0, 10) + '...'
      };
    } catch (error) {
      results.apiKeys.deepseek = { error: String(error) };
    }

    // 3. 检查端点构建
    try {
      results.endpoints.aimlapi = buildAPIURL('aimlapi', 'chat');
    } catch (error) {
      results.endpoints.aimlapi = { error: String(error) };
    }

    try {
      results.endpoints.deepseek = buildAPIURL('deepseek', 'chat');
    } catch (error) {
      results.endpoints.deepseek = { error: String(error) };
    }

    // 4. 测试AIMLAPI调用 - gpt-4o-mini
    try {
      const apiKey = getAPIKey('aimlapi');
      const endpoint = buildAPIURL('aimlapi', 'chat');
      const headers = getAPIHeaders('aimlapi', apiKey);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      });

      results.testCalls.aimlapi_gpt4omini = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: response.ok ? await response.json() : await response.text()
      };
    } catch (error) {
      results.testCalls.aimlapi_gpt4omini = { error: String(error) };
    }

    // 5. 测试AIMLAPI调用 - Gemini (默认模型)
    try {
      const apiKey = getAPIKey('aimlapi');
      const endpoint = buildAPIURL('aimlapi', 'chat');
      const headers = getAPIHeaders('aimlapi', apiKey);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite-preview',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      });

      results.testCalls.aimlapi_gemini = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: response.ok ? await response.json() : await response.text()
      };
    } catch (error) {
      results.testCalls.aimlapi_gemini = { error: String(error) };
    }

    // 6. 测试完整的内容适配器调用链
    try {
      const { callAIWithTokenTracking } = await import('@/services/aiWithTokenTracking');
      const { AITaskType } = await import('@/api/aiService');

      const result = await callAIWithTokenTracking({
        model: 'google/gemini-2.5-flash-lite-preview',
        prompt: '请生成一段测试内容',
        systemPrompt: '你是一个内容生成助手',
        maxTokens: 50,
        temperature: 0.7,
        feature: '系统诊断',
        taskType: AITaskType.CONTENT_ADAPTATION
      });

      results.testCalls.fullChain_gemini = {
        success: result.success,
        content: result.content?.substring(0, 100),
        error: result.error,
        model: result.model,
        usage: result.usage
      };
    } catch (error) {
      results.testCalls.fullChain_gemini = { error: String(error) };
    }

    setTestResult(results);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">系统诊断</h1>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '诊断中...' : '运行诊断'}
      </button>

      {testResult && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">诊断结果</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px]">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DiagnosticPage;

