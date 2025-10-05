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
import { Copy, Share2, QrCode, RefreshCw, Check } from 'lucide-react';
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

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: '复制成功',
        description: '邀请链接已复制到剪贴板',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('复制失败:', error);
      toast({
        title: '复制失败',
        description: '请手动复制链接',
        variant: 'destructive',
      });
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '邀请你加入文派',
          text: '我在使用文派AI内容生成平台，邀请你一起来体验！注册即可获得丰厚奖励！',
          url: inviteLink,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          logger.error('分享失败:', error);
        }
      }
    } else {
      copyToClipboard();
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
          <Share2 className="h-5 w-5" />
          我的邀请链接
        </CardTitle>
        <CardDescription>
          分享链接给好友，双方都能获得奖励
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 奖励说明 */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">你将获得</div>
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
              10次AI使用 + 50000 Token
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">好友将获得</div>
            <div className="text-sm font-medium text-pink-600 dark:text-pink-400">
              5次AI使用 + 20000 Token + 7天会员
            </div>
          </div>
        </div>

        {/* 邀请链接 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            邀请链接
          </label>
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="font-mono text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 邀请码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            邀请码
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-lg font-bold text-center">
              {inviteCode}
            </code>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            好友注册时可以输入此邀请码
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={copyToClipboard}
            className="flex-1"
            variant="default"
          >
            <Copy className="h-4 w-4 mr-2" />
            复制链接
          </Button>

          {(navigator as any).share && (
            <Button
              onClick={shareLink}
              className="flex-1"
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          )}

          <Button
            onClick={generateLink}
            variant="outline"
            size="icon"
            title="重新生成"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            如何邀请好友？
          </h4>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>复制邀请链接或邀请码</li>
            <li>分享给你的好友</li>
            <li>好友通过链接注册或输入邀请码</li>
            <li>双方自动获得奖励</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

