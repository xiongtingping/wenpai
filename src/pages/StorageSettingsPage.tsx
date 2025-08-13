/**
 * 存储管理设置页面
 * 集成数据迁移、统一存储演示和存储状态管理
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Database, 
  Cloud, 
  HardDrive, 
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react'
import PageNavigation from '@/components/layout/PageNavigation'
import DataMigrationManager from '@/components/migration/DataMigrationManager'
import UnifiedStorageDemo from '@/components/storage/UnifiedStorageDemo'
import SupabaseConnectionTest from '@/components/supabase/SupabaseConnectionTest'
import LoginUndefinedTest from '@/components/test/LoginUndefinedTest'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'

export default function StorageSettingsPage() {
  const { user, isAuthenticated } = useUnifiedAuth()

  return (
    <div className="min-h-screen bg-background">
      <PageNavigation
        title="存储管理"
        description="管理您的数据存储、迁移和同步设置"
        showAdaptButton={false}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 页面标题和状态 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">存储管理中心</h1>
              <p className="text-muted-foreground mt-2">
                管理您的数据存储策略，实现本地存储与云端同步的完美结合
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  已登录
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  未登录
                </Badge>
              )}
            </div>
          </div>

          {/* 功能概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                  本地存储
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  localStorage 和 sessionStorage，支持用户数据隔离
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">用户隔离</Badge>
                  <Badge variant="secondary">快速访问</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cloud className="w-5 h-5 text-green-500" />
                  云端存储
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Supabase 数据库，支持跨设备同步和备份
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">跨设备</Badge>
                  <Badge variant="secondary">自动备份</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RefreshCw className="w-5 h-5 text-purple-500" />
                  智能同步
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  自动数据同步，离线支持和冲突解决
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">实时同步</Badge>
                  <Badge variant="secondary">离线支持</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主要功能标签页 */}
          <Tabs defaultValue="connection" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="connection" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                连接测试
              </TabsTrigger>
              <TabsTrigger value="undefined-test" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                登录测试
              </TabsTrigger>
              <TabsTrigger value="migration" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                数据迁移
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                功能演示
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                高级设置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="mt-6">
              <SupabaseConnectionTest />
            </TabsContent>

            <TabsContent value="undefined-test" className="mt-6">
              <LoginUndefinedTest />
            </TabsContent>

            <TabsContent value="migration" className="mt-6">
              <DataMigrationManager />
            </TabsContent>

            <TabsContent value="demo" className="mt-6">
              <UnifiedStorageDemo />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                {/* 存储配置 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      存储配置
                    </CardTitle>
                    <CardDescription>
                      配置数据存储策略和同步选项
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">自动云端同步</h4>
                          <p className="text-sm text-muted-foreground">
                            自动将重要数据同步到云端
                          </p>
                        </div>
                        <Badge variant="default">已启用</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">用户数据隔离</h4>
                          <p className="text-sm text-muted-foreground">
                            确保不同用户的数据完全隔离
                          </p>
                        </div>
                        <Badge variant="default">已启用</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">离线支持</h4>
                          <p className="text-sm text-muted-foreground">
                            在离线状态下继续使用应用
                          </p>
                        </div>
                        <Badge variant="default">已启用</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">数据压缩</h4>
                          <p className="text-sm text-muted-foreground">
                            压缩存储数据以节省空间
                          </p>
                        </div>
                        <Badge variant="secondary">开发中</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 存储统计 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      存储统计
                    </CardTitle>
                    <CardDescription>
                      查看您的数据存储使用情况
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">本地存储使用</span>
                          <HardDrive className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">~2.3 MB</div>
                        <p className="text-xs text-muted-foreground">
                          包括用户偏好、缓存数据等
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">云端存储使用</span>
                          <Cloud className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">
                          {isAuthenticated ? '~1.8 MB' : '未登录'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isAuthenticated ? '品牌资产、用户设置等' : '登录后查看云端使用情况'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 技术架构说明 */}
                <Card>
                  <CardHeader>
                    <CardTitle>技术架构</CardTitle>
                    <CardDescription>
                      了解我们的三层存储架构设计
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <HardDrive className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">本地存储层</h4>
                          <p className="text-sm text-muted-foreground">
                            localStorage 和 sessionStorage，提供快速访问和离线支持
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Cloud className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">云端存储层</h4>
                          <p className="text-sm text-muted-foreground">
                            Supabase PostgreSQL 数据库，提供可靠的数据持久化和跨设备同步
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">同步协调层</h4>
                          <p className="text-sm text-muted-foreground">
                            智能同步算法，处理数据冲突和版本控制
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
