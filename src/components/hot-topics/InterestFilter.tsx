/**
 * 兴趣调节组件
 * 支持屏蔽不想关注的内容和重点推荐想看的内容
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Filter, Eye, EyeOff } from 'lucide-react';

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
}

/**
 * 兴趣调节组件
 */
const InterestFilter: React.FC<InterestFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<InterestFilters>({
    blockedKeywords: [],
    blockedPlatforms: [],
    preferredKeywords: [],
    preferredPlatforms: [],
    showBlocked: false
  });

  const [newBlockedKeyword, setNewBlockedKeyword] = useState('');
  const [newPreferredKeyword, setNewPreferredKeyword] = useState('');

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
        setFilters(parsed);
        onFilterChange(parsed);
      } catch (error) {
        console.error('加载过滤器设置失败:', error);
      }
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
   * 重置所有过滤器
   */
  const resetFilters = () => {
    const defaultFilters: InterestFilters = {
      blockedKeywords: [],
      blockedPlatforms: [],
      preferredKeywords: [],
      preferredPlatforms: [],
      showBlocked: false
    };
    saveFilters(defaultFilters);
  };

  return (
    <div className="mb-6">
      {/* 过滤器开关按钮 */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        兴趣调节
        {filters.blockedKeywords.length > 0 || filters.preferredKeywords.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {filters.blockedKeywords.length + filters.preferredKeywords.length}
          </Badge>
        )}
      </Button>

      {/* 过滤器面板 */}
      {isOpen && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>兴趣调节设置</span>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                重置
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 屏蔽关键词 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                屏蔽关键词
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="输入要屏蔽的关键词"
                  value={newBlockedKeyword}
                  onChange={(e) => setNewBlockedKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBlockedKeyword()}
                />
                <Button onClick={addBlockedKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.blockedKeywords.map((keyword, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeBlockedKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* 偏好关键词 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                偏好关键词
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="输入偏好的关键词"
                  value={newPreferredKeyword}
                  onChange={(e) => setNewPreferredKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPreferredKeyword()}
                />
                <Button onClick={addPreferredKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.preferredKeywords.map((keyword, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removePreferredKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* 平台偏好设置 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">平台偏好设置</h3>
              <div className="grid grid-cols-2 gap-4">
                {platformOptions.map((platform) => {
                  const isBlocked = filters.blockedPlatforms.includes(platform.value);
                  const isPreferred = filters.preferredPlatforms.includes(platform.value);
                  
                  return (
                    <div key={platform.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{platform.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`prefer-${platform.value}`} className="text-xs">
                            推荐
                          </Label>
                          <Switch
                            id={`prefer-${platform.value}`}
                            checked={isPreferred}
                            onCheckedChange={() => togglePlatformPreference(platform.value)}
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
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterestFilter; 