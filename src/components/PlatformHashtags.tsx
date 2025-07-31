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

  // 生成标签 - 改进的相关性算法
  const generateTags = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const limits = getPlatformLimits(platformId);
      const hashtags = await hashtagGenerator.generateHashtags(content, {
        platformId,
        includeBrands: true,
        includeIndustry: true,
        includePersona: true
      });

      // 过滤高相关性标签并应用平台限制
      const relevantTags = hashtags
        .filter(h => h.relevance >= 0.6) // 只保留相关度>=0.6的标签
        .sort((a, b) => b.relevance - a.relevance) // 按相关度排序
        .slice(0, limits.max) // 应用平台最大限制
        .map(h => h.tag);

      // 确保至少有最小数量的标签
      const finalTags = relevantTags.length >= limits.min
        ? relevantTags
        : hashtags.slice(0, limits.min).map(h => h.tag);

      setTags(finalTags);
      onTagsChange?.(finalTags);
    } catch (error) {
      console.error('标签生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 初始化时自动生成标签
  useEffect(() => {
    if (content.trim()) {
      generateTags();
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
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Tag className="h-4 w-4 animate-spin" />
          <span>正在生成智能标签...</span>
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">智能标签</span>
          <span className="text-xs text-gray-500">
            ({tags.length}/{getPlatformLimits(platformId).max}个)
          </span>
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
            onClick={generateTags}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="重新生成"
          >
            <RotateCcw className="h-3 w-3" />
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
