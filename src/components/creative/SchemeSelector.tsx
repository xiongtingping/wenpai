/**
 * 方案选择器组件
 * 用于选择不同的内容适配方案
 */

import React, { useState, useEffect } from 'react';
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
  Palette, 
  Sparkles, 
  Target, 
  BookOpen, 
  Settings,
  Check,
  Info,
  Globe,
  Zap,
  Users
} from "lucide-react";
import { 
  contentSchemes, 
  getContentScheme, 
  type ContentScheme 
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
    setSchemes(contentSchemes);
    
    const currentScheme = getContentScheme(selectedSchemeId) || contentSchemes[0];
    setSelectedScheme(currentScheme);
  }, [selectedSchemeId]);

  const handleSchemeChange = (schemeId: string) => {
    const scheme = getContentScheme(schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      onSchemeChange(schemeId);
    }
  };

  const getSchemeIcon = (schemeId: string) => {
    switch (schemeId) {
      case 'global-adaptation':
        return <Globe className="h-4 w-4" />;
      case 'universal':
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
      case 'global-adaptation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'universal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'marketing':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'creative':
        return 'bg-pink-50 text-pink-700 border-pink-200';
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
                      <span className="text-2xl">{scheme.icon}</span>
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
                        <h4 className="font-medium text-sm mb-2">特色功能</h4>
                        <div className="flex flex-wrap gap-1">
                          {scheme.features.map((feature) => (
                            <Badge 
                              key={feature} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  <span className="text-xl">{scheme.icon}</span>
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
                    {scheme.platforms.length}个平台
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {scheme.features.length}项功能
                  </Badge>
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

      {/* 当前选中方案的详细信息 */}
      {selectedScheme && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{selectedScheme.icon}</span>
            <h4 className="font-medium">当前方案：{selectedScheme.name}</h4>
            {selectedScheme.isDefault && (
              <Badge variant="secondary" className="text-xs">
                默认方案
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">支持平台</h5>
              <div className="flex flex-wrap gap-1">
                {selectedScheme.platforms.map((platform) => (
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
              <h5 className="font-medium mb-2">核心功能</h5>
              <div className="flex flex-wrap gap-1">
                {selectedScheme.features.map((feature) => (
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
        </div>
      )}
    </div>
  );
}

export default SchemeSelector; 