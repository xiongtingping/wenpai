/**
 * 方案选择器组件
 * 用于选择内容生成方案和风格
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Settings, 
  Palette,
  Info,
  Check,
  Sparkles,
  Target,
  Heart,
  Zap
} from "lucide-react";
import { 
  contentSchemes, 
  type ContentScheme,
  getAvailableStyles,
  type StyleType
} from '@/config/contentSchemes';
import { StyleSelector } from './StyleSelector';

interface SchemeSelectorProps {
  selectedScheme: string;
  selectedStyle: StyleType;
  onSchemeChange: (schemeId: string) => void;
  onStyleChange: (style: StyleType) => void;
  className?: string;
}

/**
 * 方案选择器组件
 */
export function SchemeSelector({ 
  selectedScheme, 
  selectedStyle,
  onSchemeChange, 
  onStyleChange,
  className 
}: SchemeSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheme' | 'style'>('scheme');

  const handleSchemeChange = (schemeId: string) => {
    onSchemeChange(schemeId);
  };

  const selectedSchemeInfo = contentSchemes.find(scheme => scheme.id === selectedScheme);

  return (
    <div className={className}>
      {/* 方案选择区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">内容方案</h3>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-1" />
                方案说明
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>内容生成方案与风格体系</DialogTitle>
                <DialogDescription>
                  选择不同的方案和风格来获得最佳的内容生成效果
                </DialogDescription>
              </DialogHeader>
              
              {/* 标签页切换 */}
              <div className="flex space-x-1 mb-4">
                <Button
                  variant={activeTab === 'scheme' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('scheme')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  内容方案
                </Button>
                <Button
                  variant={activeTab === 'style' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('style')}
                >
                  <Palette className="h-4 w-4 mr-1" />
                  风格体系
                </Button>
              </div>

              {activeTab === 'scheme' && (
                <div className="space-y-4">
                  {contentSchemes.map((scheme) => (
                    <Card key={scheme.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{scheme.icon}</span>
                          <CardTitle className="text-lg">{scheme.name}</CardTitle>
                          {scheme.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              默认方案
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{scheme.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2">支持平台</h4>
                            <div className="flex flex-wrap gap-1">
                              {scheme.platforms.map((platform) => (
                                <Badge 
                                  key={platform} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">核心功能</h4>
                            <div className="flex flex-wrap gap-1">
                              {scheme.features.map((feature) => (
                                <Badge 
                                  key={feature} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-4">
                  {getAvailableStyles().map((style) => (
                    <Card key={style.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{style.icon}</span>
                          <CardTitle className="text-lg">{style.name}</CardTitle>
                          {style.id === 'professional' && (
                            <Badge variant="secondary" className="text-xs">
                              推荐风格
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{style.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2">风格特点</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {style.id === 'professional' && (
                                <>
                                  <div>• 使用专业术语和行业词汇</div>
                                  <div>• 客观分析，避免主观情绪</div>
                                  <div>• 提供深度洞察和独到见解</div>
                                  <div>• 逻辑清晰，结构严谨</div>
                                </>
                              )}
                              {style.id === 'funny' && (
                                <>
                                  <div>• 使用幽默风趣的表达</div>
                                  <div>• 适当自嘲和调侃</div>
                                  <div>• 融入网络热词和流行语</div>
                                  <div>• 使用惊叹号和夸张表达</div>
                                </>
                              )}
                              {style.id === 'real' && (
                                <>
                                  <div>• 第一人称真实体验</div>
                                  <div>• 主观感受和情感表达</div>
                                  <div>• 分享个人经历和故事</div>
                                  <div>• 真实可信的表达方式</div>
                                </>
                              )}
                              {style.id === 'hook' && (
                                <>
                                  <div>• 开头设置强烈钩子</div>
                                  <div>• 精准定位目标用户</div>
                                  <div>• 高点击率和转化导向</div>
                                  <div>• 制造悬念和好奇心</div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">适用场景</h4>
                            <div className="text-sm text-gray-600 space-y-1">
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
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {contentSchemes.map((scheme) => (
            <Card 
              key={scheme.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedScheme === scheme.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSchemeChange(scheme.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{scheme.icon}</span>
                    <CardTitle className="text-base">{scheme.name}</CardTitle>
                  </div>
                  {selectedScheme === scheme.id && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {scheme.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs bg-gradient-to-r ${scheme.color} text-white border-0`}
                    >
                      {scheme.platforms.length} 平台
                    </Badge>
                    {scheme.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        默认
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {scheme.features.slice(0, 2).map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {scheme.features.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{scheme.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* 风格选择区域 */}
      <StyleSelector 
        selectedStyle={selectedStyle}
        onStyleChange={onStyleChange}
      />

      {/* 当前选择摘要 */}
      {(selectedSchemeInfo || selectedStyle) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">当前配置</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                内容方案
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedSchemeInfo?.icon}</span>
                <span className="font-medium">{selectedSchemeInfo?.name}</span>
                {selectedSchemeInfo?.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    默认
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">{selectedSchemeInfo?.description}</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                内容风格
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedStyle === 'professional' && '🎯'}
                  {selectedStyle === 'funny' && '😄'}
                  {selectedStyle === 'real' && '💝'}
                  {selectedStyle === 'hook' && '🎣'}
                </span>
                <span className="font-medium">
                  {selectedStyle === 'professional' && '专业风格'}
                  {selectedStyle === 'funny' && '幽默风格'}
                  {selectedStyle === 'real' && '真实风格'}
                  {selectedStyle === 'hook' && '钩子风格'}
                </span>
                {selectedStyle === 'professional' && (
                  <Badge variant="secondary" className="text-xs">
                    推荐
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {selectedStyle === 'professional' && '专业 + 客观 + 洞察'}
                {selectedStyle === 'funny' && '幽默 + 自嘲 + 网络热词 + 惊叹 + 标题党'}
                {selectedStyle === 'real' && '真实感 + 主观 + 分享型'}
                {selectedStyle === 'hook' && '钩子型 + 精准用户导向 + 高点击转化'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">
              <strong>组合效果：</strong>
              {selectedSchemeInfo?.name} + {selectedStyle === 'professional' ? '专业风格' : 
                selectedStyle === 'funny' ? '幽默风格' : 
                selectedStyle === 'real' ? '真实风格' : '钩子风格'} = 
              {selectedSchemeInfo?.platforms.length || 0} 平台 × 1 风格 = 
              {selectedSchemeInfo?.platforms.length || 0} 套专属提示词模板
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemeSelector; 