/**
 * 卡片模板选择器组件
 * 提供模板选择、预览和配置功能
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Filter,
  Image,
  Square,
  Smartphone,
  Monitor,
  CreditCard,
  GraduationCap,
  Briefcase,
  Users,
  BookOpen,
  Sparkles,
  Star,
  Lock
} from 'lucide-react';

// 卡片模板接口
export interface CardTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'knowledge' | 'social' | 'business' | 'education';
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  previewImage: string;
  isCustomizable: boolean;
  isFree: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  tags: string[];
  constraints: {
    maxSections: number;
    maxWordsPerSection: number;
    allowImages: boolean;
    allowLists: boolean;
  };
}

// 预定义模板
export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'knowledge-simple',
    name: 'knowledge-simple',
    displayName: '简约知识卡',
    description: '简洁明了的知识点展示，适合学习笔记和要点总结',
    category: 'knowledge',
    dimensions: { width: 800, height: 600, aspectRatio: '4:3' },
    previewImage: '/templates/knowledge-simple.png',
    isCustomizable: true,
    isFree: true,
    isPopular: true,
    tags: ['简约', '知识', '学习'],
    constraints: {
      maxSections: 5,
      maxWordsPerSection: 50,
      allowImages: false,
      allowLists: true
    }
  },
  {
    id: 'knowledge-infographic',
    name: 'knowledge-infographic',
    displayName: '信息图表卡',
    description: '支持数据可视化的信息图表样式',
    category: 'knowledge',
    dimensions: { width: 1000, height: 800, aspectRatio: '5:4' },
    previewImage: '/templates/knowledge-infographic.png',
    isCustomizable: true,
    isFree: false,
    tags: ['信息图', '数据', '可视化'],
    constraints: {
      maxSections: 6,
      maxWordsPerSection: 40,
      allowImages: true,
      allowLists: true
    }
  },
  {
    id: 'social-story',
    name: 'social-story',
    displayName: 'Stories卡片',
    description: 'Instagram Stories风格，9:16竖屏比例',
    category: 'social',
    dimensions: { width: 540, height: 960, aspectRatio: '9:16' },
    previewImage: '/templates/social-story.png',
    isCustomizable: true,
    isFree: false,
    isPopular: true,
    tags: ['社交', '竖屏', 'Stories'],
    constraints: {
      maxSections: 3,
      maxWordsPerSection: 30,
      allowImages: true,
      allowLists: false
    }
  },
  {
    id: 'social-square',
    name: 'social-square',
    displayName: '社交方图',
    description: '1:1正方形格式，适合各种社交平台',
    category: 'social',
    dimensions: { width: 800, height: 800, aspectRatio: '1:1' },
    previewImage: '/templates/social-square.png',
    isCustomizable: true,
    isFree: true,
    isNew: true,
    tags: ['正方形', '社交', '通用'],
    constraints: {
      maxSections: 4,
      maxWordsPerSection: 40,
      allowImages: true,
      allowLists: true
    }
  },
  {
    id: 'business-info',
    name: 'business-info',
    displayName: '商务信息卡',
    description: '专业的商务信息展示，适合产品介绍',
    category: 'business',
    dimensions: { width: 1200, height: 630, aspectRatio: '1.91:1' },
    previewImage: '/templates/business-info.png',
    isCustomizable: true,
    isFree: false,
    tags: ['商务', '专业', '产品'],
    constraints: {
      maxSections: 4,
      maxWordsPerSection: 60,
      allowImages: true,
      allowLists: true
    }
  },
  {
    id: 'business-team',
    name: 'business-team',
    displayName: '团队名片',
    description: '团队或个人介绍的专业名片样式',
    category: 'business',
    dimensions: { width: 800, height: 500, aspectRatio: '8:5' },
    previewImage: '/templates/business-team.png',
    isCustomizable: true,
    isFree: false,
    tags: ['团队', '名片', '介绍'],
    constraints: {
      maxSections: 3,
      maxWordsPerSection: 50,
      allowImages: true,
      allowLists: false
    }
  },
  {
    id: 'education-steps',
    name: 'education-steps',
    displayName: '步骤指南卡',
    description: '流程化展示操作步骤，适合教程和指南',
    category: 'education',
    dimensions: { width: 900, height: 700, aspectRatio: '9:7' },
    previewImage: '/templates/education-steps.png',
    isCustomizable: true,
    isFree: true,
    tags: ['教育', '步骤', '指南'],
    constraints: {
      maxSections: 6,
      maxWordsPerSection: 35,
      allowImages: false,
      allowLists: true
    }
  },
  {
    id: 'education-summary',
    name: 'education-summary',
    displayName: '知识总结卡',
    description: '课程总结和知识梳理的专用模板',
    category: 'education',
    dimensions: { width: 800, height: 600, aspectRatio: '4:3' },
    previewImage: '/templates/education-summary.png',
    isCustomizable: true,
    isFree: false,
    isNew: true,
    tags: ['教育', '总结', '课程'],
    constraints: {
      maxSections: 5,
      maxWordsPerSection: 45,
      allowImages: false,
      allowLists: true
    }
  }
];

// 分类图标映射
const CATEGORY_ICONS = {
  knowledge: BookOpen,
  social: Users,
  business: Briefcase,
  education: GraduationCap
};

// 分类颜色映射
const CATEGORY_COLORS = {
  knowledge: 'bg-blue-100 text-blue-800',
  social: 'bg-pink-100 text-pink-800',
  business: 'bg-green-100 text-green-800',
  education: 'bg-purple-100 text-purple-800'
};

interface TemplateCardProps {
  template: CardTemplate;
  isSelected: boolean;
  onSelect: (template: CardTemplate) => void;
  showDetails?: boolean;
}

/**
 * 单个模板卡片组件
 */
