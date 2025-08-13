/**
 * 数据迁移管理组件
 * 提供用户数据从localStorage迁移到Supabase的界面
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Cloud, 
  Database, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  HardDrive,
  Trash2
} from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { useUnifiedStorage } from '@/hooks/useUnifiedStorage'
import { DataMigrationService, MigrationProgress, MigrationResult } from '@/services/dataMigrationService'
import { useToast } from '@/hooks/use-toast'

export default function DataMigrationManager() {
  const { user, isAuthenticated } = useUnifiedAuth()
  const { isReady } = useUnifiedStorage()
  const { toast } = useToast()
  
  const [migrationService] = useState(() => DataMigrationService.getInstance())
  const [needsMigration, setNeedsMigration] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)

  // 检查是否需要迁移
  useEffect(() => {
    if (isAuthenticated && user?.id && isReady) {
      checkMigrationNeeds()
    }
  }, [isAuthenticated, user?.id, isReady])

  const checkMigrationNeeds = async () => {
    if (!user?.id) return
    
    setIsChecking(true)
    try {
      const needs = await migrationService.needsMigration(user.id)
      setNeedsMigration(needs)
    } catch (error) {
      console.error('检查迁移需求失败:', error)
      toast({
        title: "检查失败",
        description: "无法检查数据迁移需求",
        variant: "destructive"
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleMigration = async () => {
    if (!user?.id) return
    
    setIsMigrating(true)
    setMigrationProgress(null)
    setMigrationResult(null)
    
    try {
      const result = await migrationService.migrateUserData(
        user.id,
        (progress) => setMigrationProgress(progress)
      )
      
      setMigrationResult(result)
      
      if (result.success) {
        toast({
          title: "迁移成功",
          description: `已成功迁移 ${result.migratedCount} 项数据到云端`
        })
        setNeedsMigration(false)
      } else {
        toast({
          title: "迁移完成但有错误",
          description: `迁移了 ${result.migratedCount} 项数据，但有 ${result.errors.length} 个错误`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "迁移失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      })
    } finally {
      setIsMigrating(false)
      setMigrationProgress(null)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            数据迁移
          </CardTitle>
          <CardDescription>
            请先登录以管理您的数据迁移
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 迁移状态卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            数据迁移管理
          </CardTitle>
          <CardDescription>
            将您的本地数据安全迁移到云端，实现跨设备同步
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 检查状态 */}
          {isChecking && (
            <Alert>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <AlertDescription>
                正在检查您的数据迁移需求...
              </AlertDescription>
            </Alert>
          )}

          {/* 迁移需求显示 */}
          {needsMigration !== null && !isChecking && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {needsMigration ? (
                  <>
                    <HardDrive className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">发现本地数据</p>
                      <p className="text-sm text-muted-foreground">
                        您有本地数据可以迁移到云端
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">数据已同步</p>
                      <p className="text-sm text-muted-foreground">
                        您的数据已在云端，无需迁移
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {needsMigration && (
                <Button 
                  onClick={handleMigration}
                  disabled={isMigrating}
                  className="flex items-center gap-2"
                >
                  {isMigrating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isMigrating ? '迁移中...' : '开始迁移'}
                </Button>
              )}
            </div>
          )}

          {/* 迁移进度 */}
          {migrationProgress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{migrationProgress.stage}</span>
                <span className="text-sm text-muted-foreground">
                  {migrationProgress.current}/{migrationProgress.total}
                </span>
              </div>
              <Progress 
                value={(migrationProgress.current / migrationProgress.total) * 100} 
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                {migrationProgress.message}
              </p>
            </div>
          )}

          {/* 迁移结果 */}
          {migrationResult && (
            <Alert className={migrationResult.success ? "border-green-200" : "border-red-200"}>
              {migrationResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    {migrationResult.success ? '迁移成功完成！' : '迁移完成但有错误'}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span>已迁移: {migrationResult.migratedCount} 项</span>
                    <span>跳过: {migrationResult.skippedCount} 项</span>
                    <span>错误: {migrationResult.errors.length} 个</span>
                  </div>
                  {migrationResult.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        查看错误详情
                      </summary>
                      <ul className="mt-1 text-sm text-red-600 space-y-1">
                        {migrationResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 存储状态概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            存储状态概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <HardDrive className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">本地存储</p>
                <p className="text-sm text-muted-foreground">
                  localStorage + sessionStorage
                </p>
              </div>
              <Badge variant="secondary">活跃</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Cloud className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">云端存储</p>
                <p className="text-sm text-muted-foreground">
                  Supabase 数据库
                </p>
              </div>
              <Badge variant="secondary">已连接</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">自动同步</p>
                <p className="text-sm text-muted-foreground">
                  实时数据同步
                </p>
              </div>
              <Badge variant="secondary">启用</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={checkMigrationNeeds}
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          重新检查
        </Button>
        
        {needsMigration && (
          <Button 
            onClick={handleMigration}
            disabled={isMigrating}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            立即迁移
          </Button>
        )}
      </div>
    </div>
  )
}
