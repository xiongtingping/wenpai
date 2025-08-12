/**
 * 权限升级界面测试页面
 * 用于测试新的权限升级对话框和卡片组件
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewPermissionGuard } from '@/components/auth/NewPermissionGuard';
import { PermissionUpgradeCard } from '@/components/auth/PermissionUpgradeCard';
import { PermissionUpgradeDialog } from '@/components/auth/PermissionUpgradeDialog';
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { PermissionOverlay } from '@/components/auth/PermissionOverlay';
import { usePermission } from '@/hooks/usePermission';
import { 
  Crown, 
  Zap, 
  Star, 
  Wand2, 
  Database, 
  Palette,
  Lock,
  Eye
} from 'lucide-react';

export default function PermissionUpgradeTestPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<{
    name: string;
    tier: 'pro' | 'premium';
    description: string;
  } | null>(null);

  // 权限检查
  const creativePermission = usePermission('creative:basic');
  const brandPermission = usePermission('brand:basic');
  const shouldShowCreativeOverlay = !creativePermission.pass;
  const shouldShowBrandOverlay = !brandPermission.pass;

  const testFeatures = [
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
    },
    {
      name: '高级主题',
      tier: 'premium' as const,
      description: '解锁全部主题，包括蓝色、米色、绿色等多种风格',
      icon: <Palette className="h-5 w-5" />,
      color: 'text-green-500'
    }
  ];

  const handleTestDialog = (feature: typeof testFeatures[0]) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">权限升级界面测试</h1>
          <p className="text-muted-foreground">
            测试新的权限升级对话框和卡片组件，替换原有的权限遮罩弹窗
          </p>
        </div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cards">升级卡片</TabsTrigger>
            <TabsTrigger value="dialogs">升级对话框</TabsTrigger>
            <TabsTrigger value="guards">权限守卫</TabsTrigger>
            <TabsTrigger value="overlays">权限遮罩</TabsTrigger>
          </TabsList>

          {/* 升级卡片测试 */}
          <TabsContent value="cards" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">权限升级卡片</h2>
              <p className="text-muted-foreground mb-6">
                直接显示版本对比的升级卡片，适用于专门的升级页面
              </p>
            </div>

            <div className="space-y-8">
              {testFeatures.map((feature) => (
                <div key={feature.name} className="border rounded-lg p-6">
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-2">
                      {feature.name} - 需要{feature.tier === 'pro' ? '专业版' : '高级版'}
                    </Badge>
                  </div>
                  
                  <PermissionUpgradeCard
                    featureName={feature.name}
                    requiredTier={feature.tier}
                    description={feature.description}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 升级对话框测试 */}
          <TabsContent value="dialogs" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">权限升级对话框</h2>
              <p className="text-muted-foreground mb-6">
                点击按钮测试升级对话框，适用于功能受限时的弹窗提示
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testFeatures.map((feature) => (
                <Card key={feature.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={feature.color}>{feature.icon}</span>
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">
                        需要{feature.tier === 'pro' ? '专业版' : '高级版'}
                      </Badge>
                    </div>
                    
                    <Button 
                      onClick={() => handleTestDialog(feature)}
                      className="w-full"
                      variant="outline"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      查看升级方案
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 权限守卫测试 */}
          <TabsContent value="guards" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">新版权限守卫</h2>
              <p className="text-muted-foreground mb-6">
                测试新的权限守卫组件，支持多种显示模式
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 对话框模式 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">对话框模式</h3>
                <NewPermissionGuard
                  requiredTier="pro"
                  featureName="创意魔方"
                  description="AI驱动的创意内容生成工具"
                  mode="dialog"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-blue-500" />
                        创意魔方
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        这是一个受保护的功能，需要专业版权限才能使用。
                      </p>
                    </CardContent>
                  </Card>
                </NewPermissionGuard>
              </div>

              {/* 内联模式 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">内联模式</h3>
                <NewPermissionGuard
                  requiredTier="premium"
                  featureName="品牌库"
                  description="智能品牌资产管理系统"
                  mode="inline"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-500" />
                        品牌库
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        这是一个受保护的功能，需要高级版权限才能使用。
                      </p>
                    </CardContent>
                  </Card>
                </NewPermissionGuard>
              </div>
            </div>
          </TabsContent>

          {/* 权限遮罩测试 */}
          <TabsContent value="overlays" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">权限遮罩对比</h2>
              <p className="text-muted-foreground mb-6">
                对比原有权限遮罩和统一权限守卫的效果
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 原有权限遮罩 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">原有权限遮罩</h3>
                <PermissionOverlay
                  show={shouldShowCreativeOverlay}
                  featureName="创意魔方"
                  requiredPermission="creative:basic"
                  requiredTier="pro"
                  description="创意魔方是专业版功能，可以帮助您快速生成高质量的创意内容。"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-blue-500" />
                        创意魔方 (原版遮罩)
                      </CardTitle>
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
                </PermissionOverlay>
              </div>

              {/* 统一权限守卫 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">统一权限守卫</h3>
                <UnifiedPermissionGuard
                  requiredPermission="feature:brand-library"
                  featureName="品牌库"
                  description="智能品牌资产管理，支持多维度分析和自动去重"
                  allowPreview={true}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-500" />
                        品牌库 (统一守卫)
                      </CardTitle>
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
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 升级对话框 */}
        {selectedFeature && (
          <PermissionUpgradeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            featureName={selectedFeature.name}
            requiredTier={selectedFeature.tier}
            description={selectedFeature.description}
          />
        )}
      </div>
    </div>
  );
}
