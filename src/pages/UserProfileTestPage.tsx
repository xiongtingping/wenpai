import { useAuthing } from "@/hooks/useAuthing";
/**
 * 用户信息展示组件测试页面
 * 展示UserProfile组件的不同使用模式
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ArrowLeft,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import UserProfile from '@/components/auth/UserProfile';

/**
 * 用户信息展示测试页面组件
 * @returns React 组件
 */
export default function UserProfileTestPage() {
  const { isAuthenticated, login, logout } = useUnifiedAuthContext();
  const navigate = useNavigate();
  const { showLogin } = useAuthing();

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1);
  };

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">用户信息展示测试</h1>
          <p className="text-gray-600">请先登录以测试用户信息展示组件</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">需要登录</h3>
              <p className="text-gray-500 mb-6">
                您需要先登录才能测试用户信息展示组件
              </p>
              <div className="space-x-4">
                <Button onClick={() => showLogin()}>
                  去登录
                </Button>
                <Button variant="outline" onClick={() => showLogin()}>
                  去注册
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">用户信息展示测试</h1>
        <p className="text-gray-600">
          测试UserProfile组件的不同展示模式和功能
        </p>
      </div>

      {/* 组件说明 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            组件说明
          </CardTitle>
          <CardDescription>
            UserProfile组件支持多种展示模式和配置选项
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">完整模式</h4>
              <p className="text-sm text-blue-700">
                显示完整的用户信息，包括头像、基本信息、账户详情和操作按钮
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">紧凑模式</h4>
              <p className="text-sm text-green-700">
                简洁的横向布局，适合在侧边栏或导航栏中使用
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">安全特性</h4>
              <p className="text-sm text-purple-700">
                集成数据脱敏、安全存储和日志记录功能
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 完整模式展示 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">完整模式 (默认)</h2>
          <Badge variant="outline">showActions=true, compact=false</Badge>
        </div>
        <UserProfile showActions={true} compact={false} />
      </div>

      {/* 紧凑模式展示 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <EyeOff className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold">紧凑模式</h2>
          <Badge variant="outline">showActions=true, compact=true</Badge>
        </div>
        <UserProfile showActions={true} compact={true} />
      </div>

      {/* 无操作按钮模式 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">只读模式</h2>
          <Badge variant="outline">showActions=false, compact=false</Badge>
        </div>
        <UserProfile showActions={false} compact={false} />
      </div>

      {/* 紧凑只读模式 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold">紧凑只读模式</h2>
          <Badge variant="outline">showActions=false, compact=true</Badge>
        </div>
        <UserProfile showActions={false} compact={true} />
      </div>

      {/* 功能特性说明 */}
      <Card>
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
          <CardDescription>
            UserProfile组件的主要功能和特性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">核心功能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 自动加载和显示用户信息</li>
                <li>• 支持完整和紧凑两种展示模式</li>
                <li>• 可配置是否显示操作按钮</li>
                <li>• 集成安全数据脱敏功能</li>
                <li>• 支持用户头像显示</li>
                <li>• 显示账户类型和状态</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">安全特性</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 敏感信息自动脱敏显示</li>
                <li>• 安全日志记录</li>
                <li>• 错误处理和重试机制</li>
                <li>• 加载状态和错误状态处理</li>
                <li>• 安全的登出功能</li>
                <li>• 权限验证和路由保护</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 