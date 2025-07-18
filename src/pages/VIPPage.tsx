import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
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

/**
 * VIP页面组件
 * @returns React 组件
 */
export default function VIPPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, login } = useUnifiedAuth();
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
        if (!isAuthenticated || !user) {
          securityUtils.secureLog('用户未登录，重定向到登录页面');
          toast({
            title: "需要登录",
            description: "请先登录后再访问VIP页面",
            variant: "destructive"
          });
          login();
          return;
        }

        // 等待角色检查完成
        if (loading) {
          return;
        }

        // 检查VIP权限
        if (!isVip && !isAdmin) {
          securityUtils.secureLog('非VIP用户尝试访问VIP页面', {
            userId: user.id,
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
          userId: user.id,
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
          userId: user?.id
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
  }, [isAuthenticated, user, isVip, isAdmin, roles, loading, navigate, toast, login]);

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎，VIP用户！
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            享受您的专属功能和特权
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {roles.map((role) => (
              <Badge key={role.code} variant="secondary" className="bg-purple-100 text-purple-800">
                {role.name}
              </Badge>
            ))}
          </div>
          <Button
            onClick={handleRefreshRoles}
            variant="outline"
            size="sm"
            className="mb-8"
          >
            <Settings className="w-4 h-4 mr-2" />
            刷新权限
          </Button>
        </div>

        {/* VIP功能区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 专属功能 */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Star className="w-5 h-5 mr-2" />
                专属功能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  无限AI调用次数
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  高级模型访问权限
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  优先客服支持
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 安全保护 */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Shield className="w-5 h-5 mr-2" />
                安全保护
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  数据加密存储
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  隐私保护
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  安全审计日志
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 性能优化 */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Zap className="w-5 h-5 mr-2" />
                性能优化
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  优先处理队列
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  高速响应
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  专属服务器
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 使用统计 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              使用统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">剩余调用次数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">VIP</div>
                <div className="text-sm text-gray-600">用户等级</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">客服支持</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">快速操作</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate('/ai-chat')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI对话
            </Button>
            <Button
              onClick={() => navigate('/emoji-generator')}
              variant="outline"
            >
              <Star className="w-4 h-4 mr-2" />
              表情生成
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              个人中心
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 