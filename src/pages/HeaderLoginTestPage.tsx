/**
 * Header登录按钮测试页面
 * 用于测试Header组件中的登录和注册按钮是否正常工作
 */

import React from 'react';
import { Header } from '@/components/landing/Header';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function HeaderLoginTestPage() {
  const { user, isAuthenticated, login } = useUnifiedAuthContext();

  const handleTestLogin = () => {
    console.log('测试登录按钮点击');
    login();
  };

  const handleTestLoginWithRedirect = () => {
    console.log('测试登录按钮点击（带跳转）');
    login('/profile');
  };

  const testFeatureButtons = [
    { name: 'AI内容适配器', path: '/adapt'},
    { name: '创意魔方', path: '/creative-studio'},
    { name: '全网雷达', path: '/hot-topics'},
    { name: '我的资料库', path: '/library'},
    { name: '品牌库', path: '/brand-library' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Header登录逻辑测试页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">当前用户状态:</span>
                {isAuthenticated ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已登录
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    未登录
                  </Badge>
                )}
              </div>
              
              {user && (
                <div className="text-sm text-gray-600">
                  用户信息: {user.nickname || user.username || user.email || '未知用户'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>基础登录测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleTestLogin} className="w-full">
                测试基础登录
              </Button>
              <Button onClick={handleTestLoginWithRedirect} variant="outline" className="w-full">
                测试登录并跳转到个人中心
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>功能区按钮测试</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  测试Header中的功能区按钮，验证登录逻辑是否正确：
                </p>
                {testFeatureButtons.map((feature) => (
                  <Button
                    key={feature.path}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      console.log(`测试${feature.name}按钮`);
                      if (isAuthenticated) {
                        console.log('用户已登录，应该直接跳转到:', feature.path);
                      } else {
                        console.log('用户未登录，应该弹出Authing Guard弹窗');
                      }
                      login(feature.path);
                    }}
                  >
                    {feature.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>测试说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-50 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>已登录用户:</strong> 点击功能区按钮应该直接跳转到对应页面，不会弹出登录弹窗
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-50 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>未登录用户:</strong> 点击功能区按钮应该直接弹出Authing Guard登录弹窗，而不是跳转到登录页面
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-50 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>登录成功:</strong> 登录成功后应该自动跳转到用户之前点击的功能区页面
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-50 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>注意:</strong> 请打开浏览器控制台查看详细的日志输出，验证登录逻辑是否正确执行
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 