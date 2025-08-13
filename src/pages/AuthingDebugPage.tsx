import React, { useEffect, useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 🔍 Authing Guard 调试页面
 * 专门用于观察和调试 undefinedundefined 问题
 */
export default function AuthingDebugPage() {
  const { user, login, logout, isAuthenticated, isLoading } = useUnifiedAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // 监听DOM变化，捕获undefinedundefined
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const text = element.textContent || '';
              if (text.includes('undefinedundefined')) {
                console.error('🚨 发现undefinedundefined:', {
                  element,
                  text,
                  className: element.className,
                  id: element.id,
                  innerHTML: element.innerHTML
                });
                setDebugInfo(prev => ({
                  ...prev,
                  undefinedFound: true,
                  undefinedText: text,
                  undefinedElement: element.outerHTML
                }));
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  const handleLogin = async () => {
    console.log('🔍 开始登录，观察Guard行为...');
    try {
      await login();
    } catch (error) {
      console.error('🚨 登录错误:', error);
      setDebugInfo(prev => ({
        ...prev,
        loginError: error
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Authing Guard 调试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 用户状态 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">用户状态</h2>
            <div className="space-y-2">
              <p><strong>已认证:</strong> {isAuthenticated ? '是' : '否'}</p>
              <p><strong>加载中:</strong> {isLoading ? '是' : '否'}</p>
              <p><strong>用户对象:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>

          {/* 调试信息 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">调试信息</h2>
            <div className="space-y-2">
              <p><strong>发现undefined:</strong> {debugInfo.undefinedFound ? '是' : '否'}</p>
              {debugInfo.undefinedText && (
                <div>
                  <p><strong>undefined文本:</strong></p>
                  <pre className="bg-red-100 p-2 rounded text-sm">
                    {debugInfo.undefinedText}
                  </pre>
                </div>
              )}
              {debugInfo.undefinedElement && (
                <div>
                  <p><strong>undefined元素:</strong></p>
                  <pre className="bg-red-100 p-2 rounded text-sm overflow-auto">
                    {debugInfo.undefinedElement}
                  </pre>
                </div>
              )}
              {debugInfo.loginError && (
                <div>
                  <p><strong>登录错误:</strong></p>
                  <pre className="bg-red-100 p-2 rounded text-sm">
                    {JSON.stringify(debugInfo.loginError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 space-x-4">
          {!isAuthenticated ? (
            <button
              onClick={handleLogin}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '🔍 测试登录'}
            </button>
          ) : (
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              退出登录
            </button>
          )}
          
          <button
            onClick={() => setDebugInfo({})}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            清除调试信息
          </button>
        </div>

        {/* 实时DOM监控 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">实时DOM监控</h2>
          <p className="text-gray-600 mb-4">
            此页面会实时监控DOM变化，一旦发现包含"undefinedundefined"的元素，会立即显示在调试信息中。
          </p>
          <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
            <p className="text-yellow-800">
              <strong>注意:</strong> 所有DOM修复器已被禁用，您将看到Authing Guard的真实错误。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
