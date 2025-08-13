/**
 * 登录undefined问题测试组件
 * 专门用于测试和验证登录过程中的"undefinedundefined"问题修复
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Shield,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { getUserDisplayName } from '@/utils/userDisplayUtils'
import { undefinedDOMFixer } from '@/utils/undefinedDOMFixer'

export default function LoginUndefinedTest() {
  const { user, isAuthenticated, login, logout } = useUnifiedAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<string[]>([])
  const [domFixerStats, setDomFixerStats] = useState({ isRunning: false, fixCount: 0 })

  // 定期更新DOM修复器统计
  useEffect(() => {
    const interval = setInterval(() => {
      setDomFixerStats(undefinedDOMFixer.getStats())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  /**
   * 扫描页面中的undefined问题
   */
  const scanPageForUndefined = () => {
    setIsScanning(true)
    setScanResults([])

    setTimeout(() => {
      const results: string[] = []

      // 扫描所有文本节点
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )

      let node: Node | null
      while (node = walker.nextNode()) {
        const text = node.textContent || ''
        if (text.includes('undefinedundefined') || text.includes('undefined')) {
          results.push(`文本节点: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`)
        }
      }

      // 扫描输入框
      const inputs = document.querySelectorAll('input, textarea')
      inputs.forEach((input, index) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement
        if (element.value?.includes('undefined')) {
          results.push(`输入框 #${index}: "${element.value}"`)
        }
      })

      // 扫描元素属性
      const elements = document.querySelectorAll('*')
      const attributesToCheck = ['title', 'alt', 'placeholder', 'aria-label']
      
      elements.forEach((element, index) => {
        attributesToCheck.forEach(attr => {
          const value = element.getAttribute(attr)
          if (value?.includes('undefined')) {
            results.push(`元素属性 ${attr} #${index}: "${value}"`)
          }
        })
      })

      setScanResults(results)
      setIsScanning(false)
    }, 500)
  }

  /**
   * 手动触发DOM修复
   */
  const triggerDOMFix = () => {
    ;(window as any).fixUndefinedInPage?.()
    setTimeout(() => {
      scanPageForUndefined()
    }, 500)
  }

  /**
   * 模拟有问题的用户数据
   */
  const simulateProblematicUser = () => {
    // 创建一个包含undefined的测试元素
    const testDiv = document.createElement('div')
    testDiv.id = 'undefined-test-element'
    testDiv.textContent = 'undefinedundefined'
    testDiv.style.position = 'fixed'
    testDiv.style.top = '-1000px'
    testDiv.style.left = '-1000px'
    document.body.appendChild(testDiv)

    setTimeout(() => {
      scanPageForUndefined()
      // 清理测试元素
      setTimeout(() => {
        const element = document.getElementById('undefined-test-element')
        if (element) {
          element.remove()
        }
      }, 2000)
    }, 100)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            登录undefined问题测试
          </CardTitle>
          <CardDescription>
            测试和验证登录过程中的"undefinedundefined"问题修复效果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前用户状态 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              当前用户状态
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">登录状态:</span>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "已登录" : "未登录"}
                </Badge>
              </div>
              
              {user && (
                <div className="space-y-1 text-sm">
                  <p><strong>用户ID:</strong> {user.id || '未设置'}</p>
                  <p><strong>原始昵称:</strong> {user.nickname || '未设置'}</p>
                  <p><strong>原始用户名:</strong> {user.username || '未设置'}</p>
                  <p><strong>原始邮箱:</strong> {user.email || '未设置'}</p>
                  <p><strong>安全显示名:</strong> <span className="text-green-600 font-medium">{getUserDisplayName(user, '访客')}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* DOM修复器状态 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${domFixerStats.isRunning ? 'animate-spin text-green-500' : 'text-gray-400'}`} />
              DOM修复器状态
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">运行状态:</span>
                <Badge variant={domFixerStats.isRunning ? "default" : "secondary"}>
                  {domFixerStats.isRunning ? "运行中" : "已停止"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">修复次数:</span>
                <Badge variant="outline">{domFixerStats.fixCount}</Badge>
              </div>
            </div>
          </div>

          {/* 测试操作 */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={scanPageForUndefined} disabled={isScanning} className="flex items-center gap-2">
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isScanning ? '扫描中...' : '扫描页面'}
            </Button>
            
            <Button onClick={triggerDOMFix} variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              手动修复
            </Button>
            
            <Button onClick={simulateProblematicUser} variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              模拟问题
            </Button>

            {!isAuthenticated ? (
              <Button onClick={login} className="flex items-center gap-2">
                <User className="w-4 h-4" />
                测试登录
              </Button>
            ) : (
              <Button onClick={logout} variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                退出登录
              </Button>
            )}
          </div>

          {/* 扫描结果 */}
          {scanResults.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">发现 {scanResults.length} 个undefined问题:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {scanResults.map((result, index) => (
                      <li key={index}>{result}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {scanResults.length === 0 && !isScanning && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                ✅ 页面扫描完成，未发现undefined问题！
              </AlertDescription>
            </Alert>
          )}

          {/* 使用说明 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium mb-2">测试说明:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>点击"测试登录"进行登录，观察是否出现"undefinedundefined"</li>
              <li>点击"扫描页面"检查当前页面是否有undefined问题</li>
              <li>点击"手动修复"触发DOM修复器进行修复</li>
              <li>点击"模拟问题"创建测试用的undefined问题</li>
              <li>DOM修复器会自动监控和修复页面中的undefined问题</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
