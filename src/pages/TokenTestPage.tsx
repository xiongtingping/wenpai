/**
 * Token统计系统测试页面
 * @description 用于测试和验证Token使用量统计功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useTokenUsageStore } from '@/stores/tokenUsageStore';
import { callAIWithTokenTracking } from '@/services/aiWithTokenTracking';
import { useTokenLimitCheck } from '@/hooks/useTokenLimitCheck';
import TokenLimitDialog from '@/components/dialogs/TokenLimitDialog';
import { AITaskType } from '@/api/aiService';
import { 
  TestTube, 
  Play, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';

/**
 * Token统计测试页面
 */
export default function TokenTestPage() {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const { 
    currentStats, 
    usageHistory, 
    featureStats,
    refreshStats,
    refreshHistory,
    refreshFeatureStats 
  } = useTokenUsageStore();
  
  const {
    showLimitDialog,
    limitCheckResult,
    checkTokenLimit,
    closeLimitDialog,
    handleUpgrade,
    handleContinue,
    usageStatus
  } = useTokenLimitCheck();

  const [testPrompt, setTestPrompt] = useState('请生成一段关于人工智能的简短介绍');
  const [testFeature, setTestFeature] = useState('token_test');
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // 自动刷新数据
  useEffect(() => {
    if (user?.id) {
      refreshStats(user.id, 'trial');
      refreshHistory(user.id, 20);
      refreshFeatureStats(user.id);
    }
  }, [user?.id]);

  /**
   * 测试AI调用和Token统计
   */
  const handleTestAICall = async () => {
    if (!user?.id) {
      toast({
        title: '请先登录',
        description: '需要登录后才能测试Token统计功能',
        variant: 'destructive'
      });
      return;
    }

    setIsTestingAI(true);
    
    try {
      // 1. 先检查Token限额
      const limitCheck = await checkTokenLimit(1000, true);
      
      if (!limitCheck.allowed) {
        toast({
          title: 'Token额度不足',
          description: limitCheck.reason,
          variant: 'destructive'
        });
        return;
      }

      // 2. 调用AI服务（带Token统计）
      const response = await callAIWithTokenTracking({
        prompt: testPrompt,
        feature: testFeature,
        taskType: AITaskType.GENERAL_CHAT,
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7,
        userId: user.id
      });

      // 3. 记录测试结果
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        prompt: testPrompt,
        feature: testFeature,
        response: response.content,
        success: response.success,
        error: response.error,
        tokenUsage: response.tokenUsage,
        responseTime: response.responseTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // 保留最新10条

      // 4. 显示结果
      if (response.success) {
        toast({
          title: '✅ AI调用成功',
          description: `使用了 ${response.tokenUsage?.totalTokens || 0} tokens`,
        });
      } else {
        toast({
          title: '❌ AI调用失败',
          description: response.error,
          variant: 'destructive'
        });
      }

      // 5. 刷新统计数据
      await refreshStats(user.id, 'trial');
      await refreshHistory(user.id, 20);
      await refreshFeatureStats(user.id);

    } catch (error) {
      console.error('测试AI调用失败:', error);
      toast({
        title: '测试失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setIsTestingAI(false);
    }
  };

  /**
   * 测试Token限额检查
   */
  const handleTestLimitCheck = async () => {
    if (!user?.id) {
      toast({
        title: '请先登录',
        description: '需要登录后才能测试限额检查',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await checkTokenLimit(5000, true); // 测试5000 tokens
      
      toast({
        title: result.allowed ? '✅ 限额检查通过' : '❌ 限额检查失败',
        description: result.reason || `当前使用率: ${Math.round(result.stats?.usagePercentage || 0)}%`,
        variant: result.allowed ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: '限额检查失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  /**
   * 模拟Token使用记录
   */
  const handleSimulateUsage = async () => {
    if (!user?.id) return;

    try {
      const { recordUsage } = useTokenUsageStore.getState();
      
      // 模拟几条使用记录
      const mockRecords = [
        {
          userId: user.id,
          feature: 'content_adaptation',
          taskType: AITaskType.CONTENT_ADAPTATION,
          inputTokens: 150,
          outputTokens: 300,
          totalTokens: 450,
          model: 'gpt-3.5-turbo',
          success: true
        },
        {
          userId: user.id,
          feature: 'title_generation',
          taskType: AITaskType.TITLE_GENERATION,
          inputTokens: 80,
          outputTokens: 120,
          totalTokens: 200,
          model: 'gpt-3.5-turbo',
          success: true
        },
        {
          userId: user.id,
          feature: 'emoji_generation',
          taskType: AITaskType.EMOJI_GENERATION,
          inputTokens: 50,
          outputTokens: 30,
          totalTokens: 80,
          model: 'gpt-3.5-turbo',
          success: true
        }
      ];

      for (const record of mockRecords) {
        await recordUsage(record);
      }

      toast({
        title: '✅ 模拟数据生成成功',
        description: `已生成 ${mockRecords.length} 条使用记录`,
      });

      // 刷新数据
      await refreshStats(user.id, 'trial');
      await refreshHistory(user.id, 20);
      await refreshFeatureStats(user.id);

    } catch (error) {
      toast({
        title: '模拟数据生成失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Token统计测试
            </CardTitle>
            <CardDescription>请先登录以测试Token统计功能</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Token统计系统测试</h1>
        <p className="text-muted-foreground">测试和验证Token使用量统计功能</p>
      </div>

      {/* 当前状态概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            当前状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentStats?.monthlyUsed?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">本月已用</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {currentStats?.monthlyRemaining?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">剩余额度</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(currentStats?.usagePercentage || 0)}%
              </div>
              <div className="text-sm text-gray-600">使用率</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {usageHistory?.length || 0}
              </div>
              <div className="text-sm text-gray-600">历史记录</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Badge variant={usageStatus.status === 'exceeded' ? 'destructive' : 
                           usageStatus.status === 'approaching' ? 'secondary' : 'default'}>
              {usageStatus.message}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 测试控制面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI调用测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              AI调用测试
            </CardTitle>
            <CardDescription>测试AI调用和Token统计功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-prompt">测试提示词</Label>
              <Textarea
                id="test-prompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="输入测试提示词..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="test-feature">功能标识</Label>
              <Input
                id="test-feature"
                value={testFeature}
                onChange={(e) => setTestFeature(e.target.value)}
                placeholder="功能标识，如：content_adaptation"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleTestAICall}
                disabled={isTestingAI || !testPrompt.trim()}
                className="flex-1"
              >
                {isTestingAI ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {isTestingAI ? '测试中...' : '测试AI调用'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleTestLimitCheck}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                测试限额
              </Button>
            </div>
            
            <Button 
              variant="secondary"
              onClick={handleSimulateUsage}
              className="w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              生成模拟数据
            </Button>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              测试结果
            </CardTitle>
            <CardDescription>最近的测试结果记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length > 0 ? (
                testResults.map((result) => (
                  <div key={result.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.feature}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {result.success && result.tokenUsage && (
                      <div className="text-sm space-y-1">
                        <div>Token使用: {result.tokenUsage.totalTokens}</div>
                        <div>响应时间: {result.responseTime}ms</div>
                        <div>使用率: {Math.round(result.tokenUsage.usagePercentage)}%</div>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-sm text-red-600">
                        错误: {result.error}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无测试结果
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token限额对话框 */}
      {showLimitDialog && limitCheckResult && (
        <TokenLimitDialog
          open={showLimitDialog}
          onClose={closeLimitDialog}
          stats={limitCheckResult.stats!}
          limitType={limitCheckResult.limitType!}
          onUpgrade={handleUpgrade}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
