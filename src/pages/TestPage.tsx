/**
 * 简单测试页面
 * 用于测试基本渲染功能
 */

import React, { useState } from 'react';
import AIAnalysisService from '@/services/aiAnalysisService';

/**
 * 测试页面
 * @description 用于测试基本功能是否正常
 */
const TestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');

  const testPDFService = async () => {
    try {
      const service = AIAnalysisService.getInstance();
      const supportedTypes = service.getSupportedFileTypes();
      setTestResult(`✅ PDF服务正常，支持 ${supportedTypes.length} 种文件类型`);
    } catch (error) {
      setTestResult(`❌ PDF服务错误: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary particle-background flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-e1 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">测试页面</h1>
        <p className="text-gray-600 mb-4">
          如果您能看到这个页面，说明基本功能正常。
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-green-100 text-green-800 rounded">
            ✅ React 组件渲染正常
          </div>
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            ✅ Tailwind CSS 样式正常
          </div>
          <div className="p-3 bg-purple-100 text-purple-800 rounded">
            ✅ 路由系统正常
          </div>
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
            <button 
              onClick={testPDFService}
              className="text-left w-full"
            >
              🔍 测试PDF解析服务
            </button>
          </div>
          {testResult && (
            <div className="p-3 bg-gray-100 text-gray-800 rounded text-sm">
              {testResult}
            </div>
          )}
        </div>
        <div className="mt-6">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 