/**
 * 权限测试页面
 * 用于测试和展示所有功能的权限状态
 */

import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * 权限测试页面
 */
const PermissionTestPage: React.FC = () => {
  // 测试不同的权限
  const authPermission = usePermission('auth:required');
  const vipPermission = usePermission('vip:required');
  const creativeStudioPermission = usePermission('feature:creative-studio');
  const brandLibraryPermission = usePermission('feature:brand-library');
  const contentExtractorPermission = usePermission('feature:content-extractor');

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
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">✅ 您已登录，可以看到这个内容</p>
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
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">👑 VIP专属内容</p>
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
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-800">🎨 创意魔方功能可用</p>
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
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800">📚 品牌库功能可用</p>
                      </div>
                    </PermissionGuard>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* 调试信息 */}
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
                      contentExtractorPermission
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