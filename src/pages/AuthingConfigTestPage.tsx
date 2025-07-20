/**
 * Authing 配置测试页面
 * 
 * 用于测试和诊断 Authing 配置问题
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { validateAuthingConfig, generateAuthingReport } from '@/utils/authingConfigValidator';
import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * Authing 配置测试页面
 */
const AuthingConfigTestPage: React.FC = () => {
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  /**
   * 运行配置验证
   */
  const runValidation = async () => {
    setLoading(true);
    try {
      const result = validateAuthingConfig();
      setValidation(result);
      
      const configReport = generateAuthingReport();
      setReport(configReport);
      
      console.log('🔍 配置验证结果:', result);
      console.log('📋 配置报告:', configReport);
    } catch (error) {
      console.error('❌ 验证失败:', error);
      setValidation({
        isValid: false,
        errors: [`验证过程发生错误: ${error.message}`],
        warnings: [],
        config: {},
        recommendations: ['请检查控制台错误信息']
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件加载时自动运行验证
   */
  useEffect(() => {
    runValidation();
  }, []);

  /**
   * 获取状态图标
   */
  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (isValid: boolean) => {
    return isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔐 Authing 配置测试
        </h1>
        <p className="text-gray-600">
          测试和诊断 Authing 身份认证配置问题
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="mb-6 flex gap-4">
        <Button 
          onClick={runValidation} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '验证中...' : '重新验证'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => {
            console.log('🔍 详细配置信息:', {
              authingConfig: getAuthingConfig(),
              guardConfig: getGuardConfig(),
              env: import.meta.env
            });
          }}
        >
          查看详细配置
        </Button>
      </div>

      {/* 验证结果 */}
      {validation && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getStatusIcon(validation.isValid)}
              <div>
                <CardTitle className="flex items-center gap-2">
                  配置验证结果
                  <Badge className={getStatusColor(validation.isValid)}>
                    {validation.isValid ? '通过' : '失败'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {validation.isValid 
                    ? 'Authing 配置验证通过，可以正常使用' 
                    : '发现配置问题，请查看下方详细信息'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 错误信息 */}
            {validation.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="font-semibold text-red-800 mb-2">错误信息:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-700">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* 警告信息 */}
            {validation.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div className="font-semibold text-yellow-800 mb-2">警告信息:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-yellow-700">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* 建议 */}
            {validation.recommendations.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="font-semibold text-blue-800 mb-2">建议:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-blue-700">{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* 配置详情 */}
      {validation?.config && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>配置详情</CardTitle>
            <CardDescription>
              当前 Authing 配置信息
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Authing 配置 */}
              <div>
                <h4 className="font-semibold mb-2">Authing 配置:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(validation.config.authing, null, 2)}
                </pre>
              </div>
              
              <Separator />
              
              {/* Guard 配置 */}
              <div>
                <h4 className="font-semibold mb-2">Guard 配置:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(validation.config.guard, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 环境信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>环境信息</CardTitle>
          <CardDescription>
            当前运行环境信息
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">环境变量:</h4>
              <div className="space-y-1 text-sm">
                <div>MODE: <Badge variant="outline">{import.meta.env.MODE}</Badge></div>
                <div>DEV: <Badge variant="outline">{import.meta.env.DEV ? 'true' : 'false'}</Badge></div>
                <div>PROD: <Badge variant="outline">{import.meta.env.PROD ? 'true' : 'false'}</Badge></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">浏览器信息:</h4>
              <div className="space-y-1 text-sm">
                <div>URL: <span className="font-mono">{window.location.href}</span></div>
                <div>Host: <span className="font-mono">{window.location.host}</span></div>
                <div>Port: <span className="font-mono">{window.location.port || '80/443'}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 下一步操作 */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>下一步操作</CardTitle>
            <CardDescription>
              根据验证结果建议的操作步骤
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {report.nextSteps.map((step: string, index: number) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ol>
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>提示:</strong> 如果配置验证失败，请检查：
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>环境变量是否正确设置</li>
                <li>Authing 控制台中的回调地址配置</li>
                <li>网络连接是否正常</li>
                <li>应用 ID 和域名是否正确</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthingConfigTestPage; 