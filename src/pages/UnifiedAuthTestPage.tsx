/**
 * 统一认证入口测试页面
 * 展示各种登录/注册组件和功能
 */

import React from 'react';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * 统一认证系统测试页面
 */
export default function UnifiedAuthTestPage() {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    status,
    login,
    logout,
    hasPermission,
    hasRole,
    getUserData,
    updateUserData,
    bindTempUserId
  } = useUnifiedAuthContext();

  const handleTestLogin = () => {
    console.log('测试登录功能');
    login();
  };

  const handleTestLogout = async () => {
    console.log('测试登出功能');
    await logout();
  };

  const handleTestGetUserData = () => {
    console.log('测试获取用户数据');
    const userData = getUserData();
    console.log('用户数据:', userData);
  };

  const handleTestUpdateUserData = async () => {
    console.log('测试更新用户数据');
    try {
      await updateUserData({ testField: 'testValue' });
      console.log('用户数据更新成功');
    } catch (error) {
      console.error('用户数据更新失败:', error);
    }
  };

  const handleTestBindTempUserId = async () => {
    console.log('测试绑定临时用户ID');
    try {
      await bindTempUserId();
      console.log('临时用户ID绑定成功');
    } catch (error) {
      console.error('临时用户ID绑定失败:', error);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">统一认证系统测试</h1>
        
        {/* 状态显示 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>认证状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">认证状态</p>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? '已认证' : '未认证'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">加载状态</p>
                <Badge variant={loading ? "default" : "secondary"}>
                  {loading ? '加载中' : '已完成'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">状态</p>
                <Badge variant="outline">{status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">错误</p>
                <Badge variant={error ? "destructive" : "secondary"}>
                  {error || '无错误'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户信息 */}
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>用户信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>用户名:</strong> {user.username}</p>
                <p><strong>邮箱:</strong> {user.email}</p>
                <p><strong>昵称:</strong> {user.nickname}</p>
                <p><strong>计划:</strong> {String(user.plan ?? '')}</p>
                <p><strong>专业用户:</strong> {user.isProUser ? '是' : '否'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 权限测试 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>权限测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">VIP权限</p>
                <Badge variant={hasPermission('vip') ? "default" : "secondary"}>
                  {hasPermission('vip') ? '有' : '无'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">管理员角色</p>
                <Badge variant={hasRole('admin') ? "default" : "secondary"}>
                  {hasRole('admin') ? '是' : '否'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">专业用户角色</p>
                <Badge variant={hasRole('pro') ? "default" : "secondary"}>
                  {hasRole('pro') ? '是' : '否'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">免费用户角色</p>
                <Badge variant={hasRole('free') ? "default" : "secondary"}>
                  {hasRole('free') ? '是' : '否'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能测试 */}
        <Card>
          <CardHeader>
            <CardTitle>功能测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button onClick={handleTestLogin} disabled={isAuthenticated}>
                测试登录
              </Button>
              <Button onClick={handleTestLogout} disabled={!isAuthenticated} variant="outline">
                测试登出
              </Button>
              <Button onClick={handleTestGetUserData} disabled={!isAuthenticated}>
                获取用户数据
              </Button>
              <Button onClick={handleTestUpdateUserData} disabled={!isAuthenticated}>
                更新用户数据
              </Button>
              <Button onClick={handleTestBindTempUserId} disabled={!isAuthenticated}>
                绑定临时用户ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 