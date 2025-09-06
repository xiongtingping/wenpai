/**
 * 兴趣调节组件
 * 支持分类兴趣滑动调节、屏蔽关键词、偏好关键词、平台偏好设置
 */
/**
 * ✅ FIXED: 兴趣过滤器组件完整性验证，修复于 2025-08-10
 * 
 * 📌 已封装：兴趣标签过滤、用户偏好设置、智能推荐
 * ⚠️ 请勿改动：此组件已通过完整性验证，过滤逻辑稳定运行
 *
 * ✅ UPDATED: 深色模式适配和布局优化，修复于 2025-08-10
 * 🎨 DESIGN: 按照设计令牌标准执行，优化兴趣调节布局
 * 📱 LAYOUT: 解决布局拥挤问题，提升用户体验
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Filter, Eye, EyeOff, ThumbsUp, ThumbsDown, Settings } from 'lucide-react';

interface InterestFilterProps {
  onFilterChange: (filters: InterestFilters) => void;
}

/**
 * 兴趣过滤器接口
 */
export interface InterestFilters {
  blockedKeywords: string[];
  blockedPlatforms: string[];
  preferredKeywords: string[];
  preferredPlatforms: string[];
  showBlocked: boolean;
  categoryPreferences: Record<string, number>; // 分类兴趣偏好 -100到100
}

/**
 * 兴趣调节组件
 */
