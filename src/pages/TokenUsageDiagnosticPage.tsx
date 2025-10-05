/**
 * Token使用量诊断页面
 * @description 实时诊断Token使用量显示异常问题
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';
import { useUnifiedStore } from '@/stores/unified-state-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DiagnosticData {
  timestamp: string;
  userId: string;
  userTier: string;
  databaseRecords: {
    count: number;
    totalTokens: number;
    sampleRecords: any[];
    error?: string;
  };
  storeState: {
    tokenUsage: any;
    usageCount: any;
  };
  localStorage: {
    data: any;
  };
}

export default function TokenUsageDiagnosticPage() {
  const { user } = useAuth();
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runDiagnostic = async () => {
    if (!user?.id) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const result: DiagnosticData = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        userTier: user.subscription || 'trial',
        databaseRecords: {
          count: 0,
          totalTokens: 0,
          sampleRecords: [],
        },
        storeState: {
          tokenUsage: null,
          usageCount: null,
        },
        localStorage: {
          data: null,
        },
      };

      // 1. 检查数据库
      try {
        const client = await getSupabaseClient();
        console.log('🔍 查询表:', TABLE_NAMES.USER_USAGE_LOGS);
        console.log('🔍 用户ID:', user.id);

        const { data, error } = await client
          .from(TABLE_NAMES.USER_USAGE_LOGS)
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (error) {
          result.databaseRecords.error = error.message;
          console.error('❌ 数据库查询失败:', error);
        } else {
          result.databaseRecords.count = data?.length || 0;
          result.databaseRecords.sampleRecords = data || [];
          result.databaseRecords.totalTokens = (data || []).reduce(
            (sum: number, record: any) => {
              const tokens = record.total_tokens || record.totalTokens || 0;
              return sum + tokens;
            },
            0
          );
          console.log('✅ 数据库查询成功:', {
            count: data?.length,
            totalTokens: result.databaseRecords.totalTokens,
          });
        }
      } catch (error) {
        result.databaseRecords.error = error instanceof Error ? error.message : '未知错误';
        console.error('❌ 数据库检查异常:', error);
      }

      // 2. 检查Store状态
      const store = useUnifiedStore.getState();
      result.storeState.tokenUsage = store.tokenUsage.currentStats;
      result.storeState.usageCount = store.usageCount;
      console.log('🏪 Store状态:', result.storeState);

      // 3. 检查localStorage
      const storedData = localStorage.getItem('wenpai-unified-store');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        result.localStorage.data = {
          tokenUsage: parsed.state?.tokenUsage,
          usageCount: parsed.state?.usageCount,
          lastUpdated: parsed.state?.lastUpdated,
        };
      }

      setDiagnostic(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      runDiagnostic();
    }
  }, [user?.id]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runDiagnostic, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Token使用量诊断工具</h1>
          <p className="text-muted-foreground">请先登录以使用诊断工具</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Token使用量诊断工具</h1>
          <div className="flex gap-2">
            <Button onClick={runDiagnostic} disabled={loading}>
              {loading ? '诊断中...' : '立即诊断'}
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '停止自动刷新' : '自动刷新(5s)'}
            </Button>
          </div>
        </div>

        {diagnostic && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">📋 基本信息</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>用户ID: {diagnostic.userId}</div>
                <div>套餐类型: {diagnostic.userTier}</div>
                <div className="col-span-2">诊断时间: {new Date(diagnostic.timestamp).toLocaleString()}</div>
              </div>
            </div>

            {/* 数据库检查 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">
                🗄️ 数据库检查 (表: {TABLE_NAMES.USER_USAGE_LOGS})
              </h2>
              {diagnostic.databaseRecords.error ? (
                <div className="text-red-500">❌ 错误: {diagnostic.databaseRecords.error}</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm">
                    ✅ 记录数: <span className="font-bold">{diagnostic.databaseRecords.count}</span>
                  </div>
                  <div className="text-sm">
                    📊 总Token数: <span className="font-bold text-blue-600">{diagnostic.databaseRecords.totalTokens}</span>
                  </div>
                  {diagnostic.databaseRecords.count > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">查看样本记录</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                        {JSON.stringify(diagnostic.databaseRecords.sampleRecords, null, 2)}
                      </pre>
                    </details>
                  )}
                  {diagnostic.databaseRecords.count === 0 && (
                    <div className="text-yellow-600 mt-2">
                      ⚠️ 数据库中没有Token使用记录！可能原因：
                      <ul className="list-disc ml-6 mt-1">
                        <li>还未进行任何AI调用</li>
                        <li>recordTokenUsage写入失败</li>
                        <li>用户ID不匹配</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Store状态检查 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">🏪 Store状态检查</h2>
              <div className="space-y-2">
                <div className="text-sm">
                  Token统计: {diagnostic.storeState.tokenUsage ? (
                    <span className="text-green-600">
                      ✅ 已初始化 (monthlyUsed: {diagnostic.storeState.tokenUsage.monthlyUsed})
                    </span>
                  ) : (
                    <span className="text-red-600">❌ 未初始化 (null)</span>
                  )}
                </div>
                <div className="text-sm">
                  使用次数: {diagnostic.storeState.usageCount ? (
                    <span className="text-green-600">
                      ✅ 已初始化 (used: {diagnostic.storeState.usageCount.used})
                    </span>
                  ) : (
                    <span className="text-red-600">❌ 未初始化</span>
                  )}
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">查看完整状态</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(diagnostic.storeState, null, 2)}
                  </pre>
                </details>
              </div>
            </div>

            {/* localStorage检查 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">💾 localStorage检查</h2>
              {diagnostic.localStorage.data ? (
                <details>
                  <summary className="cursor-pointer text-sm text-blue-600">查看持久化数据</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(diagnostic.localStorage.data, null, 2)}
                  </pre>
                </details>
              ) : (
                <div className="text-yellow-600">⚠️ 无持久化数据</div>
              )}
            </div>

            {/* 诊断结论 */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h2 className="font-semibold mb-2">💡 诊断结论</h2>
              <div className="space-y-2 text-sm">
                {diagnostic.databaseRecords.count === 0 && (
                  <div className="text-red-600">
                    🔴 <strong>根因：数据库中无Token使用记录</strong>
                    <br />
                    建议：检查recordTokenUsage是否被正确调用，查看控制台是否有写入失败日志
                  </div>
                )}
                {diagnostic.databaseRecords.count > 0 && !diagnostic.storeState.tokenUsage && (
                  <div className="text-red-600">
                    🔴 <strong>根因：数据库有记录但Store未初始化</strong>
                    <br />
                    建议：检查initializeUsageStats是否被调用，查看控制台日志
                  </div>
                )}
                {diagnostic.databaseRecords.count > 0 && diagnostic.storeState.tokenUsage && diagnostic.storeState.tokenUsage.monthlyUsed === 0 && (
                  <div className="text-yellow-600">
                    🟡 <strong>问题：数据库有记录但统计为0</strong>
                    <br />
                    建议：检查getUserTokenStats查询逻辑，可能是字段名不匹配或时间范围问题
                  </div>
                )}
                {diagnostic.databaseRecords.count > 0 && diagnostic.storeState.tokenUsage && diagnostic.storeState.tokenUsage.monthlyUsed > 0 && (
                  <div className="text-green-600">
                    🟢 <strong>正常：数据流转正常</strong>
                    <br />
                    Token使用量应该正确显示为 {diagnostic.storeState.tokenUsage.monthlyUsed} tokens
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

