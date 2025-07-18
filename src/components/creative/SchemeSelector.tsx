/**
 * 方案选择器组件
 * 允许用户选择不同的内容适配方案
 */

import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Palette, 
  Sparkles, 
  Target, 
  BookOpen, 
  Settings,
  Check,
  Info
} from "lucide-react";
import { 
  getAllSchemes, 
  getScheme, 
  type ContentScheme,
  type PlatformScheme 
} from '@/config/contentSchemes';

interface SchemeSelectorProps {
  selectedSchemeId: string;
  onSchemeChange: (schemeId: string) => void;
  className?: string;
}

/**
 * 方案选择器组件
 */
export function SchemeSelector({ 
  selectedSchemeId, 
  onSchemeChange, 
  className 
}: SchemeSelectorProps) {
  const [schemes, setSchemes] = useState<ContentScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<ContentScheme | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const availableSchemes = getAllSchemes();
    setSchemes(availableSchemes);
    
    const currentScheme = getScheme(selectedSchemeId) || availableSchemes[0];
    setSelectedScheme(currentScheme);
  }, [selectedSchemeId]);

  const handleSchemeChange = (schemeId: string) => {
    const scheme = getScheme(schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      onSchemeChange(schemeId);
    }
  };

  const getSchemeIcon = (schemeId: string) => {
    switch (schemeId) {
      case 'default':
        return <Palette className="h-4 w-4" />;
      case 'marketing':
        return <Target className="h-4 w-4" />;
      case 'creative':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getSchemeColor = (schemeId: string) => {
    switch (schemeId) {
      case 'default':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'marketing':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'creative':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!selectedScheme) {
    return <div>加载中...</div>;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">内容适配方案</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-1" />
              方案说明
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>内容适配方案说明</DialogTitle>
              <DialogDescription>
                选择不同的方案来获得不同风格的内容适配效果
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {schemes.map((scheme) => (
                <Card key={scheme.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getSchemeIcon(scheme.id)}
                      <CardTitle className="text-lg">{scheme.name}</CardTitle>
                      {scheme.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          默认
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{scheme.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">全局设置</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>默认语调: {scheme.globalSettings.defaultTone}</div>
                          <div>表情使用: {scheme.globalSettings.emojiUsage}</div>
                          <div>格式样式: {scheme.globalSettings.formatStyle}</div>
                          <div>语言风格: {scheme.globalSettings.languageStyle}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">支持平台</h4>
                        <div className="flex flex-wrap gap-1">
                          {scheme.platforms.map((platform) => (
                            <Badge 
                              key={platform.platformId} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {platform.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">标签</h4>
                        <div className="flex flex-wrap gap-1">
                          {scheme.metadata.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {schemes.map((scheme) => (
          <Card 
            key={scheme.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedScheme.id === scheme.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSchemeChange(scheme.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSchemeIcon(scheme.id)}
                  <CardTitle className="text-base">{scheme.name}</CardTitle>
                </div>
                {selectedScheme.id === scheme.id && (
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
                    className={`text-xs ${getSchemeColor(scheme.id)}`}
                  >
                    {scheme.globalSettings.defaultTone}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {scheme.platforms.length}个平台
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {scheme.metadata.tags.slice(0, 2).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {scheme.metadata.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{scheme.metadata.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 方案详情展示 */}
      {selectedScheme && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <CardTitle className="text-base">当前方案: {selectedScheme.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">平台配置</h4>
                <div className="space-y-2">
                  {selectedScheme.platforms.map((platform) => (
                    <div key={platform.platformId} className="flex items-center justify-between text-sm">
                      <span>{platform.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {platform.wordLimit.min}-{platform.wordLimit.max}字
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {platform.hashtagCount}标签
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">全局设置</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>默认语调:</span>
                    <span className="font-medium">{selectedScheme.globalSettings.defaultTone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>表情使用:</span>
                    <span className="font-medium">{selectedScheme.globalSettings.emojiUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>格式样式:</span>
                    <span className="font-medium">{selectedScheme.globalSettings.formatStyle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>语言风格:</span>
                    <span className="font-medium">{selectedScheme.globalSettings.languageStyle}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SchemeSelector; 