import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  checkApiAvailability,
  generateAdaptedContent,
  getApiStatus,
  setApiProvider,
  getApiProvider,
  AIApiResponse
} from "@/api/contentAdapter";
import { Loader2, CheckCircle2, XCircle, Zap } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ApiTestPage = () => {
  const [testContent, setTestContent] = useState("这是一段测试内容，用于检查API连接是否正常工作。希望能够顺利适配到各个平台。");
  const [loading, setLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<AIApiResponse | null>(null);
  const [apiStatus, setApiStatus] = useState(getApiStatus());
  const [apiCheckLoading, setApiCheckLoading] = useState(false);
  const [apiProvider, setCurrentApiProvider] = useState<'openai' | 'gemini' | 'siliconflow'>(getApiProvider());
  const { toast } = useToast();

  // Update API provider when selection changes
  const handleApiProviderChange = (value: 'openai' | 'gemini' | 'siliconflow') => {
    setCurrentApiProvider(value);
    setApiProvider(value);
    
    const providerNames = {
      'openai': 'OpenAI',
      'gemini': 'Google Gemini',
      'siliconflow': 'SiliconFlow'
    };
    
    toast({
      title: "API 提供商已更改",
      description: `现在使用 ${providerNames[value]} API`,
      variant: "default",
    });
    
    // Reset status after changing provider
    setApiStatus({
      available: true,
      lastChecked: new Date(),
      errorMessage: undefined,
      responseTime: undefined
    });
  };

  // Test API availability
  const testApiAvailability = async () => {
    setApiCheckLoading(true);
    try {
      const isAvailable = await checkApiAvailability();
      setApiStatus(getApiStatus());
      
      const providerNames = {
        'openai': 'OpenAI',
        'gemini': 'Google Gemini',
        'siliconflow': 'SiliconFlow'
      };
      
      toast({
        title: isAvailable ? "API连接正常" : "API连接失败",
        description: isAvailable 
          ? `成功连接到${providerNames[apiProvider]} API` 
          : `连接失败: ${getApiStatus().errorMessage || "未知错误"}`,
        variant: isAvailable ? "default" : "destructive",
      });
    } catch (error) {
      console.error("API check error:", error);
      toast({
        title: "API检查出错",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setApiCheckLoading(false);
    }
  };

  // Test content generation
  const testContentGeneration = async () => {
    if (!testContent.trim()) {
      toast({
        title: "内容不能为空",
        description: "请输入测试内容",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTestResponse(null);

    try {
      // Generate content for a single platform (知乎) as a test
      const result = await generateAdaptedContent({
        originalContent: testContent,
        targetPlatforms: ['zhihu'],
        platformSettings: {
          'zhihu-brandLibrary': false
        }
      });

      // Get the response for 知乎
      const adaptedContent = result['zhihu'];
      setTestResponse(adaptedContent);

      const providerNames = {
        'openai': 'OpenAI',
        'gemini': 'Google Gemini',
        'siliconflow': 'SiliconFlow'
      };
      
      toast({
        title: adaptedContent.source === "ai" ? "内容生成成功" : "使用模拟内容",
        description: adaptedContent.source === "ai" 
          ? `${providerNames[apiProvider]} API成功生成内容` 
          : `使用了模拟内容: ${adaptedContent.error || "API可能不可用"}`,
        variant: adaptedContent.source === "ai" ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Test generation error:", error);
      toast({
        title: "内容生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">多模型 API 连接测试工具</h1>
        <p className="text-gray-500 mb-8">
          本页面用于测试与 AI API 的连接情况，支持 OpenAI、Google Gemini 和 SiliconFlow，验证内容生成功能是否正常工作。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>API 提供商选择</CardTitle>
              <CardDescription>选择用于内容生成的 AI 模型提供商</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                className="flex flex-col space-y-4"
                value={apiProvider} 
                onValueChange={(value: 'openai' | 'gemini' | 'siliconflow') => handleApiProviderChange(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai" className="flex items-center">
                    <span className="text-blue-600 font-semibold">OpenAI</span>
                    <span className="ml-2 text-gray-500 text-sm">(gpt-3.5-turbo)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="flex items-center">
                    <span className="text-emerald-600 font-semibold">Google Gemini</span>
                    <span className="ml-2 text-gray-500 text-sm">(gemini-pro)</span>
                    <Badge variant="secondary" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" /> 当前使用
                    </Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="siliconflow" id="siliconflow" />
                  <Label htmlFor="siliconflow" className="flex items-center">
                    <span className="text-purple-600 font-semibold">SiliconFlow</span>
                    <span className="ml-2 text-gray-500 text-sm">(qwen2.5-32b-instruct)</span>
                    <Badge variant="secondary" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" /> 备用
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API 连接状态</CardTitle>
              <CardDescription>
                检查与 {apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'gemini' ? 'Google Gemini' : 'SiliconFlow'} API 的连接状态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <span>当前状态:</span>
                {apiStatus.available ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> 可用
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="w-4 h-4 mr-1" /> 不可用
                  </Badge>
                )}
              </div>
              {apiStatus.errorMessage && (
                <div className="text-sm text-red-500 mb-4">
                  错误信息: {apiStatus.errorMessage}
                </div>
              )}
              {apiStatus.responseTime && (
                <div className="text-sm text-gray-500 mb-4">
                  响应时间: {apiStatus.responseTime}ms
                </div>
              )}
              <div className="text-sm text-gray-500">
                上次检查: {apiStatus.lastChecked.toLocaleString()}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={testApiAvailability} disabled={apiCheckLoading}>
                {apiCheckLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                检查API连接
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>内容生成测试</CardTitle>
              <CardDescription>测试AI内容生成功能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="testContent" className="block text-sm font-medium text-gray-700 mb-1">
                  测试内容:
                </label>
                <Textarea
                  id="testContent"
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder="输入需要测试的内容..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={testContentGeneration} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                测试内容生成
              </Button>
            </CardFooter>
          </Card>
        </div>

        {testResponse && (
          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
              <CardDescription>
                内容生成源: {' '}
                {testResponse.source === 'ai' ? (
                  <Badge variant="outline" className={
                    apiProvider === 'openai' ? "bg-blue-50 text-blue-700 border-blue-200" :
                    apiProvider === 'gemini' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    "bg-purple-50 text-purple-700 border-purple-200"
                  }>
                    {apiProvider === 'openai' ? 'OpenAI API' : 
                     apiProvider === 'gemini' ? 'Google Gemini API' : 
                     'SiliconFlow API'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    本地模拟
                  </Badge>
                )}
                {testResponse.error && (
                  <span className="ml-2 text-red-500">
                    (错误: {testResponse.error})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {testResponse.content || "内容为空"}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default ApiTestPage;