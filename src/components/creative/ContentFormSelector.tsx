/**
 * 内容形式选择器组件
 * 支持四大内容分类和多维提示词矩阵系统
 */

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown,
  ChevronUp,
  Check,
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
  const [isContentFormOpen, setIsContentFormOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);

  const selectedForm = selectedFormId ? getContentFormById(selectedFormId) : undefined;
  const availableStyles = getAvailableStyles();

  return (
    <div className={className}>
        {/* 内容形式选择区域 */}
        <div className="space-y-4">
          {/* 内容形式选择 */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-foreground" />
              请选择内容形式
            </h4>

          <Collapsible open={isContentFormOpen} onOpenChange={setIsContentFormOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">请选择内容形式</span>
                {selectedForm && (
                  <Badge variant="secondary" className="ml-2">
                    已选择：{selectedForm.name}
                  </Badge>
                )}
              </div>
              {isContentFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="text-sm text-foreground mb-3">
              选择内容形式来定制生成结构和风格（可选，不选择将使用平台默认结构）
            </div>

            {contentCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <h4 className="font-medium text-foreground">{category.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {category.outputDescription}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.forms.map((form) => (
                    <Card
                      key={form.id}
                      className={`cursor-pointer transition-all hover:shadow-e1 p-3 rounded-xl ${
                        selectedFormId === form.id ? 'ring-2 ring-primary bg-accent/80 backdrop-blur-sm' : 'bg-card/90 backdrop-blur-sm'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        // 🔧 FIX: 修复内容形式选择逻辑
                        if (selectedFormId === form.id) {
                          onFormChange(undefined); // 取消选择
                        } else {
                          onFormChange(form.id); // 选择新的内容形式
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base">{form.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm text-foreground">{form.name}</h5>
                            {selectedFormId === form.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-foreground mt-1 line-clamp-2">{form.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {selectedFormId && (
              <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFormChange(undefined)}
                  className="text-primary hover:text-primary"
                >
                  清除选择，使用平台默认结构
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsContentFormOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  收起选项
                </Button>
              </div>
            )}

            {/* 选择完成提示 */}
            {!selectedFormId && isContentFormOpen && (
              <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">选择一个内容形式，或收起此区域</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsContentFormOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  收起选项
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        </div>

        {/* 表达风格选择 */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-foreground" />
            请选择表达风格
          </h4>

        <Collapsible open={isStyleOpen} onOpenChange={setIsStyleOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                {selectedStyle ? (
                  <>
                    <span className="text-sm font-medium text-foreground">请选择表达风格</span>
                    <Badge variant="secondary" className="ml-2">
                      已选择：{availableStyles.find(s => s.id === selectedStyle)?.name}
                    </Badge>
                  </>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">请选择表达风格</span>
                )}
              </div>
              {isStyleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-4">
            <div className="text-sm text-foreground mb-3">
              选择表达风格来调整语气、情绪和调性
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all hover:shadow-e1 p-3 rounded-xl ${
                    selectedStyle === style.id ? 'ring-2 ring-primary bg-accent/80 backdrop-blur-sm' : 'bg-card/90 backdrop-blur-sm'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    // 🔧 FIX: 修复表达风格选择逻辑
                    if (selectedStyle === style.id) {
                      onStyleChange(undefined); // 完全取消选择
                    } else {
                      onStyleChange(style.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{style.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm text-foreground">{style.name}</h5>
                        {selectedStyle === style.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-foreground mt-1">{style.description}</p>
                      {selectedStyle === style.id && (
                        <p className="text-xs text-primary mt-1 font-medium">
                          点击可取消选择
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 表达风格收起按钮和取消选择 */}
            <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedStyle ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      当前风格：{availableStyles.find(s => s.id === selectedStyle)?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStyleChange(undefined)}
                      className="text-destructive hover:text-destructive text-xs"
                    >
                      点击可取消选择
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    未选择表达风格，将使用自然表达方式
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStyleOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                收起选项
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </div>


        </div>
      </div>
  );
}

export default ContentFormSelector;
