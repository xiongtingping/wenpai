/**
 * 上传品牌图或描述组件
 * 支持图片上传和文本描述输入，用于个性化品牌Emoji生成
 */

import React, { useState, useRef } from 'react';
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

export default function UploadForm({ onUploadComplete, onReset }: UploadFormProps) {
  const [uploadType, setUploadType] = useState<'image' | 'description'>('image');
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
      setError('请上传图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setError(null);
    setUploadedImage(file);
    setIsUploading(true);

    // 模拟上传过程
    setTimeout(() => {
      setIsUploading(false);
      onUploadComplete({ image: file });
    }, 1000);
  };

  /**
   * 处理描述提交
   */
  const handleDescriptionSubmit = () => {
    if (!description.trim()) {
      setError('请输入品牌描述');
      return;
    }

    setError(null);
    setIsUploading(true);

    // 模拟处理过程
    setTimeout(() => {
      setIsUploading(false);
      onUploadComplete({ description: description.trim() });
    }, 500);
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          上传品牌素材
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 上传类型选择 */}
        <div className="flex gap-2">
          <Button
            variant={uploadType === 'image' ? 'default' : 'outline'}
            onClick={() => setUploadType('image')}
            className="flex-1"
          >
            <Image className="w-4 h-4 mr-2" />
            上传图片
          </Button>
          <Button
            variant={uploadType === 'description' ? 'default' : 'outline'}
            onClick={() => setUploadType('description')}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            文字描述
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 图片上传区域 */}
        {uploadType === 'image' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={triggerFileSelect}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="预览"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <Badge className="absolute -top-2 -right-2 bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已上传
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{uploadedImage.name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">点击上传品牌图片</p>
                    <p className="text-sm text-gray-500">支持 JPG、PNG 格式，最大 5MB</p>
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
            {uploadedImage && (
              <div className="flex gap-2">
                <Button onClick={triggerFileSelect} variant="outline" className="flex-1">
                  重新选择
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 文字描述区域 */}
        {uploadType === 'description' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">品牌描述</Label>
              <Textarea
                id="description"
                placeholder="请描述您的品牌特点，例如：科技公司，蓝色主题，简约现代风格..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDescriptionSubmit}
                disabled={isUploading || !description.trim()}
                className="flex-1"
              >
                {isUploading ? '处理中...' : '提交描述'}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 上传状态 */}
        {isUploading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">
              {uploadType === 'image' ? '正在上传图片...' : '正在处理描述...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 