/**
 * 邀请链接卡片组件
 * @description 生成和分享邀请链接
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { InviteLinkService } from '@/services/invite/InviteLinkService';
import { Copy, Share2, QrCode, RefreshCw, Check, Gift } from 'lucide-react';
import { logger } from '@/utils/logger';

interface InviteLinkCardProps {
  userId: string;
}

export function InviteLinkCard({ userId }: InviteLinkCardProps) {
  const [inviteLink, setInviteLink] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateLink();
  }, [userId]);

  async function generateLink() {
    try {
      setLoading(true);
      const result = await InviteLinkService.generateInviteLink(userId);
      
      if (result) {
        setInviteLink(result.link);
        setInviteCode(result.code);
      }
    } catch (error) {
      logger.error('生成邀请链接失败:', error);
      toast({
        title: '生成失败',
        description: '无法生成邀请链接，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function copyInviteCode() {
    try {
      // 构建完整的邀请文案（中英文）
      const inviteMessage = `🎁 邀请您体验文派AI内容生成平台 | Invite you to try WenPai AI

📝 中文说明：
我正在使用文派AI内容生成平台，效果非常好！邀请您一起体验：
• 注册链接：${inviteLink}
• 邀请码：${inviteCode}
• 新用户奖励：注册即可获得20次免费AI使用机会
• 双倍奖励：我们双方各得20次免费使用机会

📝 English Description:
I'm using WenPai AI Content Generation Platform, and it works great! Invite you to experience it:
• Registration Link: ${inviteLink}
• Invite Code: ${inviteCode}
• New User Reward: Get 20 free AI usage credits upon registration
• Double Rewards: Both of us get 20 free usage credits

💡 温馨提示 | Tips：
请在注册页面输入邀请码以获得奖励
Please enter the invite code on the registration page to receive rewards`;

      await navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      toast({
        title: '复制成功',
        description: '已复制完整邀请信息（含中英文说明）',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('复制失败:', error);
      toast({
        title: '复制失败',
        description: '请手动复制邀请链接',
        variant: 'destructive',
      });
    }
  }

  async function shareInviteCode() {
    const shareText = `🎁 邀请您体验文派AI内容生成平台

我正在使用文派AI内容生成平台，效果非常好！邀请您一起体验：

• 注册链接：${inviteLink}
• 邀请码：${inviteCode}
• 新用户奖励：注册即可获得20次免费AI使用机会
• 双倍奖励：我们双方各得20次免费使用机会

💡 温馨提示：请在注册页面输入邀请码以获得奖励`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '邀请你加入文派AI | Invite you to WenPai AI',
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          logger.error('分享失败:', error);
        }
      }
    } else {
      copyInviteCode();
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          我的邀请链接
        </CardTitle>
        <CardDescription>
          分享邀请链接给好友，双方都能获得奖励
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 邀请奖励说明 */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎁 邀请奖励
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            每邀请1人注册，双方各得<span className="font-bold text-purple-600 dark:text-purple-400">20次免费使用机会</span>，可累加且永久有效！
          </p>
        </div>

        {/* 邀请码显示 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            您的邀请链接
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg font-mono text-sm font-bold text-left tracking-wider text-purple-700 dark:text-purple-300 break-all">
              {inviteLink}
            </code>
            <Button
              onClick={copyInviteCode}
              variant="outline"
              size="icon"
              className="shrink-0 h-12 w-12"
              title="复制邀请链接"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            发送此链接给好友，好友通过链接注册即可获得奖励
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={copyInviteCode}
            className="flex-1"
            variant="default"
          >
            <Copy className="h-4 w-4 mr-2" />
            复制邀请链接
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            如何邀请好友？
          </h4>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>复制您的专属邀请码</li>
            <li>分享给您的好友</li>
            <li>好友通过链接注册</li>
            <li>双方自动获得20次免费使用机会</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

