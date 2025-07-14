/**
 * 退出登录按钮测试页面
 * 展示LogoutButton组件的各种功能和样式
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  LogOut, 
  ArrowLeft,
  Shield,
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthingStatus } from '@/hooks/useAuthingStatus';
import { 
  LogoutButton, 
  SimpleLogoutButton, 
  ConfirmLogoutButton 
} from '@/components/auth/LogoutButton';

/**
 * 退出登录按钮测试页面组件
 * @returns React 组件
 */
export default function LogoutButtonTestPage() {
  const navigate = useNavigate();
  const [customRedirectUri, setCustomRedirectUri] = useState('/');
  const [enableSecurityLog, setEnableSecurityLog] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);
  const [customTitle, setCustomTitle] = useState('确认退出登录');
  const [customDescription, setCustomDescription] = useState('您确定要退出登录吗？退出后需要重新登录才能访问受保护的功能。');
  
  const [logoutEvents, setLogoutEvents] = useState<string[]>([]);

  // 使用Authing状态Hook
  const {
    isLoggedIn,
    user,
    loading,
    error
  } = useAuthingStatus({
    autoCheck: true,
    redirectUri: '/logout-button-test',
    enableSecurityLog: true
  });

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 记录退出事件
   */
  const handleLogoutEvent = (event: string) => {
    setLogoutEvents(prev => [
      `${new Date().toLocaleTimeString()}: ${event}`,
      ...prev.slice(0, 9) // 只保留最近10条
    ]);
  };

  /**
   * 退出前检查
   */
  const handleBeforeLogout = async (): Promise<boolean> => {
    handleLogoutEvent('退出前检查触发');
    // 这里可以添加退出前的逻辑，比如保存数据等
    return true; // 返回true表示允许退出
  };

  /**
   * 退出后回调
   */
  const handleAfterLogout = () => {
    handleLogoutEvent('退出后回调触发');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 页面头部 */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">退出登录按钮测试</h1>
        <p className="text-gray-600">
          测试LogoutButton组件的各种功能和样式
        </p>
      </div>

      {/* 当前状态 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            当前登录状态
          </CardTitle>
          <CardDescription>
            显示当前用户的登录状态和信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                ) : isLoggedIn ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium text-blue-900">登录状态</span>
              </div>
              <Badge variant={isLoggedIn ? "default" : "secondary"}>
                {loading ? '检查中...' : isLoggedIn ? '已登录' : '未登录'}
              </Badge>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">用户信息</span>
              </div>
              <p className="text-sm text-green-700">
                {loading ? '加载中...' : 
                 user ? `${user.nickname} (${user.username})` : '未获取'}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">错误状态</span>
              </div>
              <p className="text-sm text-red-700">
                {error ? error : '无错误'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置选项 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            配置选项
          </CardTitle>
          <CardDescription>
            自定义退出登录按钮的行为和样式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-confirm"
                  checked={showConfirm}
                  onCheckedChange={setShowConfirm}
                />
                <Label htmlFor="show-confirm">显示确认对话框</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="security-log"
                  checked={enableSecurityLog}
                  onCheckedChange={setEnableSecurityLog}
                />
                <Label htmlFor="security-log">启用安全日志</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="redirect-uri">跳转路径</Label>
                <Input
                  id="redirect-uri"
                  value={customRedirectUri}
                  onChange={(e) => setCustomRedirectUri(e.target.value)}
                  placeholder="/"
                />
              </div>
              
              <div>
                <Label htmlFor="custom-title">确认标题</Label>
                <Input
                  id="custom-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="确认退出登录"
                />
              </div>
              
              <div>
                <Label htmlFor="custom-description">确认描述</Label>
                <Input
                  id="custom-description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="您确定要退出登录吗？"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 按钮样式展示 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LogOut className="w-5 h-5 text-red-600" />
          按钮样式展示
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基础样式 */}
          <Card>
            <CardHeader>
              <CardTitle>基础样式</CardTitle>
              <CardDescription>
                不同变体的退出登录按钮
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <LogoutButton
                variant="default"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                默认样式退出
              </LogoutButton>
              
              <LogoutButton
                variant="destructive"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                危险样式退出
              </LogoutButton>
              
              <LogoutButton
                variant="outline"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                轮廓样式退出
              </LogoutButton>
              
              <LogoutButton
                variant="ghost"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                幽灵样式退出
              </LogoutButton>
            </CardContent>
          </Card>

          {/* 按钮大小 */}
          <Card>
            <CardHeader>
              <CardTitle>按钮大小</CardTitle>
              <CardDescription>
                不同尺寸的退出登录按钮
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <LogoutButton
                size="sm"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                小尺寸退出
              </LogoutButton>
              
              <LogoutButton
                size="default"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                默认尺寸退出
              </LogoutButton>
              
              <LogoutButton
                size="lg"
                showConfirm={showConfirm}
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                大尺寸退出
              </LogoutButton>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* 便捷组件 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          便捷组件
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 简化退出按钮 */}
          <Card>
            <CardHeader>
              <CardTitle>简化退出按钮</CardTitle>
              <CardDescription>
                基于您提供的代码逻辑，无确认对话框
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SimpleLogoutButton
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                直接退出登录
              </SimpleLogoutButton>
              
              <SimpleLogoutButton
                variant="outline"
                size="sm"
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                小尺寸直接退出
              </SimpleLogoutButton>
            </CardContent>
          </Card>

          {/* 确认退出按钮 */}
          <Card>
            <CardHeader>
              <CardTitle>确认退出按钮</CardTitle>
              <CardDescription>
                带确认对话框的安全退出
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ConfirmLogoutButton
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                安全退出登录
              </ConfirmLogoutButton>
              
              <ConfirmLogoutButton
                variant="outline"
                size="lg"
                redirectUri={customRedirectUri}
                enableSecurityLog={enableSecurityLog}
                confirmTitle={customTitle}
                confirmDescription={customDescription}
                onBeforeLogout={handleBeforeLogout}
                onLogout={handleAfterLogout}
              >
                大尺寸安全退出
              </ConfirmLogoutButton>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* 事件日志 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            退出事件日志
          </CardTitle>
          <CardDescription>
            记录退出登录过程中的各种事件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
            {logoutEvents.length === 0 ? (
              <p className="text-gray-500 text-center">暂无事件记录</p>
            ) : (
              <div className="space-y-2">
                {logoutEvents.map((event, index) => (
                  <div key={index} className="text-sm text-gray-700 bg-white p-2 rounded border">
                    {event}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogoutEvents([])}
            >
              清空日志
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 功能特性说明 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
          <CardDescription>
            LogoutButton组件的主要功能和特性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">核心功能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 安全退出登录</li>
                <li>• 确认对话框</li>
                <li>• 自定义跳转路径</li>
                <li>• 多种样式变体</li>
                <li>• 加载状态显示</li>
                <li>• 错误处理</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">安全特性</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 安全日志记录</li>
                <li>• 退出前回调</li>
                <li>• 退出后回调</li>
                <li>• 状态验证</li>
                <li>• 防重复操作</li>
                <li>• 用户确认机制</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 