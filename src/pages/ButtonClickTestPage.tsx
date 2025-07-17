import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface TestButton {
  name: string;
  path: string;
  description: string;
}

const testButtons: TestButton[] = [
  { name: 'AI内容适配器', path: '/adapt', description: '测试AI内容适配器按钮跳转' },
  { name: '创意魔方', path: '/creative-studio', description: '测试创意魔方按钮跳转' },
  { name: '全网雷达', path: '/hot-topics', description: '测试全网雷达按钮跳转' },
  { name: '我的资料库', path: '/library', description: '测试我的资料库按钮跳转' },
  { name: '品牌库', path: '/brand-library', description: '测试品牌库按钮跳转' },
];

export default function ButtonClickTestPage() {
  const { user, isAuthenticated, login } = useUnifiedAuthContext();
  const navigate = useNavigate();

  const handleTestButtonClick = (button: TestButton) => {
    console.log('测试按钮点击:', button.name, button.path);
    console.log('当前认证状态:', isAuthenticated);
    console.log('当前用户:', user);
    if (isAuthenticated) {
      console.log('用户已登录，直接跳转到:', button.path);
      navigate(button.path);
    } else {
      console.log('用户未登录，弹出Authing Guard弹窗');
      login(button.path);
    }
  };

  const handleDirectNavigate = (path: string) => {
    console.log('直接跳转到:', path);
    navigate(path);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              按钮点击测试页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant={isAuthenticated ? 'default' : 'outline'}>
                  {isAuthenticated ? '已登录' : '未登录'}
                </Badge>
                {user && (
                  <span className="text-sm text-gray-600">
                    用户: {user.nickname || user.username || user.email || user.id}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>当前页面: {window.location.pathname}</p>
                <p>测试时间: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 功能按钮测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                功能按钮测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                测试首页功能按钮的跳转逻辑（使用login方法）
              </p>
              {testButtons.map((button, index) => (
                <div key={index} className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleTestButtonClick(button)}
                  >
                    <span>{button.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-gray-500">{button.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 直接跳转测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                直接跳转测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                直接跳转到页面（绕过认证检查）
              </p>
              {testButtons.map((button, index) => (
                <div key={index} className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() => handleDirectNavigate(button.path)}
                  >
                    <span>直接跳转 - {button.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-gray-500">目标: {button.path}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 调试信息 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>调试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>认证状态:</strong> {isAuthenticated ? '已认证' : '未认证'}
              </div>
              <div>
                <strong>用户信息:</strong> {user ? JSON.stringify(user, null, 2) : '无'}
              </div>
              <div>
                <strong>当前URL:</strong> {window.location.href}
              </div>
              <div>
                <strong>localStorage login_redirect_to:</strong> {localStorage.getItem('login_redirect_to') || '无'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 