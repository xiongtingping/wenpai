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
    <Card className={`max-w-3xl mx-auto border ${className}`}>
      <CardHeader className="bg-accent border-b border-border pb-4">
        <CardTitle className="flex items-center gap-3 text-xl text-foreground">
          <div className="p-2 bg-accent rounded-lg">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          Step 1：上传品牌角色素材
        </CardTitle>
        <p className="text-muted-foreground mt-1 text-sm">上传品牌角色图片或输入详细描述，帮助AI生成专属品牌Emoji</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* 图片上传区域 */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-foreground flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            上传品牌角色图片
          </Label>
          <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center hover:border-primary hover:bg-accent transition-all duration-200 bg-accent/50">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="brand-image-upload"
            />
            <Label
              htmlFor="brand-image-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="p-3 bg-card rounded-full shadow-md">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">
                  点击上传图片或拖拽到此处
                </p>
                <p className="text-sm text-muted-foreground">
                  支持 JPG、PNG、GIF 格式，最大 5MB
                </p>
                <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full inline-block">
                  建议尺寸：512x512 像素，透明背景
                </p>
              </div>
            </Label>
          </div>
          
          {/* 图片预览 */}
          {previewUrl && (
            <div className="relative inline-block">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="品牌角色预览" 
                  className="w-40 h-40 object-contain border-2 border-border rounded-xl shadow-md"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-3 -right-3 w-8 h-8 p-0 rounded-full shadow-lg"
                  onClick={clearPreview}
                >
                  ×
                </Button>
              </div>
              <p className="text-xs text-foreground mt-2 text-center font-medium">✓ 图片已上传</p>
            </div>
          )}
        </div>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground font-medium">或者</span>
          </div>
        </div>

        {/* 描述输入区域 */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            输入角色描述
          </Label>
          <div className="relative">
            <Textarea
              placeholder="例如：穿汉服的小狐狸，戴眼镜，可爱风格，适合儿童品牌。请详细描述角色的外观特征、风格、适用场景等..."
              className="min-h-[120px] resize-none border-2 border-border focus:border-primary rounded-xl p-4 text-base"
              value={description}
              onChange={handleDescriptionChange}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {description.length}/500
            </div>
          </div>
          <div className="bg-accent p-4 rounded-lg border border-primary">
            <p className="text-sm text-foreground font-medium mb-2">💡 描述建议：</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 角色外观：颜色、形状、特征（如：圆脸、大眼睛、毛茸茸）</li>
              <li>• 风格特点：可爱、专业、科技、传统等</li>
              <li>• 适用场景：儿童产品、科技公司、餐饮品牌等</li>
              <li>• 表情动作：微笑、挥手、思考等</li>
            </ul>
          </div>
        </div>

        {/* 确认按钮 */}
        <div className="pt-4">
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full py-4 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200 shadow-lg hover:shadow-xl"
            size="lg"
          >
            <Check className="w-5 h-5 mr-2" />
            {isValid ? '✅ 确认并进入下一步' : '请上传图片或输入描述'}
          </Button>
        </div>

        {/* 提示信息 */}
        <div className="bg-accent p-4 rounded-lg border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">🎯 生成效果提示：</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">📸 上传图片：</p>
              <p>AI将参考图片风格生成多种表情的Emoji</p>
            </div>
            <div>
              <p className="font-medium">✍️ 输入描述：</p>
              <p>AI根据描述生成符合品牌调性的Emoji</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
