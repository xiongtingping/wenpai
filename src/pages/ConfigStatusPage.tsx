import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Settings,
  Shield,
  Zap,
  CreditCard,
  User
} from 'lucide-react';
import { getAPIConfig, getConfigSummary } from '@/config/apiConfig';
import { runConfigDiagnostics, generateConfigReport } from '@/utils/configDiagnostics';

/**
 * 配置状态页面
 * 显示当前所有配置的状态和说明
 */
const ConfigStatusPage: React.FC = () => {
  const [config, setConfig] = useState(getAPIConfig());
  const [summary, setSummary] = useState(getConfigSummary());
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 刷新配置状态
   */
  const refreshConfig = () => {
    setIsLoading(true);
    setTimeout(() => {
      setConfig(getAPIConfig());
      setSummary(getConfigSummary());
      setDiagnostics(runConfigDiagnostics());
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    setDiagnostics(runConfigDiagnostics());
  }, []);

  /**
   * 获取配置状态图标
   */
  const getStatusIcon = (status: 'valid' | 'invalid' | 'missing' | 'optional') => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'optional':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * 获取配置状态徽章
   */
  const getStatusBadge = (status: 'valid' | 'invalid' | 'missing' | 'optional') => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800">正常</Badge>;
      case 'invalid':
        return <Badge variant="destructive">错误</Badge>;
      case 'missing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">缺失</Badge>;
      case 'optional':
        return <Badge variant="outline">可选</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">配置状态检查</h1>
        <p className="text-gray-600">查看当前系统的配置状态和功能可用性</p>
      </div>

      {/* 刷新按钮 */}
      <div className="mb-6">
        <Button 
          onClick={refreshConfig} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          刷新配置状态
        </Button>
      </div>

      {/* 总体状态 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            总体状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalConfigs}</div>
              <div className="text-sm text-gray-600">总配置项</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.validConfigs}</div>
              <div className="text-sm text-gray-600">有效配置</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.requiredConfigs}</div>
              <div className="text-sm text-gray-600">必需配置</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.requiredValid}</div>
              <div className="text-sm text-gray-600">必需有效</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置详情 */}
      <div className="grid gap-6">
        {/* AI服务配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
            AI服务配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.details
                .filter(item => ['openai', 'deepseek', 'gemini'].includes(item.name))
                .map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium capitalize">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 认证配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              认证配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.details
                .filter(item => item.name === 'authing')
                .map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium capitalize">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 支付配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              支付配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.details
                .filter(item => ['creem', 'alipay', 'wechat'].includes(item.name))
                .map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium capitalize">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 安全配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              安全配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.details
                .filter(item => ['security', 'cors', 'rateLimit'].includes(item.name))
                .map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium capitalize">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 诊断结果 */}
      {diagnostics.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>配置诊断结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnostics.map((diagnostic, index) => (
                <Alert key={index} variant={diagnostic.status === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{diagnostic.message}</div>
                    {diagnostic.details.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm">
                        {diagnostic.details.map((detail: string, i: number) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}
                    {diagnostic.suggestions.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium text-sm">建议解决方案：</div>
                        <ul className="list-disc list-inside text-sm">
                          {diagnostic.suggestions.map((suggestion: string, i: number) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 配置说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>配置说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <strong>必需配置：</strong> 系统正常运行所必需的配置项，缺失会导致功能无法使用。
            </div>
            <div>
              <strong>可选配置：</strong> 增强功能或提供额外服务的配置项，缺失不会影响基本功能。
            </div>
            <div>
              <strong>AI服务：</strong> OpenAI、DeepSeek、Gemini等AI服务配置，用于内容生成和分析功能。
            </div>
            <div>
              <strong>支付服务：</strong> Creem、支付宝、微信支付等支付服务配置，用于付费功能。
            </div>
            <div>
              <strong>安全配置：</strong> CORS、速率限制等安全相关配置，用于保护系统安全。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigStatusPage; 