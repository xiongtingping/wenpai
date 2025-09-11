/**
 * 内容形式选择器组件 - 彻底重构版本
 * 使用简单的React下拉菜单，避免复杂的DOM操作和定位问题
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import './ContentFormSelector.css';
import { 
  ChevronDown,
  ChevronUp,
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
  const [contentFormDropUp, setContentFormDropUp] = useState(false);
  const [styleDropUp, setStyleDropUp] = useState(false);
  
  const contentFormButtonRef = useRef<HTMLButtonElement>(null);
  const styleButtonRef = useRef<HTMLButtonElement>(null);

  const selectedForm = selectedFormId ? getContentFormById(selectedFormId) : undefined;
  const availableStyles = getAvailableStyles();

  // 检测下拉菜单应该向上还是向下展开
  const checkDropDirection = (buttonRef: React.RefObject<HTMLButtonElement>, dropdownHeight: number = 200) => {
    if (!buttonRef.current) return false;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    
    // 如果下方空间不足且上方空间更充足，则向上展开
    return spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
  };

  // 监听下拉菜单展开状态变化，动态调整方向
  useEffect(() => {
    if (isContentFormOpen) {
      setContentFormDropUp(checkDropDirection(contentFormButtonRef));
    }
  }, [isContentFormOpen]);

  useEffect(() => {
    if (isStyleOpen) {
      setStyleDropUp(checkDropDirection(styleButtonRef));
    }
  }, [isStyleOpen]);

  // 监听窗口大小变化，重新计算下拉方向
  useEffect(() => {
    const handleResize = () => {
      if (isContentFormOpen) {
        setContentFormDropUp(checkDropDirection(contentFormButtonRef));
      }
      if (isStyleOpen) {
        setStyleDropUp(checkDropDirection(styleButtonRef));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isContentFormOpen, isStyleOpen]);

  const handleFormSelect = (formId: string | undefined) => {
    if (selectedFormId === formId) {
      onFormChange(undefined); // 取消选择
    } else {
      onFormChange(formId); // 选择新的
    }
    setIsContentFormOpen(false);
  };

  const handleStyleSelect = (styleId: StyleType | undefined) => {
    if (selectedStyle === styleId) {
      onStyleChange(undefined); // 取消选择
    } else {
      onStyleChange(styleId); // 选择新的
    }
    setIsStyleOpen(false);
  };

  return (
    <div className={`${className} w-full space-y-4`}>
      {/* 内容形式选择 */}
      <div className="space-y-3 w-full relative">
        <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-foreground" />
          请选择内容形式
        </h4>

        <div className="w-full relative">
          <Button 
            ref={contentFormButtonRef}
            variant="outline" 
            className="w-full justify-between"
            onClick={() => setIsContentFormOpen(!isContentFormOpen)}
          >
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

          {/* 内容形式下拉菜单 */}
          {isContentFormOpen && (
            <Card className={`absolute w-full z-10 max-h-64 overflow-y-auto shadow-lg border bg-card ${
              contentFormDropUp 
                ? 'bottom-full mb-2 dropdown-up' 
                : 'top-full mt-2 dropdown-down'
            }`}>
              <CardContent className="p-4">
                <div className="text-sm text-foreground mb-3">
                  选择内容形式来定制生成结构和风格（可选，不选择将使用平台默认结构）
                </div>
                
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.forms.map((form) => (
                        <div
                          key={form.id}
                          className={`cursor-pointer transition-all hover:shadow-sm p-3 rounded-xl border ${
                            selectedFormId === form.id ? 'border-primary bg-accent/80' : 'border-border bg-card/90'
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
                              <p className="text-xs text-foreground mt-1">{form.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* 底部按钮 */}
                <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
                  <button
                    className="text-primary hover:text-primary text-sm"
                    onClick={() => handleFormSelect(undefined)}
                  >
                    清除选择，使用平台默认结构
                  </button>
                  <button
                    className="text-muted-foreground hover:text-foreground text-sm"
                    onClick={() => setIsContentFormOpen(false)}
                  >
                    收起选项
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 表达风格选择 */}
      <div className="space-y-3 w-full relative">
        <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-foreground" />
          请选择表达风格
        </h4>

        <div className="w-full relative">
          <Button 
            ref={styleButtonRef}
            variant="outline" 
            className="w-full justify-between"
            onClick={() => setIsStyleOpen(!isStyleOpen)}
          >
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

          {/* 风格下拉菜单 */}
          {isStyleOpen && (
            <Card className={`absolute w-full z-10 max-h-64 overflow-y-auto shadow-lg border bg-card ${
              styleDropUp 
                ? 'bottom-full mb-2 dropdown-up' 
                : 'top-full mt-2 dropdown-down'
            }`}>
              <CardContent className="p-4">
                <div className="text-sm text-foreground mb-3">
                  选择表达风格来调整语气、情绪和调性
                </div>
                
                {/* 风格网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableStyles.map((style) => (
                    <div
                      key={style.id}
                      className={`cursor-pointer transition-all hover:shadow-sm p-3 rounded-xl border ${
                        selectedStyle === style.id ? 'border-primary bg-accent/80' : 'border-border bg-card/90'
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
                          <p className="text-xs text-foreground mt-1">{style.description}</p>
                          {selectedStyle === style.id && (
                            <p className="text-xs text-primary mt-1 font-medium">点击可取消选择</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 底部状态和按钮 */}
                <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedStyle ? (
                      <>
                        <span className="text-sm text-muted-foreground">
                          当前风格：{availableStyles.find(s => s.id === selectedStyle)?.name}
                        </span>
                        <button
                          className="text-destructive hover:text-destructive text-xs"
                          onClick={() => handleStyleSelect(undefined)}
                        >
                          点击可取消选择
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        未选择表达风格，将使用自然表达方式
                      </span>
                    )}
                  </div>
                  <button
                    className="text-muted-foreground hover:text-foreground text-sm"
                    onClick={() => setIsStyleOpen(false)}
                  >
                    收起选项
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {(isContentFormOpen || isStyleOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsContentFormOpen(false);
            setIsStyleOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default ContentFormSelector;