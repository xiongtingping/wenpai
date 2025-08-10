/**
 * 系统状态监控组件
 * @description 显示系统健康状态、服务状态和自动化任务状态的管理界面
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Settings,
  Clock,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { systemMonitorService } from '@/services/systemMonitorService';
import type { SystemHealthStatus } from '@/services/systemMonitorService';

/**
 * 状态指示器组件
 */
const StatusIndicator: React.FC<{
  status: 'healthy' | 'warning' | 'critical' | 'online' | 'degraded' | 'offline';
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
      case 'online':
        return { icon: CheckCircle, color: 'text-foreground', bgColor: 'bg-accent', label: '正常' };
      case 'warning':
      case 'degraded':
        return { icon: AlertTriangle, color: 'text-foreground', bgColor: 'bg-accent', label: '警告' };
      case 'critical':
      case 'offline':
        return { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', label: '异常' };
      default:
        return { icon: Activity, color: 'text-muted-foreground', bgColor: 'bg-accent', label: '未知' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${config.bgColor}`}>
      <Icon className={`${iconSize} ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

/**
 * 系统状态监控组件
 */
export const SystemStatusMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * 获取系统状态
   */
  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const status = await systemMonitorService.getSystemStatus();
      setSystemStatus(status);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('获取系统状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 手动刷新
   */
  const handleRefresh = () => {
    fetchSystemStatus();
  };

  // 初始加载和自动刷新
  useEffect(() => {
    fetchSystemStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, 30000); // 30秒刷新一次
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !systemStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            系统状态监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">正在加载系统状态...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 系统概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>系统状态监控</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {autoRefresh ? '自动刷新' : '手动刷新'}
              </Button>
            </div>
          </div>
          <CardDescription>
            最后更新: {lastRefresh || '未知'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 整体状态 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">整体状态</p>
                  <StatusIndicator status={systemStatus.overall} size="lg" />
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>

              {/* 活跃用户 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">活跃用户</p>
                  <p className="text-2xl font-bold">{systemStatus.metrics.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-foreground" />
              </div>

              {/* 今日使用量 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">今日使用量</p>
                  <p className="text-2xl font-bold">{systemStatus.metrics.totalUsageToday}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>

              {/* 响应时间 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">平均响应时间</p>
                  <p className="text-2xl font-bold">{systemStatus.metrics.responseTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-foreground" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 服务状态 */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>服务状态</CardTitle>
            <CardDescription>各个核心服务的运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(systemStatus.services).map(([serviceKey, service]) => (
                <div key={serviceKey} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={service.status} />
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        错误次数: {service.errorCount}
                        {service.lastResponseTime && (
                          <span className="ml-2">
                            响应时间: {service.lastResponseTime}ms
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {service.metrics && (
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">运行时间</div>
                      <div className="font-medium">{service.metrics.uptime}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 自动化任务状态 */}
      <Card>
        <CardHeader>
          <CardTitle>自动化任务</CardTitle>
          <CardDescription>系统自动化任务的执行状态</CardDescription>
        </CardHeader>
        <CardContent>
          <AutomationTasksStatus />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * 自动化任务状态组件
 */
const AutomationTasksStatus: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = () => {
      const taskStatus = systemMonitorService.getTaskStatus();
      setTasks(taskStatus);
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 10000); // 10秒刷新一次

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${task.enabled ? 'bg-accent' : 'bg-muted'}`} />
            <div>
              <h4 className="font-medium">{task.name}</h4>
              <p className="text-sm text-muted-foreground">
                执行次数: {task.executionCount} | 错误次数: {task.errorCount}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant={task.enabled ? "default" : "secondary"}>
              {task.enabled ? '运行中' : '已停止'}
            </Badge>
            {task.lastExecuted && (
              <p className="text-xs text-muted-foreground mt-1">
                最后执行: {new Date(task.lastExecuted).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <p>暂无自动化任务</p>
        </div>
      )}
    </div>
  );
};

export default SystemStatusMonitor;
