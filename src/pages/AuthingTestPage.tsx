/**
 * 🔧 Authing 功能测试页面
 * 用于验证Authing登录功能是否正常工作
 */

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

const AuthingTestPage: React.FC = () => {
  const { user, isAuthenticated, loading, error, login, logout } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'complete'>('idle');

  const addTestResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setTestResults(prev => [...prev, formattedMessage]);
    console.log(formattedMessage);
  };

  const runAuthingTest = async () => {
    setTestStatus('testing');
    setTestResults([]);
    
    addTestResult('开始Authing功能测试', 'info');
    
    // 测试1: 检查认证上下文
    addTestResult(`认证状态: ${isAuthenticated ? '已登录' : '未登录'}`, 'info');
    addTestResult(`加载状态: ${loading ? '加载中' : '已完成'}`, 'info');
    addTestResult(`错误状态: ${error || '无错误'}`, error ? 'error' : 'success');
    
    // 测试2: 检查用户信息
    if (user) {
      addTestResult(`用户信息: ${JSON.stringify(user, null, 2)}`, 'success');
    } else {
      addTestResult('用户信息: 未登录', 'info');
    }
    
    // 测试3: 检查登录函数
    if (typeof login === 'function') {
      addTestResult('登录函数: 可用', 'success');
    } else {
      addTestResult('登录函数: 不可用', 'error');
    }
    
    // 测试4: 检查登出函数
    if (typeof logout === 'function') {
      addTestResult('登出函数: 可用', 'success');
    } else {
      addTestResult('登出函数: 不可用', 'error');
    }
    
    setTestStatus('complete');
    addTestResult('Authing功能测试完成', 'info');
  };

  const handleLogin = async () => {
    try {
      addTestResult('启动登录流程...', 'info');
      await login();
      addTestResult('登录流程启动成功', 'success');
    } catch (error) {
      addTestResult(`登录失败: ${error}`, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      addTestResult('启动登出流程...', 'info');
      await logout();
      addTestResult('登出成功', 'success');
    } catch (error) {
      addTestResult(`登出失败: ${error}`, 'error');
    }
  };

  useEffect(() => {
    // 页面加载时自动运行测试
    runAuthingTest();
  }, []);

  return (
    <div className="min-h-screen bg-accent py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            🔧 Authing 功能测试
          </h1>
          
          {/* 当前状态 */}
          <div className="mb-6 p-4 bg-accent rounded-lg">
            <h2 className="text-xl font-semibold mb-3">📊 当前状态</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">认证状态:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  isAuthenticated ? 'bg-accent text-green-800' : 'bg-destructive/10 text-red-800'
                }`}>
                  {isAuthenticated ? '已登录' : '未登录'}
                </span>
              </div>
              <div>
                <span className="font-medium">加载状态:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  loading ? 'bg-accent text-yellow-800' : 'bg-accent text-green-800'
                }`}>
                  {loading ? '加载中' : '已完成'}
                </span>
              </div>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-red-300 rounded">
                <span className="font-medium text-red-800">错误:</span>
                <span className="ml-2 text-destructive">{error}</span>
              </div>
            )}
            
            {user && (
              <div className="mt-3 p-3 bg-accent border border-green-300 rounded">
                <span className="font-medium text-green-800">用户信息:</span>
                <pre className="mt-2 text-sm text-green-700 overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={runAuthingTest}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testStatus === 'testing' ? '测试中...' : '🧪 运行测试'}
            </button>
            
            {!isAuthenticated && (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🔐 测试登录
              </button>
            )}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-destructive text-white rounded hover:bg-red-700"
              >
                🚪 测试登出
              </button>
            )}
            
            <button
              onClick={() => setTestResults([])}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              🧹 清除日志
            </button>
          </div>
          
          {/* 测试结果 */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white font-semibold mb-3">📝 测试日志</h3>
            <div className="max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-muted-foreground">暂无测试结果...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* 功能清单 */}
          <div className="mt-6 p-4 bg-accent rounded-lg">
            <h3 className="text-lg font-semibold mb-3">✅ 必须验证的功能清单</h3>
            <ul className="space-y-2 text-sm">
              <li>□ 弹窗登录正常 - 点击登录按钮后Authing弹窗能正常显示，无"undefinedundefined"等UI异常</li>
              <li>□ 登录流程完整 - 能够在弹窗中完成用户名/密码登录或第三方登录</li>
              <li>□ 自动关闭优化 - 登录成功后弹窗能在1秒内自动关闭</li>
              <li>□ 短信验证码 - 支持手机号+短信验证码登录方式</li>
              <li>□ 用户信息同步 - 登录成功后能正确获取并显示用户信息（姓名、头像等）</li>
              <li>□ 无错误状态 - 控制台无400、401、500等HTTP错误，无JavaScript异常</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthingTestPage;
