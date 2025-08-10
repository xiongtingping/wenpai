/**
 * 兴趣调节组件
 * 支持分类兴趣滑动调节、屏蔽关键词、偏好关键词、平台偏好设置
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
    { id: 'politics', label: '政治', icon: '🏛️', description: '政府、政策、法律' },
    { id: 'economy', label: '财经', icon: '💰', description: '经济、股票、投资' },
    { id: 'society', label: '社会', icon: '👥', description: '社会事件、新闻' },
    { id: 'education', label: '教育', icon: '📚', description: '学校、考试、培训' },
    { id: 'health', label: '健康', icon: '🏥', description: '医疗、疾病、保健' },
    { id: 'lifestyle', label: '生活', icon: '🏠', description: '美食、旅游、时尚' },
    { id: 'other', label: '其他', icon: '📝', description: '其他未分类内容' }
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
   * 获取偏好级别颜色
   */
  const getPreferenceColor = (value: number): string => {
    if (value <= -40) return 'text-red-500';
    if (value <= -10) return 'text-orange-500';
    if (value <= 10) return 'text-gray-500';
    if (value <= 40) return 'text-blue-500';
    return 'text-green-500';
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

      {/* 过滤器面板 */}
      {isOpen && (
        <Card className="mt-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>兴趣调节设置</span>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
                重置
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="categories" className="text-xs">分类偏好</TabsTrigger>
                <TabsTrigger value="keywords" className="text-xs">关键词</TabsTrigger>
                <TabsTrigger value="platforms" className="text-xs">平台设置</TabsTrigger>
              </TabsList>

              {/* 分类偏好标签页 */}
              <TabsContent value="categories" className="mt-4 space-y-3">
                <div className="text-xs text-muted-foreground mb-3 text-center">
                  左滑不想看 ← 中性 → 右滑想看
                </div>
                {categories.map((category) => {
                  const preference = filters.categoryPreferences[category.id] || 0;
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <span className="text-sm font-medium">{category.label}</span>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${getPreferenceColor(preference)}`}>
                            {getPreferenceLabel(preference)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {preference > 0 ? '+' : ''}{preference}
                          </div>
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[preference]}
                          onValueChange={(value) => updateCategoryPreference(category.id, value[0])}
                          min={-100}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" />
                            不想看
                          </span>
                          <span>中性</span>
                          <span className="flex items-center gap-1">
                            想看
                            <ThumbsUp className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* 关键词标签页 */}
              <TabsContent value="keywords" className="mt-4 space-y-4">
                {/* 偏好关键词 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    偏好关键词
                  </h4>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="输入偏好的关键词"
                      value={newPreferredKeyword}
                      onChange={(e) => setNewPreferredKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPreferredKeyword()}
                      className="h-8 text-sm"
                    />
                    <Button onClick={addPreferredKeyword} size="sm" className="h-8 px-2">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {filters.preferredKeywords.map((keyword, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1 text-xs px-2 py-0 h-5">
                        {keyword}
                        <X
                          className="h-2 w-2 cursor-pointer"
                          onClick={() => removePreferredKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 屏蔽关键词 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <EyeOff className="h-3 w-3" />
                    屏蔽关键词
                  </h4>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="输入要屏蔽的关键词"
                      value={newBlockedKeyword}
                      onChange={(e) => setNewBlockedKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBlockedKeyword()}
                      className="h-8 text-sm"
                    />
                    <Button onClick={addBlockedKeyword} size="sm" className="h-8 px-2">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {filters.blockedKeywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1 text-xs px-2 py-0 h-5">
                        {keyword}
                        <X
                          className="h-2 w-2 cursor-pointer"
                          onClick={() => removeBlockedKeyword(keyword)}
                        />
                      </Badge>
                    ))}
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