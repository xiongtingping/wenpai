/**
 * 内容形式选择器组件 - 彻底重构版本
 * 使用简单的React下拉菜单，避免复杂的DOM操作和定位问题
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target,
  Heart
} from "lucide-react";
import { 
  contentCategories, 
  getContentFormById
} from '@/config/contentForms';
import { 
  getAvailableStyles,
  type StyleType
} from '@/config/contentSchemes';

interface ContentFormSelectorProps {
  selectedFormId?: string;
  selectedStyle?: StyleType;
  onFormChange: (formId: string | undefined) => void;
  onStyleChange: (style: StyleType | undefined) => void;
  className?: string;
}

export function ContentFormSelector({
  selectedFormId,
  selectedStyle,
  onFormChange,
  onStyleChange,
  className
}: ContentFormSelectorProps) {
  const selectedForm = selectedFormId ? getContentFormById(selectedFormId) : undefined;
  const availableStyles = getAvailableStyles();

  const handleFormSelect = (formId: string | undefined) => {
    if (selectedFormId === formId) {
      onFormChange(undefined); // 取消选择
    } else {
      onFormChange(formId); // 选择新的
    }
  };

  const handleStyleSelect = (styleId: StyleType | undefined) => {
    if (selectedStyle === styleId) {
      onStyleChange(undefined); // 取消选择
    } else {
      onStyleChange(styleId); // 选择新的
    }
  };

  return (
    <div className={`${className} w-full space-y-6`}>
      {/* 内容形式选择 - 外显式 */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-foreground" />
            请选择内容形式
          </h4>
          
          <div className="text-sm text-muted-foreground mb-4">
            选择内容形式来定制生成结构和风格（可选，不选择将使用平台默认结构）
          </div>
          
          {/* 当前选择显示 */}
          {selectedForm && (
            <div className="mb-4 p-3 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{selectedForm.icon}</span>
                  <div>
                    <span className="font-medium text-sm text-foreground">已选择：{selectedForm.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedForm.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormSelect(undefined)}
                  className="text-xs"
                >
                  清除选择
                </Button>
              </div>
            </div>
          )}
          
          {contentCategories.map((category) => (
            <div key={category.name} className="space-y-3 mb-6">
              {/* 分类标题 */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <h4 className="font-medium text-foreground">{category.name}</h4>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {category.outputDescription}
                </span>
              </div>
              
              {/* 表单网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {category.forms.map((form) => (
                  <div
                    key={form.id}
                    className={`cursor-pointer transition-all hover:shadow-sm p-3 rounded-xl border ${
                      selectedFormId === form.id ? 'border-primary bg-accent/80' : 'border-border bg-card/90 hover:border-border/70'
                    }`}
                    onClick={() => handleFormSelect(form.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base">{form.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm text-foreground">{form.name}</h5>
                          {selectedFormId === form.id && <span className="text-primary">✓</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{form.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 表达风格选择 - 外显式 */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Heart className="h-4 w-4 text-foreground" />
            请选择表达风格
          </h4>
          
          <div className="text-sm text-muted-foreground mb-4">
            选择表达风格来调整语气、情绪和调性
          </div>
          
          {/* 当前选择显示 */}
          {selectedStyle && (
            <div className="mb-4 p-3 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{availableStyles.find(s => s.id === selectedStyle)?.icon}</span>
                  <div>
                    <span className="font-medium text-sm text-foreground">已选择：{availableStyles.find(s => s.id === selectedStyle)?.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{availableStyles.find(s => s.id === selectedStyle)?.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStyleSelect(undefined)}
                  className="text-xs"
                >
                  清除选择
                </Button>
              </div>
            </div>
          )}
          
          {/* 风格网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableStyles.map((style) => (
              <div
                key={style.id}
                className={`cursor-pointer transition-all hover:shadow-sm p-3 rounded-xl border ${
                  selectedStyle === style.id ? 'border-primary bg-accent/80' : 'border-border bg-card/90 hover:border-border/70'
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{style.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm text-foreground">{style.name}</h5>
                      {selectedStyle === style.id && <span className="text-primary">✓</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 底部提示 */}
          {!selectedStyle && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              未选择表达风格，将使用自然表达方式
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentFormSelector;