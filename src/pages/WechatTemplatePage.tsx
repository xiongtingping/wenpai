import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Edit, Heart, Search, Filter, MessageCircle, Calendar, Sparkles, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { PermissionProtectedInput, PermissionProtectedSelect } from '@/components/auth/PermissionProtectedInput';

/**
 * 微信朋友圈文案模板接口定义
 */
interface WechatTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  emoji: string;
  wordCount: number;
  isFavorite: boolean;
  useCount: number;
  createdAt: Date;
  occasion?: string;
  mood?: string;
}

/**
 * 微信朋友圈文案模板页面组件
 */
const WechatTemplatePage: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<WechatTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WechatTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<WechatTemplate | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast  } = useToast();

  // 预设分类
  const categories = [
    t('pages.messages.日常分享'), t('pages.messages.节日祝福'), t('pages.messages.心情表达'), t('pages.messages.美食分享'), t('pages.messages.旅行记录'), 
    t('pages.messages.工作感悟'), t('pages.messages.生活感悟'), t('pages.messages.励志鸡汤'), t('pages.messages.搞笑段子'), t('pages.messages.其他')
  ];

  // 预设标签
  const allTags = [
    t('pages.messages.温馨'), t('pages.messages.搞笑'), t('pages.messages.励志'), t('pages.messages.文艺'), t('pages.messages.小清新'), t('pages.messages.治愈'), t('pages.messages.正能量'), 
    t('pages.messages.节日'), t('pages.messages.生日'), t('pages.messages.新年'), t('pages.messages.情人节'), t('pages.messages.母亲节'), t('pages.messages.父亲节'), t('pages.messages.感恩节')
  ];

  // 预设场合
  const occasions = [
    t('pages.messages.日常'), t('pages.messages.生日'), t('pages.messages.新年'), t('pages.messages.情人节'), t('pages.messages.母亲节'), t('pages.messages.父亲节'), t('pages.messages.感恩节'), 
    t('pages.messages.圣诞节'), t('pages.messages.春节'), t('pages.messages.中秋节'), t('pages.messages.国庆节'), t('pages.messages.毕业季'), t('pages.messages.工作'), t('pages.messages.旅行')
  ];

  /**
   * 初始化为空数据
   */
  useEffect(() => {
    setTemplates([]);
    setFilteredTemplates([]);
  }, []);

  /**
   * 过滤模板
   */
  useEffect(() => {
    let filtered = templates;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.some(tag => template.tags.includes(tag))
      );
    }

    // 场合过滤
    if (selectedOccasion !== 'all') {
      filtered = filtered.filter(template => template.occasion === selectedOccasion);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, selectedTags, selectedOccasion]);

  /**
   * 复制文案到剪贴板
   */
  const copyTemplate = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: t('wechatTemplate.copySuccess'),
        description: t('wechatTemplate.copySuccessDescription'),
      });
    } catch (err) {
      toast({
        title: t('wechatTemplate.copyFailed'),
        description: t('wechatTemplate.copyFailedDescription'),
        variant: "destructive",
      });
    }
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  /**
   * 增加使用次数
   */
  const incrementUseCount = (id: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, useCount: template.useCount + 1 }
        : template
    ));
  };

  /**
   * 添加新模板
   */
  const addTemplate = (template: Omit<WechatTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: WechatTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setIsAddDialogOpen(false);
  };

  /**
   * 更新模板
   */
  const updateTemplate = (id: string, updates: Partial<WechatTemplate>) => {
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, ...updates }
        : template
    ));
    setEditingTemplate(null);
  };

  /**
   * 删除模板
   */
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  return (
    <div className="container mx-auto p-6 space-y-6 particle-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="creative-module-title text-foreground"></h1>
          <p className="creative-module-description text-muted-foreground"></p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('wechatTemplate.addNewTemplate')}</DialogTitle>
            </DialogHeader>
            <AddTemplateForm onSubmit={addTemplate} categories={categories} allTags={allTags} occasions={occasions} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤 */}
      <Card variant="enhanced">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PermissionProtectedInput
              requiredTier="pro"
              featureName={t('components.labels.名称')}
            >
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  variant="enhanced"
                  placeholder="搜索文案..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </PermissionProtectedInput>
            <PermissionProtectedSelect
              requiredTier="pro"
              featureName={t('components.labels.名称')}
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder={t('components.labels.占位符')}
            >
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </PermissionProtectedSelect>
            <PermissionProtectedSelect
              requiredTier="pro"
              featureName={t('pages.messages.场合筛选')}
              value={selectedOccasion}
              onValueChange={setSelectedOccasion}
              placeholder={t('components.labels.占位符')}
            >
              <SelectItem value="all">全部场合</SelectItem>
              {occasions.map(occasion => (
                <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
              ))}
            </PermissionProtectedSelect>
            <PermissionLockedButton
              requiredTier="pro"
              featureName={t('components.labels.名称')}
              variant="outline"
              onClick={() => setSelectedTags([])}
            >
              <Filter className="w-4 h-4 mr-2" />
              清除标签过滤
            </PermissionLockedButton>
          </div>
          
          {/* 标签过滤 */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onCopy={copyTemplate}
            onToggleFavorite={toggleFavorite}
            onIncrementUse={incrementUseCount}
            onEdit={setEditingTemplate}
            onDelete={deleteTemplate}
            categories={categories}
            allTags={allTags}
            occasions={occasions}
          />
        ))}
      </div>

      {/* 编辑对话框 */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑模板</DialogTitle>
            </DialogHeader>
            <EditTemplateForm
              template={editingTemplate}
              onSubmit={(updates) => updateTemplate(editingTemplate.id, updates)}
              categories={categories}
              allTags={allTags}
              occasions={occasions}
            />
          </DialogContent>
        </Dialog>
      )}

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无模板</h3>
            <p className="text-muted-foreground">尝试调整搜索条件或添加新的模板</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * 模板卡片组件
 */
interface TemplateCardProps {
  template: WechatTemplate;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementUse: (id: string) => void;
  onEdit: (template: WechatTemplate) => void;
  onDelete: (id: string) => void;
  categories: string[];
  allTags: string[];
  occasions: string[];
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onCopy,
  onToggleFavorite,
  onIncrementUse,
  onEdit,
  onDelete,
  categories,
  allTags,
  occasions
}) => {
  const handleCopy = () => {
    onCopy(template.content);
    onIncrementUse(template.id);
  };

  return (
    <Card className={`wechat-template-card ${template.isFavorite ? 'ring-2 ring-primary' : ''} transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="creative-module-subtitle flex items-center gap-2">
              <span>{template.emoji}</span>
              <span>{template.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="creative-module-label">{template.category}</Badge>
              {template.occasion && <Badge variant="outline" className="creative-module-label">{template.occasion}</Badge>}
              <Badge variant="outline" className="creative-module-label">{template.wordCount}字</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(template.id)}
            >
              <Heart className={`w-4 h-4 ${template.isFavorite ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{template.content}</p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {template.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>使用次数: {template.useCount}</span>
          <span>创建时间: {template.createdAt.toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2">
          <PermissionLockedButton
            requiredTier="pro"
            featureName={t('components.labels.名称')}
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制文案
          </PermissionLockedButton>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 添加模板表单组件
 */
interface AddTemplateFormProps {
  onSubmit: (template: Omit<WechatTemplate, 'id' | 'createdAt'>) => void;
  categories: string[];
  allTags: string[];
  occasions: string[];
}

const AddTemplateForm: React.FC<AddTemplateFormProps> = ({ onSubmit, categories, allTags, occasions }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    emoji: '',
    wordCount: 0,
    isFavorite: false,
    useCount: 0,
    occasion: '',
    mood: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: [],
        emoji: '',
        wordCount: 0,
        isFavorite: false,
        useCount: 0,
        occasion: '',
        mood: ''
      });
    }
  };

  const updateWordCount = (content: string) => {
    setFormData(prev => ({ ...prev, content, wordCount: content.length }));
  };

  const popularEmojis = ['😊', '🎉', '💕', '🌟', '✨', '🎊', '💪', '🌸', '🌈', '🎵', '🍕', '✈️'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">标题 *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t('components.labels.占位符')}
        required
          />
        </div>
        <div>
          <label className="text-sm font-medium">分类</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('components.labels.占位符')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="creative-module-button">文案内容 *</label>
        <Textarea
          value={formData.content}
          onChange={(e) => updateWordCount(e.target.value)}
          placeholder="输入朋友圈文案内容..."
          rows={4}
          required
        />
        <div className="creative-module-small mt-1">
          字数: {formData.wordCount} (建议30-50字)
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Emoji装饰</label>
        <Input
          value={formData.emoji}
          onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          placeholder="添加Emoji装饰"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {popularEmojis.map(e => (
            <button
              key={e}
              type="button"
              className="text-xl hover:scale-110 transition-transform"
              onClick={() => setFormData(prev => ({ ...prev, emoji: prev.emoji + e }))}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">场合</label>
          <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('components.labels.占位符')} />
            </SelectTrigger>
            <SelectContent>
              {occasions.map(occasion => (
                <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">心情</label>
          <Input
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
            placeholder="开心、温馨、励志等"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">标签</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={formData.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFormData(prev => ({
                ...prev,
                tags: prev.tags.includes(tag)
                  ? prev.tags.filter(t => t !== tag)
                  : [...prev.tags, tag]
              }))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm">收藏</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">添加模板</Button>
      </div>
    </form>
  );
};

/**
 * 编辑模板表单组件
 */
interface EditTemplateFormProps {
  template: WechatTemplate;
  onSubmit: (updates: Partial<WechatTemplate>) => void;
  categories: string[];
  allTags: string[];
  occasions: string[];
}

const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template, onSubmit, categories, allTags, occasions }) => {
  const [formData, setFormData] = useState({
    title: template.title,
    content: template.content,
    category: template.category,
    tags: template.tags,
    emoji: template.emoji,
    wordCount: template.wordCount,
    isFavorite: template.isFavorite,
    useCount: template.useCount,
    occasion: template.occasion || '',
    mood: template.mood || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateWordCount = (content: string) => {
    setFormData(prev => ({ ...prev, content, wordCount: content.length }));
  };

  const popularEmojis = ['😊', '🎉', '💕', '🌟', '✨', '🎊', '💪', '🌸', '🌈', '🎵', '🍕', '✈️'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">标题 *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t('components.labels.占位符')}
        required
          />
        </div>
        <div>
          <label className="text-sm font-medium">分类</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('components.labels.占位符')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">文案内容 *</label>
        <Textarea
          value={formData.content}
          onChange={(e) => updateWordCount(e.target.value)}
          placeholder="输入朋友圈文案内容..."
          rows={4}
          required
        />
        <div className="text-xs text-muted-foreground mt-1">
          字数: {formData.wordCount} (建议30-50字)
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Emoji装饰</label>
        <Input
          value={formData.emoji}
          onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          placeholder="添加Emoji装饰"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {popularEmojis.map(e => (
            <button
              key={e}
              type="button"
              className="text-xl hover:scale-110 transition-transform"
              onClick={() => setFormData(prev => ({ ...prev, emoji: prev.emoji + e }))}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">场合</label>
          <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('pages.messages.选择场合')} />
            </SelectTrigger>
            <SelectContent>
              {occasions.map(occasion => (
                <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">心情</label>
          <Input
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
            placeholder="开心、温馨、励志等"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">标签</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={formData.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFormData(prev => ({
                ...prev,
                tags: prev.tags.includes(tag)
                  ? prev.tags.filter(t => t !== tag)
                  : [...prev.tags, tag]
              }))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm">收藏</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">保存修改</Button>
      </div>
    </form>
  );
};

export default WechatTemplatePage;
