import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, Brain } from "lucide-react";
import BrandProfileService from '@/services/brandProfileService';

interface BrandProfileGeneratorProps {
  onProfileGenerated: (profile: BrandProfile) => void;
  existingProfile?: BrandProfile;
}

/**
 * 品牌资料上传和分析组件
 * @description 处理品牌资料的上传、分析和品牌调性生成
 */
export default function BrandProfileGenerator({ onProfileGenerated, existingProfile }: BrandProfileGeneratorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    name: existingProfile?.name || '',
    description: existingProfile?.description || '',
    slogans: existingProfile?.slogans.join('\n') || '',
    keywords: existingProfile?.keywords.join(', ') || '',
    forbiddenWords: existingProfile?.forbiddenWords.join(', ') || '',
  });

  /**
   * 处理文件上传
   * @param e 文件上传事件
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟文件上传进度
      for (let i = 0; i < files.length; i++) {
        const progress = ((i + 1) / files.length) * 100;
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "文件上传成功",
        description: `已成功上传 ${files.length} 个品牌资料文件`,
      });

      // 开始 AI 分析
      setIsAnalyzing(true);
      const brandService = BrandProfileService.getInstance();
      const analysisResult = await brandService.analyzeFiles(Array.from(files));

      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        keywords: analysisResult.keywords.join(', '),
      }));

      // 生成品牌档案
      const newProfile: BrandProfile = {
        id: existingProfile?.id || Date.now().toString(),
        name: formData.name,
        tone: analysisResult.tone,
        slogans: formData.slogans.split('\n').filter(s => s.trim()),
        keywords: analysisResult.keywords,
        forbiddenWords: formData.forbiddenWords.split(',').map(k => k.trim()),
        files: Array.from(files).map(f => f.name),
        description: formData.description,
        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date(),
        aiAnalysis: {
          toneAnalysis: analysisResult.tone,
          keyThemes: analysisResult.keywords,
          brandPersonality: "AI 分析生成的品牌个性",
          targetAudience: "AI 分析确定的目标受众",
          contentSuggestions: analysisResult.suggestions
        }
      };

      // 保存到数据库
      await brandService.setCurrentProfile(newProfile);
      onProfileGenerated(newProfile);

      toast({
        title: "分析完成",
        description: "AI 已完成品牌资料分析并保存到数据库",
      });
    } catch (error) {
      console.error('处理失败:', error);
      toast({
        title: "处理失败",
        description: error instanceof Error ? error.message : "文件处理过程中发生错误",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  };

  /**
   * 分析上传的文件并生成品牌调性
   * @param files 上传的文件列表
   */
  const analyzeFiles = async (files: FileList) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // 模拟 AI 分析过程
      for (let i = 0; i < 5; i++) {
        setAnalysisProgress(i * 20);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 生成示例分析结果
      const mockAnalysis = {
        toneAnalysis: "专业、温暖、富有同理心",
        keyThemes: ["创新", "用户体验", "技术领先", "服务至上"],
        brandPersonality: "可靠的专家型品牌形象",
        targetAudience: "追求专业解决方案的企业用户",
        contentSuggestions: [
          "强调产品的创新性和实用价值",
          "使用专业但平易近人的语气",
          "分享用户成功案例",
        ]
      };

      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        keywords: mockAnalysis.keyThemes.join(', '),
      }));

      // 生成品牌档案
      const newProfile: BrandProfile = {
        id: existingProfile?.id || Date.now().toString(),
        name: formData.name,
        tone: mockAnalysis.toneAnalysis,
        slogans: formData.slogans.split('\n').filter(s => s.trim()),
        keywords: formData.keywords.split(',').map(k => k.trim()),
        forbiddenWords: formData.forbiddenWords.split(',').map(k => k.trim()),
        files: Array.from(files).map(f => f.name),
        description: formData.description,
        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date(),
        aiAnalysis: mockAnalysis
      };

      onProfileGenerated(newProfile);

      toast({
        title: "分析完成",
        description: "已成功生成品牌调性档案",
      });
    } catch (error) {
      toast({
        title: "分析失败",
        description: "品牌资料分析过程中发生错误",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>品牌资料上传与分析</CardTitle>
        <CardDescription>
          上传品牌相关资料，AI 将自动分析并生成品牌调性档案
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 基本信息表单 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">品牌名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入品牌名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">品牌描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="简要描述品牌定位和特色"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogans">品牌 Slogan（每行一个）</Label>
            <Textarea
              id="slogans"
              value={formData.slogans}
              onChange={e => setFormData(prev => ({ ...prev, slogans: e.target.value }))}
              placeholder="输入品牌 Slogan，每行一个"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">品牌关键词（逗号分隔）</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={e => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="输入品牌关键词，用逗号分隔"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forbiddenWords">禁用词（逗号分隔）</Label>
            <Input
              id="forbiddenWords"
              value={formData.forbiddenWords}
              onChange={e => setFormData(prev => ({ ...prev, forbiddenWords: e.target.value }))}
              placeholder="输入禁用词，用逗号分隔"
            />
          </div>
        </div>

        {/* 文件上传区域 */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="brand-files"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
          />
          <label
            htmlFor="brand-files"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600">
              点击或拖拽上传品牌资料文件
              <p className="text-xs text-gray-400 mt-1">
                支持 PDF、Word、文本文件和图片
              </p>
            </div>
          </label>
        </div>

        {/* 上传进度 */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>上传进度</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* 分析进度 */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>AI 分析进度</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              slogans: '',
              keywords: '',
              forbiddenWords: '',
            });
          }}
        >
          重置
        </Button>
        <Button
          disabled={!formData.name || isUploading || isAnalyzing}
          onClick={() => {
            const fileInput = document.getElementById('brand-files') as HTMLInputElement;
            fileInput.click();
          }}
        >
          开始上传和分析
        </Button>
      </CardFooter>
    </Card>
  );
} 