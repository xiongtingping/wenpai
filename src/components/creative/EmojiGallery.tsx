/**
 * Emoji展示组件
 * 简化版本，提供基本的展示、删除和重生功能
 * 添加权限保护，限制复制功能
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Lock } from 'lucide-react';

interface EmojiGalleryProps {
  emojis: Array<{ emotion: string; url: string }>;
  onDelete: (emotion: string) => void;
  onRegenerate: (emotion: string) => void;
}

export default function EmojiGallery({ emojis, onDelete, onRegenerate  }: EmojiGalleryProps) {
  const { user, isAuthenticated } = useAuth();
  const { primaryStatus } = useSubscriptionStatus();
  const { toast } = useToast();

  // 获取用户当前等级 - 优先使用订阅状态
  const getCurrentTier = () => {
    // 1. 优先使用订阅状态中的等级信息
    if (primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }
    
    // 2. 从订阅状态标签推断
    if (primaryStatus?.status === 'active') {
      const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
      if (statusLabel.includes(t('components.labels.高级版')) || statusLabel.includes('premium')) {
        return 'premium';
      } else if (statusLabel.includes(t('components.labels.专业版')) || statusLabel.includes('pro')) {
        return 'pro';
      }
    }
    
    // 3. 最后使用用户数据
    return getUserTier(user);
  };

  const userTier = getCurrentTier();

  // 检查是否有复制权限（需要专业版或以上）
  const hasPermission = () => {
    if (!isAuthenticated) {
      console.log('EmojiGallery: usernotauthenticating');
      return false;
    }
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    const hasAccess = tierLevels[userTier] >= tierLevels['pro'];
    console.log('EmojiGallerypermissionchecking:', {
      userTier,
      isAuthenticated,
      hasAccess,
      primaryStatus: primaryStatus?.status,
      primaryTier: primaryStatus?.tier,
      user: user ? { id: user.id, tier: user.tier } : null
    });
    return hasAccess;
  };

  // 处理复制点击
  const handleCopyClick = (url: string, emotion: string) => {
    console.log('EmojiGallery: 尝试copying', { emotion, hasPermission: hasPermission() });

    if (!hasPermission()) {
      console.log('EmojiGallery: permission不足，display升级hint');
      toast({
        title: t('components.labels.需要专业版'),
        description: "Emoji复制功能需要专业版权限，确定后跳转至支付中心选择专业版",
        action: (
          <ToastAction
            altText="确定"
            onClick={() => {
              localStorage.setItem("selectedPlan", "pro");
              window.location.href = '/payment';
            }}
          >
            确定
          </ToastAction>
        )
      });
      return;
    }

    console.log('EmojiGallery: permission通过，executingcopying');
    navigator.clipboard.writeText(url);
    toast({
      title: t('components.labels.复制成功'),
      description: `已复制 ${emotion} 的链接到剪贴板`,
    });
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {emojis.map(({ emotion, url }) => (
        <div key={emotion} className="text-center relative">
          <div className="relative">
            <img
              src={url}
              alt={emotion}
              className={`w-16 h-16 mx-auto ${hasPermission() ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
              onClick={() => handleCopyClick(url, emotion)}
              title={hasPermission() ? t('components.labels.点击复制链接') : t('components.labels.需要专业版权限')}
            />
            {!hasPermission() && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 rounded">
                <Lock className="w-4 h-4 text-background" />
              </div>
            )}
          </div>
          <p className="text-xs mt-1">{emotion}</p>
          <div className="flex justify-center space-x-2 mt-1">
            <button
              className="text-destructive text-xs hover:underline"
              onClick={() => onDelete(emotion)}
            >
              删除
            </button>
            <button
              className="text-primary text-xs hover:underline"
              onClick={() => onRegenerate(emotion)}
            >
              重生
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}