/**
 * 数据源切换组件
 * 允许用户在原有数据和增强数据之间切换
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Globe,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import rsshubDataService from '@/services/rsshubDataService';

interface DataSourceToggleProps {
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export default function DataSourceToggle({ onToggle, className }: DataSourceToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({
    count: 0,
    platforms: [] as string[]
  });

  // 初始化状态
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const enabled = rsshubDataService.isEnabled();
        const available = await rsshubDataService.isServiceAvailable();

        setIsEnabled(enabled);
        setIsAvailable(available);

        if (available && enabled) {
          const dataStats = await rsshubDataService.getDataStats();
          setStats({
            count: dataStats.count,
            platforms: dataStats.platforms
          });
        } else {
          setStats({
            count: 0,
            platforms: []
          });
        }
      } catch (error) {
        // 静默处理初始化错误
        setIsEnabled(false);
        setIsAvailable(false);
        setStats({
          count: 0,
          platforms: []
        });
      }
    };

    checkStatus();
  }, []);

  /**
   * 切换RSSHub功能
   */
  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    rsshubDataService.setEnabled(enabled);
    onToggle?.(enabled);

    // 如果启用，获取统计数据
    if (enabled && isAvailable) {
      rsshubDataService.getDataStats().then(dataStats => {
        setStats({
          count: dataStats.count,
          platforms: dataStats.platforms
        });
      }).catch(() => {
        // 静默处理获取统计数据失败的情况
        setStats({
          count: 0,
          platforms: []
        });
      });
    } else {
      // 禁用时重置统计数据
      setStats({
        count: 0,
        platforms: []
      });
    }
  };

  return (
    <div className={className}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="border-blue-200 bg-blue-50/30">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-blue-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">数据源增强</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isAvailable ? (
                      <Badge variant="outline" className="text-success border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        可用
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        不可用
                      </Badge>
                    )}
                    {isEnabled && stats.count > 0 && (
                      <Badge variant="secondary">
                        +{stats.count} 条数据
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={handleToggle}
                    disabled={!isAvailable}
                  />
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <CardDescription>
                {isEnabled 
                  ? "已启用 RSSHub 数据源，为您提供更多实时热点" 
                  : "启用 RSSHub 数据源以获取更全面的热点信息"
                }
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* 功能说明 */}
                <div className="bg-background/50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-blue-900">RSSHub 数据源增强功能</p>
                      <ul className="text-blue-700 space-y-1">
                        <li>• <strong>更多平台覆盖</strong>：获取微博、知乎、GitHub、B站等平台的实时数据</li>
                        <li>• <strong>实时性更强</strong>：直接从RSS源获取最新热点，更新更及时</li>
                        <li>• <strong>数据补充</strong>：在现有数据基础上增加更多热点，不会替换原有内容</li>
                        <li>• <strong>智能去重</strong>：自动识别和过滤重复内容，保证数据质量</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 数据统计 */}
                {isEnabled && isAvailable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">补充数据</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900 mt-1">{stats.count} 条</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">覆盖平台</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900 mt-1">{stats.platforms.length} 个</p>
                    </div>
                  </div>
                )}

                {/* 平台列表 */}
                {isEnabled && stats.platforms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-2">活跃平台</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.platforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 服务不可用提示 */}
                {!isAvailable && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-red-900">RSSHub 服务暂时不可用</p>
                        <p className="text-red-700 mt-1">
                          可能是网络连接问题或服务维护中。您仍可以使用原有的热点数据功能。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/enhanced-hot-topics', '_blank')}
                    className="text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    体验增强版
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
