/**
 * 文件格式展示组件
 * 用于展示支持的文件格式信息
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

import FileFormatSupportService from '@/services/fileFormatSupportService';
import { 
  getFormatsGroupedByCategory, 
  CATEGORY_NAMES, 
  FileFormatInfo 
} from '@/config/fileFormatConfig';

interface FileFormatDisplayProps {
  mode?: 'compact' | 'detailed' | 'summary';
  showCategories?: boolean;
  showQuality?: boolean;
  className?: string;
}

export default function FileFormatDisplay({ 
  mode = 'compact',
  showCategories = true,
  showQuality = true,
  className = ''
}: FileFormatDisplayProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const formatService = FileFormatSupportService.getInstance();
  const groupedFormats = getFormatsGroupedByCategory();
  const summary = formatService.getFormatSupportSummary();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'fair': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'limited': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return '完美支持';
      case 'good': return '良好支持';
      case 'fair': return '基础支持';
      case 'limited': return '有限支持';
      default: return '未知';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      case 'limited': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (mode === 'summary') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            文件格式支持概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalFormats}</div>
              <div className="text-sm text-gray-600">总计格式</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.supportLevels.excellent}</div>
              <div className="text-sm text-gray-600">完美支持</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.supportLevels.good}</div>
              <div className="text-sm text-gray-600">良好支持</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.supportLevels.fair}</div>
              <div className="text-sm text-gray-600">基础支持</div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {formatService.generateUserFriendlyDescription()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'compact') {
    return (
      <div className={`space-y-2 text-center ${className}`}>
        <div className="text-sm font-medium text-gray-700">
          支持 {summary.totalFormats} 种文件格式
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {Object.entries(groupedFormats).map(([category, formats]) => {
            if (formats.length === 0) return null;
            const categoryName = CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES];
            return (
              <Badge key={category} variant="outline" className="text-xs">
                {categoryName} ({formats.length})
              </Badge>
            );
          })}
        </div>
        <div className="text-xs text-gray-500">
          文档、表格、演示、文本、图片等格式，支持批量上传和网页内容提取
        </div>
      </div>
    );
  }

  // detailed mode
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          支持的文件格式 ({summary.totalFormats} 种)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCategories && Object.entries(groupedFormats).map(([category, formats]) => {
          if (formats.length === 0) return null;
          
          const categoryName = CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES];
          const isExpanded = expandedCategories.has(category);
          
          return (
            <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{formats[0]?.icon || '📁'}</span>
                    <span className="font-medium">{categoryName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formats.length} 种
                    </Badge>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2 mt-2 ml-4">
                {formats.map((format: FileFormatInfo) => (
                  <div key={format.extension} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {format.extension}
                        </span>
                        <span className="font-medium">{format.name}</span>
                      </div>
                      {showQuality && (
                        <div className="flex items-center gap-1">
                          {getQualityIcon(format.parseQuality)}
                          <Badge className={`text-xs ${getQualityColor(format.parseQuality)}`}>
                            {getQualityText(format.parseQuality)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {format.description}
                    </div>
                    
                    {format.features && format.features.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-green-700">✅ 支持功能:</div>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {format.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {format.limitations && format.limitations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-orange-700">⚠️ 使用限制:</div>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {format.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {format.recommendations && format.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-blue-700">💡 使用建议:</div>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {format.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</div>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• 推荐格式：.txt, .docx, .xlsx, .pdf (解析效果最佳)</div>
            <div>• PDF文档：已支持无页数限制完整解析</div>
            <div>• PowerPoint：.pptx 支持文本提取，.ppt 建议转换</div>
            <div>• 图片格式：支持OCR识别，需要清晰文字内容</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
