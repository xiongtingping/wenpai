import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, FileImage, FileSpreadsheet, FileType, Presentation } from 'lucide-react';
import AIAnalysisService from '@/services/aiAnalysisService';

interface FileTestResult {
  fileName: string;
  fileType: string;
  fileSize: string;
  contentLength: number;
  extractedContent: string;
  status: 'success' | 'error' | 'processing';
  errorMessage?: string;
}

export default function FileTypeTestPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [testResults, setTestResults] = useState<FileTestResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const aiService = AIAnalysisService.getInstance();

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  /**
   * 测试单个文件内容提取
   */
  const testSingleFile = async (file: File): Promise<FileTestResult> => {
    const result: FileTestResult = {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      contentLength: 0,
      extractedContent: '',
      status: 'processing'
    };

    try {
      // 检查文件类型是否支持
      if (!aiService.isFileTypeSupported(file)) {
        result.status = 'error';
        result.errorMessage = `不支持的文件类型: ${file.type}`;
        return result;
      }

      // 提取文件内容
      const content = await aiService.readFileContent(file);
      result.extractedContent = content;
      result.contentLength = content.length;
      result.status = 'success';

      // 如果内容过短，给出提示
      if (content.length < 50) {
        result.errorMessage = '提取的内容过短，可能文件不包含有效文本';
      }

    } catch (error) {
      result.status = 'error';
      result.errorMessage = error instanceof Error ? error.message : '未知错误';
    }

    return result;
  };

  /**
   * 开始测试所有文件
   */
  const startTest = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setTestResults([]);

    const results: FileTestResult[] = [];

    for (const file of selectedFiles) {
      const result = await testSingleFile(file);
      results.push(result);
      setTestResults([...results]); // 实时更新结果
    }

    setIsProcessing(false);
  };

  /**
   * 获取文件类型图标
   */
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('text') || fileType.includes('markdown')) {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-4 w-4" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-4 w-4" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileType className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <FileType className="h-4 w-4" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <Presentation className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  /**
   * 获取支持的文件类型列表
   */
  const getSupportedFileTypes = () => {
    return aiService.getSupportedFileTypes();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">文件类型测试</h1>
        <p className="text-muted-foreground">
          测试各种文件格式的内容提取功能
        </p>
      </div>

      {/* 支持的文件类型 */}
      <Card>
        <CardHeader>
          <CardTitle>支持的文件类型</CardTitle>
          <CardDescription>
            当前系统支持以下文件格式的内容提取
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSupportedFileTypes().map((type, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                {getFileIcon(type.mimeType)}
                <div>
                  <div className="font-medium">{type.extension}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 文件选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择测试文件</CardTitle>
          <CardDescription>
            选择要测试的文件，支持多文件同时测试
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-input">选择文件</Label>
            <Input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileSelect}
              accept=".txt,.md,.csv,.json,.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <Label>已选择的文件 ({selectedFiles.length})</Label>
              <div className="mt-2 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                    {getFileIcon(file.type)}
                    <span className="flex-1">{file.name}</span>
                    <Badge variant="secondary">
                      {(file.size / 1024).toFixed(2)} KB
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={startTest} 
            disabled={selectedFiles.length === 0 || isProcessing}
            className="w-full"
          >
            {isProcessing ? '测试中...' : '开始测试'}
          </Button>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
            <CardDescription>
              文件内容提取测试结果
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(result.fileType)}
                    <span className="font-medium">{result.fileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{result.fileSize}</Badge>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 
                              result.status === 'error' ? 'destructive' : 'secondary'}
                    >
                      {result.status === 'success' ? '成功' : 
                       result.status === 'error' ? '失败' : '处理中'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">文件类型:</span>
                    <span className="ml-2">{result.fileType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">内容长度:</span>
                    <span className="ml-2">{result.contentLength} 字符</span>
                  </div>
                </div>

                {result.status === 'error' && (
                  <Alert variant="destructive">
                    <AlertDescription>{result.errorMessage}</AlertDescription>
                  </Alert>
                )}

                {result.status === 'success' && result.extractedContent && (
                  <div>
                    <Label>提取的内容预览</Label>
                    <Textarea
                      value={result.extractedContent.length > 500 
                        ? result.extractedContent.substring(0, 500) + '...' 
                        : result.extractedContent}
                      readOnly
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                )}

                {result.errorMessage && result.status === 'success' && (
                  <Alert>
                    <AlertDescription>{result.errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 