const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  isSelected, 
  onSelect, 
  showDetails = false 
}) => {
  const CategoryIcon = CATEGORY_ICONS[template.category];
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${!template.isFree ? 'relative' : ''}`}
      onClick={() => onSelect(template)}
    >
      <CardContent className="p-3">
        {/* 预览图片区域 */}
        <div className="relative aspect-video bg-muted rounded mb-3 flex items-center justify-center overflow-hidden">
          {template.previewImage ? (
            <img 
              src={template.previewImage} 
              alt={template.displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 图片加载失败时显示占位符
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <CategoryIcon className="w-8 h-8 mb-2" />
              <span className="text-xs">{template.displayName}</span>
            </div>
          )}
          
          {/* 付费标识 */}
          {!template.isFree && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Pro
            </div>
          )}
          
          {/* 热门/新标识 */}
          {template.isPopular && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              热门
            </div>
          )}
          
          {template.isNew && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              新
            </div>
          )}
        </div>

        {/* 模板信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium truncate">{template.displayName}</h4>
            <Badge 
              variant="secondary" 
              className={`text-xs ${CATEGORY_COLORS[template.category]}`}
            >
              <CategoryIcon className="w-3 h-3 mr-1" />
              {template.category}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{template.dimensions.aspectRatio}</span>
            <span>{template.dimensions.width}×{template.dimensions.height}</span>
          </div>
          
          {showDetails && (
            <div className="pt-2 border-t border-border">
              <div className="flex flex-wrap gap-1">
                {template.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface TemplateSelectorsProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  gridColumns?: number;
}

/**
 * 模板选择器主组件
 */
export const TemplateSelector: React.FC<TemplateSelectorsProps> = ({
  selectedTemplate,
  onTemplateChange,
  showSearch = true,
  showFilters = true,
  gridColumns = 2
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 过滤模板
  const filteredTemplates = useMemo(() => {
    return CARD_TEMPLATES.filter(template => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          template.displayName.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // 分类过滤
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }

      // 免费过滤
      if (showOnlyFree && !template.isFree) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, showOnlyFree]);

  // 处理模板选择
  const handleTemplateSelect = (template: CardTemplate) => {
    onTemplateChange(template.id);
  };

  return (
    <div className="space-y-4">
      {/* 搜索和过滤器 */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {/* 搜索框 */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* 过滤器 */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {/* 分类过滤 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value="knowledge">知识</SelectItem>
                  <SelectItem value="social">社交</SelectItem>
                  <SelectItem value="business">商务</SelectItem>
                  <SelectItem value="education">教育</SelectItem>
                </SelectContent>
              </Select>

              {/* 免费过滤 */}
              <Button
                variant={showOnlyFree ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOnlyFree(!showOnlyFree)}
              >
                <Filter className="w-4 h-4 mr-1" />
                仅免费
              </Button>

              {/* 显示详情切换 */}
              <Button
                variant={showDetails ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                详情
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 模板网格 */}
      <div className={`grid gap-3 ${
        gridColumns === 1 ? 'grid-cols-1' : 
        gridColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={handleTemplateSelect}
            showDetails={showDetails}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <Square className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">未找到匹配的模板</h3>
          <p className="text-muted-foreground mb-4">
            尝试调整搜索条件或过滤器设置
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setShowOnlyFree(false);
            }}
          >
            清除过滤条件
          </Button>
        </div>
      )}

      {/* 模板统计 */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        显示 {filteredTemplates.length} / {CARD_TEMPLATES.length} 个模板
        {searchQuery && (
          <span> · 搜索结果: "{searchQuery}"</span>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;