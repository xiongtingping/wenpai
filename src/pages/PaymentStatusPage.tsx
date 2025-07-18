/**
 * 支付服务状态检查页面
 * 用于诊断支付相关的配置和连接问题
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
  Wifi,
  WifiOff,
  Settings,
  CreditCard,
  Shield,
  Smartphone
} from 'lucide-react';
import { validateAllConfigs, getConfigSummary } from '@/utils/configValidator';

/**
 * 状态检查结果接口
 */
interface StatusCheckResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  timestamp: string;
}

/**
 * 支付服务状态检查页面
 * @returns {JSX.Element}
 */
export default function PaymentStatusPage() {
  const [checkResults, setCheckResults] = useState<StatusCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  /**
   * 执行状态检查
   */
  const performStatusCheck = async () => {
    setIsChecking(true);
    const results: StatusCheckResult[] = [];
    const now = new Date().toLocaleString();

    try {
      // 1. 检查网络连接
      results.push({
        name: '网络连接',
        status: navigator.onLine ? 'success' : 'error',
        message: navigator.onLine ? '网络连接正常' : '网络连接不可用',
        details: navigator.onLine ? '可以访问互联网' : '请检查网络设置',
        timestamp: now
      });

      // 2. 检查配置验证
      try {
        const configResult = await validateAllConfigs();
        results.push({
          name: '配置验证',
          status: configResult.isValid ? 'success' : 'warning',
          message: configResult.isValid ? '配置验证通过' : '配置验证失败',
          details: configResult.isValid 
            ? '所有必需配置已正确设置'
            : `缺失配置: ${configResult.missingConfigs.join(', ')}`,
          timestamp: now
        });

        // 3. 检查支付API连接
        results.push({
          name: '支付API连接',
          status: configResult.networkStatus.canConnect ? 'success' : 'error',
          message: configResult.networkStatus.canConnect ? '支付API连接正常' : '支付API连接失败',
          details: configResult.networkStatus.canConnect 
            ? `API端点: ${configResult.networkStatus.apiEndpoint}`
            : '无法连接到支付服务，请检查网络或联系客服',
          timestamp: now
        });

        // 4. 检查环境变量
        const envChecks = [
          { name: 'OpenAI API Key', key: 'VITE_OPENAI_API_KEY' },
          { name: 'Authing App ID', key: 'VITE_AUTHING_APP_ID' },
          { name: 'Creem API Key', key: 'VITE_CREEM_API_KEY' }
        ];

        envChecks.forEach(check => {
          const value = import.meta.env[check.key];
          results.push({
            name: check.name,
            status: value ? 'success' : 'error',
            message: value ? `${check.name}已配置` : `${check.name}未配置`,
            details: value ? '配置正确' : '请在环境变量中配置此值',
            timestamp: now
          });
        });

      } catch (error: any) {
        results.push({
          name: '配置验证',
          status: 'error',
          message: '配置验证过程出错',
          details: error.message,
          timestamp: now
        });
      }

      // 5. 检查浏览器兼容性
      const browserChecks = [
        { name: 'Fetch API', test: () => typeof fetch !== 'undefined' },
        { name: 'Promise支持', test: () => typeof Promise !== 'undefined' },
        { name: 'JSON支持', test: () => typeof JSON !== 'undefined' },
        { name: 'Canvas支持', test: () => typeof HTMLCanvasElement !== 'undefined' }
      ];

      browserChecks.forEach(check => {
        const isSupported = check.test();
        results.push({
          name: `浏览器${check.name}`,
          status: isSupported ? 'success' : 'error',
          message: isSupported ? `${check.name}支持正常` : `${check.name}不支持`,
          details: isSupported ? '浏览器功能正常' : '请使用现代浏览器',
          timestamp: now
        });
      });

    } catch (error: any) {
      results.push({
        name: '状态检查',
        status: 'error',
        message: '状态检查过程出错',
        details: error.message,
        timestamp: now
      });
    }

    setCheckResults(results);
    setLastCheckTime(now);
    setIsChecking(false);
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  /**
   * 组件挂载时自动检查
   */
  useEffect(() => {
    performStatusCheck();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          支付服务状态检查
        </h1>
        <p className="text-gray-600">
          诊断支付相关的配置和连接问题
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center mb-6">
        <Button 
          onClick={performStatusCheck}
          disabled={isChecking}
          className="flex items-center gap-2"
          size="lg"
        >
          {isChecking ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          {isChecking ? '检查中...' : '重新检查'}
        </Button>
      </div>

      {/* 状态摘要 */}
      {checkResults.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              状态摘要
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {checkResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">正常</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {checkResults.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">警告</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {checkResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">错误</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {checkResults.length}
                </div>
                <div className="text-sm text-gray-600">总计</div>
              </div>
            </div>
            {lastCheckTime && (
              <div className="text-center mt-4 text-sm text-gray-500">
                最后检查时间: {lastCheckTime}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 检查结果列表 */}
      <div className="space-y-4">
        {checkResults.map((result, index) => (
          <Card key={index} className={getStatusColor(result.status)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{result.name}</h3>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {result.status === 'success' ? '正常' : 
                       result.status === 'warning' ? '警告' : '错误'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500">{result.details}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 故障排除指南 */}
      <Separator className="my-8" />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            故障排除指南
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                网络问题
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 检查网络连接是否正常</li>
                <li>• 尝试刷新页面</li>
                <li>• 检查防火墙设置</li>
                <li>• 尝试使用其他网络</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                支付问题
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 确保支付宝App已安装</li>
                <li>• 检查支付宝账户余额</li>
                <li>• 确认支付限额设置</li>
                <li>• 联系客服获取帮助</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                配置问题
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 检查环境变量配置</li>
                <li>• 确认API密钥有效性</li>
                <li>• 验证域名设置</li>
                <li>• 查看控制台错误信息</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                浏览器问题
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 使用现代浏览器</li>
                <li>• 清除浏览器缓存</li>
                <li>• 禁用广告拦截器</li>
                <li>• 尝试无痕模式</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 联系客服 */}
      <div className="text-center mt-8">
        <p className="text-gray-600 mb-2">
          如果问题持续存在，请联系客服获取帮助
        </p>
        <Button variant="outline" onClick={() => window.open('mailto:support@example.com')}>
          联系客服
        </Button>
      </div>
    </div>
  );
} 