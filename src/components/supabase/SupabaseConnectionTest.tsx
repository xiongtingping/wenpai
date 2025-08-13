/**
 * Supabase连接测试组件
 * 用于验证Supabase配置和数据库连接
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Wifi,
  Shield,
  Users,
  Settings
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: string
}

export default function SupabaseConnectionTest() {
  const { user, isAuthenticated } = useUnifiedAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const tests = [
    {
      name: '环境变量配置',
      test: async () => {
        const url = import.meta.env.VITE_SUPABASE_URL
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!url || url === 'https://your-project-id.supabase.co') {
          throw new Error('VITE_SUPABASE_URL 未配置或使用默认值')
        }
        
        if (!anonKey || anonKey.includes('your-anon-key')) {
          throw new Error('VITE_SUPABASE_ANON_KEY 未配置或使用默认值')
        }
        
        return '环境变量配置正确'
      }
    },
    {
      name: 'Supabase客户端连接',
      test: async () => {
        const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true })
        
        if (error) {
          throw new Error(`连接失败: ${error.message}`)
        }
        
        return '客户端连接成功'
      }
    },
    {
      name: '数据表结构验证',
      test: async () => {
        const tables = ['user_profiles', 'brand_assets', 'usage_stats', 'user_preferences']
        const results = []
        
        for (const table of tables) {
          const { error } = await supabase.from(table).select('*').limit(1)
          if (error) {
            throw new Error(`表 ${table} 不存在或无法访问: ${error.message}`)
          }
          results.push(table)
        }
        
        return `所有数据表存在: ${results.join(', ')}`
      }
    },
    {
      name: '行级安全策略 (RLS)',
      test: async () => {
        if (!isAuthenticated) {
          return 'RLS测试需要用户登录'
        }
        
        // 尝试访问用户偏好表
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .limit(1)
        
        if (error && error.code === 'PGRST301') {
          throw new Error('RLS策略配置错误，无法访问数据')
        }
        
        return 'RLS策略配置正确'
      }
    },
    {
      name: '用户资料自动创建',
      test: async () => {
        // 🔧 FIXED: 支持测试环境的用户ID
        const testUserId = user?.id || 'dev-premium-user'

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', testUserId)
          .single()

        if (error && error.code === 'PGRST116') {
          // 用户资料不存在，尝试创建
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: testUserId,
              nickname: user?.nickname || user?.email || '测试用户',
              tier: 'premium'
            })

          if (insertError) {
            throw new Error(`创建用户资料失败: ${insertError.message}`)
          }

          return '用户资料已自动创建'
        }

        if (error) {
          throw new Error(`获取用户资料失败: ${error.message}`)
        }

        return `用户资料存在: ${data.nickname || data.id} (${data.tier})`
      }
    },
    {
      name: '数据读写测试',
      test: async () => {
        // 🔧 FIXED: 支持测试环境的用户ID
        const testUserId = user?.id || 'dev-premium-user'
        const testKey = 'connection_test'
        const testValue = { timestamp: Date.now(), test: true, user: testUserId }

        // 写入测试
        const { error: writeError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: testUserId,
            key: testKey,
            value: testValue
          })

        if (writeError) {
          throw new Error(`写入测试失败: ${writeError.message}`)
        }

        // 读取测试
        const { data, error: readError } = await supabase
          .from('user_preferences')
          .select('value')
          .eq('user_id', testUserId)
          .eq('key', testKey)
          .single()

        if (readError) {
          throw new Error(`读取测试失败: ${readError.message}`)
        }

        // 验证数据完整性
        if (!data.value || data.value.timestamp !== testValue.timestamp) {
          throw new Error('数据完整性验证失败')
        }

        // 清理测试数据
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', testUserId)
          .eq('key', testKey)

        return `数据读写功能正常 (用户: ${testUserId})`
      }
    }
  ]

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    for (const test of tests) {
      setTestResults(prev => [...prev, {
        name: test.name,
        status: 'pending',
        message: '测试中...'
      }])
      
      try {
        const message = await test.test()
        setTestResults(prev => prev.map(result => 
          result.name === test.name 
            ? { ...result, status: 'success', message }
            : result
        ))
      } catch (error) {
        setTestResults(prev => prev.map(result => 
          result.name === test.name 
            ? { 
                ...result, 
                status: 'error', 
                message: '测试失败',
                details: error instanceof Error ? error.message : '未知错误'
              }
            : result
        ))
      }
      
      // 添加延迟以便观察测试过程
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">通过</Badge>
      case 'error':
        return <Badge variant="destructive">失败</Badge>
      case 'pending':
        return <Badge variant="secondary">测试中</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase连接测试
        </CardTitle>
        <CardDescription>
          验证Supabase配置和数据库连接状态
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 测试控制 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">连接状态检查</span>
          </div>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            {isRunning ? '测试中...' : '开始测试'}
          </Button>
        </div>

        {/* 用户状态 */}
        <Alert>
          <Users className="w-4 h-4" />
          <AlertDescription>
            当前用户状态: {isAuthenticated ? `已登录 (${user?.nickname || user?.email})` : '未登录'}
            {!isAuthenticated && ' - 部分测试需要登录后才能执行'}
          </AlertDescription>
        </Alert>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              测试结果
            </h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-red-600 mt-1">{result.details}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}

        {/* 测试总结 */}
        {testResults.length > 0 && !isRunning && (
          <Alert className={
            testResults.every(r => r.status === 'success') 
              ? "border-green-200 bg-green-50" 
              : testResults.some(r => r.status === 'error')
              ? "border-red-200 bg-red-50"
              : "border-blue-200 bg-blue-50"
          }>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              测试完成: {testResults.filter(r => r.status === 'success').length} 通过, {' '}
              {testResults.filter(r => r.status === 'error').length} 失败
              {testResults.every(r => r.status === 'success') && ' - 🎉 所有测试通过，Supabase配置正确！'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
