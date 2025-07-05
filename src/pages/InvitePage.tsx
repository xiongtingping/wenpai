import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  Award,
  Share2,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/store/userStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function InvitePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("invite");
  const userInviteCode = useUserStore((state) => state.userInviteCode);
  const generateInviteCode = useUserStore((state) => state.generateInviteCode);
  const userInviteStats = useUserStore((state) => state.userInviteStats);
  const usageRemaining = useUserStore((state) => state.usageRemaining);
  
  const [newInviteLink, setNewInviteLink] = useState<any>(null);

  // Base URL for invites
  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/register?ref=${userInviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "链接已复制",
      description: "邀请链接已复制到剪贴板",
    });
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
    <div className="container mx-auto py-12 max-w-6xl">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-8">邀请好友 · 获得奖励</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="invite">邀请奖励</TabsTrigger>
          <TabsTrigger value="stats">数据统计</TabsTrigger>
        </TabsList>

        <TabsContent value="invite">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 border-2 border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <Award className="mr-2 h-5 w-5" /> 邀请好友，双方共同获益
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
                      <Button onClick={handleCopyLink} className="flex-shrink-0">
                        <Copy className="h-4 w-4 mr-1" /> 复制
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    <Card className="bg-blue-50 border border-blue-100">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-blue-600 font-medium">每邀请 1 人注册</p>
                        <p className="text-2xl font-bold text-blue-800 mt-1">+20 次</p>
                        <p className="text-xs text-blue-600 mt-1">生成次数</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border border-purple-100">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-purple-600 font-medium">邀请奖励</p>
                        <p className="text-2xl font-bold text-purple-800 mt-1">+20 次</p>
                        <p className="text-xs text-purple-600 mt-1">双方获得</p>
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
                        <span>将您的专属邀请链接分享给好友，好友通过链接注册后双方各获得 20 次免费生成次数</span>
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
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" /> 邀请数据统计
              </CardTitle>
              <CardDescription>
                查看您的邀请链接表现和奖励获取情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-green-50 border border-green-100">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Users className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-3xl font-bold">{userInviteStats.totalRegistrations}</p>
                    <p className="text-sm text-gray-500">成功注册人数</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border border-purple-100">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Award className="h-8 w-8 text-purple-500 mb-2" />
                    <p className="text-3xl font-bold">{calculateTotalRewards()}</p>
                    <p className="text-sm text-gray-500">累计奖励次数</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableCaption>邀请链接效果统计表格</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>邀请码</TableHead>
                      <TableHead>创建日期</TableHead>
                      <TableHead className="text-right">注册数</TableHead>
                      <TableHead className="text-right">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userInviteStats.invitationLinks.length > 0 ? (
                      userInviteStats.invitationLinks.map((invite) => (
                        <TableRow key={invite.code}>
                          <TableCell className="font-medium">{invite.code}</TableCell>
                          <TableCell>{new Date(invite.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{invite.registrations}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                              有效
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          暂无邀请记录，创建一个新的邀请链接开始分享吧！
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Show the newly created invite if it exists */}
                    {newInviteLink && (
                      <TableRow className="bg-green-50">
                        <TableCell className="font-medium">{newInviteLink.code}</TableCell>
                        <TableCell>{new Date(newInviteLink.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">0</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">新建</Badge>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InvitePage;