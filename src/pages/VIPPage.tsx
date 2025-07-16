import { useAuthing } from "@/hooks/useAuthing";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
/**
 * VIP页面组件
 * 仅限VIP用户访问，集成Authing角色检查和权限验证
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { securityUtils } from '@/lib/security';
import { 
  Crown, 
  Star, 
  Shield, 
  Zap, 
  Users, 
  Settings, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';

/**
 * VIP页面组件
 * @returns React 组件
 */
export default function VIPPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, login } = useUnifiedAuthContext();
  const { user: unifiedUser, isAuthenticated: unifiedIsAuthenticated } = useUnifiedAuth();
  const { showLogin } = useAuthing();
  
  // 优先使用统一认证状态
  const currentUser = unifiedUser || user;
  const currentIsAuthenticated = unifiedIsAuthenticated || isAuthenticated;
  const { isVip, isAdmin, roles, loading, error, refreshRoles } = useUserRoles({
    autoCheck: true,
    enableSecurityLog: true,
    vipRoleCode: 'vip'
  });

  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // VIP权限检查
  useEffect(() => {
    const checkVIPAccess = async () => {
      try {
        setCheckingAccess(true);
        securityUtils.secureLog('开始检查VIP访问权限');

        // 检查用户是否已登录
        if (!currentIsAuthenticated || !currentUser) {
          securityUtils.secureLog('用户未登录，重定向到登录页面');
          toast({
            title: "需要登录",
            description: "请先登录后再访问VIP页面",
            variant: "destructive"
          });
          showLogin();
          return;
        }

        // 等待角色检查完成
        if (loading) {
          return;
        }

        // 检查VIP权限
        if (!isVip && !isAdmin) {
          securityUtils.secureLog('非VIP用户尝试访问VIP页面', {
            userId: currentUser.id,
            roles: roles
          }, 'error');
          
          toast({
            title: "访问被拒绝",
            description: "此页面仅限VIP用户访问，请升级您的账户",
            variant: "destructive"
          });
          
          // 延迟跳转，让用户看到提示
          setTimeout(() => {
            navigate('/payment');
          }, 2000);
          return;
        }

        // 权限验证通过
        setAccessGranted(true);
        securityUtils.secureLog('VIP用户访问权限验证通过', {
          userId: currentUser.id,
          roles: roles,
          isVip,
          isAdmin
        });

        toast({
          title: "欢迎VIP用户",
          description: "您已成功访问VIP专属页面",
        });

      } catch (error) {
        console.error('VIP权限检查失败:', error);
              securityUtils.secureLog('VIP权限检查失败', {
        error: error instanceof Error ? error.message : '未知错误',
        userId: currentUser?.id
      }, 'error');
        
        toast({
          title: "权限检查失败",
          description: "请稍后重试或联系客服",
          variant: "destructive"
        });
      } finally {
        setCheckingAccess(false);
      }
    };

    checkVIPAccess();
  }, [isAuthenticated, user, isVip, isAdmin, roles, loading, navigate, toast]);

  // 刷新角色信息
  const handleRefreshRoles = async () => {
    try {
      await refreshRoles();
      toast({
        title: "角色信息已刷新",
        description: "您的权限状态已更新",
      });
    } catch (error) {
      toast({
        title: "刷新失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 加载状态
  if (checkingAccess || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证VIP权限...</p>
        </div>
      </div>
    );
  }

  // 权限被拒绝
  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
          <p className="text-gray-600 mb-6">
            此页面仅限VIP用户访问，请升级您的账户以享受专属功能。
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/payment')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
              立即升级VIP
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VIP页面内容
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* VIP欢迎区域 */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">VIP专属页面</h1>
          <p className="text-xl text-gray-600 mb-6">
            欢迎尊贵的VIP用户，这里是您的专属功能区域
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Crown className="w-3 h-3 mr-1" />
              VIP用户
            </Badge>
            {isAdmin && (
              <Badge className="bg-red-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                管理员
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRoles}
              disabled={loading}
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              刷新权限
            </Button>
          </div>
        </div>

        {/* VIP功能区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 专属功能1 */}
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                无限AI调用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                享受无限制的AI内容生成和适配功能，提升您的工作效率。
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>已激活</span>
              </div>
            </CardContent>
          </Card>

          {/* 专属功能2 */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                高级模型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                使用最新的AI模型，获得更高质量的内容生成结果。
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>已激活</span>
              </div>
            </CardContent>
          </Card>

          {/* 专属功能3 */}
          <Card className="border-2 border-green-200 hover:border-green-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                专属客服
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                享受7×24小时专属客服支持，快速解决您的问题。
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>已激活</span>
              </div>
            </CardContent>
          </Card>

          {/* 专属功能4 */}
          <Card className="border-2 border-yellow-200 hover:border-yellow-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                数据分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                查看详细的使用统计和数据分析报告。
              </p>
              <Button size="sm" variant="outline">
                查看报告
              </Button>
            </CardContent>
          </Card>

          {/* 专属功能5 */}
          <Card className="border-2 border-red-200 hover:border-red-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                高级设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                自定义AI参数和高级配置选项。
              </p>
              <Button size="sm" variant="outline">
                配置设置
              </Button>
            </CardContent>
          </Card>

          {/* 专属功能6 */}
          <Card className="border-2 border-indigo-200 hover:border-indigo-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                优先处理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                享受优先处理队列，快速获得AI生成结果。
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>已激活</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VIP用户信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              VIP用户信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">用户ID：</span>
                  <span className="font-mono text-sm">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户名：</span>
                  <span>{user?.nickname || user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">邮箱：</span>
                  <span>{user?.email || '未设置'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">手机：</span>
                  <span>{user?.phone || '未设置'}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">VIP状态：</span>
                  <Badge className="bg-green-600">已激活</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户角色：</span>
                  <div className="flex gap-1">
                    {roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {typeof role === 'string' ? role : role.name || role.code}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">权限级别：</span>
                  <span className="font-semibold">
                    {isAdmin ? '管理员' : 'VIP用户'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更新：</span>
                  <span className="text-sm">{new Date().toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/adapt')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
          >
            <Zap className="w-4 h-4" />
            开始使用AI功能
          </Button>
          
          <Button
            onClick={() => navigate('/creative')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            创意工作室
          </Button>
          
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            个人设置
          </Button>
        </div>

        {/* VIP特权说明 */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                VIP特权说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-purple-600">功能特权</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      无限制AI内容生成
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      高级AI模型访问
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      优先处理队列
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      专属客服支持
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">服务特权</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      7×24小时技术支持
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      专属功能优先体验
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      个性化定制服务
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      高级数据分析报告
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 