/**
 * 权限系统演示页面
 * 展示新的权限锁定按钮和主题适配功能
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PermissionLockedButton, PermissionLockedIconButton } from '@/components/auth/PermissionLockedButton';
import { PermissionAwareContainer } from '@/components/auth/PermissionAwareContainer';
import { PermissionUpgradePrompt, InlinePermissionPrompt } from '@/components/auth/PermissionUpgradePrompt';
import PageNavigation from '@/components/layout/PageNavigation';
import { 
  Sparkles, 
  Crown, 
  Zap, 
  Lock, 
  Download, 
  Upload, 
  Save,
  Share2,
  Settings,
  Star
} from 'lucide-react';

/**
 * 权限系统演示页面
 */
export default function PermissionSystemDemoPage() {
  return (
    <PermissionAwareContainer className="min-h-screen bg-background">
      <PageNavigation
        title="权限系统演示"
        description="展示新的权限锁定按钮和主题适配功能"
        showAdaptButton={false}
        showUpgradeButton={true}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 权限锁定按钮演示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              权限锁定按钮演示
            </CardTitle>
            <CardDescription>
              根据用户权限显示不同状态的按钮
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 专业版功能按钮 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">专业版功能</h4>
              <div className="flex flex-wrap gap-3">
                <PermissionLockedButton
                  requiredTier="pro"
                  featureName="AI内容生成"
                  onClick={() => console.log('AI内容生成')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI内容生成
                </PermissionLockedButton>

                <PermissionLockedButton
                  requiredTier="pro"
                  featureName="批量处理"
                  variant="outline"
                  onClick={() => console.log('批量处理')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  批量处理
                </PermissionLockedButton>

                <PermissionLockedIconButton
                  requiredTier="pro"
                  featureName="下载功能"
                  onClick={() => console.log('下载')}
                >
                  <Download className="h-4 w-4" />
                </PermissionLockedIconButton>

                <PermissionLockedIconButton
                  requiredTier="pro"
                  featureName="保存功能"
                  onClick={() => console.log('保存')}
                >
                  <Save className="h-4 w-4" />
                </PermissionLockedIconButton>
              </div>
            </div>

            {/* 高级版功能按钮 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">高级版功能</h4>
              <div className="flex flex-wrap gap-3">
                <PermissionLockedButton
                  requiredTier="premium"
                  featureName="高级AI模型"
                  onClick={() => console.log('高级AI模型')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  高级AI模型
                </PermissionLockedButton>

                <PermissionLockedButton
                  requiredTier="premium"
                  featureName="团队协作"
                  variant="outline"
                  onClick={() => console.log('团队协作')}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  团队协作
                </PermissionLockedButton>

                <PermissionLockedIconButton
                  requiredTier="premium"
                  featureName="高级设置"
                  onClick={() => console.log('高级设置')}
                >
                  <Settings className="h-4 w-4" />
                </PermissionLockedIconButton>
              </div>
            </div>

            {/* 免费功能按钮（对比） */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">免费功能（对比）</h4>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => console.log('基础功能')}>
                  <Star className="h-4 w-4 mr-2" />
                  基础功能
                </Button>

                <Button variant="outline" onClick={() => console.log('免费工具')}>
                  <Zap className="h-4 w-4 mr-2" />
                  免费工具
                </Button>
              </div>
            </div>

            {/* 实际功能演示 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">实际功能演示</h4>
              <div className="flex flex-wrap gap-3">
                <PermissionLockedButton
                  requiredTier="trial"
                  featureName="AI内容适配器"
                  onClick={() => window.open('/adapt', '_blank')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  打开AI内容适配器
                </PermissionLockedButton>

                <PermissionLockedButton
                  requiredTier="pro"
                  featureName="内容提取器"
                  variant="outline"
                  onClick={() => window.open('/content-extractor', '_blank')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  打开内容提取器
                </PermissionLockedButton>

                <PermissionLockedButton
                  requiredTier="premium"
                  featureName="创意工作室"
                  onClick={() => window.open('/creative-studio', '_blank')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  打开创意工作室
                </PermissionLockedButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 权限提示组件演示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              权限提示组件演示
            </CardTitle>
            <CardDescription>
              不同样式的权限升级提示
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 完整权限提示卡片 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">完整提示卡片</h4>
              <PermissionUpgradePrompt
                requiredTier="pro"
                featureName="AI内容分析"
                description="使用先进的AI技术分析和优化您的内容，提升创作效率"
              />
            </div>

            {/* 紧凑权限提示 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">紧凑提示</h4>
              <PermissionUpgradePrompt
                requiredTier="premium"
                featureName="高级数据分析"
                description="深度数据洞察和可视化分析"
                compact={true}
              />
            </div>

            {/* 内联权限提示 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">内联提示</h4>
              <div className="flex items-center gap-3">
                <span className="text-sm">此功能</span>
                <InlinePermissionPrompt
                  requiredTier="pro"
                  featureName="高级功能"
                />
                <span className="text-sm">请升级后使用</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主题适配演示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              主题适配演示
            </CardTitle>
            <CardDescription>
              权限组件在不同主题下的表现
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">权限等级标识</h4>
                <div className="flex gap-2">
                  <Badge variant="secondary">免费版</Badge>
                  <Badge className="permission-pro-badge">专业版</Badge>
                  <Badge className="permission-premium-badge">高级版</Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">锁定状态按钮</h4>
                <div className="flex gap-2">
                  <Button className="permission-locked-button" variant="outline" size="sm">
                    <Lock className="h-3 w-3 mr-1" />
                    锁定功能
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionAwareContainer>
  );
}
