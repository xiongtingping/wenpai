/**
 * 品牌Emoji生成器 - 第一步上传表单组件
 * 支持上传品牌角色图片或输入角色描述
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Image, FileText, Check } from 'lucide-react';

/**
 * 上传表单数据接口
 */
interface UploadFormData {
  image: File | null;
  description: string;
}

/**
 * 上传表单属性
 */
interface BrandEmojiUploadFormProps {
  /** 确认回调函数 */
  onConfirm: (data: UploadFormData) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 品牌Emoji上传表单组件
 */
export default function BrandEmojiUploadForm({ 
  onConfirm, 
  className = '' 
}: BrandEmojiUploadFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  /**
   * 处理图片上传
   */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      validateForm(file, description);
    }
  };

  /**
   * 处理描述输入
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    validateForm(image, value);
  };

  /**
   * 验证表单
   */
  const validateForm = (img: File | null, desc: string) => {
    setIsValid(!!img || desc.trim().length > 0);
  };

  /**
   * 处理确认
   */
  const handleConfirm = () => {
    if (isValid) {
      onConfirm({ image, description });
    }
  };

  /**
   * 清除预览
   */
  const clearPreview = () => {
    setImage(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    validateForm(null, description);
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="w-6 h-6" />
          Step 1：上传品牌角色图或描述
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 图片上传区域 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">上传品牌角色图片</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="brand-image-upload"
            />
            <Label 
              htmlFor="brand-image-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                点击上传图片或拖拽到此处
              </span>
              <span className="text-xs text-gray-400">
                支持 JPG、PNG、GIF 格式，最大 5MB
              </span>
            </Label>
          </div>
          
          {/* 图片预览 */}
          {previewUrl && (
            <div className="relative inline-block">
              <img 
                src={previewUrl} 
                alt="品牌角色预览" 
                className="w-32 h-32 object-contain border rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                onClick={clearPreview}
              >
                ×
              </Button>
            </div>
          )}
        </div>

        {/* 描述输入区域 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            或输入角色描述
          </Label>
          <Textarea
            placeholder="例如：穿汉服的小狐狸，戴眼镜，可爱风格，适合儿童品牌"
            className="min-h-[100px] resize-none"
            value={description}
            onChange={handleDescriptionChange}
          />
          <p className="text-xs text-gray-500">
            请详细描述角色的外观特征、风格、适用场景等，这将帮助AI生成更准确的品牌emoji
          </p>
        </div>

        {/* 确认按钮 */}
        <Button
          onClick={handleConfirm}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          <Check className="w-4 h-4 mr-2" />
          ✅ 确认并进入下一步
        </Button>

        {/* 提示信息 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 提示：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>上传图片或输入描述，至少选择一种方式</li>
            <li>图片建议使用透明背景，尺寸建议 512x512 像素</li>
            <li>描述越详细，生成的emoji越符合您的需求</li>
            <li>支持描述角色的表情、动作、装饰等细节</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 