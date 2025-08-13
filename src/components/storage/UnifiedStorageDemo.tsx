/**
 * 统一存储演示组件
 * 展示新的统一存储系统的功能和使用方法
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Cloud, 
  HardDrive, 
  Save, 
  Download, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { useUnifiedStorage, STORAGE_CONFIGS } from '@/hooks/useUnifiedStorage'
import { useToast } from '@/hooks/use-toast'

interface StorageTestData {
  message: string
  timestamp: number
  counter: number
}

export default function UnifiedStorageDemo() {
  const { user, isAuthenticated } = useUnifiedAuth()
  const { 
    setLocalItem, 
    getLocalItem, 
    setSessionItem, 
    getSessionItem,
    setCloudItem,
    getCloudItem,
    removeItem,
    syncToCloud,
    syncFromCloud,
    isReady 
  } = useUnifiedStorage()
  const { toast } = useToast()

  const [testData, setTestData] = useState<StorageTestData>({
    message: 'Hello, Unified Storage!',
    timestamp: Date.now(),
    counter: 0
  })
  
  const [localData, setLocalData] = useState<StorageTestData | null>(null)
  const [sessionData, setSessionData] = useState<StorageTestData | null>(null)
  const [cloudData, setCloudData] = useState<StorageTestData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 加载数据
  useEffect(() => {
    if (isReady) {
      loadAllData()
    }
  }, [isReady])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [local, session, cloud] = await Promise.all([
        getLocalItem<StorageTestData>('demo_data', STORAGE_CONFIGS.USER_PREFERENCES),
        getSessionItem<StorageTestData>('demo_session_data', STORAGE_CONFIGS.TEMP_DATA),
        isAuthenticated ? getCloudItem<StorageTestData>('demo_cloud_data') : null
      ])
      
      setLocalData(local)
      setSessionData(session)
      setCloudData(cloud)
    } catch (error) {
      console.error('加载数据失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载存储数据",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveLocal = async () => {
    try {
      const dataToSave = { ...testData, timestamp: Date.now() }
      await setLocalItem('demo_data', dataToSave, STORAGE_CONFIGS.USER_PREFERENCES)
      setLocalData(dataToSave)
      toast({
        title: "保存成功",
        description: "数据已保存到本地存储"
      })
    } catch (error) {
      toast({
        title: "保存失败",
        description: "无法保存到本地存储",
        variant: "destructive"
      })
    }
  }

  const handleSaveSession = async () => {
    try {
      const dataToSave = { ...testData, timestamp: Date.now() }
      await setSessionItem('demo_session_data', dataToSave, STORAGE_CONFIGS.TEMP_DATA)
      setSessionData(dataToSave)
      toast({
        title: "保存成功",
        description: "数据已保存到会话存储"
      })
    } catch (error) {
      toast({
        title: "保存失败",
        description: "无法保存到会话存储",
        variant: "destructive"
      })
    }
  }

  const handleSaveCloud = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请先登录以使用云端存储",
        variant: "destructive"
      })
      return
    }

    try {
      const dataToSave = { ...testData, timestamp: Date.now() }
      await setCloudItem('demo_cloud_data', dataToSave)
      setCloudData(dataToSave)
      toast({
        title: "保存成功",
        description: "数据已保存到云端存储"
      })
    } catch (error) {
      toast({
        title: "保存失败",
        description: "无法保存到云端存储",
        variant: "destructive"
      })
    }
  }

  const handleSyncToCloud = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请先登录以同步到云端",
        variant: "destructive"
      })
      return
    }

    try {
      await syncToCloud(['demo_data'])
      await loadAllData()
      toast({
        title: "同步成功",
        description: "本地数据已同步到云端"
      })
    } catch (error) {
      toast({
        title: "同步失败",
        description: "无法同步到云端",
        variant: "destructive"
      })
    }
  }

  const handleSyncFromCloud = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请先登录以从云端同步",
        variant: "destructive"
      })
      return
    }

    try {
      await syncFromCloud(['demo_cloud_data'])
      await loadAllData()
      toast({
        title: "同步成功",
        description: "云端数据已同步到本地"
      })
    } catch (error) {
      toast({
        title: "同步失败",
        description: "无法从云端同步",
        variant: "destructive"
      })
    }
  }

  const handleClearAll = async () => {
    try {
      await Promise.all([
        removeItem('demo_data', 'local', STORAGE_CONFIGS.USER_PREFERENCES),
        removeItem('demo_session_data', 'session', STORAGE_CONFIGS.TEMP_DATA),
        isAuthenticated ? removeItem('demo_cloud_data', 'cloud') : Promise.resolve()
      ])
      
      setLocalData(null)
      setSessionData(null)
      setCloudData(null)
      
      toast({
        title: "清除成功",
        description: "所有演示数据已清除"
      })
    } catch (error) {
      toast({
        title: "清除失败",
        description: "无法清除数据",
        variant: "destructive"
      })
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            统一存储系统演示
          </CardTitle>
          <CardDescription>
            体验新的统一存储系统，支持本地存储、会话存储和云端同步
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 数据输入 */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="message">测试消息</Label>
              <Input
                id="message"
                value={testData.message}
                onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="输入测试消息"
              />
            </div>
            <div>
              <Label htmlFor="counter">计数器</Label>
              <Input
                id="counter"
                type="number"
                value={testData.counter}
                onChange={(e) => setTestData(prev => ({ ...prev, counter: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveLocal} className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              保存到本地
            </Button>
            <Button onClick={handleSaveSession} variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              保存到会话
            </Button>
            <Button 
              onClick={handleSaveCloud} 
              variant="outline" 
              disabled={!isAuthenticated}
              className="flex items-center gap-2"
            >
              <Cloud className="w-4 h-4" />
              保存到云端
            </Button>
            <Button onClick={loadAllData} variant="ghost" className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button onClick={handleClearAll} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              清除所有
            </Button>
          </div>

          {/* 同步操作 */}
          {isAuthenticated && (
            <div className="flex gap-2 pt-2 border-t">
              <Button onClick={handleSyncToCloud} size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                同步到云端
              </Button>
              <Button onClick={handleSyncFromCloud} size="sm" variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                从云端同步
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 存储状态显示 */}
      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="local" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            本地存储
          </TabsTrigger>
          <TabsTrigger value="session" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            会话存储
          </TabsTrigger>
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            云端存储
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>本地存储 (localStorage)</span>
                {localData && <Badge variant="secondary">有数据</Badge>}
              </CardTitle>
              <CardDescription>
                持久化存储，支持用户隔离和云端同步
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localData ? (
                <div className="space-y-2">
                  <p><strong>消息:</strong> {localData.message}</p>
                  <p><strong>计数器:</strong> {localData.counter}</p>
                  <p><strong>时间戳:</strong> {formatTimestamp(localData.timestamp)}</p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>暂无本地存储数据</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>会话存储 (sessionStorage)</span>
                {sessionData && <Badge variant="secondary">有数据</Badge>}
              </CardTitle>
              <CardDescription>
                临时存储，浏览器关闭后清除
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionData ? (
                <div className="space-y-2">
                  <p><strong>消息:</strong> {sessionData.message}</p>
                  <p><strong>计数器:</strong> {sessionData.counter}</p>
                  <p><strong>时间戳:</strong> {formatTimestamp(sessionData.timestamp)}</p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>暂无会话存储数据</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>云端存储 (Supabase)</span>
                {cloudData && <Badge variant="secondary">有数据</Badge>}
                {!isAuthenticated && <Badge variant="outline">需要登录</Badge>}
              </CardTitle>
              <CardDescription>
                云端同步存储，支持跨设备访问
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>请先登录以使用云端存储功能</AlertDescription>
                </Alert>
              ) : cloudData ? (
                <div className="space-y-2">
                  <p><strong>消息:</strong> {cloudData.message}</p>
                  <p><strong>计数器:</strong> {cloudData.counter}</p>
                  <p><strong>时间戳:</strong> {formatTimestamp(cloudData.timestamp)}</p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>暂无云端存储数据</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
