/**
 * 平台专属的紧凑标签组件
 * 显示在每个平台内容下方，占用空间小
 */

import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Copy, Edit3, RotateCcw } from 'lucide-react';
import { hashtagGenerator, HashtagSuggestion } from '../utils/hashtagGenerator';

export interface PlatformHashtagsProps {
  platformId: string;
  content: string;
  onTagsChange?: (tags: string[]) => void;
}

export const PlatformHashtags: React.FC<PlatformHashtagsProps> = ({
  platformId,
  content,
  onTagsChange
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newTag, setNewTag] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

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

  // 生成标签 - 基于当前内容的精准分析
  const generateTags = async (forceRefresh = false) => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const limits = getPlatformLimits(platformId);

      console.log(`🏷️ 为${platformId}平台基于内容生成标签:`, content.substring(0, 50) + '...');

      // 强制基于当前内容生成，禁用任何缓存
      const hashtags = await hashtagGenerator.generateHashtags(content, {
        platformId,
        maxTags: limits.max,
        includeBrands: false, // 专注于内容相关性
        includeIndustry: true,
        includePersona: false // 避免通用标签
      });

      // 只保留高相关性标签
      const relevantTags = hashtags
        .filter(h => h.relevance >= 0.7) // 提高相关性阈值
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, Math.min(limits.max, 10)) // 限制最多10个
        .map(h => h.tag);

      console.log(`✅ 生成了${relevantTags.length}个相关标签:`, relevantTags);

      setTags(relevantTags);
      onTagsChange?.(relevantTags);
    } catch (error) {
      console.error('标签生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 内容变化时重新生成标签，确保标签与内容一致
  useEffect(() => {
    if (content.trim() && content.length > 10) {
      // 清空旧标签，避免显示不相关的缓存标签
      setTags([]);
      // 延迟生成，避免频繁调用
      const timer = setTimeout(() => {
        generateTags();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setTags([]);
    }
  }, [content, platformId]);

  // 复制所有标签 - 改进的视觉反馈
  const copyAllTags = async () => {
    const formattedTags = hashtagGenerator.formatTagsForPlatform(tags, platformId);
    try {
      await navigator.clipboard.writeText(formattedTags);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
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
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 text-sm text-blue-700">
          <Tag className="h-4 w-4 animate-spin" />
          <span>正在基于当前内容生成相关标签...</span>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          分析内容：{content.substring(0, 30)}...
        </div>
      </div>
    );
  }

  // 确保即使没有标签也显示组件框架
  if (!content.trim()) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Tag className="h-4 w-4" />
          <span>等待内容生成后自动生成标签...</span>
        </div>
      </div>
    );
  }

  // 即使没有标签也显示组件，提供生成按钮
  if (tags.length === 0 && !isGenerating) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">暂无相关标签</span>
          </div>
          <button
            onClick={() => generateTags(true)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={!content.trim()}
          >
            生成标签
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">内容相关标签</span>
          <span className="text-xs text-gray-500">
            ({tags.length}/{Math.min(getPlatformLimits(platformId).max, 10)}个)
          </span>
          {tags.length > 0 && (
            <span className="text-xs text-green-600 bg-green-50 px-1 rounded">
              ✓ 已匹配
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded text-xs"
            title={isExpanded ? "收起" : "展开"}
          >
            {isExpanded ? "收起" : "展开"}
          </button>

          <button
            onClick={() => generateTags(true)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
            title="刷新标签 - 基于当前内容重新生成"
            disabled={isGenerating}
          >
            <RotateCcw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={copyAllTags}
            className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
              copyFeedback
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
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
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
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
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-xs rounded-full"
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
                        className="p-1 hover:bg-blue-200 rounded-r-full"
                      >
                        <Edit3 className="h-2 w-2" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeTag(index)}
                    className="p-1 hover:bg-blue-200 rounded-r-full"
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
                className="px-2 py-1 border border-gray-300 rounded text-xs w-24 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addTag}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
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
