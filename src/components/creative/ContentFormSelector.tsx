/**
 * 内容形式选择器组件
 * 支持四大内容分类和多维提示词矩阵系统
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Sparkles,
  Target,
  Heart,
  Zap
} from "lucide-react";
import { 
  contentCategories, 
  type ContentForm,
  type ContentCategory,
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
  // 新增props用于动态预览
  selectedPlatforms?: string[];
  useBrandLibrary?: boolean;
  customPrompt?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

export function ContentFormSelector({
  selectedFormId,
  selectedStyle,
  onFormChange,
  onStyleChange,
  className,
  selectedPlatforms = [],
  useBrandLibrary = false,
  customPrompt = '',
  onCustomPromptChange
}: ContentFormSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContentFormOpen, setIsContentFormOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);

  const selectedForm = selectedFormId ? getContentFormById(selectedFormId) : undefined;
  const availableStyles = getAvailableStyles();

  return (
    <TooltipProvider>
      <div className={className}>
        {/* 内容形式选择区域 */}
        <div className="space-y-4">
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>内容形式与表达风格体系</DialogTitle>
                <DialogDescription>
                  选择不同的内容形式和表达风格来获得最佳的内容生成效果
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {contentCategories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h4 className="text-lg font-semibold">{category.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {category.outputDescription}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.forms.map((form) => (
                        <Card key={form.id} className="p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{form.icon}</span>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{form.name}</h5>
                              <p className="text-xs text-gray-600 mt-1">{form.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

          {/* 内容形式选择 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Target className="h-4 w-4" />
                选择内容形式
              </h4>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>查看详细说明</p>
                    </TooltipContent>
                  </Tooltip>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>内容形式与表达风格体系</DialogTitle>
                    <DialogDescription>
                      选择不同的内容形式和表达风格来获得最佳的内容生成效果
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {contentCategories.map((category) => (
                      <div key={category.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.icon}</span>
                          <h4 className="text-lg font-semibold">{category.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {category.outputDescription}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{category.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {category.forms.map((form) => (
                            <Card key={form.id} className="p-3">
                              <div className="flex items-start gap-2">
                                <span className="text-lg">{form.icon}</span>
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{form.name}</h5>
                                  <p className="text-xs text-gray-600 mt-1">{form.description}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

          <Collapsible open={isContentFormOpen} onOpenChange={setIsContentFormOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">选择内容形式</span>
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
            <div className="text-sm text-gray-600 mb-3">
              选择内容形式来定制生成结构和风格（可选，不选择将使用平台默认结构）
            </div>
            
            {contentCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <h4 className="font-medium">{category.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {category.outputDescription}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.forms.map((form) => (
                    <Card 
                      key={form.id} 
                      className={`cursor-pointer transition-all hover:shadow-md p-3 ${
                        selectedFormId === form.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        const newFormId = selectedFormId === form.id ? undefined : form.id;
                        onFormChange(newFormId);
                        // 移除自动折叠逻辑，让用户手动决定何时收起
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base">{form.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{form.name}</h5>
                            {selectedFormId === form.id && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{form.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {selectedFormId && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFormChange(undefined)}
                  className="text-blue-700 hover:text-blue-800"
                >
                  清除选择，使用平台默认结构
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsContentFormOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  收起选项
                </Button>
              </div>
            )}

            {/* 选择完成提示 */}
            {!selectedFormId && isContentFormOpen && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">选择一个内容形式，或收起此区域</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsContentFormOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
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
          <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4" />
            请选择表达风格
          </h4>

        <Collapsible open={isStyleOpen} onOpenChange={setIsStyleOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                {selectedStyle ? (
                  <>
                    <span className="text-sm font-medium text-gray-600">表达风格</span>
                    <Badge variant="secondary" className="ml-2">
                      {availableStyles.find(s => s.id === selectedStyle)?.name}
                    </Badge>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-600">请选择表达风格</span>
                )}
              </div>
              {isStyleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-4">
            <div className="text-sm text-gray-600 mb-3">
              选择表达风格来调整语气、情绪和调性
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all hover:shadow-md p-3 ${
                    selectedStyle === style.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    // 如果点击的是已选中的风格，则取消选择
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
                        <h5 className="font-medium text-sm">{style.name}</h5>
                        {selectedStyle === style.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                      {selectedStyle === style.id && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          点击可取消选择
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 表达风格收起按钮和取消选择 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedStyle ? (
                  <>
                    <span className="text-sm text-gray-600">
                      当前风格：{availableStyles.find(s => s.id === selectedStyle)?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStyleChange(undefined)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      点击可取消选择
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">
                    未选择表达风格，将使用自然表达方式
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStyleOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                收起选项
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </div>

        {/* 自定义提示词输入 */}
        <div className="mt-6 pt-6 border-t">
          <Label htmlFor="custom-prompt" className="text-sm font-medium text-gray-700">
            自定义提示词（可选）
          </Label>
          <Textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => onCustomPromptChange?.(e.target.value)}
            placeholder="如：特定的表达方式、关键词、语气风格等..."
            className="mt-2 min-h-[60px] text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            输入您的个性化创作要求，将与系统提示词结合使用
          </p>
        </div>


        </div>
      </div>
    </TooltipProvider>
  );
}

export default ContentFormSelector;
