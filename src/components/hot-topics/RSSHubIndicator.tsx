/**
 * RSSHub 状态指示器 - 轻量级组件
 * 在原有界面中显示RSSHub数据源状态，不影响原有布局
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Globe,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Info
} from 'lucide-react';
import rsshubDataService from '@/services/rsshubDataService';

interface RSSHubIndicatorProps {
  onDataUpdate?: (hasNewData: boolean) => void;
  className?: string;
}

export default function RSSHubIndicator({ onDataUpdate, className }: RSSHubIndicatorProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [stats, setStats] = useState({
    count: 0,
    platforms: [] as string[],
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(false);

  // 初始化和状态检查
  useEffect(() => {
    checkRSSHubStatus();
    const interval = setInterval(checkRSSHubStatus, 60000); // 每分钟检查一次
    return () => clearInterval(interval);
  }, []);

  // 监听启用状态变化
  useEffect(() => {
    if (isEnabled && isAvailable) {
      loadRSSHubData();
    }
  }, [isEnabled, isAvailable]);

  /**
   * 检查RSSHub服务状态
   */
  const checkRSSHubStatus = async () => {
    try {
      const available = await rsshubDataService.isServiceAvailable();
      setIsAvailable(available);

      if (available) {
        const dataStats = await rsshubDataService.getDataStats();
        setStats({
          count: dataStats.count,
          platforms: dataStats.platforms,
          lastUpdate: dataStats.lastUpdate
        });
      } else {
        // 服务不可用时重置统计数据
        setStats({
          count: 0,
          platforms: [],
          lastUpdate: ''
        });
      }
    } catch (error) {
      // 静默处理错误，不在控制台输出
      setIsAvailable(false);
      setStats({
        count: 0,
        platforms: [],
        lastUpdate: ''
      });
    }
  };

  /**
   * 加载RSSHub数据
   */
  const loadRSSHubData = async () => {
    if (!isEnabled || !isAvailable) return;

    setLoading(true);
    try {
      const topics = await rsshubDataService.getSupplementaryTopics();
      onDataUpdate?.(topics.length > 0);

      // 更新统计数据
      if (topics.length > 0) {
        setStats(prev => ({
          ...prev,
          count: topics.length,
          lastUpdate: new Date().toISOString()
        }));
      }
    } catch (error) {
      // 静默处理错误
      onDataUpdate?.(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 切换RSSHub功能
   */
  const toggleRSSHub = (enabled: boolean) => {
    setIsEnabled(enabled);
    rsshubDataService.setEnabled(enabled);
    onDataUpdate?.(enabled && isAvailable);
  };

  /**
   * 手动刷新
   */
  const handleRefresh = () => {
    checkRSSHubStatus();
    if (isEnabled && isAvailable) {
      loadRSSHubData();
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Globe className="h-4 w-4 mr-1" />
            <span className="text-xs">RSSHub</span>
            {isAvailable ? (
              <CheckCircle className="h-3 w-3 ml-1 text-success" />
            ) : (
              <AlertCircle className="h-3 w-3 ml-1 text-destructive" />
            )}
            {isEnabled && stats.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 text-xs">
                +{stats.count}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* 标题和状态 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">RSSHub 数据源</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={toggleRSSHub}
                  disabled={!isAvailable}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* 服务状态 */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>服务状态</span>
                  <div className="flex items-center space-x-1">
                    {isAvailable ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-success" />
                        <span className="text-success">可用</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">不可用</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据统计 */}
            {isAvailable && isEnabled && (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>补充数据</span>
                      <Badge variant="outline">{stats.count} 条</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>覆盖平台</span>
                      <span className="text-muted-foreground">
                        {stats.platforms.length} 个
                      </span>
                    </div>
                    {stats.lastUpdate && (
                      <div className="flex items-center justify-between">
                        <span>最后更新</span>
                        <span className="text-muted-foreground">
                          {formatTime(stats.lastUpdate)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 平台列表 */}
            {isAvailable && isEnabled && stats.platforms.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">活跃平台</div>
                <div className="flex flex-wrap gap-1">
                  {stats.platforms.map(platform => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 说明信息 */}
            <div className="border-t pt-3">
              <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p>RSSHub 为现有热点数据提供补充信息，不会替换原有数据源。</p>
                  <p className="mt-1">启用后将在原有数据基础上增加更多实时热点。</p>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
