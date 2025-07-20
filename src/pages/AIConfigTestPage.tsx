/**
 * AI配置测试页面
 * 用于测试AI API配置是否正确
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getAPIConfig, validateAPIConfig } from '@/config/apiConfig';
import { checkAIStatus } from '@/api/aiService';

export default function AIConfigTestPage() {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      // 检查配置
      const config = getAPIConfig();
      const validation = validateAPIConfig();
      
      setConfigStatus({
        config,
        validation
      });

      // 检查AI服务状态
      const status = await checkAIStatus();
      setAiStatus(status);
    } catch (err: any) {
      setError(err.message || '检查配置失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        正常
      </Badge>
    ) : (
      <Badge variant="destructive">
        异常
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI配置测试</h1>
        <Button onClick={checkConfig} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          重新检查
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {configStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(configStatus.validation.isValid)}
              配置状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">OpenAI</h3>
                <div className="flex items-center justify-between">
                  <span>API密钥</span>
                  {getStatusBadge(!!configStatus.config.openai.apiKey)}
                </div>
                <div className="flex items-center justify-between">
                  <span>API地址</span>
                  {getStatusBadge(!!configStatus.config.openai.baseURL)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Gemini</h3>
                <div className="flex items-center justify-between">
                  <span>API密钥</span>
                  {getStatusBadge(!!configStatus.config.gemini.apiKey)}
                </div>
                <div className="flex items-center justify-between">
                  <span>API地址</span>
                  {getStatusBadge(!!configStatus.config.gemini.baseURL)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Deepseek</h3>
                <div className="flex items-center justify-between">
                  <span>API密钥</span>
                  {getStatusBadge(!!configStatus.config.deepseek.apiKey)}
                </div>
                <div className="flex items-center justify-between">
                  <span>API地址</span>
                  {getStatusBadge(!!configStatus.config.deepseek.baseURL)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Creem</h3>
                <div className="flex items-center justify-between">
                  <span>API密钥</span>
                  {getStatusBadge(!!configStatus.config.creem.apiKey)}
                </div>
                <div className="flex items-center justify-between">
                  <span>API地址</span>
                  {getStatusBadge(!!configStatus.config.creem.baseURL)}
                </div>
              </div>
            </div>

            {configStatus.validation.missingKeys.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  缺少配置: {configStatus.validation.missingKeys.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {configStatus.validation.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  警告: {configStatus.validation.warnings.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {aiStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(aiStatus.openai || aiStatus.gemini || aiStatus.deepseek)}
              AI服务状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">OpenAI</h3>
                <div className="flex items-center justify-between">
                  <span>状态</span>
                  {getStatusBadge(aiStatus.openai)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Gemini</h3>
                <div className="flex items-center justify-between">
                  <span>状态</span>
                  {getStatusBadge(aiStatus.gemini)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Deepseek</h3>
                <div className="flex items-center justify-between">
                  <span>状态</span>
                  {getStatusBadge(aiStatus.deepseek)}
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>{aiStatus.message}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 