/**
 * 平台专属的话题标签组件
 * 显示在每个平台内容下方，专门生成话题标签
 * 注意：话题标签功能已从智能内容生成移动到此组件中
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, X, Copy, Edit3, RotateCcw } from 'lucide-react';
import { hashtagGenerator, HashtagSuggestion } from '../utils/hashtagGenerator';
import { logger } from '@/utils/logger';

export interface PlatformHashtagsProps {
  platformId: string;
  content: string;
  extractedTags?: string[]; // 从智能内容生成中提取的标签
  onTagsChange?: (tags: string[]) => void;
}

export const PlatformHashtags: React.FC<any> = ({ platformId,
  content,
  extractedTags,
  onTagsChange }) => { const [tags, setTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newTag, setNewTag] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Debug log to ensure component is rendering
  if (import.meta.env.DEV) {
    console.log(`🏷️ PlatformHashtags rendering for ${platformId }, content length: ${content.length}, tags: ${tags.length}`);
  }

  // Platform-specific hashtag limits
  const getPlatformLimits = (platformId: string) => {
    const limits = {
      'douyin': { min: 3, max: 5 },
      'xiaohongshu': { min: 6, max: 10 },
      'weibo': { min: 3, max: 5 },
      'zhihu': { min: 2, max: 3 },
      'bilibili': { min: 4, max: 8 }
    };
    return limits[platformId as keyof typeof limits] || { min: 3, max: 6 };
  };

  // 生成话题标签 - 从智能内容生成移动过来的功能
  const generateTags = async (forceRefresh = false) => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const limits = getPlatformLimits(platformId);

      if (import.meta.env.DEV) console.log(`🏷️ 为${platformId}平台生成话题tag:`, content.substring(0, 50) + '...');

      // 使用新的话题标签生成功能
      const topicTags = await hashtagGenerator.generateTopicTagsForSmartTagging(content, platformId);

      // 只保留高相关性话题标签
      const relevantTags = topicTags
        .filter(h => h.relevance >= 0.6) // 话题标签相关性阈值稍低
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, Math.min(limits.max, 8)) // 限制最多8个话题标签
        .map(h => h.tag);

      logger.debug('✅ 生成了${relevantTags.length}个话题标签:', relevantTags);

      setTags(relevantTags);
      onTagsChange?.(relevantTags);
    } catch (error) {
      console.error('话题tag生成failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ FIXED: 2025-08-04 修复无限循环问题 - 使用 useMemo 和 useCallback 优化
  // 处理提取的标签和内容变化
  useEffect(() => {
    if (extractedTags && extractedTags.length > 0) {
      // 优先使用从智能内容生成中提取的标签
      if (import.meta.env.DEV) console.log('🏷️ 使用从智能content生成提取的tag:', extractedTags);
      setTags(prev => {
        // 只有当标签真正不同时才更新
        if (JSON.stringify(prev) !== JSON.stringify(extractedTags)) {
          onTagsChange?.(extractedTags);
          return extractedTags;
        }
        return prev;
      });
    } else if (content.trim() && content.length > 10) {
      // 如果没有提取的标签，则生成话题标签
      setTags(prev => {
        if (prev.length > 0) {
          return [];
        }
        return prev;
      });
      const timer = setTimeout(() => {
        generateTags();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setTags(prev => {
        if (prev.length > 0) {
          return [];
        }
        return prev;
      });
    }
  }, [content, platformId, extractedTags?.length, extractedTags?.join(',')]); // 使用更稳定的依赖

  // 复制所有标签 - 改进的视觉反馈
  const copyAllTags = async () => {
    const formattedTags = hashtagGenerator.formatTagsForPlatform(tags, platformId);
    try {
      await navigator.clipboard.writeText(formattedTags);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('copyingfailed:', error);
    }
  };

  // 添加新标签
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      onTagsChange?.(updatedTags);
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    onTagsChange?.(updatedTags);
  };

  // 编辑标签
  const editTag = (index: number, newValue: string) => {
    if (newValue.trim()) {
      const updatedTags = [...tags];
      updatedTags[index] = newValue.trim();
      setTags(updatedTags);
      onTagsChange?.(updatedTags);
    }
    setEditingIndex(null);
  };

  if (isGenerating) {
    return (
      <div className="mt-3 p-3 bg-accent rounded-lg border border-border">
        <div className="flex items-center space-x-2 text-sm text-primary">
          <Tag className="h-4 w-4 animate-spin" />
          <span>正在基于当前内容生成话题标签...</span>
        </div>
        <div className="text-xs text-primary mt-1">
          分析内容：{content.substring(0, 30)}...
        </div>
      </div>
    );
  }

  // 确保即使没有标签也显示组件框架
  if (!content.trim()) {
    return (
      <div className="mt-3 p-3 bg-accent rounded-lg border border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Tag className="h-4 w-4" />
          <span>等待内容生成后自动生成标签...</span>
        </div>
      </div>
    );
  }

  // 即使没有标签也显示组件，提供生成按钮
  if (tags.length === 0 && !isGenerating) {
    return (
      <div className="mt-3 p-3 bg-accent rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {content.trim() ? '点击生成话题标签（或从内容中自动提取）' : '等待内容生成后可生成话题标签'}
            </span>
          </div>
          {content.trim() && (
            <button
              onClick={() => generateTags(true)}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary transition-colors"
            >
              生成话题标签
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-accent rounded-lg border">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">话题标签</span>
          <span className="text-xs text-muted-foreground">
            ({tags.length}/{Math.min(getPlatformLimits(platformId).max, 8)}个)
          </span>
          {tags.length > 0 && (
            <span className="text-xs text-foreground bg-accent px-1 rounded">
              {extractedTags && extractedTags.length > 0 ? '✓ 已提取' : '✓ 已生成'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-muted-foreground hover:text-muted-foreground rounded text-xs"
            title={isExpanded ? t('components.labels.收起') : t('components.labels.展开')}
          >
            {isExpanded ? t('components.labels.收起') : t('components.labels.展开')}
          </button>

          <button
            onClick={() => generateTags(true)}
            className="p-1 text-muted-foreground hover:text-primary rounded transition-colors"
            title="刷新话题标签 - 基于当前内容重新生成"
            disabled={isGenerating}
          >
            <RotateCcw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={copyAllTags}
            className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
              copyFeedback
                ? 'bg-accent text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary'
            }`}
          >
            {copyFeedback ? '已复制 ✓' : '复制'}
          </button>
        </div>
      </div>

      {/* 标签显示区域 */}
      <div className="space-y-2">
        {/* 紧凑模式：只显示前3个标签 */}
        {!isExpanded && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-accent text-primary text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{tags.length - 3}个
              </span>
            )}
          </div>
        )}

        {/* 展开模式：显示所有标签并支持编辑 */}
        {isExpanded && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="inline-flex items-center bg-accent text-primary text-xs rounded-full"
                >
                  {editingIndex === index ? (
                    <input
                      type="text"
                      defaultValue={tag}
                      autoFocus
                      className="bg-transparent border-none outline-none px-2 py-1 w-20 text-xs"
                      onBlur={(e) => editTag(index, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          editTag(index, e.currentTarget.value);
                        }
                      }}
                    />
                  ) : (
                    <>
                      <span className="px-2 py-1">#{tag}</span>
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="p-1 hover:bg-primary rounded-r-full"
                      >
                        <Edit3 className="h-2 w-2" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeTag(index)}
                    className="p-1 hover:bg-primary rounded-r-full"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              ))}
            </div>

            {/* 添加新标签 */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag();
                  }
                }}
                placeholder="添加标签"
                className="px-2 py-1 border border-border rounded text-xs w-24 focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={addTag}
                className="p-1 text-primary hover:bg-accent rounded"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
