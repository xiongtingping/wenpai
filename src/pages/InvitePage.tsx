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
  Home,
  User,
  Plus,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/store/userStore";
import { useAuth } from "@/contexts/AuthContext";
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
  const { userId, isTempUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("invite");
  const userInviteCode = useUserStore((state) => state.userInviteCode);
  const generateInviteCode = useUserStore((state) => state.generateInviteCode);
  const userInviteStats = useUserStore((state) => state.userInviteStats);
  const usageRemaining = useUserStore((state) => state.usageRemaining);
  const trackInviteClick = useUserStore((state) => state.trackInviteClick);
  const navigate = useNavigate();
  
  const [newInviteLink, setNewInviteLink] = useState<any>(null);

  // Base URL for invites
  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/register?ref=${userInviteCode}`;

  const handleCopyInviteLink = async (inviteCode: string) => {
    try {
      const inviteLink = `${window.location.origin}/register?ref=${inviteCode}`;
      await navigator.clipboard.writeText(inviteLink);
      
      // 记录邀请链接点击
      trackInviteClick(inviteCode);
      
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
      expirationDate: expirationDate.toISOString(),
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

  // 格式化时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 检查邀请链接是否过期
  const isInviteExpired = (expirationDate: string) => {
    return new Date() > new Date(expirationDate);
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">邀请好友</h1>
            <p className="text-gray-600 text-lg">
              邀请好友注册，双方各得20次使用机会奖励
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {userInviteStats.totalClicks}
              </div>
              <div className="text-gray-600">总点击次数</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {userInviteStats.totalRegistrations}
              </div>
              <div className="text-gray-600">成功邀请</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {calculateTotalRewards()}
              </div>
              <div className="text-gray-600">总奖励次数</div>
            </Card>
          </div>

          {/* 邀请方式区 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 推荐码邀请 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  推荐码邀请
                </CardTitle>
                <CardDescription>
                  分享您的专属推荐码，好友注册时输入即可获得奖励
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">您的推荐码</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={userInviteCode} 
                      readOnly 
                      className="font-mono text-lg" 
                    />
                    <Button 
                      onClick={() => handleCopyInviteLink(userInviteCode)}
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" /> 复制
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">邀请链接</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={inviteUrl} 
                      readOnly 
                      className="text-sm" 
                    />
                    <Button 
                      onClick={() => handleCopyInviteLink(userInviteCode)}
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" /> 复制
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 创建新邀请链接 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  创建新邀请链接
                </CardTitle>
                <CardDescription>
                  创建带有7天有效期的专属邀请链接
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={createNewInviteLink}
                  className="w-full"
                  disabled={!!newInviteLink}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建新邀请链接
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 新创建的邀请链接 */}
          {newInviteLink && (
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 mt-8">
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
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <Input 
                      value={`${baseUrl}/register?ref=${newInviteLink.code}`} 
                      readOnly 
                      className="bg-white font-medium text-base py-3 border-green-300" 
                    />
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${baseUrl}/register?ref=${newInviteLink.code}`);
                        trackInviteClick(newInviteLink.code);
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
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <Clock className="h-4 w-4 mr-2" /> 
                      创建时间: {formatDate(newInviteLink.createdAt)}
                    </div>
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-4 w-4 mr-2" /> 
                      过期时间: {formatDate(newInviteLink.expirationDate)}
                    </div>
                  </div>
                  
                  {isInviteExpired(newInviteLink.expirationDate) && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      此邀请链接已过期
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvitePage;