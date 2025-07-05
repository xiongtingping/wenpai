/**
 * 简化登录页面
 * 用于测试基本功能
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * 简化登录页面组件
 * @returns React 组件
 */
const SimpleLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 处理表单输入变化
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  /**
   * 处理登录
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟登录成功
      console.log('登录成功:', formData);
      localStorage.setItem('user', JSON.stringify({
        username: formData.username,
        email: `${formData.username}@example.com`,
        id: Date.now().toString(),
      }));
      
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试 Authing 功能
   */
  const testAuthing = async () => {
    try {
      console.log('测试 Authing 功能...');
      
      // 动态导入 Authing 服务
      const authingService = await import('@/services/authingService');
      console.log('Authing 服务导入成功:', authingService.default);
      
      // 测试配置
      const config = authingService.default.getConfig();
      console.log('Authing 配置:', config);
      
      // 测试构建登录 URL
      // const loginUrl = authingService.default.buildLoginUrl();
      // console.log('登录 URL:', loginUrl);
      console.log('登录 URL 功能暂不可用');
      
      alert('Authing 功能测试成功！请查看控制台输出。');
    } catch (error) {
      console.error('Authing 测试失败:', error);
      alert(`Authing 测试失败: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            简化登录测试
          </CardTitle>
          <CardDescription className="text-gray-600">
            测试基本登录功能和 Authing 集成
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>测试账号：任意用户名 + 任意密码</p>
          </div>

          {/* 测试按钮 */}
          <div className="space-y-3">
            <Button 
              onClick={testAuthing} 
              variant="outline" 
              className="w-full"
            >
              测试 Authing 功能
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="w-full"
            >
              返回首页
            </Button>
          </div>

          {/* 调试信息 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">调试信息</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>当前时间: {new Date().toLocaleString()}</p>
              <p>页面路径: {window.location.pathname}</p>
              <p>用户代理: {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleLoginPage; 