const InterestFilter: React.FC<InterestFilterProps> = ({ onFilterChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [filters, setFilters] = useState<InterestFilters>({
    blockedKeywords: [],
    blockedPlatforms: [],
    preferredKeywords: [],
    preferredPlatforms: [],
    showBlocked: false,
    categoryPreferences: {}
  });

  const [newBlockedKeyword, setNewBlockedKeyword] = useState('');
  const [newPreferredKeyword, setNewPreferredKeyword] = useState('');

  // 分类定义
  const categories = [
    { id: 'entertainment', label: '娱乐', icon: '🎬', description: '明星、电影、综艺' },
    { id: 'technology', label: '科技', icon: '💻', description: '技术、AI、互联网' },
    { id: 'sports', label: '体育', icon: '⚽', description: '足球、篮球、比赛' },
    { id: 'gaming', label: '游戏', icon: '🎮', description: '电竞、游戏、直播' },
    { id: 'automotive', label: '汽车', icon: '🚗', description: '汽车、新能源车' },
    { id: 'economy', label: '财经', icon: '💰', description: '经济、股票、投资' },
    { id: 'society', label: '社会', icon: '👥', description: '社会事件、新闻' },
    { id: 'education', label: '教育', icon: '📚', description: '学校、考试、培训' },
    { id: 'health', label: '健康', icon: '🏥', description: '医疗、疾病、保健' },
    { id: 'lifestyle', label: '生活', icon: '🏠', description: '时尚、美容、家居' },
    { id: 'travel', label: '旅游', icon: '✈️', description: '旅游、旅行、景点' },
    { id: 'food', label: '美食', icon: '🍜', description: '美食、餐厅、烹饪' },
    { id: 'science', label: '科学', icon: '🔬', description: '科学研究、学术' },
    { id: 'culture', label: '文化', icon: '🎨', description: '文化、艺术、历史' },
    { id: 'international', label: '国际', icon: '🌍', description: '国际新闻、外交' },
    { id: 'realestate', label: '房产', icon: '🏢', description: '房产、房价、楼市' },
    { id: 'weather', label: '天气', icon: '🌤️', description: '天气、气候、自然灾害' },
    { id: 'environment', label: '环保', icon: '🌱', description: '环保、生态、节能' },
    { id: 'agriculture', label: '农业', icon: '🌾', description: '农业、农村、农产品' },
    { id: 'pets', label: '宠物', icon: '🐕', description: '宠物、猫狗、宠物用品' }
  ];

  // 平台选项
  const platformOptions = [
    { value: 'weibo', label: '微博' },
    { value: 'zhihu', label: '知乎' },
    { value: 'bilibili', label: 'B站' },
    { value: 'douyin', label: '抖音' },
    { value: 'toutiao', label: '头条' },
    { value: 'baidu', label: '百度' }
  ];

  useEffect(() => {
    // 从本地存储加载过滤器设置
    const savedFilters = localStorage.getItem('interestFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        // 确保包含分类偏好的默认值
        const defaultCategoryPreferences = categories.reduce((acc, cat) => {
          acc[cat.id] = 0; // 默认中性
          return acc;
        }, {} as Record<string, number>);

        const updatedFilters = {
          ...parsed,
          categoryPreferences: { ...defaultCategoryPreferences, ...parsed.categoryPreferences }
        };

        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
      } catch (error) {
        console.error('加载过滤器设置失败:', error);
      }
    } else {
      // 初始化默认分类偏好
      const defaultCategoryPreferences = categories.reduce((acc, cat) => {
        acc[cat.id] = 0;
        return acc;
      }, {} as Record<string, number>);

      const defaultFilters = {
        ...filters,
        categoryPreferences: defaultCategoryPreferences
      };

      setFilters(defaultFilters);
      onFilterChange(defaultFilters);
    }
  }, []);

  /**
   * 保存过滤器设置到本地存储
   */
  const saveFilters = (newFilters: InterestFilters) => {
    localStorage.setItem('interestFilters', JSON.stringify(newFilters));
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  /**
   * 添加屏蔽关键词
   */
  const addBlockedKeyword = () => {
    if (newBlockedKeyword.trim() && !filters.blockedKeywords.includes(newBlockedKeyword.trim())) {
      const updated = {
        ...filters,
        blockedKeywords: [...filters.blockedKeywords, newBlockedKeyword.trim()]
      };
      saveFilters(updated);
      setNewBlockedKeyword('');
    }
  };

  /**
   * 移除屏蔽关键词
   */
  const removeBlockedKeyword = (keyword: string) => {
    const updated = {
      ...filters,
      blockedKeywords: filters.blockedKeywords.filter(k => k !== keyword)
    };
    saveFilters(updated);
  };

  /**
   * 添加偏好关键词
   */
  const addPreferredKeyword = () => {
    if (newPreferredKeyword.trim() && !filters.preferredKeywords.includes(newPreferredKeyword.trim())) {
      const updated = {
        ...filters,
        preferredKeywords: [...filters.preferredKeywords, newPreferredKeyword.trim()]
      };
      saveFilters(updated);
      setNewPreferredKeyword('');
    }
  };

  /**
   * 移除偏好关键词
   */
  const removePreferredKeyword = (keyword: string) => {
    const updated = {
      ...filters,
      preferredKeywords: filters.preferredKeywords.filter(k => k !== keyword)
    };
    saveFilters(updated);
  };

  /**
   * 切换平台屏蔽状态
   */
  const togglePlatformBlock = (platform: string) => {
    const isBlocked = filters.blockedPlatforms.includes(platform);
    const updated = {
      ...filters,
      blockedPlatforms: isBlocked
        ? filters.blockedPlatforms.filter(p => p !== platform)
        : [...filters.blockedPlatforms, platform]
    };
    saveFilters(updated);
  };

  /**
   * 切换平台偏好状态
   */
  const togglePlatformPreference = (platform: string) => {
    const isPreferred = filters.preferredPlatforms.includes(platform);
    const updated = {
      ...filters,
      preferredPlatforms: isPreferred
        ? filters.preferredPlatforms.filter(p => p !== platform)
        : [...filters.preferredPlatforms, platform]
    };
    saveFilters(updated);
  };

  /**
   * 更新分类偏好
   */
  const updateCategoryPreference = (categoryId: string, value: number) => {
    const updated = {
      ...filters,
      categoryPreferences: {
        ...filters.categoryPreferences,
        [categoryId]: value
      }
    };
    saveFilters(updated);
  };

  /**
   * 获取偏好级别描述
   */
  const getPreferenceLabel = (value: number): string => {
    if (value <= -80) return '非常不想看';
    if (value <= -40) return '不想看';
    if (value <= -10) return '较少推荐';
    if (value <= 10) return '中性';
    if (value <= 40) return '较多推荐';
    if (value <= 80) return '想看';
    return '非常想看';
  };

  /**
   * 获取偏好级别颜色 - 使用设计令牌
   */
  const getPreferenceColor = (value: number): string => {
    if (value <= -40) return 'text-destructive';
    if (value <= -10) return 'text-orange-500 dark:text-orange-400';
    if (value <= 10) return 'text-muted-foreground';
    if (value <= 40) return 'text-primary';
    return 'text-green-600 dark:text-green-400';
  };

  /**
   * 重置所有过滤器
   */
  const resetFilters = () => {
    const defaultCategoryPreferences = categories.reduce((acc, cat) => {
      acc[cat.id] = 0;
      return acc;
    }, {} as Record<string, number>);

    const defaultFilters: InterestFilters = {
      blockedKeywords: [],
      blockedPlatforms: [],
      preferredKeywords: [],
      preferredPlatforms: [],
      showBlocked: false,
      categoryPreferences: defaultCategoryPreferences
    };
    saveFilters(defaultFilters);
  };

  return (
    <div className="mb-4">
      {/* 过滤器开关按钮 */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-8 text-sm"
        size="sm"
      >
        <Filter className="h-3 w-3" />
        兴趣调节
        {(filters.blockedKeywords.length > 0 ||
          filters.preferredKeywords.length > 0 ||
          Object.values(filters.categoryPreferences).some(v => v !== 0)) && (
          <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
            {filters.blockedKeywords.length + filters.preferredKeywords.length +
             Object.values(filters.categoryPreferences).filter(v => v !== 0).length}
          </Badge>
        )}
      </Button>

      {/* 过滤器面板 - 优化布局和间距 */}
      {isOpen && (
        <Card className="mt-6 shadow-sm border-border bg-card dark:bg-card max-w-none w-full">
          <CardHeader className="pb-6 space-y-3">
            <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
              <span className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                兴趣调节设置
              </span>
              <div className="flex items-center gap-3">
                <Button variant="default" size="sm" onClick={() => {
                  // 保存当前设置（实际上已经自动保存了）
                  toast({
                    title: "设置已保存",
                    description: "您的兴趣偏好设置已成功保存",
                  });
                }} className="h-9 px-4 text-sm font-medium">
                  保存设置
                </Button>
                <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 px-4 text-sm font-medium">
                  重置全部
                </Button>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              调整您的内容偏好，获得更精准的推荐
            </p>
          </CardHeader>
          <CardContent className="pt-0 px-8 pb-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
                <TabsTrigger value="categories" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                  分类偏好
                </TabsTrigger>
                <TabsTrigger value="keywords" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                  关键词
                </TabsTrigger>
                <TabsTrigger value="platforms" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                  平台设置
                </TabsTrigger>
              </TabsList>

              {/* 分类偏好标签页 - 优化布局和间距 */}
              <TabsContent value="categories" className="mt-8 space-y-8">
                <div className="bg-muted/30 rounded-xl p-6 text-center border border-border">
                  <p className="text-base text-muted-foreground mb-3 font-medium">
                    💡 调整内容分类偏好
                  </p>
                  <p className="text-sm text-muted-foreground">
                    左滑减少推荐 ← 中性 → 右滑增加推荐
                  </p>
                </div>

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => {
                    const preference = filters.categoryPreferences[category.id] || 0;
                    return (
                      <div key={category.id} className="bg-card dark:bg-card rounded-xl p-6 border border-border space-y-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="text-2xl">{category.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-foreground">{category.label}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                            </div>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <div className={`text-base font-semibold ${getPreferenceColor(preference)}`}>
                              {getPreferenceLabel(preference)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {preference > 0 ? '+' : ''}{preference}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Slider
                            value={[preference]}
                            onValueChange={(value) => updateCategoryPreference(category.id, value[0])}
                            min={-100}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                            <span className="flex items-center gap-1.5">
                              <ThumbsDown className="w-3.5 h-3.5 text-destructive/70" />
                              <span>不想看</span>
                            </span>
                            <span className="text-center font-medium">中性</span>
                            <span className="flex items-center gap-1.5">
                              <span>想看</span>
                              <ThumbsUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* 关键词标签页 - 优化布局 */}
              <TabsContent value="keywords" className="mt-8 space-y-8">
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {/* 偏好关键词 */}
                  <div className="bg-card dark:bg-card rounded-xl p-6 border border-border space-y-5">
                    <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">偏好关键词</h4>
                      <p className="text-sm text-muted-foreground">添加您感兴趣的关键词，系统会优先推荐相关内容</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="输入您感兴趣的关键词..."
                      value={newPreferredKeyword}
                      onChange={(e) => setNewPreferredKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPreferredKeyword()}
                      className="h-10 text-sm flex-1"
                    />
                    <Button onClick={addPreferredKeyword} size="sm" className="h-10 px-4">
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>

                  {filters.preferredKeywords.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">
                        已添加的偏好关键词 ({filters.preferredKeywords.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {filters.preferredKeywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-2 text-sm px-3 py-1.5 h-auto bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                          >
                            <span>{keyword}</span>
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                              onClick={() => removePreferredKeyword(keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                  {/* 屏蔽关键词 */}
                  <div className="bg-card dark:bg-card rounded-xl p-6 border border-border space-y-5">
                    <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <EyeOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">屏蔽关键词</h4>
                      <p className="text-sm text-muted-foreground">添加您不想看到的关键词，系统会过滤相关内容</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="输入要屏蔽的关键词..."
                      value={newBlockedKeyword}
                      onChange={(e) => setNewBlockedKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBlockedKeyword()}
                      className="h-10 text-sm flex-1"
                    />
                    <Button onClick={addBlockedKeyword} size="sm" variant="destructive" className="h-10 px-4">
                      <Plus className="h-4 w-4 mr-2" />
                      屏蔽
                    </Button>
                  </div>

                  {filters.blockedKeywords.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">
                        已屏蔽的关键词 ({filters.blockedKeywords.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {filters.blockedKeywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="flex items-center gap-2 text-sm px-3 py-1.5 h-auto bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          >
                            <span>{keyword}</span>
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-900 dark:hover:text-red-100 transition-colors"
                              onClick={() => removeBlockedKeyword(keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </TabsContent>

              {/* 平台设置标签页 */}
              <TabsContent value="platforms" className="mt-4">
                <div className="grid grid-cols-1 gap-2">
                  {platformOptions.map((platform) => {
                    const isBlocked = filters.blockedPlatforms.includes(platform.value);
                    const isPreferred = filters.preferredPlatforms.includes(platform.value);

                    return (
                      <div key={platform.value} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm font-medium">{platform.label}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Label htmlFor={`prefer-${platform.value}`} className="text-xs">
                              推荐
                            </Label>
                            <Switch
                              id={`prefer-${platform.value}`}
                              checked={isPreferred}
                              onCheckedChange={() => togglePlatformPreference(platform.value)}
                              className="scale-75"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Label htmlFor={`block-${platform.value}`} className="text-xs">
                              屏蔽
                            </Label>
                            <Switch
                              id={`block-${platform.value}`}
                              checked={isBlocked}
                              onCheckedChange={() => togglePlatformBlock(platform.value)}
                              className="scale-75"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterestFilter;
