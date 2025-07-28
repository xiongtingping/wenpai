/**
 * AI API 设置向导组件
 * 帮助用户配置AI API密钥
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Info,
  Zap,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * AI API 设置向导组件
 */
export function AISetupWizard() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    deepseek: '',
    gemini: ''
  });

  const [showKeys, setShowKeys] = useState({
    openai: false,
    deepseek: false,
    gemini: false
  });

  /**
   * 处理API密钥输入
   */
  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  /**
   * 切换密钥显示状态
   */
  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  /**
   * 复制配置到剪贴板
   */
  const copyConfiguration = () => {
    const config = `# AI API 配置
# 请将以下内容添加到 .env.local 文件中

# OpenAI API 配置（主要AI服务）
VITE_OPENAI_API_KEY=${apiKeys.openai || 'sk-your-openai-api-key-here'}
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4
VITE_OPENAI_TIMEOUT=30000

# DeepSeek API 配置（备用AI服务，可选）
VITE_DEEPSEEK_API_KEY=${apiKeys.deepseek || 'sk-your-deepseek-api-key-here'}
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_TIMEOUT=30000

# Google Gemini API 配置（备用AI服务，可选）
VITE_GEMINI_API_KEY=${apiKeys.gemini || 'your-gemini-api-key-here'}
VITE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com
VITE_GEMINI_MODEL=gemini-pro
VITE_GEMINI_TIMEOUT=30000

# AI功能开关
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_CONTENT_ADAPTATION=true
VITE_ENABLE_IMAGE_GENERATION=true`;

    navigator.clipboard.writeText(config);
    toast({
      title: "配置已复制",
      description: "请粘贴到 .env.local 文件中并重启开发服务器",
    });
  };

  /**
   * 验证API密钥格式
   */
  const validateApiKey = (provider: string, key: string): boolean => {
    if (!key) return false;
    
    switch (provider) {
      case 'openai':
      case 'deepseek':
        return key.startsWith('sk-') && key.length > 20;
      case 'gemini':
        return key.length > 10 && !key.includes('your-');
      default:
        return false;
    }
  };

  /**
   * 获取API密钥状态
   */
  const getKeyStatus = (provider: string, key: string) => {
    if (!key) return 'empty';
    if (validateApiKey(provider, key)) return 'valid';
    return 'invalid';
  };

  /**
   * 渲染API密钥输入框
   */
  const renderKeyInput = (provider: string, name: string, description: string, getUrl: string) => {
    const key = apiKeys[provider as keyof typeof apiKeys];
    const isVisible = showKeys[provider as keyof typeof showKeys];
    const status = getKeyStatus(provider, key);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor={provider} className="text-sm font-medium">
            {name} API密钥
          </Label>
          <Button variant="link" size="sm" asChild>
            <a href={getUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              获取密钥
            </a>
          </Button>
        </div>
        
        <div className="relative">
          <Input
            id={provider}
            type={isVisible ? 'text' : 'password'}
            placeholder={`输入${name} API密钥...`}
            value={key}
            onChange={(e) => handleKeyChange(provider, e.target.value)}
            className={`pr-20 ${
              status === 'valid' ? 'border-green-300' : 
              status === 'invalid' ? 'border-red-300' : ''
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleKeyVisibility(provider)}
              className="h-6 w-6 p-0"
            >
              {isVisible ? '🙈' : '👁️'}
            </Button>
            {status === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'invalid' && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
        </div>
        
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI API 配置向导
          </CardTitle>
          <CardDescription>
            配置AI API密钥以启用内容生成功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
              <TabsTrigger value="gemini">Gemini</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4">
              {renderKeyInput(
                'openai',
                'OpenAI',
                '推荐使用，功能最全面，支持GPT-4等先进模型',
                'https://platform.openai.com/api-keys'
              )}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  OpenAI是目前最强大的AI服务，建议优先配置。需要有效的信用卡进行验证。
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="deepseek" className="space-y-4">
              {renderKeyInput(
                'deepseek',
                'DeepSeek',
                '可选配置，成本更低的备用AI服务',
                'https://platform.deepseek.com/'
              )}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  DeepSeek提供高性价比的AI服务，可作为OpenAI的备用选择。
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="gemini" className="space-y-4">
              {renderKeyInput(
                'gemini',
                'Google Gemini',
                '可选配置，Google的AI服务，免费额度较高',
                'https://makersuite.google.com/app/apikey'
              )}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Google Gemini提供较高的免费使用额度，适合轻度使用。
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 配置步骤 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            配置步骤
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              <strong>获取API密钥：</strong>
              点击上方"获取密钥"链接，注册并获取对应的API密钥
            </li>
            <li>
              <strong>输入密钥：</strong>
              在上方输入框中填入获取的API密钥
            </li>
            <li>
              <strong>复制配置：</strong>
              点击下方"复制配置"按钮，将配置复制到剪贴板
            </li>
            <li>
              <strong>更新环境文件：</strong>
              在项目根目录找到 <code>.env.local</code> 文件，粘贴配置内容
            </li>
            <li>
              <strong>重启服务：</strong>
              重启开发服务器使配置生效
            </li>
            <li>
              <strong>测试连接：</strong>
              使用"AI连接测试"功能验证配置是否正确
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button onClick={copyConfiguration} className="flex-1">
          <Copy className="h-4 w-4 mr-2" />
          复制配置到剪贴板
        </Button>
        <Button variant="outline" asChild>
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            获取OpenAI密钥
          </a>
        </Button>
      </div>

      {/* 重要提示 */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>重要提示：</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>API密钥是敏感信息，请妥善保管，不要分享给他人</li>
              <li>建议定期检查API使用量，避免超出预算</li>
              <li>至少需要配置一个AI服务才能使用内容生成功能</li>
              <li>推荐优先配置OpenAI，功能最完整</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
