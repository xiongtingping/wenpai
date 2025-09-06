/**
 * 风格选择器组件
 * 用于选择四大核心风格：专业风格、幽默风格、真实风格、钩子风格
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Target, 
  Sparkles, 
  Heart, 
  Zap, 
  Info,
  Check,
  Palette,
  Lightbulb
} from "lucide-react";
import { 
  getAvailableStyles, 
  type StyleType,
  getStylePromptTemplate
} from '@/config/contentSchemes';

interface StyleSelectorProps {
  selectedStyle: StyleType;
  onStyleChange: (style: StyleType) => void;
  className?: string;
}

/**
 * 风格选择器组件
 */
export function StyleSelector({ 
  selectedStyle, 
  onStyleChange, 
  className 
}: StyleSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const styles = getAvailableStyles();

  const handleStyleChange = (styleId: StyleType) => {
    onStyleChange(styleId);
  };

  const getStyleIcon = (styleId: StyleType) => {
    switch (styleId) {
      case 'professional':
        return <Target className="h-4 w-4" />;
      case 'funny':
        return <Sparkles className="h-4 w-4" />;
      case 'real':
        return <Heart className="h-4 w-4" />;
      case 'hook':
        return <Zap className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  const getStyleColor = (styleId: StyleType) => {
    switch (styleId) {
      case 'professional':
        return 'bg-accent text-primary border-border';
      case 'funny':
        return 'bg-accent text-muted-foreground border-border';
      case 'real':
        return 'bg-accent text-primary border-primary';
      case 'hook':
        return 'bg-accent text-primary border-primary';
      default:
        return 'bg-accent text-foreground border-border';
    }
  };

  const getStyleGradient = (styleId: StyleType) => {
    switch (styleId) {
      case 'professional':
        return 'bg-primary text-primary-foreground';
      case 'funny':
        return 'bg-secondary text-secondary-foreground';
      case 'real':
        return 'bg-primary text-primary-foreground';
      case 'hook':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const selectedStyleInfo = styles.find(style => style.id === selectedStyle);

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">表达风格</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-1" />
              风格说明
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>四大核心风格体系</DialogTitle>
              <DialogDescription>
                选择不同的风格来获得不同调性的内容生成效果
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {styles.map((style) => {
                const styleTemplate = getStylePromptTemplate(style.id);
                return (
                  <Card key={style.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{style.icon}</span>
                        <CardTitle className="text-lg">{style.name}</CardTitle>
                        {style.id === 'professional' && (
                          <Badge variant="secondary" className="text-xs">
                            推荐
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{style.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">风格特点</h4>
                          <div className="flex flex-wrap gap-1">
                            {styleTemplate?.characteristics.map((characteristic) => (
                              <Badge 
                                key={characteristic} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {characteristic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">适用场景</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {style.id === 'professional' && (
                              <>
                                <div>• 专业报告和行业分析</div>
                                <div>• 权威发布和官方声明</div>
                                <div>• 学术研究和深度探讨</div>
                              </>
                            )}
                            {style.id === 'funny' && (
                              <>
                                <div>• 娱乐内容和搞笑视频</div>
                                <div>• 轻松话题和休闲分享</div>
                                <div>• 吸引眼球和病毒传播</div>
                              </>
                            )}
                            {style.id === 'real' && (
                              <>
                                <div>• 个人经历和真实故事</div>
                                <div>• 情感分享和共鸣内容</div>
                                <div>• 生活记录和日常分享</div>
                              </>
                            )}
                            {style.id === 'hook' && (
                              <>
                                <div>• 营销推广和产品宣传</div>
                                <div>• 爆款标题和引流内容</div>
                                <div>• 转化导向和行动引导</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {styles.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStyle === style.id 
                ? 'ring-2 ring-primary bg-accent' 
                : 'hover:bg-accent'
            }`}
            onClick={() => handleStyleChange(style.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{style.icon}</span>
                  <CardTitle className="text-base">{style.name}</CardTitle>
                </div>
                {selectedStyle === style.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <CardDescription className="text-sm">
                {style.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStyleColor(style.id)}`}
                  >
                    {style.id === 'professional' && '专业权威'}
                    {style.id === 'funny' && '幽默有趣'}
                    {style.id === 'real' && '真实温暖'}
                    {style.id === 'hook' && '高点击率'}
                  </Badge>
                  {style.id === 'professional' && (
                    <Badge variant="secondary" className="text-xs">
                      推荐
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {getStylePromptTemplate(style.id)?.characteristics &&
                    getStylePromptTemplate(style.id)!.characteristics.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{getStylePromptTemplate(style.id)!.characteristics.length - 2}
                      </Badge>
                    )
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 当前选中风格的详细信息 */}
      {selectedStyleInfo && (
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{selectedStyleInfo.icon}</span>
            <h4 className="font-medium">当前风格：{selectedStyleInfo.name}</h4>
            {selectedStyle === 'professional' && (
              <Badge variant="secondary" className="text-xs">
                推荐风格
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">风格特点</h5>
              <div className="flex flex-wrap gap-1">
                {getStylePromptTemplate(selectedStyle)?.characteristics.map((characteristic) => (
                  <Badge 
                    key={characteristic} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {characteristic}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">适用场景</h5>
              <div className="text-sm text-muted-foreground space-y-1">
                {selectedStyle === 'professional' && (
                  <>
                    <div>• 专业报告和行业分析</div>
                    <div>• 权威发布和官方声明</div>
                    <div>• 学术研究和深度探讨</div>
                  </>
                )}
                {selectedStyle === 'funny' && (
                  <>
                    <div>• 娱乐内容和搞笑视频</div>
                    <div>• 轻松话题和休闲分享</div>
                    <div>• 吸引眼球和病毒传播</div>
                  </>
                )}
                {selectedStyle === 'real' && (
                  <>
                    <div>• 个人经历和真实故事</div>
                    <div>• 情感分享和共鸣内容</div>
                    <div>• 生活记录和日常分享</div>
                  </>
                )}
                {selectedStyle === 'hook' && (
                  <>
                    <div>• 营销推广和产品宣传</div>
                    <div>• 爆款标题和引流内容</div>
                    <div>• 转化导向和行动引导</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StyleSelector;
