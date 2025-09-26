/**
 * 上传品牌图或描述组件
 * 支持图片上传和文本描述输入，用于个性化品牌Emoji生成
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Image, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadFormProps {
  onUploadComplete: (data: { image?: File; description?: string }) => void;
  onReset: () => void;
}

export default function UploadForm({ onUploadComplete, onReset  }: UploadFormProps) {
  const { t } = useTranslation();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理图片上传
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError(t('components.errors.请上传图片文件'));
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setError(null);
    setUploadedImage(file);
    // 不立即完成上传，让用户可以继续填写描述
  };

  /**
   * 处理表单提交
   */
  const handleFormSubmit = () => {
    // 验证：必须同时提供图片和描述
    if (!uploadedImage) {
      setError('请上传品牌图片');
      return;
    }
    
    if (!description.trim()) {
      setError('请填写品牌描述');
      return;
    }

    setError(null);
    setIsUploading(true);

    // 模拟处理过程
    setTimeout(() => {
      setIsUploading(false);
      onUploadComplete({ 
        image: uploadedImage, 
        description: description.trim() 
      });
    }, 1000);
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    setUploadedImage(null);
    setDescription('');
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onReset();
  };

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          品牌信息输入
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          请上传品牌图片并填写品牌描述，两项信息都是必填的，用于生成专属品牌Emoji
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 图片上传区域 - 始终显示 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">品牌图片 <span className="text-destructive">*</span></Label>
          </div>
          <div
            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={triggerFileSelect}
          >
            {uploadedImage ? (
              <div className="flex items-center gap-3 justify-center">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(uploadedImage)}
                    alt="预览"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <Badge className="absolute -top-1 -right-1 bg-success text-success-foreground text-xs">
                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                    已上传
                  </Badge>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate max-w-40">{uploadedImage.name}</p>
                  <Button onClick={triggerFileSelect} variant="outline" size="sm" className="mt-1">
                    重新选择
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 justify-center py-2">
                <Upload className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">点击上传品牌图片</p>
                  <p className="text-xs text-muted-foreground">支持 JPG、PNG 格式，最大 5MB</p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* 文字描述区域 - 始终显示 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <Label htmlFor="description" className="text-sm font-medium">品牌描述 <span className="text-destructive">*</span></Label>
          </div>
          <Textarea
            id="description"
            placeholder="请描述您的品牌特点，例如：科技公司，蓝色主题，简约现代风格，专注AI技术..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* 提交按钮区域 */}
        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleFormSubmit}
            disabled={isUploading || !uploadedImage || !description.trim()}
            className="flex-1"
          >
            {isUploading ? '处理中...' : '开始生成'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="default">
            <X className="w-4 h-4" />
            重置
          </Button>
        </div>

        {/* 上传状态 */}
        {isUploading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              正在处理品牌信息...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
