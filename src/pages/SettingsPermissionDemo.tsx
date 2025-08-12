/**
 * 设置页面权限演示
 * @description 展示如何在设置页面中使用权限守卫和透明遮罩
 * @author 权限系统团队
 * @created 2025-08-12
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Zap, 
  Crown,
  Lock,
  Eye
} from 'lucide-react';
import { FeatureZoneGuard, SettingItemGuard, ThemeGuard } from '@/components/auth/FeatureZoneGuard';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import PageNavigation from '@/components/layout/PageNavigation';

export default function SettingsPermissionDemo() {
  const { user } = useUnifiedAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [apiTimeout, setApiTimeout] = useState(30);
  const [maxRetries, setMaxRetries] = useState(3);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageNavigation 
        title="设置权限演示"
        description="展示不同订阅等级用户在设置页面的权限控制"
      />

      {/* 用户信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            当前用户信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">用户名</div>
              <div className="font-medium">{user?.nickname || '未登录'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">当前等级</div>
              <Badge variant="outline">
                {user?.subscription?.tier || user?.vipLevel || 'trial'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">权限数量</div>
              <div className="font-medium">{user?.permissions?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">VIP状态</div>
              <Badge variant={user?.isVip ? "default" : "secondary"}>
                {user?.isVip ? "是" : "否"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 基础设置 - 所有用户可见 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                基础设置
              </CardTitle>
              <CardDescription>所有用户都可以访问的基础设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>通知设置</Label>
                  <div className="text-sm text-muted-foreground">接收系统通知</div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="space-y-2">
                <Label>语言设置</Label>
                <Select defaultValue="zh">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>用户名</Label>
                <Input placeholder="输入用户名" defaultValue={user?.nickname} />
              </div>
            </CardContent>
          </Card>

          {/* 主题设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                主题设置
              </CardTitle>
              <CardDescription>选择您喜欢的界面主题</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <ThemeGuard
                  themeName="浅色主题"
                  requiredTier="trial"
                  previewColor="#ffffff"
                  isSelected={true}
                />
                
                <ThemeGuard
                  themeName="深色主题"
                  requiredTier="pro"
                  previewColor="#1a1a1a"
                />
                
                <ThemeGuard
                  themeName="蓝色主题"
                  requiredTier="pro"
                  previewColor="#3b82f6"
                />
                
                <ThemeGuard
                  themeName="紫色主题"
                  requiredTier="premium"
                  previewColor="#8b5cf6"
                />
                
                <ThemeGuard
                  themeName="绿色主题"
                  requiredTier="premium"
                  previewColor="#10b981"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 高级设置 */}
        <div className="space-y-6">
          {/* 专业版功能区域 */}
          <FeatureZoneGuard
            requiredTier="pro"
            zoneName="专业版设置"
            description="专业版用户可以访问的高级配置选项"
            allowPreview={true}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  专业版设置
                </CardTitle>
                <CardDescription>高级配置和自定义选项</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动保存</Label>
                    <div className="text-sm text-muted-foreground">自动保存工作内容</div>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>

                <div className="space-y-2">
                  <Label>API超时时间: {apiTimeout}秒</Label>
                  <Slider
                    value={[apiTimeout]}
                    onValueChange={(value) => setApiTimeout(value[0])}
                    max={120}
                    min={10}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>AI模型选择</Label>
                  <Select defaultValue="gpt-4o">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="gemini">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>最大重试次数</Label>
                  <Input 
                    type="number" 
                    value={maxRetries} 
                    onChange={(e) => setMaxRetries(Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
              </CardContent>
            </Card>
          </FeatureZoneGuard>

          {/* 高级版功能区域 */}
          <FeatureZoneGuard
            requiredTier="premium"
            zoneName="企业级设置"
            description="高级版用户专享的企业级功能配置"
            allowPreview={true}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  企业级设置
                </CardTitle>
                <CardDescription>企业级功能和安全配置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    安全设置
                  </h4>
                  
                  <SettingItemGuard
                    requiredTier="premium"
                    itemName="单点登录(SSO)"
                    description="企业级单点登录集成"
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">单点登录(SSO)</div>
                        <div className="text-sm text-muted-foreground">SAML/OAuth集成</div>
                      </div>
                      <Button variant="outline" size="sm">配置</Button>
                    </div>
                  </SettingItemGuard>

                  <SettingItemGuard
                    requiredTier="premium"
                    itemName="数据加密"
                    description="端到端数据加密"
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">数据加密</div>
                        <div className="text-sm text-muted-foreground">AES-256加密</div>
                      </div>
                      <Switch />
                    </div>
                  </SettingItemGuard>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    数据管理
                  </h4>
                  
                  <SettingItemGuard
                    requiredTier="premium"
                    itemName="数据导出"
                    description="批量数据导出功能"
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">数据导出</div>
                        <div className="text-sm text-muted-foreground">JSON/CSV/Excel格式</div>
                      </div>
                      <Button variant="outline" size="sm">导出</Button>
                    </div>
                  </SettingItemGuard>

                  <SettingItemGuard
                    requiredTier="premium"
                    itemName="自动备份"
                    description="定期自动备份数据"
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">自动备份</div>
                        <div className="text-sm text-muted-foreground">每日自动备份</div>
                      </div>
                      <Switch />
                    </div>
                  </SettingItemGuard>
                </div>
              </CardContent>
            </Card>
          </FeatureZoneGuard>
        </div>
      </div>

      {/* 权限说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            权限说明
          </CardTitle>
          <CardDescription>不同订阅等级的功能权限说明</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="font-medium">体验版</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 基础设置</li>
                <li>• 浅色主题</li>
                <li>• 基础功能</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">专业版</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 所有体验版功能</li>
                <li>• 深色/蓝色主题</li>
                <li>• 高级配置选项</li>
                <li>• AI模型选择</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium">高级版</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 所有专业版功能</li>
                <li>• 全部主题</li>
                <li>• 企业级安全</li>
                <li>• 数据管理</li>
                <li>• SSO集成</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
