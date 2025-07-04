import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Loader2, 
  Users, 
  Award,
  Settings,
  CreditCard,
  Heart,
  TestTube
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ToolLayout from "@/components/layout/ToolLayout";
import { useUserStore } from "@/store/userStore";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, logout } = useUserStore();
  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
  });
  
  const [usageRemaining, setUsageRemaining] = useState(20);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [favorites, setFavorites] = useState<Array<{id: string; content: string}>>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast({
        title: "需要登录",
        description: "请先登录后再访问此页面",
        variant: "destructive"
      });
      navigate('/login-register');
      return;
    }
    
    // Load user data from store
    if (userInfo) {
      setUser({
        name: userInfo.username,
        phone: userInfo.username,
        email: userInfo.email
      });
      setEditValue(userInfo.username || "");
    }
    
    // Load usage data (mock)
    const savedUsage = localStorage.getItem('usageRemaining');
    if (savedUsage) {
      setUsageRemaining(parseInt(savedUsage));
    }

    // Load favorites
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites as Array<{id: string; content: string}>);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, [navigate, toast]);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setEditValue(user[field as keyof typeof user] || "");
  };

  const handleSave = async (field: string) => {
    if (!editValue.trim()) {
      toast({
        title: "输入不能为空",
        description: "请填写有效信息",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUser = { ...user, [field]: editValue };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "更新成功",
        description: `${field === 'name' ? '姓名' : field === 'phone' ? '手机号' : '邮箱'}已更新`,
      });
      
      setEditingField(null);
      setLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "已登出",
      description: "您已成功退出登录",
    });
    navigate('/');
  };

  return (
    <ToolLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">我的账户</h1>
            <p className="text-gray-600 mt-2">管理您的个人信息和使用情况</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    个人信息
                  </CardTitle>
                  <CardDescription>
                    管理您的账户基本信息
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <Label className="text-sm font-medium">姓名</Label>
                    </div>
                    {editingField === 'name' ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-48"
                          disabled={loading}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('name')}
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900">{user.name || "未设置"}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit('name')}
                        >
                          编辑
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <Label className="text-sm font-medium">手机号</Label>
                    </div>
                    {editingField === 'phone' ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-48"
                          disabled={loading}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('phone')}
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900">{user.phone || "未设置"}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit('phone')}
                        >
                          编辑
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <Label className="text-sm font-medium">邮箱</Label>
                    </div>
                    {editingField === 'email' ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-48"
                          disabled={loading}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('email')}
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900">{user.email || "未设置"}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit('email')}
                        >
                          编辑
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    使用统计
                  </CardTitle>
                  <CardDescription>
                    查看您的使用情况和剩余次数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{usageRemaining}</div>
                      <div className="text-sm text-gray-600">剩余次数</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">20</div>
                      <div className="text-sm text-gray-600">本月已用</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">5</div>
                      <div className="text-sm text-gray-600">邀请奖励</div>
                    </div>
                  </div>
                  
                  {usageRemaining <= 5 && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-amber-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            使用次数即将用完
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            邀请好友可获得更多使用次数，或升级专业版享受无限使用
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    快捷操作
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/invite">
                      <Users className="h-4 w-4 mr-2" />
                      邀请奖励
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/adapt">
                      <Shield className="h-4 w-4 mr-2" />
                      内容适配
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/brand-library">
                      <Settings className="h-4 w-4 mr-2" />
                      品牌库
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/api-test">
                      <TestTube className="h-4 w-4 mr-2" />
                      API 测试
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Upgrade Card */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <CreditCard className="h-5 w-5 mr-2" />
                    升级专业版
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    解锁无限使用和高级功能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-blue-700">
                      <p>✓ 无限次内容生成</p>
                      <p>✓ 全平台内容适配</p>
                      <p>✓ 高级风格定制</p>
                      <p>✓ 品牌库功能</p>
                    </div>
                                         <Button 
                       className="w-full bg-blue-600 hover:bg-blue-700"
                       onClick={() => window.location.href = "/payment"}
                     >
                       立即升级
                     </Button>
                     <Button 
                       variant="outline" 
                       className="w-full text-red-600 hover:text-red-700"
                       onClick={handleLogout}
                     >
                       退出登录
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    我的收藏
                  </CardTitle>
                  <CardDescription>
                    您收藏的内容适配结果
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {favorites.map((favorite, index) => (
                      <div key={favorite.id || index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{favorite.platformName}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(favorite.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(favorite.content);
                                toast({
                                  title: "已复制",
                                  description: "内容已复制到剪贴板",
                                });
                              }}
                            >
                              一键复制
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newFavorites = favorites.filter((_, i) => i !== index);
                                setFavorites(newFavorites);
                                localStorage.setItem('favorites', JSON.stringify(newFavorites));
                                toast({
                                  title: "已删除",
                                  description: "收藏内容已删除",
                                });
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                          {favorite.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
} 