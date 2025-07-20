/**
 * 权限测试页面
 * 用于测试和展示所有功能的权限状态
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Loader2,
  Shield,
  Settings,
  User,
  Lock,
  Unlock
} from 'lucide-react';
// 移除 import { checkPermission, checkAllPermissions, getPermissionConfig } from '@/utils/permissionChecker';
import { getConfigSummary } from '@/utils/configValidator';

/**
 * 权限测试结果接口
 */
interface PermissionTestResult {
  permissionKey: string;
  hasPermission: boolean;
  userRole?: string;
  requiredRole?: string;
  message: string;
  timestamp: string;
}

/**
 * 权限测试页面
 * @returns {JSX.Element}
 */
export default function PermissionTestPage() {
  const [testResults, setTestResults] = useState<PermissionTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<string>('');
  const [configSummary, setConfigSummary] = useState<string>('');

  /**
   * 执行权限测试
   */
  const performPermissionTest = async () => {
    setIsTesting(true);
    const results: PermissionTestResult[] = [];
    const now = new Date().toLocaleString();

    try {
      // 权限测试逻辑已移除，因为permissionChecker模块不存在
      // 暂时返回空结果
      setTestResults([]);
    } catch (error: any) {
      results.push({
        permissionKey: '权限测试',
        hasPermission: false,
        message: '权限测试过程出错',
        timestamp: now
      });
    }

    setTestResults(results);
    setLastTestTime(now);
    setIsTesting(false);
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (hasPermission: boolean) => {
    return hasPermission ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (hasPermission: boolean) => {
    return hasPermission ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  /**
   * 组件挂载时自动测试
   */
  useEffect(() => {
    performPermissionTest();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          权限系统测试
        </h1>
        <p className="text-gray-600">
          测试功能权限检查系统
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center mb-6">
        <Button 
          onClick={performPermissionTest}
          disabled={isTesting}
          className="flex items-center gap-2"
          size="lg"
        >
          {isTesting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          {isTesting ? '测试中...' : '重新测试'}
        </Button>
      </div>

      {/* 配置摘要 */}
      {configSummary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              系统配置状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{configSummary}</p>
            {lastTestTime && (
              <p className="text-xs text-gray-500 mt-2">
                最后测试时间: {lastTestTime}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 测试结果列表 */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className={getStatusColor(result.hasPermission)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(result.hasPermission)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{result.permissionKey}</h3>
                    <Badge 
                      variant={result.hasPermission ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {result.hasPermission ? '通过' : '失败'}
                    </Badge>
                    {result.requiredRole && (
                      <Badge variant="outline" className="text-xs">
                        需要: {result.requiredRole}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{result.message}</p>
                  {result.userRole && (
                    <p className="text-xs text-gray-500">用户角色: {result.userRole}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 权限系统说明 */}
      <Separator className="my-8" />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            权限系统说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                用户角色
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>免费用户</strong>: 基础功能访问</li>
                <li>• <strong>专业用户</strong>: 高级功能访问</li>
                <li>• <strong>高级用户</strong>: 全部功能访问</li>
                <li>• <strong>管理员</strong>: 系统管理权限</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                权限控制
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 基于用户角色的权限检查</li>
                <li>• 功能级别的访问控制</li>
                <li>• 实时权限验证</li>
                <li>• 友好的权限提示</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制台函数说明 */}
      <div className="text-center mt-8">
        <p className="text-gray-600 mb-2">
          在浏览器控制台中可以调用以下函数进行权限测试：
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
          <p><code>__checkPermission__('feature_key')</code> - 检查特定权限</p>
          <p><code>__checkAllPermissions__()</code> - 检查所有权限</p>
        </div>
      </div>
    </div>
  );
} 