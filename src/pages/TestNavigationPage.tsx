/**
 * 导航测试页面
 * 用于测试首页功能按钮跳转是否正常
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  FolderOpen, 
  Users,
  ArrowRight,
  Home
} from 'lucide-react';

/**
 * 功能测试数据
 */
const testFeatures = [
  {
    title: 'AI内容适配器',
    path: '/adapt',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    description: '测试AI内容适配器跳转'
  },
  {
    title: '创意魔方',
    path: '/creative-studio',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    description: '测试创意魔方跳转'
  },
  {
    title: '全网雷达',
    path: '/hot-topics',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    description: '测试全网雷达跳转'
  },
  {
    title: '我的资料库',
    path: '/library',
    icon: FolderOpen,
    color: 'from-green-500 to-emerald-500',
    description: '测试我的资料库跳转'
  },
  {
    title: '品牌库',
    path: '/brand-library',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    description: '测试品牌库跳转'
  }
];

/**
 * 导航测试页面组件
 */
const TestNavigationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useUnifiedAuth();

  /**
   * 处理功能跳转
   */
  const handleFeatureClick = (path: string) => {
    console.log('点击功能按钮:', path);
    console.log('用户认证状态:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('用户已登录，直接跳转到:', path);
      window.location.href = path;
    } else {
      console.log('用户未登录，先登录再跳转到:', path);
      localStorage.setItem('login_redirect_to', path);
      login();
    }
  };

  /**
   * 返回首页
   */
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            导航跳转测试页面
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            测试首页功能按钮跳转是否正常工作
          </p>
          
          {/* 状态信息 */}
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              认证状态: {isAuthenticated ? '已登录' : '未登录'}
            </Badge>
            <Badge variant="outline">
              当前页面: /test-navigation
            </Badge>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            <Button onClick={handleGoHome} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        </div>

        {/* 功能测试卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleFeatureClick(feature.path)}
                    >
                      <span className="flex items-center justify-center">
                        测试跳转
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </Button>
                    <div className="text-xs text-gray-500 text-center">
                      目标路径: {feature.path}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 测试说明 */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">测试说明</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 点击"测试跳转"按钮，观察控制台输出和页面行为</p>
            <p>• 已登录用户：应该直接跳转到目标页面</p>
            <p>• 未登录用户：应该弹出登录框，登录成功后跳转</p>
            <p>• 如果跳转很慢或不跳转，请检查控制台错误信息</p>
            <p>• 可以打开浏览器开发者工具查看网络请求和JavaScript错误</p>
          </div>
        </div>

        {/* 调试信息 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">调试信息</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>当前时间: {new Date().toLocaleString()}</p>
            <p>用户代理: {navigator.userAgent}</p>
            <p>页面URL: {window.location.href}</p>
            <p>认证状态: {isAuthenticated ? 'true' : 'false'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNavigationPage; 