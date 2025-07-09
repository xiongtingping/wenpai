/**
 * 平台API配置管理组件
 * 支持平台授权、配置管理和状态显示
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  RefreshCw,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  getSupportedPlatforms,
  loadPlatformApiConfig,
  savePlatformApiConfig,
  clearPlatformApiConfig,
  checkPlatformAuth,
  getPlatformAuthUrl,
  type PlatformApiConfig
} from '@/api/platformApiService';

/**
 * 平台API配置管理组件属性
 */
interface PlatformApiManagerProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
}

/**
 * 平台API配置管理组件
 * @param props 组件属性
 * @returns React组件
 */
export function PlatformApiManager({ open, onOpenChange }: PlatformApiManagerProps) {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<PlatformApiConfig[]>([]);
  const [editingPlatform, setEditingPlatform] = useState<PlatformApiConfig | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');

  /**
   * 加载平台列表和配置
   */
  useEffect(() => {
    if (open) {
      const supportedPlatforms = getSupportedPlatforms();
      const platformsWithConfig = supportedPlatforms.map(platform => {
        const config = loadPlatformApiConfig(platform.platformId);
        return config || platform;
      });
      setPlatforms(platformsWithConfig);
    }
  }, [open]);

  /**
   * 打开配置编辑弹窗
   * @param platform 平台配置
   */
  const handleEditConfig = (platform: PlatformApiConfig) => {
    setEditingPlatform(platform);
    setApiKey(platform.apiKey || '');
    setAccessToken(platform.accessToken || '');
    setUserId(platform.userId || '');
    setConfigDialogOpen(true);
  };

  /**
   * 保存平台配置
   */
  const handleSaveConfig = () => {
    if (!editingPlatform) return;

    const updatedConfig: Partial<PlatformApiConfig> = {
      apiKey: apiKey.trim() || undefined,
      accessToken: accessToken.trim() || undefined,
      userId: userId.trim() || undefined,
      isAuthorized: !!(accessToken.trim())
    };

    savePlatformApiConfig(editingPlatform.platformId, updatedConfig);
    
    // 更新本地状态
    setPlatforms(prev => prev.map(p => 
      p.platformId === editingPlatform.platformId 
        ? { ...p, ...updatedConfig }
        : p
    ));

    setConfigDialogOpen(false);
    setEditingPlatform(null);
    
    toast({
      title: "配置已保存",
      description: `${editingPlatform.platformName}的API配置已更新`,
    });
  };

  /**
   * 清除平台配置
   * @param platformId 平台ID
   */
  const handleClearConfig = (platformId: string) => {
    clearPlatformApiConfig(platformId);
    setPlatforms(prev => prev.map(p => 
      p.platformId === platformId 
        ? { ...p, apiKey: undefined, accessToken: undefined, userId: undefined, isAuthorized: false }
        : p
    ));
    
    toast({
      title: "配置已清除",
      description: "平台API配置已清除",
    });
  };

  /**
   * 打开平台授权页面
   * @param platform 平台配置
   */
  const handleAuthorize = (platform: PlatformApiConfig) => {
    const authUrl = getPlatformAuthUrl(platform.platformId);
    if (authUrl) {
      window.open(authUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: "授权页面已打开",
        description: "请在授权页面完成授权，然后返回配置访问令牌",
      });
    } else {
      toast({
        title: "授权失败",
        description: "该平台暂不支持授权",
        variant: "destructive"
      });
    }
  };

  /**
   * 刷新平台状态
   */
  const handleRefresh = () => {
    const supportedPlatforms = getSupportedPlatforms();
    const platformsWithConfig = supportedPlatforms.map(platform => {
      const config = loadPlatformApiConfig(platform.platformId);
      return config || platform;
    });
    setPlatforms(platformsWithConfig);
    
    toast({
      title: "状态已刷新",
      description: "平台配置状态已更新",
    });
  };

  /**
   * 获取平台状态图标
   * @param platform 平台配置
   * @returns React节点
   */
  const getStatusIcon = (platform: PlatformApiConfig) => {
    if (platform.isAuthorized) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (platform.accessToken) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * 获取平台状态文本
   * @param platform 平台配置
   * @returns 状态文本
   */
  const getStatusText = (platform: PlatformApiConfig) => {
    if (platform.isAuthorized) {
      return "已授权";
    } else if (platform.accessToken) {
      return "待验证";
    } else {
      return "未配置";
    }
  };

  /**
   * 获取平台状态颜色
   * @param platform 平台配置
   * @returns 状态颜色类名
   */
  const getStatusColor = (platform: PlatformApiConfig) => {
    if (platform.isAuthorized) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (platform.accessToken) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else {
      return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            平台API配置管理
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="platforms" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platforms">平台配置</TabsTrigger>
              <TabsTrigger value="help">使用说明</TabsTrigger>
            </TabsList>
            
            <TabsContent value="platforms" className="h-full overflow-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      配置平台API密钥和访问令牌，支持内容直发功能
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    刷新状态
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <Card key={platform.platformId} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{platform.platformName}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(platform)}
                            <Badge variant="outline" className={getStatusColor(platform)}>
                              {getStatusText(platform)}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          平台ID: {platform.platformId}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            API密钥: {platform.apiKey ? '已配置' : '未配置'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            访问令牌: {platform.accessToken ? '已配置' : '未配置'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditConfig(platform)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            配置
                          </Button>
                          
                          {platform.authUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAuthorize(platform)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              授权
                            </Button>
                          )}
                          
                          {(platform.apiKey || platform.accessToken) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClearConfig(platform.platformId)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              清除
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="help" className="h-full overflow-auto">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API直发功能说明</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">什么是API直发？</h4>
                      <p className="text-sm text-gray-600">
                        API直发功能允许您通过平台的官方API直接发布内容，无需手动复制粘贴。
                        配置完成后，可以一键将AI生成的内容直接发布到各平台。
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">支持的平台</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 微博 - 支持文本发布</li>
                        <li>• 知乎 - 支持文章发布</li>
                        <li>• Twitter - 支持推文发布</li>
                        <li>• 更多平台开发中...</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">配置步骤</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. 点击"授权"按钮，在平台官网完成授权</li>
                        <li>2. 获取API密钥和访问令牌</li>
                        <li>3. 在配置页面填入相关信息</li>
                        <li>4. 保存配置，即可使用API直发功能</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">安全说明</h4>
                      <p className="text-sm text-gray-600">
                        所有API密钥和访问令牌仅存储在您的浏览器本地，不会上传到服务器。
                        请妥善保管您的密钥信息，不要泄露给他人。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 配置编辑弹窗 */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                配置 {editingPlatform?.platformName} API
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API密钥</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="请输入API密钥"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="accessToken">访问令牌</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="请输入访问令牌"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="userId">用户ID</Label>
                <Input
                  id="userId"
                  placeholder="请输入用户ID（可选）"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveConfig}>
                保存配置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
} 