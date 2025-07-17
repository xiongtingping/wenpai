/**
 * API配置测试页面
 * 用于验证部署环境的API配置是否正确
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  ExternalLink,
  Copy,
  Settings
} from 'lucide-react';
import { 
  checkAPIConfig, 
  getConfigStatusSummary, 
  getDeploymentRecommendations,
  validateAPIKey 
} from '@/utils/apiConfigChecker';
import { getAPIConfig, reloadAPIConfig } from '@/config/apiConfig';

/**
 * API配置测试页面
 * 用于验证部署环境的API配置是否正确
 */
export default function APIConfigTestPage() {
  const [configResult, setConfigResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'deployment'>('overview');

  // 检查配置
  const checkConfig = async () => {
    setLoading(true);
    try {
      // 重新加载配置
      reloadAPIConfig();
      
      // 检查配置
      const result = checkAPIConfig();
      setConfigResult(result);
    } catch (error) {
      console.error('配置检查失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始检查
  useEffect(() => {
    checkConfig();
  }, []);

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'optional':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'missing':
        return 'bg-yellow-100 text-yellow-800';
      case 'optional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!configResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            正在检查API配置...
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusSummary = getConfigStatusSummary();
  const deploymentRecs = getDeploymentRecommendations();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              API配置测试
            </CardTitle>
            <Button onClick={checkConfig} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新检查
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 状态摘要 */}
          <Alert className={`mb-6 ${
            statusSummary.status === 'success' ? 'border-green-200 bg-green-50' :
            statusSummary.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-start gap-3">
              {statusSummary.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {statusSummary.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
              {statusSummary.status === 'error' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              <div>
                <h3 className="font-semibold mb-2">{statusSummary.message}</h3>
                <ul className="text-sm space-y-1">
                  {statusSummary.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Alert>

          {/* 标签页导航 */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              概览
            </Button>
            <Button
              variant={activeTab === 'details' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('details')}
            >
              详细配置
            </Button>
            <Button
              variant={activeTab === 'deployment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('deployment')}
            >
              部署配置
            </Button>
          </div>

          {/* 概览标签页 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 配置统计 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{configResult.summary.totalConfigs}</div>
                    <div className="text-sm text-gray-600">总配置项</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{configResult.summary.validConfigs}</div>
                    <div className="text-sm text-gray-600">有效配置</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{configResult.summary.requiredConfigs}</div>
                    <div className="text-sm text-gray-600">必需配置</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{configResult.summary.requiredValid}</div>
                    <div className="text-sm text-gray-600">必需有效</div>
                  </CardContent>
                </Card>
              </div>

              {/* 错误和警告 */}
              {configResult.errors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      配置错误 ({configResult.errors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {configResult.errors.map((error: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {configResult.warnings.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      配置警告 ({configResult.warnings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {configResult.warnings.map((warning: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 建议 */}
              {configResult.recommendations.length > 0 && (
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-600 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      配置建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {configResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 详细配置标签页 */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {configResult.details.map((detail: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(detail.status)}
                        <div>
                          <h4 className="font-medium">{detail.name}</h4>
                          <p className="text-sm text-gray-600">{detail.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(detail.status)}>
                          {detail.status === 'valid' && '有效'}
                          {detail.status === 'invalid' && '无效'}
                          {detail.status === 'missing' && '缺失'}
                          {detail.status === 'optional' && '可选'}
                        </Badge>
                        {detail.value && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(detail.value)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {detail.value && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm font-mono">
                        {detail.value}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 部署配置标签页 */}
          {activeTab === 'deployment' && (
            <div className="space-y-6">
              {deploymentRecs.map((platform, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      {platform.platform} 部署配置
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 环境变量 */}
                      <div>
                        <h4 className="font-medium mb-3">环境变量配置</h4>
                        <div className="space-y-2">
                          {platform.variables.map((variable, varIndex) => (
                            <div key={varIndex} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">{variable.name}</span>
                                  {variable.required && (
                                    <Badge variant="destructive" className="text-xs">必需</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {variable.value}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(variable.name)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* 配置步骤 */}
                      <div>
                        <h4 className="font-medium mb-3">配置步骤</h4>
                        <ol className="space-y-2">
                          {platform.instructions.map((instruction, instIndex) => (
                            <li key={instIndex} className="flex items-start gap-2 text-sm">
                              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {instIndex + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 