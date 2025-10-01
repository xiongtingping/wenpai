/**
 * 独立标签管理模块
 * 支持标签编辑、保存、模板管理等功能
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tag, Plus, X, Copy, Save, RotateCcw, Star,
  Edit3, Trash2, Download, Upload, Settings
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export interface HashtagData {
  id: string;
  tag: string;
  dimension: string;
  type: string;
  relevance: number;
  description?: string;
}

export interface HashtagTemplate {
  id: string;
  name: string;
  tags: string[];
  platformId: string;
  createdAt: number;
  usageCount: number;
}

export interface HashtagManagerProps {
  initialTags: HashtagData[];
  platformId: string;
  onTagsChange: (tags: string[]) => void;
  onSaveTemplate?: (template: HashtagTemplate) => void;
}

export const HashtagManager: React.FC<any> = ({ initialTags,
  platformId,
  onTagsChange,
  onSaveTemplate }) => { const [tags, setTags] = useState<HashtagData[]>(initialTags);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagText, setNewTagText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<HashtagTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');

  // 从localStorage加载模板
  useEffect(() => {
    const savedTemplates = localStorage.getItem(`hashtag_templates_${platformId }`);
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, [platformId]);

  // 保存模板到localStorage
  const saveTemplatesToStorage = (newTemplates: HashtagTemplate[]) => {
    localStorage.setItem(`hashtag_templates_${platformId}`, JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  // 更新标签
  const updateTags = (newTags: HashtagData[]) => {
    setTags(newTags);
    onTagsChange(newTags.map(t => t.tag));
  };

  // 添加新标签
  const addNewTag = () => {
    if (newTagText.trim()) {
      const newTag: HashtagData = {
        id: Date.now().toString(),
        tag: newTagText.trim(),
        dimension: 'custom',
        type: 'manual',
        relevance: 1.0,
        description: '用户手动添加'
      };
      updateTags([...tags, newTag]);
      setNewTagText('');
    }
  };

  // 删除标签
  const removeTag = (tagId: string) => {
    updateTags(tags.filter(t => t.id !== tagId));
  };

  // 编辑标签
  const editTag = (tagId: string, newText: string) => {
    updateTags(tags.map(t => 
      t.id === tagId ? { ...t, tag: newText } : t
    ));
    setEditingTag(null);
  };

  // 复制所有标签
  const copyAllTags = async () => {
    const tagText = tags.map(t => `#${t.tag}`).join(' ');
    try {
      await navigator.clipboard.writeText(tagText);
      // 显示复制成功提示
      const button = document.getElementById('copy-all-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '已复制 ✓';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('copyingfailed:', error);
    }
  };

  // 保存为模板
  const saveAsTemplate = () => {
    if (templateName.trim() && tags.length > 0) {
      const newTemplate: HashtagTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        tags: tags.map(t => t.tag),
        platformId,
        createdAt: Date.now(),
        usageCount: 0
      };
      
      const newTemplates = [...templates, newTemplate];
      saveTemplatesToStorage(newTemplates);
      
      if (onSaveTemplate) {
        onSaveTemplate(newTemplate);
      }
      
      setTemplateName('');
      alert('模板保存成功！');
    }
  };

  // 应用模板
  const applyTemplate = (template: HashtagTemplate) => {
    const templateTags: HashtagData[] = template.tags.map((tag, index) => ({
      id: `template_${Date.now()}_${index}`,
      tag,
      dimension: 'template',
      type: 'template',
      relevance: 0.8,
      description: `来自模板: ${template.name}`
    }));
    
    updateTags(templateTags);
    
    // 更新使用次数
    const updatedTemplates = templates.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    saveTemplatesToStorage(updatedTemplates);
    
    setShowTemplates(false);
  };

  // 删除模板（使用 AlertDialog）
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false });
  const deleteTemplate = (templateId: string) => setDeleteDialog({ open: true, id: templateId });
  const confirmDeleteTemplate = () => {
    if (!deleteDialog.id) return;
    const newTemplates = templates.filter(t => t.id !== deleteDialog.id);
    saveTemplatesToStorage(newTemplates);
    setDeleteDialog({ open: false, id: undefined });
  };

  // 重置标签（使用 AlertDialog）
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const resetTags = () => setResetDialogOpen(true);
  const confirmResetTags = () => {
    updateTags(initialTags);
    setResetDialogOpen(false);
  };

  // 获取维度颜色
  const getDimensionColor = (dimension: string) => {
    const colors: Record<string, string> = {
      'industry': 'bg-accent text-primary',
      'topic': 'bg-accent text-foreground',
      'content': 'bg-accent text-primary',
      'account': 'bg-accent text-foreground',
      'persona': 'bg-accent text-primary',
      'trending': 'bg-destructive/10 text-destructive',
      'brand': 'bg-accent text-muted-foreground',
      'custom': 'bg-accent text-foreground',
      'template': 'bg-accent text-primary'
    };
    return colors[dimension] || 'bg-accent text-foreground';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Tag className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">智能标签管理</h3>
          <span className="text-sm text-muted-foreground">({tags.length}个标签)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 text-muted-foreground hover:text-muted-foreground rounded-lg hover:bg-accent"
            title="显示模板"
          >
            <Star className="h-4 w-4" />
          </button>

          <button
            onClick={() => setResetDialogOpen(true)}
            className="p-2 text-muted-foreground hover:text-muted-foreground rounded-lg hover:bg-accent"
            title="重置标签"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            id="copy-all-btn"
            onClick={copyAllTags}
            className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>复制全部</span>
          </button>
        </div>
      </div>

      {/* 模板管理面板 */}
      {showTemplates && (
        <div className="bg-accent rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-foreground">标签模板</h4>

          {/* 保存新模板 */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="输入模板名称"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:ring-primary focus:border-primary"
            />
            <button
              onClick={saveAsTemplate}
              disabled={!templateName.trim() || tags.length === 0}
              className="px-3 py-2 bg-accent text-primary-foreground rounded-lg hover:bg-accent disabled:bg-muted disabled:cursor-not-allowed text-sm"
            >
              保存模板
            </button>
          </div>

          {/* 模板列表 */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {templates.map(template => (
              <div key={template.id} className="flex items-center justify-between p-2 bg-card rounded border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.tags.length}个标签 • 使用{template.usageCount}次
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => applyTemplate(template)}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary"
                  >
                    应用
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, id: template.id })}
                    className="p-1 text-muted-foreground hover:text-destructive rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-4">
                暂无保存的模板
              </div>
            )}
          </div>
        </div>
      )}

      {/* 标签显示和编辑区域 */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">当前标签</h4>

        {/* 标签列表 */}
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div
              key={tag.id}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getDimensionColor(tag.dimension)}`}
            >
              {editingTag === tag.id ? (
                <input
                  type="text"
                  defaultValue={tag.tag}
                  autoFocus
                  onBlur={(e) => editTag(tag.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      editTag(tag.id, e.currentTarget.value);
                    }
                  }}
                  className="bg-transparent border-none outline-none text-sm w-20"
                />
              ) : (
                <>
                  <span>#{tag.tag}</span>
                  <button
                    onClick={() => setEditingTag(tag.id)}
                    className="ml-1 hover:bg-accent rounded p-0.5"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </>
              )}

              <button
                onClick={() => removeTag(tag.id)}
                className="ml-1 hover:bg-accent rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* 添加新标签 */}
          <div className="inline-flex items-center space-x-1">
            <input
              type="text"
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addNewTag();
                }
              }}
              placeholder="添加标签"
              className="px-2 py-1 border border-border rounded text-sm w-24 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={addNewTag}
              className="p-1 text-primary hover:bg-accent rounded"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 标签统计 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>维度分布: {Object.entries(
            tags.reduce((acc, tag) => {
              acc[tag.dimension] = (acc[tag.dimension] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([dim, count]) => `${dim}(${count})`).join(' • ')}</div>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="bg-accent border border-border rounded-lg p-3">
        <div className="text-sm text-primary">
          <strong>💡 使用提示：</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• 点击标签可以编辑内容</li>
            <li>• 点击"复制全部"将所有标签复制到剪贴板</li>
            <li>• 保存常用标签组合为模板，方便下次使用</li>
            <li>• 不同颜色代表不同的标签维度</li>
          </ul>
        </div>
      </div>

      {/* 删除模板确认 */}
      <AlertDialog open={deleteDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除模板</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个模板吗？该操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, id: undefined })}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 重置标签确认 */}
      <AlertDialog open={resetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置</AlertDialogTitle>
            <AlertDialogDescription>确定要重置所有标签吗？该操作将丢失未保存的更改。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetDialogOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetTags}>重置</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
