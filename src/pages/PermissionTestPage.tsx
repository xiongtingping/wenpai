/**
 * 权限测试页面
 * 用于测试和展示所有功能的权限状态
 */

import React, { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UnifiedPermissionGuard, useUnifiedPermission } from '@/components/auth/UnifiedPermissionGuard';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { FeatureZoneGuard, SettingItemGuard, ThemeGuard } from '@/components/auth/FeatureZoneGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette, Crown, Zap, Star, Smile, Calendar } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 权限测试页面
 */
const PermissionTestPage: React.FC = () => {
  const { user } = useUnifiedAuth();
  const [testValue, setTestValue] = useState(50);
  const [testSwitch, setTestSwitch] = useState(false);

  // 测试不同的权限
  const authPermission = usePermission('auth:required');
  const vipPermission = usePermission('vip:required');
  const creativeStudioPermission = usePermission('feature:creative-studio');
  const brandLibraryPermission = usePermission('feature:brand-library');
  const contentExtractorPermission = usePermission('feature:content-extractor');
  const emojiGeneratorPermission = usePermission('feature:emoji-generator');
  const marketingCalendarPermission = usePermission('feature:marketing-calendar');
  const wechatTemplatesPermission = usePermission('feature:wechat-templates');
  const tierProPermission = usePermission('tier:pro');
  const tierPremiumPermission = usePermission('tier:premium');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🔒 权限系统测试页面</CardTitle>
            <CardDescription>
              测试新的统一权限系统是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 权限状态概览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">登录状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={authPermission.pass ? "default" : "destructive"}>
                    {authPermission.pass ? "已登录" : "未登录"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">VIP状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={vipPermission.pass ? "default" : "secondary"}>
                    {vipPermission.pass ? "VIP用户" : "普通用户"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">创意魔方</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={creativeStudioPermission.pass ? "default" : "secondary"}>
                    {creativeStudioPermission.pass ? "可用" : "需要VIP"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">品牌库</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={brandLibraryPermission.pass ? "default" : "secondary"}>
                    {brandLibraryPermission.pass ? "可用" : "需要VIP"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">内容提取</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={contentExtractorPermission.pass ? "default" : "secondary"}>
                    {contentExtractorPermission.pass ? "可用" : "需要VIP"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* 权限详情 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">权限详情</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>登录权限 (auth:required)</span>
                  <div className="text-right">
                    <Badge variant={authPermission.pass ? "default" : "destructive"}>
                      {authPermission.pass ? "通过" : "失败"}
                    </Badge>
                    {!authPermission.pass && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {authPermission.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>VIP权限 (vip:required)</span>
                  <div className="text-right">
                    <Badge variant={vipPermission.pass ? "default" : "secondary"}>
                      {vipPermission.pass ? "通过" : "失败"}
                    </Badge>
                    {!vipPermission.pass && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {vipPermission.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>创意魔方 (feature:creative-studio)</span>
                  <div className="text-right">
                    <Badge variant={creativeStudioPermission.pass ? "default" : "secondary"}>
                      {creativeStudioPermission.pass ? "通过" : "失败"}
                    </Badge>
                    {!creativeStudioPermission.pass && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {creativeStudioPermission.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>品牌库 (feature:brand-library)</span>
                  <div className="text-right">
                    <Badge variant={brandLibraryPermission.pass ? "default" : "secondary"}>
                      {brandLibraryPermission.pass ? "通过" : "失败"}
                    </Badge>
                    {!brandLibraryPermission.pass && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {brandLibraryPermission.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>内容提取 (feature:content-extractor)</span>
                  <div className="text-right">
                    <Badge variant={contentExtractorPermission.pass ? "default" : "secondary"}>
                      {contentExtractorPermission.pass ? "通过" : "失败"}
                    </Badge>
                    {!contentExtractorPermission.pass && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {contentExtractorPermission.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 权限守卫测试 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">权限守卫测试</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">需要登录的内容</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="auth:required" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-border rounded-lg">
                        <p className="text-foreground">✅ 您已登录，可以看到这个内容</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">需要VIP的内容</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="vip:required" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-border rounded-lg">
                        <p className="text-primary">👑 VIP专属内容</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">创意魔方功能</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="feature:creative-studio" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-primary rounded-lg">
                        <p className="text-primary">🎨 创意魔方功能可用</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">品牌库功能</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="feature:brand-library" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-border rounded-lg">
                        <p className="text-foreground">📚 品牌库功能可用</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Emoji生成器功能</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="feature:emoji-generator" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-primary rounded-lg">
                        <p className="text-primary">😀 Emoji生成器功能可用</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">营销日历功能</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="feature:marketing-calendar" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-primary rounded-lg">
                        <p className="text-primary">📅 营销日历功能可用</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">微信朋友圈文案模板功能</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionGuard required="feature:wechat-templates" autoRedirect={false}>
                      <div className="p-4 bg-accent border border-primary rounded-lg">
                        <p className="text-primary">💬 微信朋友圈文案模板功能可用</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* 新版订阅权限系统测试 */}
            <Separator />

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">订阅权限系统测试</h3>
              </div>

              {/* 当前用户信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    当前用户状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">用户名</div>
                      <div className="font-medium">{user?.nickname || '未登录'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">VIP等级</div>
                      <div className="font-medium">{user?.vipLevel || 'trial'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">订阅状态</div>
                      <div className="font-medium">{user?.subscription?.tier || 'trial'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">权限数量</div>
                      <div className="font-medium">{user?.permissions?.length || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="unified" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="unified">统一守卫</TabsTrigger>
                  <TabsTrigger value="guards">权限守卫</TabsTrigger>
                  <TabsTrigger value="zones">功能区域</TabsTrigger>
                  <TabsTrigger value="themes">主题权限</TabsTrigger>
                </TabsList>

                {/* 统一权限守卫测试 */}
                <TabsContent value="unified" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 专业版功能 - 统一守卫 */}
                    <UnifiedPermissionGuard
                      requiredPermission="feature:creative-studio"
                      featureName="创意魔方"
                      description="使用统一权限守卫的创意魔方功能"
                      allowPreview={true}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" />
                            创意魔方 (统一守卫)
                          </CardTitle>
                          <CardDescription>
                            使用UnifiedPermissionGuard的功能
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full">开始创作</Button>
                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="outline" size="sm">风格A</Button>
                              <Button variant="outline" size="sm">风格B</Button>
                              <Button variant="outline" size="sm">风格C</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </UnifiedPermissionGuard>

                    {/* 高级版功能 - 统一守卫 */}
                    <UnifiedPermissionGuard
                      requiredPermission="feature:brand-library"
                      featureName="品牌库"
                      description="使用统一权限守卫的品牌库功能"
                      allowPreview={true}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-purple-500" />
                            品牌库 (统一守卫)
                          </CardTitle>
                          <CardDescription>
                            使用UnifiedPermissionGuard的功能
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full">管理品牌资产</Button>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>品牌一致性</span>
                                <span>98%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </UnifiedPermissionGuard>

                    {/* Emoji生成器功能 - 统一守卫 */}
                    <UnifiedPermissionGuard
                      requiredPermission="feature:emoji-generator"
                      featureName="Emoji生成器"
                      description="智能生成个性化Emoji图片"
                      allowPreview={true}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Smile className="h-5 w-5 text-yellow-500" />
                            Emoji生成器 (统一守卫)
                          </CardTitle>
                          <CardDescription>
                            使用UnifiedPermissionGuard的Emoji功能
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full">生成Emoji</Button>
                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="outline" size="sm">😀</Button>
                              <Button variant="outline" size="sm">🎉</Button>
                              <Button variant="outline" size="sm">💡</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </UnifiedPermissionGuard>

                    {/* 营销日历功能 - 统一守卫 */}
                    <UnifiedPermissionGuard
                      requiredPermission="feature:marketing-calendar"
                      featureName="营销日历"
                      description="智能营销日历和任务管理"
                      allowPreview={true}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-green-500" />
                            营销日历 (统一守卫)
                          </CardTitle>
                          <CardDescription>
                            使用UnifiedPermissionGuard的日历功能
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full">查看日历</Button>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" size="sm">添加任务</Button>
                              <Button variant="outline" size="sm">查看统计</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </UnifiedPermissionGuard>
                  </div>
                </TabsContent>

                {/* 权限守卫测试 */}
                <TabsContent value="guards" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 专业版功能 */}
                    <SubscriptionGuard
                      requiredTier="pro"
                      featureName="创意魔方"
                      description="AI驱动的多维度创意内容生成工具"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" />
                            创意魔方 (专业版)
                          </CardTitle>
                          <CardDescription>
                            这是一个需要专业版权限的功能
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full">开始创作</Button>
                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="outline" size="sm">风格A</Button>
                              <Button variant="outline" size="sm">风格B</Button>
                              <Button variant="outline" size="sm">风格C</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SubscriptionGuard>

                    {/* 高级版功能 */}
                    <SubscriptionGuard
                      requiredTier="premium"
                      featureName="品牌库"
                      description="企业级品牌资产管理和智能分析系统"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-purple-500" />
                            品牌库 (高级版)
                          </CardTitle>
                          <CardDescription>
                            这是一个需要高级版权限的功能
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full">管理品牌资产</Button>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>品牌一致性</span>
                                <span>98%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SubscriptionGuard>
                  </div>
                </TabsContent>

                {/* 功能区域测试 */}
                <TabsContent value="zones" className="space-y-6">
                  <FeatureZoneGuard
                    requiredTier="pro"
                    zoneName="高级设置"
                    description="专业版用户可以访问更多高级配置选项"
                    allowPreview={true}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>高级配置面板</CardTitle>
                        <CardDescription>专业版功能区域</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">AI模型选择</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择AI模型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                              <SelectItem value="claude">Claude</SelectItem>
                              <SelectItem value="gemini">Gemini Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">创意强度: {testValue}%</label>
                          <Slider
                            value={[testValue]}
                            onValueChange={(value) => setTestValue(value[0])}
                            max={100}
                            step={1}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">启用高级算法</label>
                          <Switch checked={testSwitch} onCheckedChange={setTestSwitch} />
                        </div>
                      </CardContent>
                    </Card>
                  </FeatureZoneGuard>
                </TabsContent>

                {/* 主题权限测试 */}
                <TabsContent value="themes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        主题选择权限测试
                      </CardTitle>
                      <CardDescription>不同等级用户可以使用的主题</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ThemeGuard
                          themeName="浅色主题"
                          requiredTier="trial"
                          previewColor="#ffffff"
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

                        <ThemeGuard
                          themeName="米色主题"
                          requiredTier="premium"
                          previewColor="#f5f5dc"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* 调试信息 */}
            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">调试信息</h3>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('🔒 权限调试信息:', {
                      authPermission,
                      vipPermission,
                      creativeStudioPermission,
                      brandLibraryPermission,
                      contentExtractorPermission,
                      tierProPermission,
                      tierPremiumPermission,
                      user
                    });
                  }}
                >
                  打印权限调试信息到控制台
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  打开浏览器控制台查看详细的权限检查日志
                </p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionTestPage; 