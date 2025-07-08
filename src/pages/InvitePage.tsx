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
import PageNavigation from '@/components/layout/PageNavigation';

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
      {/* 页面导航 */}
      <PageNavigation
        title="邀请好友"
        description="邀请朋友注册，双方都能获得免费使用次数奖励"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回个人中心
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-1" />
              立即分享
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 border-2 border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <Gift className="mr-2 h-5 w-5" /> 邀请好友，双方共同获益
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">您的专属邀请链接</h3>
                    <div className="flex space-x-2">
                      <Input 
                        value={inviteUrl} 
                        readOnly 
                        className="bg-gray-50 font-medium text-blue-800" 
                      />
                      <Button onClick={() => handleCopyInviteLink(userInviteCode)} className="flex-shrink-0">
                        <Copy className="h-4 w-4 mr-1" /> 复制
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    <Card className="bg-blue-50 border border-blue-100">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-blue-600 font-medium">每邀请 1 人注册</p>
                        <p className="text-2xl font-bold text-blue-800 mt-1">+20 次</p>
                        <p className="text-xs text-blue-600 mt-1">双方获得</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border border-green-100">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-green-600 font-medium">当前可用次数</p>
                        <p className="text-2xl font-bold text-green-800 mt-1">{usageRemaining}</p>
                        <p className="text-xs text-green-600 mt-1">本月剩余</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">使用须知：</h3>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span> 
                        <span>每次成功邀请好友注册，您和好友各获得 20 次免费生成次数</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span> 
                        <span>邀请链接长期有效</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span> 
                        <span>每月月初赠送 10 次免费使用次数</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 border-t flex justify-between">
                                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" /> 邀请链接长期有效
                  </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={createNewInviteLink}>
                    <RefreshCw className="h-4 w-4 mr-1" /> 创建新链接
                  </Button>
                  <Button>
                    <Share2 className="h-4 w-4 mr-1" /> 立即分享
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" /> 奖励记录
                </CardTitle>
                <CardDescription>
                  您获得的邀请奖励统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">总邀请注册人数：</span>
                      <span className="font-medium">{userInviteStats.totalRegistrations} 人</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">获得注册奖励：</span>
                      <span className="font-medium">{userInviteStats.totalRegistrations * 20} 次</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>累计获得奖励：</span>
                      <span className="text-blue-600">{calculateTotalRewards()} 次</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New invite link creation result */}
          {newInviteLink && (
            <Card className="mt-6 border-2 border-green-100">
              <CardHeader className="pb-3">
                <CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500 inline mr-2" />
                  新邀请链接已创建
                </CardTitle>
                <CardDescription>
                  分享以下链接给您的好友
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input 
                    value={`${baseUrl}/register?ref=${newInviteLink.code}`} 
                    readOnly 
                    className="bg-gray-50 font-medium" 
                  />
                  <Button onClick={() => {
                    navigator.clipboard.writeText(`${baseUrl}/register?ref=${newInviteLink.code}`);
                    toast({
                      title: "链接已复制",
                      description: "新的邀请链接已复制到剪贴板",
                    });
                  }}>
                    <Copy className="h-4 w-4 mr-1" /> 复制
                  </Button>
                </div>
                <p className="mt-3 text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> 
                  邀请链接已创建
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