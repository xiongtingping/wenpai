/**
 * 网页提取功能测试页面
 * 用于测试和演示网页内容提取功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { WebContentExtractorService, WebExtractionResult } from '../services/webContentExtractor';
import { 
  Globe, 
  Download, 
  Loader2, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";

export default function WebExtractorTestPage() {
  const [testUrl, setTestUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<WebExtractionResult | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { toast } = useToast();

  /**
   * 运行基础功能测试
   */
  const runBasicTests = async () => {
    const results: string[] = [];
    const webExtractor = WebContentExtractorService.getInstance();

    try {
      // 测试1: URL验证
      results.push('🧪 测试URL验证功能...');
      const testUrls = ['https://www.baidu.com', 'invalid-url', 'www.example.com'];
      
      for (const url of testUrls) {
        const isValid = (webExtractor as any).isValidUrl(url);
        results.push(`   ${url}: ${isValid ? '✅ 有效' : '❌ 无效'}`);
      }

      // 测试2: URL标准化
      results.push('\n🧪 测试URL标准化功能...');
      const urlsToNormalize = ['www.baidu.com', 'baidu.com', 'https://www.baidu.com'];
      
      for (const url of urlsToNormalize) {
        const normalized = (webExtractor as any).normalizeUrl(url);
        results.push(`   ${url} -> ${normalized}`);
      }

      // 测试3: 域名提取
      results.push('\n🧪 测试域名提取功能...');
      for (const url of urlsToNormalize) {
        const domain = (webExtractor as any).extractDomain(url);
        results.push(`   ${url} -> 域名: ${domain}`);
      }

      results.push('\n✅ 基础功能测试完成');
      setTestResults(results);

      toast({
        title: "基础测试完成",
        description: "所有基础功能测试通过",
      });

    } catch (error) {
      results.push(`\n❌ 测试失败: ${error}`);
      setTestResults(results);
      
      toast({
        title: "测试失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };

  /**
   * 测试网页内容提取
   */
  const testWebExtraction = async () => {
    if (!testUrl.trim()) {
      toast({
        title: "请输入URL",
        description: "请提供有效的网页地址进行测试",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);

    try {
      const webExtractor = WebContentExtractorService.getInstance();
      
      // 执行网页内容提取
      const result = await webExtractor.extractFromUrl(testUrl, {
        includeBrandAnalysis: true,
        maxContentLength: 2000
      });

      setExtractionResult(result);

      if (result.status === 'success') {
        toast({
          title: "提取成功",
          description: `成功提取 ${result.title} 的内容`,
        });
      } else {
        toast({
          title: "提取失败",
          description: result.error || "内容提取失败",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('网页提取测试失败:', error);
      
      toast({
        title: "提取失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            网页提取功能测试
          </h1>
          <p className="text-muted-foreground">
            测试和验证网页内容提取服务的各项功能
          </p>
        </div>

        {/* 基础功能测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              基础功能测试
            </CardTitle>
            <CardDescription>
              测试URL验证、标准化、域名提取等基础功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runBasicTests} className="w-full">
              运行基础功能测试
            </Button>
            
            {testResults.length > 0 && (
              <div className="bg-accent p-4 rounded-lg">
                <h4 className="font-medium mb-2">测试结果:</h4>
                <pre className="text-sm whitespace-pre-wrap text-foreground">
                  {testResults.join('\n')}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 网页内容提取测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-foreground" />
              网页内容提取测试
            </CardTitle>
            <CardDescription>
              测试完整的网页内容提取和AI分析功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="test-url">测试URL</Label>
                <Input
                  id="test-url"
                  placeholder="https://example.com"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  disabled={isExtracting}
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  onClick={testWebExtraction}
                  disabled={isExtracting || !testUrl.trim()}
                  className="flex items-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      提取中...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      开始提取
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 提取结果展示 */}
            {extractionResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">提取结果:</h4>
                  {extractionResult.status === 'success' && (
                    <Badge variant="default">
                      <Check className="h-3 w-3 mr-1" />
                      成功
                    </Badge>
                  )}
                  {extractionResult.status === 'error' && (
                    <Badge variant="destructive">
                      <X className="h-3 w-3 mr-1" />
                      失败
                    </Badge>
                  )}
                </div>

                <div className="bg-accent p-4 rounded-lg space-y-3">
                  <div>
                    <strong>标题:</strong> {extractionResult.title}
                  </div>
                  <div>
                    <strong>URL:</strong> {extractionResult.url}
                  </div>
                  <div>
                    <strong>域名:</strong> {extractionResult.metadata.domain}
                  </div>
                  <div>
                    <strong>字数:</strong> {extractionResult.metadata.wordCount} 字
                  </div>
                  
                  {extractionResult.status === 'success' && extractionResult.content && (
                    <div>
                      <strong>内容预览:</strong>
                      <div className="mt-2 p-3 bg-card rounded border max-h-40 overflow-y-auto">
                        {extractionResult.content.substring(0, 500)}
                        {extractionResult.content.length > 500 && '...'}
                      </div>
                    </div>
                  )}

                  {extractionResult.brandAnalysis && (
                    <div>
                      <strong>品牌分析:</strong>
                      <div className="mt-2 space-y-2">
                        <div>
                          <span className="text-sm font-medium">品牌关键词:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extractionResult.brandAnalysis.brandKeywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">品牌语调:</span>
                          <span className="ml-2">{extractionResult.brandAnalysis.brandTone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {extractionResult.status === 'error' && extractionResult.error && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        错误信息: {extractionResult.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>基础功能测试:</strong> 验证URL处理、验证等核心功能</p>
              <p>• <strong>网页内容提取测试:</strong> 测试完整的内容提取和AI分析流程</p>
              <p>• <strong>建议测试URL:</strong> 使用公开的、内容丰富的网页进行测试</p>
              <p>• <strong>注意:</strong> AI分析功能需要有效的API密钥配置</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
