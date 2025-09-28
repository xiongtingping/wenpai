/**
 * 速率限制监控组件
 * @description 管理员用于监控和管理API速率限制的界面
 */

import React, { useState, useEffect } from 'react';
import { request } from '@/api/request';
import { logger } from '@/utils/logger';

interface RateLimitStats {
  totalCachedIPs: number;
  cacheEntries: Array<{
    key: string;
    count: number;
    windowStart: string;
    remaining: number;
  }>;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  config: {
    default: {
      windowMs: number;
      maxRequests: number;
      message: string;
    };
    endpoints: Record<string, {
      windowMs: number;
      maxRequests: number;
      message: string;
    }>;
    vipMultiplier: {
      trial: number;
      pro: number;
      premium: number;
    };
  };
  serverInfo: {
    timestamp: string;
    uptime: number;
    nodeVersion: string;
  };
}

export const RateLimitMonitor: React.FC = () => {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取速率限制统计
  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await request.get('/.netlify/functions/rate-limit-admin');
      
      if (response.success) {
        setStats(response.data);
        setError(null);
      } else {
        throw new Error(response.error || '获取统计失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      logger.error('获取速率限制统计失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 清理缓存
  const clearCache = async () => {
    try {
      const response = await request.post('/.netlify/functions/rate-limit-admin', {
        action: 'clear-cache'
      });
      
      if (response.success) {
        alert('缓存清理成功');
        fetchStats(); // 刷新统计
      } else {
        throw new Error(response.error || '清理失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '清理失败';
      alert(`清理缓存失败: ${errorMessage}`);
      logger.error('清理缓存失败:', err);
    }
  };

  // 重置IP限制
  const resetIPLimit = async (ip: string) => {
    if (!confirm(`确定要重置 IP ${ip} 的限制状态吗？`)) {
      return;
    }

    try {
      const response = await request.post('/.netlify/functions/rate-limit-admin', {
        action: 'reset-ip',
        ip: ip
      });
      
      if (response.success) {
        alert(`IP ${ip} 限制状态已重置`);
        fetchStats(); // 刷新统计
      } else {
        throw new Error(response.error || '重置失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置失败';
      alert(`重置IP限制失败: ${errorMessage}`);
      logger.error('重置IP限制失败:', err);
    }
  };

  // 格式化内存大小
  const formatMemory = (bytes: number): string => {
    const MB = bytes / (1024 * 1024);
    return `${MB.toFixed(1)} MB`;
  };

  // 格式化运行时间
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  useEffect(() => {
    fetchStats();
    
    // 每30秒自动刷新
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-red-600">
          <h3 className="text-lg font-medium mb-2">错误</h3>
          <p>{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6">暂无数据</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">速率限制监控</h2>
          <div className="space-x-2">
            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {refreshing ? '刷新中...' : '刷新'}
            </button>
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              清理缓存
            </button>
          </div>
        </div>

        {/* 服务器信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700">服务器状态</h3>
            <p className="text-sm text-gray-600">运行时间: {formatUptime(stats.serverInfo.uptime)}</p>
            <p className="text-sm text-gray-600">Node版本: {stats.serverInfo.nodeVersion}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700">内存使用</h3>
            <p className="text-sm text-gray-600">已用堆内存: {formatMemory(stats.memoryUsage.heapUsed)}</p>
            <p className="text-sm text-gray-600">总堆内存: {formatMemory(stats.memoryUsage.heapTotal)}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700">缓存状态</h3>
            <p className="text-sm text-gray-600">缓存IP数: {stats.totalCachedIPs}</p>
            <p className="text-sm text-gray-600">最后更新: {new Date(stats.serverInfo.timestamp).toLocaleString()}</p>
          </div>
        </div>

        {/* 限制配置 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">限制配置</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">默认限制</h4>
                <p className="text-sm">窗口: {stats.config.default.windowMs / 1000}秒</p>
                <p className="text-sm">最大请求: {stats.config.default.maxRequests}次</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">VIP倍率</h4>
                <p className="text-sm">Trial: {stats.config.vipMultiplier.trial}x</p>
                <p className="text-sm">Pro: {stats.config.vipMultiplier.pro}x</p>
                <p className="text-sm">Premium: {stats.config.vipMultiplier.premium}x</p>
              </div>
            </div>
          </div>
        </div>

        {/* 特定端点配置 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">端点配置</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">端点</th>
                  <th className="px-4 py-2 text-left">窗口(秒)</th>
                  <th className="px-4 py-2 text-left">最大请求</th>
                  <th className="px-4 py-2 text-left">消息</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.config.endpoints).map(([endpoint, config]) => (
                  <tr key={endpoint} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{endpoint}</td>
                    <td className="px-4 py-2">{config.windowMs / 1000}</td>
                    <td className="px-4 py-2">{config.maxRequests}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{config.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 活跃IP */}
        {stats.cacheEntries.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">活跃IP状态</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">IP:端点</th>
                    <th className="px-4 py-2 text-left">请求次数</th>
                    <th className="px-4 py-2 text-left">窗口开始</th>
                    <th className="px-4 py-2 text-left">剩余毫秒</th>
                    <th className="px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.cacheEntries.map((entry, index) => {
                    const [ip, endpoint] = entry.key.split(':');
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 font-mono text-sm">
                          <div>{ip}</div>
                          <div className="text-gray-500">{endpoint}</div>
                        </td>
                        <td className="px-4 py-2">{entry.count}</td>
                        <td className="px-4 py-2 text-sm">
                          {new Date(entry.windowStart).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2">{entry.remaining}ms</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => resetIPLimit(ip)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            重置
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};