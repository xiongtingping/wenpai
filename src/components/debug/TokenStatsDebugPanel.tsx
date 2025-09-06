/**
 * Token统计调试面板
 * 用于测试和调试Token使用量统计功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Bug, 
  Database, 
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// import { tokenStatsTester } from '@/utils/tokenStatsTester'; // 文件不存在，暂时禁用
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 测试结果显示组件
 */
function TestResultDisplay({ result, title }: { result: any; title: string }) {
  if (!result) return null;

  const isSuccess = result.success;
  const IconComponent = isSuccess ? CheckCircle : XCircle;
  const colorClass = isSuccess ? 'text-green-500' : 'text-red-500';

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`w-4 h-4 ${colorClass}`} />
        <span className="font-medium">{title}</span>
        <Badge variant={isSuccess ? "default" : "destructive"} className="text-xs">
          {isSuccess ? "通过" : "失败"}
        </Badge>
      </div>
      
      {result.error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          错误: {result.error}
        </div>
      )}
      
      {result.stats && (
        <div className="text-sm bg-blue-50 p-2 rounded">
          <div>月度限额: {result.stats.monthlyLimit?.toLocaleString()}</div>
          <div>已使用: {result.stats.monthlyUsed?.toLocaleString()}</div>
          <div>使用率: {result.stats.usagePercentage?.toFixed(2)}%</div>
        </div>
      )}
      
      {result.history && (
        <div className="text-sm bg-green-50 p-2 rounded">
          历史记录数量: {result.history.length}
        </div>
      )}
      
      {result.featureStats && (
        <div className="text-sm bg-purple-50 p-2 rounded">
          功能统计数量: {Object.keys(result.featureStats).length}
        </div>
      )}
    </div>
  );
}

/**
 * Token统计调试面板组件
 */
export function TokenStatsDebugPanel() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testReport, setTestReport] = useState<string>('');
  const [testUserId, setTestUserId] = useState<string>('');
  const [testTier, setTestTier] = useState<SubscriptionTier>('trial');

  // 使用当前用户ID或测试ID
  const effectiveUserId = testUserId || user?.id || 'test-user-' + Date.now();

  /**
   * 运行综合测试
   */
  const runComprehensiveTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setTestResults(null);
    setTestReport('');

    try {
      console.log('🚀 开始Token统计功能测试...', { effectiveUserId, testTier });

      // const results = await tokenStatsTester.runFullTest(effectiveUserId, testTier);
      // const report = tokenStatsTester.generateTestReport(results);

      // setTestResults(results);
      // setTestReport(report);
      
      // 临时模拟结果
      const mockResults = { success: true, message: '测试功能暂时不可用' };
      setTestResults(mockResults);
      setTestReport('TokenStatsTester 模块暂时不可用');

      console.log('✅ Token统计功能测试完成:', mockResults);
    } catch (error) {
      console.error('❌ Token统计功能测试失败:', error);
      setTestReport(`# 测试执行失败\n\n错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 创建测试记录
   */
  const createTestRecord = async () => {
    try {
      // await tokenStatsTester.createTestTokenRecord(effectiveUserId, {
      //   feature: 'debug-test',
      //   totalTokens: 1000,
      //   model: 'gpt-4'
      // });
      
      alert('测试记录创建功能暂时不可用');
    } catch (error) {
      alert(`创建测试记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试统计查询
   */
  const testStatsQuery = async () => {
    try {
      // const result = await tokenStatsTester.testTokenStatsQuery(effectiveUserId, testTier);
      
      // 模拟结果
      const result = { success: true, stats: { monthlyUsed: 0, monthlyLimit: 1000 } };
      
      if (result.success) {
        alert(`统计查询功能暂时不可用\n模拟结果 - 已使用: ${result.stats.monthlyUsed}\n限额: ${result.stats.monthlyLimit}`);
      } else {
        alert(`统计查询失败: ${result.error}`);
      }
    } catch (error) {
      alert(`测试统计查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Token统计调试面板</CardTitle>
            <div className="text-white/80 text-sm">测试和调试Token使用量统计功能</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 测试配置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userId">测试用户ID</Label>
            <Input
              id="userId"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              placeholder={`当前用户: ${user?.id || '未登录'}`}
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tier">用户套餐</Label>
            <select
              id="tier"
              value={testTier}
              onChange={(e) => setTestTier(e.target.value as SubscriptionTier)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="trial">体验版</option>
              <option value="pro">专业版</option>
              <option value="premium">高级版</option>
            </select>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runComprehensiveTest}
            disabled={isRunning}
            className="flex items-center gap-2"
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            运行综合测试
          </Button>

          <Button
            onClick={createTestRecord}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <Database className="w-4 h-4" />
            创建测试记录
          </Button>

          <Button
            onClick={testStatsQuery}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <Zap className="w-4 h-4" />
            测试统计查询
          </Button>
        </div>

        {/* 当前用户信息 */}
        {user && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-2">当前用户信息</div>
            <div className="text-sm text-blue-700">
              <div>用户ID: {user.id}</div>
              <div>套餐: {(user as any)?.subscription?.tier || 'trial'}</div>
              <div>测试ID: {effectiveUserId}</div>
            </div>
          </div>
        )}

        {/* 测试结果 */}
        {testResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium">测试结果</h3>
              <Badge 
                variant={testResults.success ? "default" : "destructive"}
                className="ml-auto"
              >
                {testResults.success ? "全部通过" : "存在问题"}
              </Badge>
            </div>

            <div className="grid gap-3">
              <TestResultDisplay 
                result={testResults.results.recordCreation} 
                title="Token记录创建" 
              />
              <TestResultDisplay 
                result={testResults.results.statsQuery} 
                title="Token统计查询" 
              />
              <TestResultDisplay 
                result={testResults.results.historyQuery} 
                title="Token历史查询" 
              />
              <TestResultDisplay 
                result={testResults.results.featureStatsQuery} 
                title="功能统计查询" 
              />
            </div>
          </div>
        )}

        {/* 测试报告 */}
        {testReport && (
          <div className="space-y-2">
            <Label htmlFor="report">测试报告</Label>
            <Textarea
              id="report"
              value={testReport}
              readOnly
              rows={12}
              className="text-xs font-mono"
            />
          </div>
        )}

        {/* 状态指示 */}
        {isRunning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
              <div>
                <div className="font-medium text-yellow-900">正在运行测试...</div>
                <div className="text-sm text-yellow-700">请稍候，正在测试Token统计功能的各个方面</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TokenStatsDebugPanel;