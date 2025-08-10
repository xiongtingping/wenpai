/**
 * 文件格式支持测试页面
 * 用于测试和验证所有支持的文件格式是否能正常解析内容
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Play, 
  Download,
  RefreshCw
} from 'lucide-react';

import FileFormatTester, { FileFormatTestResult } from '@/utils/fileFormatTester';
import FileFormatSupportService from '@/services/fileFormatSupportService';
import FileFormatDisplay from '@/components/ui/FileFormatDisplay';
import WordDocumentTester, { WordTestResult } from '@/utils/wordDocumentTester';

export default function FileFormatTestPage() {
  const [tester] = useState(() => new FileFormatTester());
  const [formatService] = useState(() => FileFormatSupportService.getInstance());
  const [wordTester] = useState(() => new WordDocumentTester());
  const [testResults, setTestResults] = useState<FileFormatTestResult[]>([]);
  const [wordTestResults, setWordTestResults] = useState<WordTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isWordTesting, setIsWordTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string>('');
  const { toast } = useToast();

  // 初始化支持的格式列表
  useEffect(() => {
    const formats = tester.getSupportedFormats();
    setTestResults(formats);
  }, [tester]);

  /**
   * 运行所有格式测试
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('');

    try {
      const formats = tester.getSupportedFormats();
      const results: FileFormatTestResult[] = [];

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i];
        setCurrentTest(`测试 ${format.extension} (${format.description})`);
        setProgress(((i + 1) / formats.length) * 100);

        try {
          const result = await tester.testSingleFormat(format);
          results.push(result);
          
          // 实时更新结果
          setTestResults(prev => prev.map(r => 
            r.extension === result.extension ? result : r
          ));

          // 添加延迟避免过快处理
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`测试 ${format.extension} 失败:`, error);
          results.push({
            ...format,
            testStatus: 'error',
            testMessage: `测试异常：${error instanceof Error ? error.message : '未知错误'}`
          });
        }
      }

      const successCount = results.filter(r => r.testStatus === 'success').length;
      const totalCount = results.length;

      toast({
        title: "测试完成",
        description: `成功解析 ${successCount}/${totalCount} 种格式 (${((successCount / totalCount) * 100).toFixed(1)}%)`,
      });

    } catch (error) {
      console.error('测试过程出错:', error);
      toast({
        title: "测试失败",
        description: "测试过程中出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentTest('');
    }
  };

  /**
   * 重置测试结果
   */
  const resetTests = () => {
    const formats = tester.getSupportedFormats();
    setTestResults(formats);
    setProgress(0);
    setCurrentTest('');
  };

  /**
   * 下载测试报告
   */
  const downloadReport = () => {
    const report = tester.generateTestReport(testResults);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file-format-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "报告已下载",
      description: "测试报告已保存为 Markdown 文件",
    });
  };

  /**
   * 处理Word文档测试
   */
  const handleWordFileTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsWordTesting(true);
    const results: WordTestResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`🧪 测试Word文档 ${i + 1}/${files.length}: ${file.name}`);

        const result = await wordTester.testWordDocument(file);
        results.push(result);
      }

      setWordTestResults(results);

      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Word文档测试完成",
        description: `测试了 ${results.length} 个文档，成功解析 ${successCount} 个`,
      });

    } catch (error) {
      console.error('Word文档测试失败:', error);
      toast({
        title: "测试失败",
        description: "Word文档测试过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsWordTesting(false);
    }
  };

  const successCount = testResults.filter(r => r.testStatus === 'success').length;
  const errorCount = testResults.filter(r => r.testStatus === 'error').length;
  const totalCount = testResults.length;

  return (
    <div className="min-h-screen bg-gradient-primary particle-background">
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文件格式支持测试</h1>
          <p className="text-muted-foreground mt-2">
            测试和验证所有支持的文件格式是否能正常解析内容
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={resetTests}
            variant="outline"
            disabled={isRunning}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          
          <Button
            onClick={downloadReport}
            variant="outline"
            disabled={testResults.every(r => r.testStatus === 'not_tested')}
          >
            <Download className="h-4 w-4 mr-2" />
            下载报告
          </Button>
          
          <Button
            onClick={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? '测试中...' : '开始测试'}
          </Button>
        </div>
      </div>

      {/* 测试进度 */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Word文档专项测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Word文档解析测试
          </CardTitle>
          <CardDescription>
            专门测试Word文档(.docx/.doc)的解析功能，上传Word文档进行解析测试
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <input
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                multiple
                onChange={handleWordFileTest}
                disabled={isWordTesting}
                className="hidden"
                id="word-file-input"
              />
              <Button
                onClick={() => document.getElementById('word-file-input')?.click()}
                disabled={isWordTesting}
                variant="outline"
              >
                {isWordTesting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isWordTesting ? '测试中...' : '选择Word文档'}
              </Button>
            </div>

            {wordTestResults.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>已测试 {wordTestResults.length} 个文档</span>
                <span>•</span>
                <span className="text-foreground">
                  成功 {wordTestResults.filter(r => r.success).length} 个
                </span>
                <span>•</span>
                <span className="text-destructive">
                  失败 {wordTestResults.filter(r => !r.success).length} 个
                </span>
              </div>
            )}
          </div>

          {/* Word测试结果 */}
          {wordTestResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">测试结果:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {wordTestResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-foreground" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium">{result.fileInfo.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(result.fileInfo.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.success ? (
                        <span className="text-foreground">
                          {result.parseInfo?.textLength} 字符
                        </span>
                      ) : (
                        <span className="text-destructive">{result.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试概况 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">总计格式</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{successCount}</div>
            <p className="text-xs text-muted-foreground">成功解析</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{errorCount}</div>
            <p className="text-xs text-muted-foreground">解析失败</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">成功率</p>
          </CardContent>
        </Card>
      </div>

      {/* 测试结果列表 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result) => (
              <div
                key={result.extension}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.extension}</span>
                      <Badge variant="outline">{result.description}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      MIME: {result.mimeType}
                    </p>
                    {result.testMessage && (
                      <p className="text-sm mt-2">{result.testMessage}</p>
                    )}
                    {result.sampleContent && (
                      <div className="mt-2 p-2 bg-accent rounded text-xs">
                        <strong>示例内容：</strong>
                        <br />
                        {result.sampleContent}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {result.contentLength && (
                    <Badge variant="secondary">
                      {result.contentLength} 字符
                    </Badge>
                  )}
                  
                  {result.testStatus === 'success' && (
                    <CheckCircle className="h-5 w-5 text-foreground" />
                  )}
                  {result.testStatus === 'error' && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  {result.testStatus === 'testing' && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {result.testStatus === 'not_tested' && (
                    <div className="h-5 w-5 rounded-full border-2 border-border" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 详细格式支持展示 */}
      <FileFormatDisplay
        mode="detailed"
        showCategories={true}
        showQuality={true}
        className="mb-6"
      />

      {/* 使用说明 */}
      <Alert>
        <AlertDescription>
          <strong>使用说明：</strong>
          点击"开始测试"按钮将自动测试所有支持的文件格式。测试过程中会创建示例文件并尝试解析内容，
          以验证文件解析功能是否正常工作。测试完成后可以下载详细的测试报告。
        </AlertDescription>
      </Alert>
      </div>
    </div>
  );
}
