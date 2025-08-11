/**
 * AI连接测试组件
 * 用于测试和验证AI API配置是否正确
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Settings,
  RefreshCw,
  ExternalLink,
  Info
} from "lucide-react";
import { callAI, checkAIStatus, getAvailableModels } from '@/api/ai';
import { AISetupWizard } from './AISetupWizard';
import { toast } from "@/hooks/use-toast";

/**
 * AI服务状态
 */
interface AIServiceStatus {
  name: string;
  status: 'checking' | 'success' | 'error' | 'not_configuhsl(var(--destructive))';
  message: string;
  responseTime?: number;
  model?: string;
}

/**
 * AI连接测试组件
 */
export function AIConnectionTest() {
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [services, setServices] = useState<AIServiceStatus[]>([
    { name: 'OpenAI', status: 'not_configuhsl(var(--destructive))', message: '未配置' },
    { name: 'DeepSeek', status: 'not_configuhsl(var(--destructive))', message: '未配置' },
    { name: 'Gemini', status: 'not_configuhsl(var(--destructive))', message: '未配置' }
  ]);
  const [testProgress, setTestProgress] = useState(0);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    checkInitialConfig();
  }, []);

  /**
   * 检查初始配置
   */
  const checkInitialConfig = () => {
    const updatedServices = services.map(service => {
      let configured = false;
      
      switch (service.name) {
        case 'OpenAI':
          configured = !!import.meta.env.VITE_OPENAI_API_KEY &&
                      !import.meta.env.VITE_OPENAI_API_KEY.includes('your-');
          break;
        case 'DeepSeek':
          configured = !!import.meta.env.VITE_DEEPSEEK_API_KEY &&
                      !import.meta.env.VITE_DEEPSEEK_API_KEY.includes('your-');
          break;
        case 'Gemini':
          configured = !!import.meta.env.VITE_GEMINI_API_KEY &&
                      !import.meta.env.VITE_GEMINI_API_KEY.includes('your-');
          break;
      }

      return {
        ...service,
        status: configured ? 'configured' : 'not_configured',
        message: configured ? '已配置，待测试' : '未配置API密钥'
      };
    });

    setServices(updatedServices as AIServiceStatus[]);
    
    // 获取可用模型列表
    const models = getAvailableModels();
    setAvailableModels(models);
  };

  /**
   * 测试单个AI服务
   */
  const testSingleService = async (serviceName: string) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: 'checking', message: '测试中...' }
        : service
    ));

    try {
      const startTime = Date.now();
      let model = 'gpt-3.5-turbo';
      
      // 根据服务选择模型
      switch (serviceName) {
        case 'OpenAI':
          model = 'gpt-3.5-turbo';
          break;
        case 'DeepSeek':
          model = 'deepseek-chat';
          break;
        case 'Gemini':
          model = 'gemini-pro';
          break;
      }

      const response = await callAI({
        prompt: '请回复"连接测试成功"',
        model: model as any,
        maxTokens: 50,
        temperature: 0.1
      });

      const responseTime = Date.now() - startTime;

      if (response.success) {
        setServices(prev => prev.map(service => 
          service.name === serviceName 
            ? { 
                ...service, 
                status: 'success', 
                message: '连接成功',
                responseTime,
                model: response.model
              }
            : service
        ));

        toast({
          title: `${serviceName} 连接成功`,
          description: `响应时间: ${responseTime}ms`,
        });
      } else {
        throw new Error(response.error || '连接失败');
      }

    } catch (error) {
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { 
              ...service, 
              status: 'error', 
              message: error instanceof Error ? error.message : '连接失败'
            }
          : service
      ));

      toast({
        title: `${serviceName} 连接失败`,
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      });
    }
  };

  /**
   * 测试所有配置的服务
   */
  const testAllServices = async () => {
    setIsTestingAll(true);
    setTestProgress(0);

    const configuredServices = services.filter(service => 
      !service.message.includes('未配置')
    );

    if (configuredServices.length === 0) {
      toast({
        title: "无可测试服务",
        description: "请先配置至少一个AI API密钥",
        variant: "destructive",
      });
      setIsTestingAll(false);
      return;
    }

    for (let i = 0; i < configuredServices.length; i++) {
      const service = configuredServices[i];
      await testSingleService(service.name);
      setTestProgress(((i + 1) / configuredServices.length) * 100);
      
      // 添加延迟避免API限制
      if (i < configuredServices.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsTestingAll(false);
    
    toast({
      title: "测试完成",
      description: `已测试 ${configuredServices.length} 个AI服务`,
    });
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: AIServiceStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-foreground" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'not_configuhsl(var(--destructive))':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: AIServiceStatus['status']) => {
    switch (status) {
      case 'checking':
        return 'bg-accent border-border';
      case 'success':
        return 'bg-accent border-border';
      case 'error':
        return 'bg-accent border-border';
      case 'not_configuhsl(var(--destructive))':
        return 'bg-accent border-border';
      default:
        return 'bg-accent border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI服务连接测试
            </CardTitle>
            <CardDescription>
              验证AI API配置是否正确，确保内容生成功能正常工作
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkInitialConfig}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新配置
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSetupWizard(!showSetupWizard)}
            >
              <Settings className="h-4 w-4 mr-1" />
              配置向导
            </Button>
            <Button
              onClick={testAllServices}
              disabled={isTestingAll}
              size="sm"
            >
              {isTestingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  测试所有
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 配置向导 */}
        {showSetupWizard && (
          <div className="border rounded-lg p-4 bg-accent">
            <AISetupWizard />
          </div>
        )}

        {/* 测试进度 */}
        {isTestingAll && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>测试进度</span>
              <span>{Math.round(testProgress)}%</span>
            </div>
            <Progress value={testProgress} className="h-2" />
          </div>
        )}

        {/* 服务状态列表 */}
        <div className="grid gap-3">
          {services.map((service) => (
            <div
              key={service.name}
              className={`p-3 border rounded-lg ${getStatusColor(service.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">{service.message}</div>
                    {service.responseTime && (
                      <div className="text-xs text-muted-foreground">
                        响应时间: {service.responseTime}ms
                        {service.model && ` | 模型: ${service.model}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {service.status !== 'not_configuhsl(var(--destructive))' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSingleService(service.name)}
                      disabled={service.status === 'checking'}
                    >
                      {service.status === 'checking' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        '测试'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 配置提示 */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>如需配置AI API密钥，请：</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>在项目根目录找到 <code>.env.local</code> 文件</li>
                <li>填入对应的API密钥（如 VITE_OPENAI_API_KEY）</li>
                <li>重启开发服务器使配置生效</li>
                <li>点击"测试所有"验证连接</li>
              </ol>
              <div className="flex gap-2 mt-2">
                <Button variant="link" size="sm" asChild>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    获取OpenAI密钥
                  </a>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    获取DeepSeek密钥
                  </a>
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* 可用模型列表 */}
        {availableModels.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">可用AI模型</h4>
            <div className="flex flex-wrap gap-1">
              {availableModels.map((model) => (
                <Badge key={model} variant="secondary" className="text-xs">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
