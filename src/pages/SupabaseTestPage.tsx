import React, { useState, useEffect } from 'react'
import { useSupabase, useDatabase } from '@/hooks/useSupabase'

const SupabaseTestPage: React.FC = () => {
  const {
    user,
    profile,
    subscription,
    loading,
    signIn,
    signOut,
    recordTokenUsage,
    checkTokenLimit,
    getMonthlyUsage,
    getUsageCount,
    updateProfile
  } = useSupabase()

  const {
    initialized,
    stats,
    getDatabaseStats
  } = useDatabase()

  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDatabaseTests = async () => {
    if (!user) {
      addTestResult('❌ 需要先登录才能测试数据库功能')
      return
    }

    setIsRunningTests(true)
    addTestResult('🚀 开始数据库功能测试...')

    try {
      // 测试 1: 更新用户资料
      addTestResult('📝 测试 1: 更新用户资料...')
      const updatedProfile = await updateProfile({
        nickname: 'Test User',
        bio: '这是一个测试用户资料'
      })
      if (updatedProfile) {
        addTestResult('✅ 用户资料更新成功')
      } else {
        addTestResult('❌ 用户资料更新失败')
      }

      // 测试 2: 记录 Token 使用
      addTestResult('📊 测试 2: 记录 Token 使用...')
      const tokenRecord = await recordTokenUsage({
        feature: 'test_feature',
        taskType: 'database_test',
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
        model: 'test-model',
        contentSummary: '数据库测试记录',
        success: true
      })
      if (tokenRecord) {
        addTestResult('✅ Token 使用记录成功')
      } else {
        addTestResult('❌ Token 使用记录失败')
      }

      // 测试 3: 检查 Token 限额
      addTestResult('🔍 测试 3: 检查 Token 限额...')
      const limitCheck = await checkTokenLimit(500)
      if (limitCheck) {
        addTestResult(`✅ Token 限额检查成功: ${limitCheck.monthly_used}/${limitCheck.monthly_limit} (${limitCheck.usage_percentage}%)`)
      } else {
        addTestResult('❌ Token 限额检查失败')
      }

      // 测试 4: 获取月度使用统计
      addTestResult('📈 测试 4: 获取月度使用统计...')
      const monthlyUsage = await getMonthlyUsage()
      if (monthlyUsage) {
        addTestResult(`✅ 月度统计获取成功: 总计 ${monthlyUsage.total_tokens} tokens, ${monthlyUsage.request_count} 次请求`)
      } else {
        addTestResult('❌ 月度统计获取失败')
      }

      // 测试 5: 获取使用次数统计
      addTestResult('🔢 测试 5: 获取使用次数统计...')
      const usageCount = await getUsageCount()
      if (usageCount) {
        addTestResult(`✅ 使用次数统计获取成功: 总计 ${usageCount.total_used}, 本月 ${usageCount.monthly_used}, 今日 ${usageCount.daily_used}`)
      } else {
        addTestResult('❌ 使用次数统计获取失败')
      }

      // 测试 6: 获取数据库统计
      addTestResult('📊 测试 6: 获取数据库统计...')
      const dbStats = await getDatabaseStats()
      addTestResult(`✅ 数据库统计: 用户 ${dbStats.totalUsers}, Token记录 ${dbStats.totalTokenUsage}, 邀请 ${dbStats.totalInvites}`)

      addTestResult('🎉 所有测试完成！')

    } catch (error) {
      addTestResult(`❌ 测试过程中发生错误: ${error}`)
    } finally {
      setIsRunningTests(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>加载中...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🗄️ Supabase 数据库测试页面</h1>
      
      {/* 数据库状态 */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h3>📊 数据库状态</h3>
        <p><strong>初始化状态:</strong> {initialized ? '✅ 已初始化' : '❌ 未初始化'}</p>
        <p><strong>总用户数:</strong> {stats.totalUsers}</p>
        <p><strong>Token 记录数:</strong> {stats.totalTokenUsage}</p>
        <p><strong>邀请记录数:</strong> {stats.totalInvites}</p>
        <p><strong>文件数:</strong> {stats.totalFiles}</p>
        <p><strong>笔记数:</strong> {stats.totalNotes}</p>
      </div>

      {/* 用户状态 */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>👤 用户状态</h3>
        {user ? (
          <div>
            <p><strong>用户 ID:</strong> {user.id}</p>
            <p><strong>邮箱:</strong> {user.email}</p>
            <p><strong>昵称:</strong> {profile?.nickname || '未设置'}</p>
            <p><strong>个人简介:</strong> {profile?.bio || '未设置'}</p>
            <p><strong>订阅类型:</strong> {subscription?.tier || '未设置'}</p>
            <p><strong>月度 Token 限额:</strong> {subscription?.monthly_token_limit || 0}</p>
            <button 
              onClick={signOut}
              style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              登出
            </button>
          </div>
        ) : (
          <div>
            <p>未登录</p>
            <p>请先在登录页面登录，然后返回此页面测试数据库功能</p>
          </div>
        )}
      </div>

      {/* 测试控制 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runDatabaseTests}
          disabled={!user || isRunningTests}
          style={{
            padding: '12px 24px',
            backgroundColor: user && !isRunningTests ? '#2563eb' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: user && !isRunningTests ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          {isRunningTests ? '🔄 测试中...' : '🧪 运行数据库测试'}
        </button>
        
        <button
          onClick={clearResults}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🗑️ 清空结果
        </button>
      </div>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📋 测试结果</h3>
          <div style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
        <h3>📖 使用说明</h3>
        <ol>
          <li>确保你已经登录（可以在登录页面登录）</li>
          <li>点击"运行数据库测试"按钮开始测试</li>
          <li>测试将验证以下功能：
            <ul>
              <li>用户资料更新</li>
              <li>Token 使用记录</li>
              <li>Token 限额检查</li>
              <li>使用统计获取</li>
              <li>数据库统计</li>
            </ul>
          </li>
          <li>查看测试结果了解各项功能是否正常工作</li>
        </ol>
      </div>
    </div>
  )
}

export default SupabaseTestPage
