/**
 * 增强的分类热点组件
 * 集成RSSHub数据，为分类热点信息流提供更丰富的数据源
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  Plus,
  Zap,
  RefreshCw
} from 'lucide-react';
import { DailyHotItem } from '@/api/hotTopicsService';
import rsshubDataService, { RSSHubTopic } from '@/services/rsshubDataService';

interface EnhancedTopicCategoriesProps {
  originalData: Record<string, DailyHotItem[]>;
  onCategoryClick?: (category: string) => void;
  className?: string;
}

interface EnhancedCategoryData {
  original: DailyHotItem[];
  rsshub: RSSHubTopic[];
  total: number;
}

export default function EnhancedTopicCategories({ 
  originalData, 
  onCategoryClick, 
  className 
}: EnhancedTopicCategoriesProps) {
  const [enhancedData, setEnhancedData] = useState<Record<string, EnhancedCategoryData>>({});
  const [rsshubEnabled, setRSSHubEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 初始化和加载RSSHub数据
  useEffect(() => {
    loadRSSHubData();
  }, [rsshubEnabled]);

  // 当原始数据变化时更新增强数据
  useEffect(() => {
    updateEnhancedData();
  }, [originalData]);

  /**
   * 加载RSSHub补充数据
   */
  const loadRSSHubData = async () => {
    if (!rsshubEnabled) {
      updateEnhancedData({});
      return;
    }

    setLoading(true);
    try {
      const rsshubCategorized = await rsshubDataService.getCategorizedSupplementaryTopics();
      updateEnhancedData(rsshubCategorized);
    } catch (error) {
      console.warn('加载RSSHub分类数据失败:', error);
      updateEnhancedData({});
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新增强数据
   */
  const updateEnhancedData = (rsshubData: Record<string, RSSHubTopic[]> = {}) => {
    const enhanced: Record<string, EnhancedCategoryData> = {};

    // 合并原始数据和RSSHub数据
    Object.keys(originalData).forEach(category => {
      const original = originalData[category] || [];
      const rsshub = rsshubData[category] || [];
      
      enhanced[category] = {
        original,
        rsshub,
        total: original.length + rsshub.length
      };
    });

    // 添加只有RSSHub数据的分类
    Object.keys(rsshubData).forEach(category => {
      if (!enhanced[category]) {
        enhanced[category] = {
          original: [],
          rsshub: rsshubData[category] || [],
          total: rsshubData[category]?.length || 0
        };
      }
    });

    setEnhancedData(enhanced);
  };

  /**
   * 切换分类展开状态
   */
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  /**
   * 获取分类图标
   */
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      '社会': '👥',
      '科技': '💻',
      '娱乐': '🎬',
      '体育': '⚽',
      '财经': '💰',
      '汽车': '🚗',
      '文化': '🎨',
      '游戏': '🎮',
      '生活': '🏠',
      '美食': '🍜',
      '天气': '🌤️',
      '农业': '🌾',
      '宠物': '🐕',
      '房产': '🏢',
      '健康': '🏥',
      '旅游': '✈️',
      '环保': '🌱'
    };
    return iconMap[category] || '📰';
  };

  /**
   * 渲染热点项目
   */
  const renderHotItem = (item: DailyHotItem | RSSHubTopic, index: number, isRSSHub = false) => {
    const title = 'title' in item ? item.title : '';
    const hot = 'hot' in item ? item.hot : (item as RSSHubTopic).hotScore?.toString() || '0';
    const url = 'url' in item ? item.url : (item as RSSHubTopic).link;
    const platform = 'platform' in item ? item.platform : (item as RSSHubTopic).platform;

    return (
      <div key={`${isRSSHub ? 'rsshub' : 'original'}-${index}`} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
            <h5 className="text-sm font-medium truncate">{title}</h5>
            {isRSSHub && (
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                RSSHub
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-muted-foreground">{platform}</span>
            <span className="text-xs text-muted-foreground">热度: {hot}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          className="ml-2"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  /**
   * 渲染分类卡片
   */
  const renderCategoryCard = (category: string, data: EnhancedCategoryData) => {
    const isExpanded = expandedCategories.has(category);
    const hasRSSHubData = data.rsshub.length > 0;
    const displayItems = [...data.original, ...data.rsshub].slice(0, isExpanded ? undefined : 5);

    return (
      <Card key={category} className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <CardTitle className="text-base">{category}</CardTitle>
              {hasRSSHubData && (
                <Badge variant="secondary" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  增强
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {data.total}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategory(category)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-1">
            {/* 显示原始数据 */}
            {data.original.slice(0, isExpanded ? undefined : 3).map((item, index) => 
              renderHotItem(item, index, false)
            )}
            
            {/* 显示RSSHub数据 */}
            {rsshubEnabled && data.rsshub.slice(0, isExpanded ? undefined : 2).map((item, index) => 
              renderHotItem(item, data.original.length + index, true)
            )}
            
            {/* 展开更多按钮 */}
            {!isExpanded && data.total > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategory(category)}
                className="w-full mt-2 text-xs"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                展开更多 ({data.total - 5}+)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      {/* 控制面板 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">📊 增强分类热点信息流</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={rsshubEnabled}
              onCheckedChange={setRSSHubEnabled}
            />
            <span className="text-sm text-muted-foreground">RSSHub增强</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRSSHubData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      {rsshubEnabled && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 text-sm">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-blue-700 dark:text-blue-300">
              RSSHub数据增强已启用，为各分类提供补充热点数据
            </span>
          </div>
        </div>
      )}

      {/* 分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(enhancedData)
          .filter(([_, data]) => data.total > 0)
          .sort(([_, a], [__, b]) => b.total - a.total)
          .map(([category, data]) => renderCategoryCard(category, data))
        }
      </div>

      {/* 空状态 */}
      {Object.keys(enhancedData).length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">暂无分类数据</h3>
          <p className="text-sm text-muted-foreground">等待热点数据加载...</p>
        </div>
      )}
    </div>
  );
}
