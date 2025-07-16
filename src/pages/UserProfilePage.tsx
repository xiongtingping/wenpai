import { useAuthing } from "@/hooks/useAuthing";
/**
 * 用户信息展示页面
 * 展示当前登录用户的详细信息
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Shield, 
  Activity, 
  Settings, 
  Crown,
  ArrowLeft,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import UserProfile from '@/components/auth/UserProfile';
import { useToast } from '@/hooks/use-toast';

/**
 * 用户信息展示页面组件
 * @returns React 组件
 */
export default function UserProfilePage() {
  const { user, isAuthenticated, login } = useUnifiedAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * 刷新用户信息
   */
  const handleRefresh = () => {
    toast({
      title: "刷新成功",
      description: "用户信息已更新",
    });
    // 这里可以添加刷新逻辑
  };

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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">用户信息</h1>
          <p className="text-gray-600">请先登录以查看您的用户信息</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">需要登录</h3>
              <p className="text-gray-500 mb-6">
                您需要先登录才能查看用户信息
              </p>
              <div className="space-x-4">
                <Button onClick={() => login()}>
                  <LogIn className="w-4 h-4 mr-2" />
                  登录
                </Button>
                <Button variant="outline" onClick={() => login()}>
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
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">用户信息</h1>
        <p className="text-gray-600">
          查看和管理您的账户信息、设置和活动记录
        </p>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：用户信息卡片 */}
        <div className="lg:col-span-1">
          <UserProfile showActions={true} />
        </div>

        {/* 右侧：详细信息标签页 */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                概览
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                安全
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                活动
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                设置
              </TabsTrigger>
            </TabsList>

            {/* 概览标签页 */}
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    账户概览
                  </CardTitle>
                  <CardDescription>
                    您的账户基本信息和状态
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 账户状态 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">账户类型</span>
                      </div>
                      <Badge variant={user?.isProUser ? "default" : "secondary"}>
                        {user?.isProUser ? "专业版" : "体验版"}
                      </Badge>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">账户状态</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        正常
                      </Badge>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">最后活跃</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* 使用统计 */}
                  <div>
                    <h4 className="font-medium mb-3">使用统计</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-gray-600">今日使用</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-green-600">156</div>
                        <div className="text-sm text-gray-600">本月使用</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">1,234</div>
                        <div className="text-sm text-gray-600">总使用次数</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">30</div>
                        <div className="text-sm text-gray-600">剩余次数</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 安全标签页 */}
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    安全设置
                  </CardTitle>
                  <CardDescription>
                    管理您的账户安全设置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">密码</h4>
                        <p className="text-sm text-gray-600">上次更新：2024年1月</p>
                      </div>
                      <Button variant="outline" size="sm">
                        修改密码
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">双因素认证</h4>
                        <p className="text-sm text-gray-600">增强账户安全性</p>
                      </div>
                      <Button variant="outline" size="sm">
                        启用
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">登录设备</h4>
                        <p className="text-sm text-gray-600">管理已登录的设备</p>
                      </div>
                      <Button variant="outline" size="sm">
                        查看设备
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 活动标签页 */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    活动记录
                  </CardTitle>
                  <CardDescription>
                    查看您的账户活动历史
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">登录活动</h4>
                          <p className="text-sm text-gray-600">2024年1月5日 14:30</p>
                        </div>
                        <Badge variant="outline">成功</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">内容适配</h4>
                          <p className="text-sm text-gray-600">2024年1月5日 13:15</p>
                        </div>
                        <Badge variant="outline">完成</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">账户设置更新</h4>
                          <p className="text-sm text-gray-600">2024年1月4日 16:20</p>
                        </div>
                        <Badge variant="outline">更新</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 设置标签页 */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    账户设置
                  </CardTitle>
                  <CardDescription>
                    管理您的账户偏好设置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">通知设置</h4>
                        <p className="text-sm text-gray-600">管理邮件和推送通知</p>
                      </div>
                      <Button variant="outline" size="sm">
                        配置
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">隐私设置</h4>
                        <p className="text-sm text-gray-600">管理数据隐私偏好</p>
                      </div>
                      <Button variant="outline" size="sm">
                        设置
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">语言设置</h4>
                        <p className="text-sm text-gray-600">当前：简体中文</p>
                      </div>
                      <Button variant="outline" size="sm">
                        更改
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 