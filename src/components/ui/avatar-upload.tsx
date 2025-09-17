import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, RefreshCw, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserAltText } from '@/utils/userDisplayUtils';

/**
 * 头像上传组件属性
 */
interface AvatarUploadProps {
  /** 当前头像URL */
  currentAvatar?: string;
  /** 用户昵称（用于生成随机头像） */
  nickname?: string;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示上传按钮 */
  showUploadButton?: boolean;
  /** 是否显示随机生成按钮 */
  showRandomButton?: boolean;
  /** 头像变化回调 */
  onAvatarChange?: (avatarUrl: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 头像上传组件
 */
export function AvatarUpload({ 
  currentAvatar,
  nickname = '用户',
  size = 'md',
  showUploadButton = true,
  showRandomButton = true,
  onAvatarChange,
  disabled = false
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  /**
   * 获取头像大小类名
   */
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-16 w-16';
      case 'lg':
        return 'h-32 w-32';
      default:
        return 'h-24 w-24';
    }
  };

  /**
   * 获取按钮大小
   */
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default:
        return 'default';
    }
  };

  /**
   * 生成随机头像 - 使用统一emoji系统
   */
  const generateRandomAvatar = async () => {
    setIsGenerating(true);
    try {
      // 动态导入统一emoji系统
      const { getRandomEmojis, getAllEmojis, generateEmojiSVG } = await import('@/services/unifiedEmojiSystem');

      // 优先动物类，若空则退回全量
      let pool = getRandomEmojis(1, 'animals');
      if (pool.length === 0) {
        const all = getAllEmojis();
        if (all.length === 0) throw new Error('没有可用的emoji');
        pool = [all[Math.floor(Math.random() * all.length)]];
      }

      if (pool.length > 0) {
        const selectedEmoji = pool[0];
        const randomAvatarUrl = generateEmojiSVG(selectedEmoji);

        setAvatarUrl(randomAvatarUrl);
        onAvatarChange?.(randomAvatarUrl);

        toast({
          title: t('components.labels.头像生成成功'),
          description: `已为您生成可爱的${selectedEmoji.name} ${selectedEmoji.emoji}头像`,
        });
      } else {
        throw new Error('没有可用的emoji');
      }
    } catch (error) {
      console.error('生成随机emoji头像失败，回退到Dicebear API:', error);

      // 回退到Dicebear API
      try {
        const seed = nickname + Date.now();
        const randomAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

        setAvatarUrl(randomAvatarUrl);
        onAvatarChange?.(randomAvatarUrl);

        toast({
          title: t('components.labels.头像生成成功'),
          description: t('components.messages.已为您生成新的随机头像'),
        });
      } catch (fallbackError) {
        console.error('Dicebear API也失败了:', fallbackError);
        toast({
          title: t('components.labels.生成失败'),
          description: "随机头像生成失败，请重试",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('components.labels.文件类型错误'),
        description: t('components.messages.请选择图片文件'),
        variant: "destructive"
      });
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('components.labels.文件过大'),
        description: "图片大小不能超过 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // 这里应该上传到服务器，现在先使用本地 URL
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      onAvatarChange?.(imageUrl);
      
      toast({
        title: t('components.labels.头像上传成功'),
        description: t('components.messages.您的头像已更新'),
      });
    } catch (error) {
      console.error('上传头像失败:', error);
      toast({
        title: t('components.labels.上传失败'),
        description: "头像上传失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  /**
   * 获取头像首字母
   */
  const getInitials = () => {
    return nickname.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 头像显示 */}
      <div className="relative">
        <Avatar className={getSizeClass()}>
          <AvatarImage src={avatarUrl} alt={getUserAltText({ nickname }, t('components.messages.头像'))} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* 上传状态指示器 */}
        {(isUploading || isGenerating) && (
          <div className="absolute inset-0 bg-foreground/20 rounded-full flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-primary-foreground animate-spin" />
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
        {showUploadButton && (
          <Button
            variant="outline"
            size={getButtonSize()}
            onClick={triggerFileSelect}
            disabled={disabled || isUploading || isGenerating}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isUploading ? '上传中...' : t('components.messages.上传头像')}
          </Button>
        )}
        
        {showRandomButton && (
          <Button
            variant="outline"
            size={getButtonSize()}
            onClick={generateRandomAvatar}
            disabled={disabled || isUploading || isGenerating}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isGenerating ? '生成中...' : t('components.messages.随机头像')}
          </Button>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 提示信息 */}
      <div className="text-xs text-muted-foreground text-center">
        <p>或点击t('components.messages.随机头像')生成个性化头像</p>
      </div>
    </div>
  );
}
