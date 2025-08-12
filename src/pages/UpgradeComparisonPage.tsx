/**
 * 权限升级界面对比页面
 * 展示新旧权限升级界面的对比效果
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionOverlay } from '@/components/auth/PermissionOverlay';
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { UpgradePromptCard } from '@/components/auth/UpgradePromptCard';
import { PermissionUpgradeDialog } from '@/components/auth/PermissionUpgradeDialog';
import { 
  Crown, 
  Zap, 
  Star, 
  Wand2, 
  Database, 
  Palette,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function UpgradeComparisonPage() {
  const [showOldOverlay, setShowOldOverlay] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const demoFeatures = [
    {
      name: '创意魔方',
      tier: 'pro' as const,
      description: '使用AI快速生成高质量的创意内容，提升内容创作效率',
      icon: <Wand2 className="h-5 w-5" />,
      color: 'text-blue-500'
    },
    {
      name: '品牌库',
      tier: 'premium' as const,
      description: '智能品牌资产管理，支持多维度分析和自动去重',
      icon: <Database className="h-5 w-5" />,
      color: 'text-purple-500'
    }
  ];

  const [selectedFeature, setSelectedFeature] = useState(demoFeatures[0]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">权限升级界面对比</h1>
          <p className="text-muted-foreground">
            对比原有的权限遮罩弹窗和新的版本对比升级界面
          </p>
        </div>

        {/* 功能选择 */}
        <div className="flex justify-center gap-4">
          {demoFeatures.map((feature) => (
            <Button
              key={feature.name}
              variant={selectedFeature.name === feature.name ? "default" : "outline"}
              onClick={() => setSelectedFeature(feature)}
              className="flex items-center gap-2"
            >
              <span className={feature.color}>{feature.icon}</span>
              {feature.name}
              <Badge variant="secondary" className="ml-2">
                {feature.tier === 'pro' ? '专业版' : '高级版'}
              </Badge>
            </Button>
          ))}
        </div>

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">界面对比</TabsTrigger>
            <TabsTrigger value="new-features">新界面特性</TabsTrigger>
            <TabsTrigger value="implementation">实现方案</TabsTrigger>
          </TabsList>

          {/* 界面对比 */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 原有权限遮罩 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">原有权限遮罩</h2>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    旧版本
                  </Badge>
                </div>
                
                <div className="relative">
                  <Card className="h-80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className={selectedFeature.color}>{selectedFeature.icon}</span>
                        {selectedFeature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {selectedFeature.description}
                        </p>
                        <Button className="w-full" disabled>
                          开始使用 {selectedFeature.name}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" disabled>选项A</Button>
                          <Button variant="outline" size="sm" disabled>选项B</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 权限遮罩 */}
                  <PermissionOverlay
                    show={true}
                    featureName={selectedFeature.name}
                    requiredPermission="creative:basic"
                    requiredTier={selectedFeature.tier}
                    description={selectedFeature.description}
                    opacity={0.3}
                  >
                    <div />
                  </PermissionOverlay>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>❌ 信息不够清晰，用户不知道各版本差异</p>
                  <p>❌ 只显示单一升级选项，缺乏对比</p>
                  <p>❌ 升级理由不够充分</p>
                </div>
              </div>

              {/* 新版权限升级界面 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">新版升级界面</h2>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    新版本
                  </Badge>
                </div>

                <Card className="h-80 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">需要升级解锁</h3>
                    <p className="text-muted-foreground">
                      {selectedFeature.name} 需要 {selectedFeature.tier === 'pro' ? '专业版' : '高级版'} 权限
                    </p>
                    <Button onClick={() => setShowNewDialog(true)}>
                      <Crown className="h-4 w-4 mr-2" />
                      查看升级方案
                    </Button>
                  </div>
                </Card>

                <div className="text-sm text-green-600 space-y-2">
                  <p>✅ 清晰的版本对比，用户能看到所有差异</p>
                  <p>✅ 显示当前版本 vs 目标版本的功能对比</p>
                  <p>✅ 明确的价格信息和升级理由</p>
                  <p>✅ 直接跳转到支付中心</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 新界面特性 */}
          <TabsContent value="new-features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    清晰的版本对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    并排显示当前版本和目标版本，让用户清楚看到升级后能获得什么功能。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-green-500" />
                    直观的升级流程
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    使用箭头和视觉引导，让用户明确升级的价值和流程。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    透明的价格信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    显示详细的价格信息，包括原价、折扣价和计费周期。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    功能清单对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    列出各版本的具体功能，用户能清楚知道升级后的收益。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    推荐标识
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    为推荐的订阅计划添加醒目标识，引导用户选择最佳方案。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    一键跳转支付
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    点击升级按钮直接跳转到支付中心，减少用户操作步骤。
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 实现方案 */}
          <TabsContent value="implementation" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>技术实现方案</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">新增组件</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• PermissionUpgradeCard - 版本对比卡片</li>
                        <li>• PermissionUpgradeDialog - 升级对话框</li>
                        <li>• UpgradePromptCard - 简化升级提示</li>
                        <li>• NewPermissionGuard - 新版权限守卫</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">修改组件</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• UnifiedPermissionGuard - 集成新对话框</li>
                        <li>• PermissionOverlay - 使用新升级卡片</li>
                        <li>• 保持向后兼容性</li>
                        <li>• 渐进式替换旧组件</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>使用方式</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">替换权限遮罩弹窗</h4>
                      <pre className="text-sm text-muted-foreground">
{`// 原有方式
<PermissionOverlay
  show={true}
  featureName="创意魔方"
  requiredTier="pro"
/>

// 新方式 - 自动使用新的升级界面
<PermissionOverlay
  show={true}
  featureName="创意魔方"
  requiredTier="pro"
/>`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 新版升级对话框 */}
        <PermissionUpgradeDialog
          open={showNewDialog}
          onOpenChange={setShowNewDialog}
          featureName={selectedFeature.name}
          requiredTier={selectedFeature.tier}
          description={selectedFeature.description}
        />
      </div>
    </div>
  );
}
