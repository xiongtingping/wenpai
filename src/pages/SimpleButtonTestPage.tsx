import React, { useState } from 'react';
import { useUnifiedAuth } from "../contexts/UnifiedAuthContext";
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

/**
 * 简化按钮测试页面
 * 专注于测试按钮点击和登录弹窗功能
 */
const SimpleButtonTestPage: React.FC = () => {
  const { isAuthenticated, user, login } = useUnifiedAuth();
  const [clickCount, setClickCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>('');

  /**
   * 处理按钮点击
   */
  const handleButtonClick = (action: string) => {
    setClickCount(prev => prev + 1);
    setLastAction(action);
    
    console.log(`🔘 按钮点击: ${action}`);
    console.log(`📊 当前认证状态: ${isAuthenticated}`);
    console.log(`👤 用户信息:`, user);
    
    if (!isAuthenticated) {
      console.log('🔐 用户未登录，调用登录方法');
      login('/simple-test');
    } else {
      console.log('✅ 用户已登录，可以正常跳转');
      // 模拟跳转
      setTimeout(() => {
        alert(`模拟跳转到: ${action}`);
      }, 100);
    }
  };

  /**
   * 测试直接登录调用
   */
  const testDirectLogin = () => {
    console.log('🧪 测试直接登录调用');
    login('/simple-test');
  };

  /**
   * 测试导航功能
   */
  const testNavigation = () => {
    console.log('🧪 测试导航功能');
    if (isAuthenticated) {
      window.location.href = '/adapt';
    } else {
      login('/adapt');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🧪 简化按钮功能测试</CardTitle>
            <CardDescription>
              测试按钮点击、登录弹窗和页面跳转功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 状态显示 */}
              <Alert>
                <AlertDescription>
                  <strong>认证状态:</strong> {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
                  {user && (
                    <span className="ml-2">
                      | <strong>用户:</strong> {user.nickname || user.username || user.email || '未知用户'}
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {/* 测试统计 */}
              <div className="text-sm text-gray-600">
                <p>点击次数: {clickCount}</p>
                <p>最后操作: {lastAction || '无'}</p>
              </div>

              {/* 功能按钮 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleButtonClick('内容创作')}
                  className="h-16 text-lg"
                  variant="default"
                >
                  🎨 内容创作
                </Button>

                <Button 
                  onClick={() => handleButtonClick('品牌库')}
                  className="h-16 text-lg"
                  variant="outline"
                >
                  📚 品牌库
                </Button>

                <Button 
                  onClick={() => handleButtonClick('个人中心')}
                  className="h-16 text-lg"
                  variant="secondary"
                >
                  👤 个人中心
                </Button>

                <Button 
                  onClick={() => handleButtonClick('VIP升级')}
                  className="h-16 text-lg"
                  variant="destructive"
                >
                  ⭐ VIP升级
                </Button>
              </div>

              {/* 测试按钮 */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">🧪 测试功能</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={testDirectLogin}
                    variant="outline"
                    size="sm"
                  >
                    测试登录调用
                  </Button>
                  
                  <Button 
                    onClick={testNavigation}
                    variant="outline"
                    size="sm"
                  >
                    测试页面跳转
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      console.clear();
                      setClickCount(0);
                      setLastAction('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    清除日志
                  </Button>
                </div>
              </div>

              {/* 调试信息 */}
              {import.meta.env.DEV && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    调试信息
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                    <p><strong>当前URL:</strong> {window.location.href}</p>
                    <p><strong>用户代理:</strong> {navigator.userAgent}</p>
                    <p><strong>在线状态:</strong> {navigator.onLine ? '在线' : '离线'}</p>
                    <p><strong>本地存储:</strong> {localStorage.getItem('authing_user') ? '有用户数据' : '无用户数据'}</p>
                  </div>
                </details>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>📋 使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. 点击任意功能按钮测试按钮响应</p>
              <p>2. 如果未登录，应该弹出Authing登录弹窗</p>
              <p>3. 登录成功后应该跳转到目标页面</p>
              <p>4. 查看浏览器控制台了解详细日志</p>
              <p>5. 如果按钮无响应，检查网络连接和Authing配置</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleButtonTestPage; 