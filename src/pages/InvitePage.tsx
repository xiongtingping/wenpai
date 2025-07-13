import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Users, 
  Gift, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Award, 
  TrendingUp,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/store/userStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

function InvitePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("invite");
  const userInviteCode = useUserStore((state) => state.userInviteCode);
  const generateInviteCode = useUserStore((state) => state.generateInviteCode);
  const userInviteStats = useUserStore((state) => state.userInviteStats);
  const usageRemaining = useUserStore((state) => state.usageRemaining);
  const navigate = useNavigate();
  
  const [newInviteLink, setNewInviteLink] = useState<any>(null);

  // Base URL for invites
  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/register?ref=${userInviteCode}`;

  const handleCopyInviteLink = async (inviteCode: string) => {
    try {
      const inviteLink = `${window.location.origin}/register?ref=${inviteCode}`;
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "邀请链接已复制",
        description: "邀请链接已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制邀请链接",
        variant: "destructive",
      });
    }
  };

  const createNewInviteLink = () => {
    // Create a new invite link with a 7 day expiration
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 7);

    const newInvite = {
      code: generateInviteCode(),
      createdAt: now.toISOString(),
      clicks: 0,
      registrations: 0,
    };

    // In a real app, we'd also save this to the backend
    setNewInviteLink(newInvite);
  };

  // 简化处理，移除过期时间逻辑

  // Calculate total rewards from invites
  const calculateTotalRewards = (): number => {
    return userInviteStats.totalRegistrations * 20;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 简化页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')} 
                className="hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">邀请好友</h1>
                <p className="text-sm text-gray-500">邀请朋友注册，双方都能获得免费使用次数奖励</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          {/* 主邀请卡片 */}
          <Card className="border-2 border-blue-100 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center">
                <Gift className="mr-3 h-6 w-6" /> 邀请好友，双方共同获益
              </h2>
              <p className="text-blue-100 mt-2">每邀请1人注册，双方各得20次免费使用机会</p>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* 邀请链接区域 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">您的专属邀请链接</h3>
                  <div className="flex space-x-3">
                    <Input 
                      value={inviteUrl} 
                      readOnly 
                      className="bg-gray-50 font-medium text-blue-800 text-base py-3" 
                    />
                    <Button 
                      onClick={() => handleCopyInviteLink(userInviteCode)} 
                      className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Copy className="h-5 w-5 mr-2" /> 复制链接
                    </Button>
                  </div>
                </div>

                {/* 奖励说明卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">🎁</div>
                      <p className="text-base font-semibold text-blue-800 mb-2">邀请奖励</p>
                      <p className="text-2xl font-bold text-blue-900">+20 次</p>
                      <p className="text-sm text-blue-600 mt-2">每邀请1人注册，双方获得</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">💎</div>
                      <p className="text-base font-semibold text-green-800 mb-2">当前可用</p>
                      <p className="text-2xl font-bold text-green-900">{usageRemaining}</p>
                      <p className="text-sm text-green-600 mt-2">本月剩余使用次数</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 使用须知 */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-base font-semibold mb-3 text-gray-800 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    使用须知
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 text-sm">✓</span> 
                      <span className="text-gray-700">每次成功邀请好友注册，您和好友各获得 20 次免费生成次数</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 text-sm">✓</span> 
                      <span className="text-gray-700">邀请链接长期有效，无过期时间</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 text-sm">✓</span> 
                      <span className="text-gray-700">每月月初自动赠送 10 次免费使用次数</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 text-sm">✓</span> 
                      <span className="text-gray-700">奖励次数永久有效，可累积使用</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={createNewInviteLink}
                    className="flex-1 py-2 text-base border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> 创建新链接
                  </Button>
                  <Button 
                    className="flex-1 py-2 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Share2 className="h-4 w-4 mr-2" /> 立即分享
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 新邀请链接创建结果 */}
          {newInviteLink && (
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-800 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  新邀请链接已创建
                </CardTitle>
                <CardDescription className="text-green-600">
                  分享以下链接给您的好友，开始获得奖励
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Input 
                    value={`${baseUrl}/register?ref=${newInviteLink.code}`} 
                    readOnly 
                    className="bg-white font-medium text-base py-3 border-green-300" 
                  />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${baseUrl}/register?ref=${newInviteLink.code}`);
                      toast({
                        title: "链接已复制",
                        description: "新的邀请链接已复制到剪贴板",
                      });
                    }}
                    className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Copy className="h-4 w-4 mr-2" /> 复制
                  </Button>
                </div>
                <p className="mt-3 text-sm text-green-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> 
                  邀请链接已创建，可立即使用
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvitePage;