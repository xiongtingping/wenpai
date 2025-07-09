import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileType, Image, FileSpreadsheet, Presentation, FileText } from "lucide-react";
import AIAnalysisService from '@/services/aiAnalysisService';

/**
 * 文件类型支持测试页面
 */
export default function FileTypeTestPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const aiService = AIAnalysisService.getInstance();
  const supportedFileTypes = aiService.getSupportedFileTypes();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要分析的文件",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeFiles(selectedFiles);
      toast({
        title: "分析成功",
        description: `成功分析 ${selectedFiles.length} 个文件，提取到 ${result.keywords.length} 个关键词`,
      });
      console.log('分析结果:', result);
    } catch (error) {
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "文件分析过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileIcon = (extension: string) => {
    switch (extension) {
      case '.txt':
      case '.md':
      case '.csv':
      case '.json':
        return <FileType className="h-4 w-4 text-blue-500" />;
      case '.pdf':
      case '.docx':
      case '.doc':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case '.xlsx':
      case '.xls':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case '.pptx':
      case '.ppt':
        return <Presentation className="h-4 w-4 text-orange-600" />;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.bmp':
      case '.webp':
        return <Image className="h-4 w-4 text-purple-500" />;
      default:
        return <FileType className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>文件类型支持测试</CardTitle>
          <CardDescription>
            测试各种文件类型的上传和分析功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 支持的文件类型列表 */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">支持的文件类型</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportedFileTypes.map((fileType) => (
                <div key={fileType.extension} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {getFileIcon(fileType.extension)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{fileType.extension}</Badge>
                      <span className="text-sm font-medium">{fileType.description}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{fileType.mimeType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 文件上传区域 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">文件上传测试</h3>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                className="hidden"
                id="test-files"
                onChange={handleFileSelect}
                accept={supportedFileTypes.map(type => type.extension).join(',')}
              />
              <label
                htmlFor="test-files"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-600">
                  点击选择要测试的文件
                  <p className="text-xs text-gray-400 mt-1">
                    支持以上所有文件类型
                  </p>
                </div>
              </label>
            </div>

            {/* 已选择的文件列表 */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">已选择的文件：</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      {getFileIcon('.' + file.name.split('.').pop()?.toLowerCase())}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.type} • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Badge variant={aiService.isFileTypeSupported(file) ? "default" : "destructive"}>
                        {aiService.isFileTypeSupported(file) ? "支持" : "不支持"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFiles([]);
                const fileInput = document.getElementById('test-files') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
            >
              清空选择
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={selectedFiles.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? "分析中..." : "开始分析"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 