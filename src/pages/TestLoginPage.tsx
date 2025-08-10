import React, { useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getUserDisplayName } from '@/utils/userDisplayUtils';

/**
 * 登录测试页面
 * 用于测试 Authing Guard 弹窗是否正常显示
 */
export const TestLoginPage: React.FC = () => {
  const { login, user, isAuthenticated, guard } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setTestResults(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testLogin = async () => {
    try {
      addLog('🔐 开始测试登录功能...');
      addLog('📞 调用 login() 函数...');

      // 检查 Guard 实例状态
      addLog(`Guard 实例状态: ${guard ? '已初始化' : '未初始化'}`);

      if (!guard) {
        addLog('❌ Guard 实例未初始化，无法显示登录弹窗');
        return;
      }

      await login();

      addLog('✅ login() 函数调用成功');
      addLog('⏳ 等待用户完成登录...');

      // 延迟检查 DOM
      setTimeout(() => {
        inspectDOM();
      }, 1000);

    } catch (error) {
      addLog(`❌ 登录测试失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
    console.clear();
  };

  const checkAuthStatus = () => {
    addLog('🔍 检查认证状态...');
    addLog(`认证状态: ${isAuthenticated ? '已登录' : '未登录'}`);
    
    if (user) {
      addLog(`用户信息: ${JSON.stringify(user, null, 2)}`);
    } else {
      addLog('用户信息: 无');
    }
  };

  const inspectDOM = () => {
    addLog('🔍 检查 DOM 中的 Authing 元素...');
    
    const selectors = [
      '[class*="authing"]',
      '[id*="authing"]',
      '[role="dialog"]',
      '[aria-modal="true"]',
      '.guard-container',
      '.guard-modal'
    ];

    let foundElements = 0;

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements += elements.length;
        addLog(`找到 ${elements.length} 个 ${selector} 元素`);
        
        elements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          const isVisible = rect.width > 0 && rect.height > 0 && 
                           style.display !== 'none' && 
                           style.visibility !== 'hidden' && 
                           style.opacity !== '0';
          
          addLog(`  元素 ${index + 1}: 可见=${isVisible}, 位置=(${Math.round(rect.x)}, ${Math.round(rect.y)}), 尺寸=${Math.round(rect.width)}x${Math.round(rect.height)}`);
          addLog(`  样式: display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}, z-index=${style.zIndex}`);
          
          if (el.textContent && el.textContent.trim().length > 0) {
            const preview = el.textContent.trim().substring(0, 50);
            addLog(`  内容预览: "${preview}${el.textContent.length > 50 ? '...' : ''}"`);
          }
        });
      }
    });

    if (foundElements === 0) {
      addLog('❌ 未找到任何 Authing 相关的 DOM 元素');
    } else {
      addLog(`✅ 总共找到 ${foundElements} 个 Authing 相关元素`);
    }

    // 检查 body 的直接子元素
    addLog('🔍 检查 body 的直接子元素...');
    Array.from(document.body.children).forEach((child, index) => {
      const tagName = child.tagName.toLowerCase();
      const className = child.className || '';
      const id = child.id || '';
      
      if (className.includes('authing') || id.includes('authing') || 
          child.hasAttribute('role') || child.hasAttribute('aria-modal')) {
        addLog(`  子元素 ${index + 1}: <${tagName}> (class: ${className}, id: ${id})`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-accent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-8">🔐 登录功能测试</h1>
          
          {/* 当前状态 */}
          <div className="mb-8 p-4 bg-accent rounded-lg">
            <h2 className="text-lg font-semibold text-primary mb-2">当前状态</h2>
            <div className="space-y-1 text-sm">
              <p><strong>认证状态:</strong> {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}</p>
              <p><strong>用户信息:</strong> {user ? getUserDisplayName(user, '用户') : '无'}</p>
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="mb-8 space-x-4">
            <button
              onClick={testLogin}
              className="bg-primary hover:bg-primary text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              🔐 测试登录弹窗
            </button>
            
            <button
              onClick={checkAuthStatus}
              className="bg-accent hover:bg-accent text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              🔍 检查认证状态
            </button>
            
            <button
              onClick={inspectDOM}
              className="bg-primary hover:bg-primary text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              🔍 检查 DOM
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              🗑️ 清空日志
            </button>
          </div>

          {/* 测试日志 */}
          <div className="bg-gray-900 text-foreground p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <h3 className="text-white font-semibold mb-2">测试日志:</h3>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">点击上方按钮开始测试...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>

          {/* 说明 */}
          <div className="mt-8 p-4 bg-accent rounded-lg">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">测试说明</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>测试登录弹窗:</strong> 调用登录函数，检查是否显示 Authing Guard 弹窗</li>
              <li>• <strong>检查认证状态:</strong> 查看当前用户登录状态和用户信息</li>
              <li>• <strong>检查 DOM:</strong> 查找页面中的 Authing 相关元素</li>
              <li>• <strong>预期结果:</strong> 点击"测试登录弹窗"后应该看到登录界面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
