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
  setModel,
  getModel,
  getAvailableModels,
  availableModels,
  modelDescriptions,
  AIApiResponse
} from "@/api/contentAdapter";
import { Loader2, CheckCircle2, XCircle, Zap } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ApiTestPage = () => {
  const [testContent, setTestContent] = useState("这是一段测试内容，用于检查API连接是否正常工作。希望能够顺利适配到各个平台。");
  const [loading, setLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<AIApiResponse | null>(null);
  const [apiStatus, setApiStatus] = useState(getApiStatus());
  const [apiCheckLoading, setApiCheckLoading] = useState(false);
  const [apiProvider, setCurrentApiProvider] = useState<'openai' | 'gemini' | 'deepseek'>(getApiProvider());
  const [selectedModel, setSelectedModel] = useState(getModel());
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const { toast } = useToast();

  // Update API provider when selection changes
  const handleApiProviderChange = (value: 'openai' | 'gemini' | 'deepseek') => {
    setCurrentApiProvider(value);
    setApiProvider(value);
    
    // Reset model to first available model for new provider
    const available = getAvailableModels(userPlan);
    if (available.length > 0) {
      setSelectedModel(available[0]);
      setModel(available[0]);
    }
    
    const providerNames = {
      'openai': 'OpenAI',
      'gemini': 'Google Gemini',
      'deepseek': 'DeepSeek'
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

  // Update model when selection changes
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setModel(value);
    
    toast({
      title: "模型已更改",
      description: `现在使用 ${value} 模型`,
      variant: "default",
    });
  };

  // Update user plan
  const handleUserPlanChange = (value: 'free' | 'pro') => {
    setUserPlan(value);
    
    // Check if current model is still available for new plan
    const available = getAvailableModels(value);
    if (!available.includes(selectedModel) && available.length > 0) {
      setSelectedModel(available[0]);
      setModel(available[0]);
    }
    
    toast({
      title: "用户计划已更改",
      description: `现在使用 ${value === 'free' ? '免费版' : '专业版'} 权限`,
      variant: "default",
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
        'deepseek': 'DeepSeek'
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
        'deepseek': 'DeepSeek'
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
          本页面用于测试与 AI API 的连接情况，支持 OpenAI、Google Gemini 和 DeepSeek，验证内容生成功能是否正常工作。
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
                onValueChange={(value: 'openai' | 'gemini' | 'deepseek') => handleApiProviderChange(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai" className="flex items-center">
                    <span className="text-blue-600 font-semibold">OpenAI</span>
                    <span className="ml-2 text-gray-500 text-sm">(GPT-3.5/4系列)</span>
                  </Label>
                </div>
                {/* 暂时隐藏 Gemini API 选项 */}
                {/* <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="flex items-center">
                    <span className="text-emerald-600 font-semibold">Google Gemini</span>
                    <span className="ml-2 text-gray-500 text-sm">(gemini-pro)</span>
                    <Badge variant="secondary" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" /> 当前使用
                    </Badge>
                  </Label>
                </div> */}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deepseek" id="deepseek" />
                  <Label htmlFor="deepseek" className="flex items-center">
                    <span className="text-orange-600 font-semibold">DeepSeek</span>
                    <span className="ml-2 text-gray-500 text-sm">(DeepSeek系列)</span>
                    <Badge variant="secondary" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" /> 新增
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
                检查与 {apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'gemini' ? 'Google Gemini' : 'DeepSeek'} API 的连接状态
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>用户计划</CardTitle>
              <CardDescription>选择您的用户计划以确定可用模型</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                className="flex flex-col space-y-4"
                value={userPlan} 
                onValueChange={(value: 'free' | 'pro') => handleUserPlanChange(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="flex items-center">
                    <span className="text-gray-600 font-semibold">免费版</span>
                    <span className="ml-2 text-gray-500 text-sm">(基础模型)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pro" id="pro" />
                  <Label htmlFor="pro" className="flex items-center">
                    <span className="text-blue-600 font-semibold">专业版</span>
                    <span className="ml-2 text-gray-500 text-sm">(所有模型)</span>
                    <Badge variant="secondary" className="ml-2">
                      <Zap className="h-3 w-3 mr-1" /> 推荐
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 模型选择</CardTitle>
              <CardDescription>选择适合您需求的AI模型</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableModels(userPlan).map((model) => {
                      const modelInfo = modelDescriptions[model as keyof typeof modelDescriptions];
                      return (
                        <SelectItem key={model} value={model}>
                          <div className="flex flex-col">
                            <span className="font-medium">{modelInfo?.name || model}</span>
                            <span className="text-xs text-gray-500">{modelInfo?.description}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {selectedModel && modelDescriptions[selectedModel as keyof typeof modelDescriptions] && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {modelDescriptions[selectedModel as keyof typeof modelDescriptions].name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {modelDescriptions[selectedModel as keyof typeof modelDescriptions].description}
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">适用场景:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {modelDescriptions[selectedModel as keyof typeof modelDescriptions].useCases.map((useCase, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">优势:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {modelDescriptions[selectedModel as keyof typeof modelDescriptions].strengths.map((strength, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">最适合:</span>
                        <p className="text-xs text-gray-600 mt-1">
                          {modelDescriptions[selectedModel as keyof typeof modelDescriptions].bestFor}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
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
                     'DeepSeek API'}
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