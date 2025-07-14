/**
 * 用户编辑表单测试页面
 * 展示UserEditForm组件和角色检查功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  ArrowLeft,
  Shield,
  Settings,
  Crown,
  Star,
  Users,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthingStatus } from '@/hooks/useAuthingStatus';
import { useUserRoles, useSimpleUserRoles, useRolePermissions } from '@/hooks/useUserRoles';
import { 
  UserEditForm, 
  SimpleUserEditForm, 
  ConfirmUserEditForm 
} from '@/components/auth/UserEditForm';

/**
 * 用户编辑表单测试页面组件
 * @returns React 组件
 */
export default function UserEditFormTestPage() {
  const navigate = useNavigate();
  const [showRoles, setShowRoles] = useState(true);
  const [useSimpleRoles, setUseSimpleRoles] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [enableSecurityLog, setEnableSecurityLog] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  // 使用Authing状态Hook
  const {
    isLoggedIn,
    user,
    loading,
    error
  } = useAuthingStatus({
    autoCheck: true,
    redirectUri: '/user-edit-form-test',
    enableSecurityLog: true
  });

  // 使用角色检查Hook
  const userRoles = useUserRoles({
    autoCheck: true,
    enableSecurityLog: true
  });

  // 使用简化角色检查Hook
  const simpleUserRoles = useSimpleUserRoles();

  // 使用权限检查Hook
  const permissions = useRolePermissions();

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 保存成功回调
   */
  const handleSave = (user: any) => {
    console.log('用户资料保存成功:', user);
  };

  /**
   * 保存前回调
   */
  const handleBeforeSave = async (data: any) => {
    console.log('准备保存用户资料:', data);
    // 这里可以添加保存前的验证逻辑
    return true;
  };

  /**
   * 取消编辑回调
   */
  const handleCancel = () => {
    console.log('用户取消编辑');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 页面头部 */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">用户编辑表单测试</h1>
        <p className="text-gray-600">
          测试UserEditForm组件和角色检查功能
        </p>
      </div>

      {/* 当前状态 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            当前登录状态
          </CardTitle>
          <CardDescription>
            显示当前用户的登录状态和信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : isLoggedIn ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium text-blue-900">登录状态</span>
              </div>
              <Badge variant={isLoggedIn ? "default" : "secondary"}>
                {loading ? '检查中...' : isLoggedIn ? '已登录' : '未登录'}
              </Badge>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">用户信息</span>
              </div>
              <p className="text-sm text-green-700">
                {loading ? '加载中...' : 
                 user ? `${user.nickname} (${user.username})` : '未获取'}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">错误状态</span>
              </div>
              <p className="text-sm text-red-700">
                {error ? error : '无错误'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 角色信息 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            角色信息
          </CardTitle>
          <CardDescription>
            显示当前用户的角色和权限信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="full" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="full">完整角色检查</TabsTrigger>
              <TabsTrigger value="simple">简化角色检查</TabsTrigger>
            </TabsList>
            
            <TabsContent value="full" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    角色状态
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {userRoles.isVip ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>VIP用户</span>
                      {userRoles.isVip && (
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                          VIP
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {userRoles.isAdmin ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>管理员</span>
                      {userRoles.isAdmin && (
                        <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                          管理员
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {userRoles.isNormalUser ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>普通用户</span>
                      {userRoles.isNormalUser && (
                        <Badge variant="outline">普通用户</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    权限检查
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {permissions.canEdit() ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>编辑权限</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {permissions.canDelete() ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>删除权限</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {permissions.canView() ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>查看权限</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {permissions.canManage() ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>管理权限</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">角色列表</h4>
                <div className="flex flex-wrap gap-2">
                  {userRoles.roles.map((role, index) => (
                    <Badge key={index} variant="outline">
                      {role.name} ({role.code})
                    </Badge>
                  ))}
                  {userRoles.roles.length === 0 && (
                    <span className="text-gray-500">暂无角色</span>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="simple" className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  简化角色状态
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {simpleUserRoles.isVip ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>VIP用户</span>
                    {simpleUserRoles.isVip && (
                      <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {simpleUserRoles.isNormalUser ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>普通用户</span>
                    {simpleUserRoles.isNormalUser && (
                      <Badge variant="outline">普通用户</Badge>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 配置选项 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            配置选项
          </CardTitle>
          <CardDescription>
            自定义用户编辑表单的行为和显示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-roles"
                  checked={showRoles}
                  onCheckedChange={setShowRoles}
                />
                <Label htmlFor="show-roles">显示角色信息</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-simple-roles"
                  checked={useSimpleRoles}
                  onCheckedChange={setUseSimpleRoles}
                />
                <Label htmlFor="use-simple-roles">使用简化角色检查</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-avatar"
                  checked={showAvatar}
                  onCheckedChange={setShowAvatar}
                />
                <Label htmlFor="show-avatar">显示头像编辑</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-email"
                  checked={showEmail}
                  onCheckedChange={setShowEmail}
                />
                <Label htmlFor="show-email">显示邮箱编辑</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-phone"
                  checked={showPhone}
                  onCheckedChange={setShowPhone}
                />
                <Label htmlFor="show-phone">显示手机号编辑</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="security-log"
                  checked={enableSecurityLog}
                  onCheckedChange={setEnableSecurityLog}
                />
                <Label htmlFor="security-log">启用安全日志</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-confirm"
                  checked={showConfirm}
                  onCheckedChange={setShowConfirm}
                />
                <Label htmlFor="show-confirm">显示确认对话框</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户编辑表单展示 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          用户编辑表单
        </h2>
        
        <Tabs defaultValue="full" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="full">完整版本</TabsTrigger>
            <TabsTrigger value="simple">简化版本</TabsTrigger>
            <TabsTrigger value="confirm">确认版本</TabsTrigger>
          </TabsList>
          
          <TabsContent value="full" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>完整版本 - UserEditForm</CardTitle>
                <CardDescription>
                  功能完整的用户编辑表单，支持所有配置选项
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserEditForm
                  showAvatar={showAvatar}
                  showEmail={showEmail}
                  showPhone={showPhone}
                  enableSecurityLog={enableSecurityLog}
                  showConfirm={showConfirm}
                  showRoles={showRoles}
                  useSimpleRoles={useSimpleRoles}
                  onSave={handleSave}
                  onBeforeSave={handleBeforeSave}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simple" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>简化版本 - SimpleUserEditForm</CardTitle>
                <CardDescription>
                  基于您提供的代码逻辑，无确认对话框
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleUserEditForm
                  showAvatar={showAvatar}
                  showEmail={showEmail}
                  showPhone={showPhone}
                  enableSecurityLog={enableSecurityLog}
                  showRoles={showRoles}
                  useSimpleRoles={useSimpleRoles}
                  onSave={handleSave}
                  onBeforeSave={handleBeforeSave}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="confirm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>确认版本 - ConfirmUserEditForm</CardTitle>
                <CardDescription>
                  带确认对话框的安全编辑表单
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfirmUserEditForm
                  showAvatar={showAvatar}
                  showEmail={showEmail}
                  showPhone={showPhone}
                  enableSecurityLog={enableSecurityLog}
                  showRoles={showRoles}
                  useSimpleRoles={useSimpleRoles}
                  onSave={handleSave}
                  onBeforeSave={handleBeforeSave}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Separator className="my-8" />

      {/* 功能特性说明 */}
      <Card>
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
          <CardDescription>
            UserEditForm组件和角色检查功能的主要特性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">用户编辑功能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 用户信息编辑</li>
                <li>• 头像URL设置</li>
                <li>• 昵称修改</li>
                <li>• 邮箱更新</li>
                <li>• 手机号修改</li>
                <li>• 变更检测</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">角色检查功能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• VIP用户检测</li>
                <li>• 管理员权限</li>
                <li>• 角色权限检查</li>
                <li>• 安全日志记录</li>
                <li>• 权限验证</li>
                <li>• 角色状态显示</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 