/**
 * Authing状态检查测试页面
 * 展示useAuthingStatus Hook的功能
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  ArrowLeft,
  RefreshCw,
  User,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthingStatus, useSimpleAuthingStatus } from '@/hooks/useAuthingStatus';

/**
 * Authing状态检查测试页面组件
 * @returns React 组件
 */
export default function AuthingStatusTestPage() {
  const navigate = useNavigate();

  // 使用完整的Authing状态Hook
  const {
    isLoggedIn,
    user,
    loading,
    error,
    checkStatus,
    getUserInfo,
    login,
    logout,
    refreshUser
  } = useAuthingStatus({
    autoCheck: true,
    redirectUri: '/authing-status-test',
    enableSecurityLog: true
  });

  // 使用简化的Authing状态Hook（基于用户提供的代码）
  const simpleStatus = useSimpleAuthingStatus();

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1);
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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authing状态检查测试</h1>
        <p className="text-gray-600">
          测试useAuthingStatus Hook的功能和状态管理
        </p>
      </div>

      {/* 当前状态概览 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            当前状态概览
          </CardTitle>
          <CardDescription>
            实时显示Authing登录状态和用户信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 登录状态 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : isLoggedIn ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium text-blue-900">登录状态</span>
              </div>
              <Badge variant={isLoggedIn ? "default" : "secondary"}>
                {loading ? '检查中...' : isLoggedIn ? '已登录' : '未登录'}
              </Badge>
            </div>

            {/* 用户信息 */}
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

            {/* 错误状态 */}
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">错误状态</span>
              </div>
              <p className="text-sm text-red-700">
                {error ? error : '无错误'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 完整Hook功能测试 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          完整Hook功能测试
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 状态检查操作 */}
          <Card>
            <CardHeader>
              <CardTitle>状态检查操作</CardTitle>
              <CardDescription>
                手动触发各种状态检查操作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={checkStatus}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                检查登录状态
              </Button>
              
              <Button 
                onClick={getUserInfo}
                disabled={loading || !isLoggedIn}
                variant="outline"
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                获取用户信息
              </Button>
              
              <Button 
                onClick={refreshUser}
                disabled={loading || !isLoggedIn}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新用户信息
              </Button>
            </CardContent>
          </Card>

          {/* 登录登出操作 */}
          <Card>
            <CardHeader>
              <CardTitle>登录登出操作</CardTitle>
              <CardDescription>
                测试登录和登出功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => login()}
                disabled={loading || isLoggedIn}
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </Button>
              
              <Button 
                onClick={logout}
                disabled={loading || !isLoggedIn}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
              
              <Button 
                onClick={() => login('/user-profile')}
                disabled={loading || isLoggedIn}
                variant="outline"
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                登录后跳转到用户信息页
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* 简化Hook对比 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          简化Hook对比
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>useSimpleAuthingStatus Hook</CardTitle>
            <CardDescription>
              基于您提供的代码逻辑实现的简化版本
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {simpleStatus.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  ) : simpleStatus.isLoggedIn ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium text-purple-900">简化Hook状态</span>
                </div>
                <Badge variant={simpleStatus.isLoggedIn ? "default" : "secondary"}>
                  {simpleStatus.loading ? '检查中...' : simpleStatus.isLoggedIn ? '已登录' : '未登录'}
                </Badge>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">简化Hook用户</span>
                </div>
                <p className="text-sm text-purple-700">
                  {simpleStatus.loading ? '加载中...' : 
                   simpleStatus.user ? `${simpleStatus.user.nickname || simpleStatus.user.username}` : '未获取'}
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">自动跳转</span>
                </div>
                <p className="text-sm text-purple-700">
                  {simpleStatus.loading ? '检查中...' : 
                   !simpleStatus.isLoggedIn ? '未登录时自动跳转' : '已登录'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 用户信息详情 */}
      {user && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            用户信息详情
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>当前用户信息</CardTitle>
              <CardDescription>
                从Authing获取的完整用户信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">用户ID:</span>
                      <p className="font-mono bg-gray-100 p-1 rounded">{user.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">用户名:</span>
                      <p>{user.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">昵称:</span>
                      <p>{user.nickname}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">邮箱:</span>
                      <p>{user.email || '未设置'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">手机号:</span>
                      <p>{user.phone || '未设置'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">时间信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">创建时间:</span>
                      <p>{new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">更新时间:</span>
                      <p>{new Date(user.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 功能特性说明 */}
      <Card>
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
          <CardDescription>
            useAuthingStatus Hook的主要功能和特性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">核心功能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 自动检查登录状态</li>
                <li>• 获取用户信息</li>
                <li>• 登录/登出操作</li>
                <li>• 刷新用户信息</li>
                <li>• 错误处理</li>
                <li>• 加载状态管理</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">安全特性</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 安全日志记录</li>
                <li>• 错误日志追踪</li>
                <li>• 用户行为监控</li>
                <li>• 状态验证</li>
                <li>• 安全的跳转机制</li>
                <li>• 防重复操作</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 