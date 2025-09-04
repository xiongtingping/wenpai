/**
 * 内容设置组件
 * 负责内容形式和风格的选择
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Palette, 
  Sparkles,
  Info
} from 'lucide-react';
import { useAdaptPage } from '../../AdaptPageProvider';
import { cn } from '@/lib/utils';

// ========================================================================================
// 内容形式选项
// ========================================================================================

const contentForms = [
  { 
    value: 'auto', 
    label: '自动适配', 
    description: '根据平台特性自动选择最佳形式' 
  },
  { 
    value: 'article', 
    label: '文章形式', 
    description: '结构化的长篇内容，适合深度阅读' 
  },
  { 
    value: 'social', 
    label: '社交动态', 
    description: '简洁有趣的社交媒体内容' 
  },
  { 
    value: 'story', 
    label: '故事叙述', 
    description: '以故事形式展现，增强代入感' 
  },
  { 
    value: 'tutorial', 
    label: '教程指南', 
    description: '步骤清晰的操作指导' 
  },
  { 
    value: 'review', 
    label: '评测推荐', 
    description: '产品评测或推荐内容' 
  },
  { 
    value: 'qa', 
    label: '问答形式', 
    description: '问题解答式的内容结构' 
  },
];

// ========================================================================================
// 内容风格选项
// ========================================================================================

const contentSchemes = [
  { 
    value: 'auto', 
    label: '自动适配', 
    description: '根据内容和平台自动选择风格' 
  },
  { 
    value: 'professional', 
    label: '专业严谨', 
    description: '正式、专业的表达方式' 
  },
  { 
    value: 'casual', 
    label: '轻松随意', 
    description: '亲切、随和的交流语调' 
  },
  { 
    value: 'humorous', 
    label: '幽默风趣', 
    description: '轻松幽默，增加趣味性' 
  },
  { 
    value: 'inspiring', 
    label: '励志激励', 
    description: '积极向上，激发正能量' 
  },
  { 
    value: 'storytelling', 
    label: '故事化', 
    description: '以故事形式娓娓道来' 
  },
  { 
    value: 'analytical', 
    label: '分析型', 
    description: '逻辑清晰，深入分析' 
  },
];

// ========================================================================================
// 组件Props
// ========================================================================================

interface ContentSettingsProps {
  className?: string;
}

// ========================================================================================
// 主组件
// ========================================================================================

export function ContentSettings({ className }: ContentSettingsProps) {
  const { state, events } = useAdaptPage();

  const {
    selectedContentForm,
    selectedContentScheme,
    isGenerating,
  } = state;

  const {
    onContentFormChange,
    onContentSchemeChange,
  } = events;

  const selectedForm = contentForms.find(form => form.value === selectedContentForm);
  const selectedScheme = contentSchemes.find(scheme => scheme.value === selectedContentScheme);

  return (
    <div className={cn('space-y-6', className)}>
      {/* 内容形式选择 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">内容形式</Label>
        </div>
        
        <SimpleSelect
          value={selectedContentForm}
          options={contentForms}
          onValueChange={onContentFormChange}
          disabled={isGenerating}
          placeholder="选择内容形式..."
          className="w-full"
        />
        
        {selectedForm && selectedForm.value !== 'auto' && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {selectedForm.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedForm.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 内容风格选择 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">内容风格</Label>
        </div>
        
        <SimpleSelect
          value={selectedContentScheme}
          options={contentSchemes}
          onValueChange={onContentSchemeChange}
          disabled={isGenerating}
          placeholder="选择内容风格..."
          className="w-full"
        />
        
        {selectedScheme && selectedScheme.value !== 'auto' && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {selectedScheme.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedScheme.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 组合效果预览 */}
      {(selectedForm?.value !== 'auto' || selectedScheme?.value !== 'auto') && (
        <Card className="bg-accent/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                组合效果
              </Badge>
            </div>
            <div className="text-sm text-foreground">
              将生成
              <span className="font-medium text-primary mx-1">
                {selectedForm?.label || '自动适配'}
              </span>
              风格的
              <span className="font-medium text-primary mx-1">
                {selectedScheme?.label || '自动适配'}
              </span>
              内容
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用提示 */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <div className="font-medium mb-1">💡 使用建议：</div>
              <ul className="space-y-1">
                <li>• 选择"自动适配"可根据平台特性智能调整</li>
                <li>• 不同平台会根据设置自动优化内容风格</li>
                <li>• 可在平台设置中进一步定制化调整</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentSettings;
