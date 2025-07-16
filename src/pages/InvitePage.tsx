import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Gift, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useUserStore } from "@/store/userStore";
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { useNavigate } from 'react-router-dom';

function InvitePage() {
  const { toast } = useToast();
  const { user } = useUnifiedAuthContext();
  const userId = user?.id;
  const isTempUser = !user?.email; // 如果没有邮箱，认为是临时用户
  const userInviteCode = useUserStore((state) => state.userInviteCode);
  const trackInviteClick = useUserStore((state) => state.trackInviteClick);
  const navigate = useNavigate();

  // Base URL for invites
  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/register?ref=${userInviteCode}`;

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      
      // 记录邀请链接点击
      trackInviteClick(userInviteCode);
      
      toast({
        title: "邀请链接已复制",
        description: "去发给好友吧！",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制邀请链接",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回个人中心
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">邀请好友</h1>
            <p className="text-gray-600 text-lg">
              邀请好友注册，双方各得20次使用机会奖励
            </p>
          </div>

          {/* 邀请链接卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                邀请链接
              </CardTitle>
              <CardDescription>
                复制专属邀请链接，分享给好友即可获得奖励
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">您的专属邀请链接</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={inviteUrl} 
                    readOnly 
                    className="text-sm" 
                  />
                  <Button 
                    onClick={handleCopyInviteLink}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="h-4 w-4 mr-2" /> 
                    立即邀请好友
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">邀请奖励说明</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 好友通过您的链接注册，双方各得20次使用机会</li>
                      <li>• 邀请奖励无上限，邀请越多奖励越多</li>
                      <li>• 奖励立即到账，可立即使用</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InvitePage;