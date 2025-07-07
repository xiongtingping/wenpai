import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Edit, Heart, Search, Filter, MessageCircle, Calendar, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [templates, setTemplates] = useState<WechatTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WechatTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<WechatTemplate | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // 预设分类
  const categories = [
    '日常分享', '节日祝福', '心情表达', '美食分享', '旅行记录', 
    '工作感悟', '生活感悟', '励志鸡汤', '搞笑段子', '其他'
  ];

  // 预设标签
  const allTags = [
    '温馨', '搞笑', '励志', '文艺', '小清新', '治愈', '正能量', 
    '节日', '生日', '新年', '情人节', '母亲节', '父亲节', '感恩节'
  ];

  // 预设场合
  const occasions = [
    '日常', '生日', '新年', '情人节', '母亲节', '父亲节', '感恩节', 
    '圣诞节', '春节', '中秋节', '国庆节', '毕业季', '工作', '旅行'
  ];

  /**
   * 初始化示例数据
   */
  useEffect(() => {
    const sampleTemplates: WechatTemplate[] = [
      {
        id: '1',
        title: '温馨日常分享',
        content: '今天天气真好 ☀️ 阳光洒在脸上暖暖的，心情也跟着明媚起来 ✨ 生活就是这样，简单而美好 💕',
        category: '日常分享',
        tags: ['温馨', '小清新', '治愈'],
        emoji: '☀️✨💕',
        wordCount: 45,
        isFavorite: true,
        useCount: 156,
        createdAt: new Date('2024-01-15'),
        occasion: '日常',
        mood: '开心'
      },
      {
        id: '2',
        title: '新年祝福',
        content: '🎊 新年快乐！愿新的一年里，所有的美好都能如期而至 🌟 愿你所求皆所愿，所行化坦途 🎆',
        category: '节日祝福',
        tags: ['节日', '新年', '正能量'],
        emoji: '🎊🌟🎆',
        wordCount: 38,
        isFavorite: false,
        useCount: 234,
        createdAt: new Date('2024-01-10'),
        occasion: '新年',
        mood: '祝福'
      },
      {
        id: '3',
        title: '美食分享',
        content: '🍜 今天发现了一家超好吃的面馆！汤底浓郁，面条劲道，配料丰富 🥢 吃货的快乐就是这么简单 😋',
        category: '美食分享',
        tags: ['美食', '分享', '开心'],
        emoji: '🍜🥢😋',
        wordCount: 42,
        isFavorite: true,
        useCount: 89,
        createdAt: new Date('2024-01-08'),
        occasion: '日常',
        mood: '满足'
      },
      {
        id: '4',
        title: '旅行记录',
        content: '✈️ 终于来到了心心念念的地方！这里的风景美得让人窒息 🌅 旅行真的能治愈一切疲惫 🏔️',
        category: '旅行记录',
        tags: ['旅行', '治愈', '美景'],
        emoji: '✈️🌅🏔️',
        wordCount: 39,
        isFavorite: false,
        useCount: 123,
        createdAt: new Date('2024-01-05'),
        occasion: '旅行',
        mood: '兴奋'
      },
      {
        id: '5',
        title: '励志鸡汤',
        content: '💪 每一个优秀的人，都有一段沉默的时光 🌱 那段时光，是付出了很多努力，忍受了很多孤独 🎯',
        category: '励志鸡汤',
        tags: ['励志', '正能量', '成长'],
        emoji: '💪🌱🎯',
        wordCount: 41,
        isFavorite: true,
        useCount: 178,
        createdAt: new Date('2024-01-03'),
        occasion: '日常',
        mood: '励志'
      },
      {
        id: '6',
        title: '情人节甜蜜',
        content: '💕 有你的每一天都是情人节 🌹 感谢你让我的生活变得如此美好 ✨ 爱你，永远 💑',
        category: '节日祝福',
        tags: ['节日', '情人节', '甜蜜'],
        emoji: '💕🌹✨💑',
        wordCount: 36,
        isFavorite: false,
        useCount: 267,
        createdAt: new Date('2024-01-01'),
        occasion: '情人节',
        mood: '甜蜜'
      },
      {
        id: '7',
        title: '搞笑段子',
        content: '😂 今天又被自己蠢哭了 🤦‍♀️ 明明想煮个面，结果把锅给煮糊了 🍳 这就是生活吧 🤷‍♀️',
        category: '搞笑段子',
        tags: ['搞笑', '日常', '自嘲'],
        emoji: '😂🤦‍♀️🍳🤷‍♀️',
        wordCount: 44,
        isFavorite: true,
        useCount: 145,
        createdAt: new Date('2023-12-28'),
        occasion: '日常',
        mood: '搞笑'
      },
      {
        id: '8',
        title: '工作感悟',
        content: '💼 今天又是充实的一天 📈 虽然很累，但看到项目有了新进展，一切都值得 🎉 加油！',
        category: '工作感悟',
        tags: ['工作', '励志', '成就感'],
        emoji: '💼📈🎉',
        wordCount: 37,
        isFavorite: false,
        useCount: 92,
        createdAt: new Date('2023-12-25'),
        occasion: '工作',
        mood: '满足'
      }
    ];
    setTemplates(sampleTemplates);
    setFilteredTemplates(sampleTemplates);
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
        title: "复制成功",
        description: "文案已复制到剪贴板",
      });
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制",
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/adapt'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            返回内容适配器
          </Button>
          <div>
            <h1 className="text-3xl font-bold">微信朋友圈文案模板</h1>
            <p className="text-muted-foreground">精心设计的文案模板，让你的朋友圈更有魅力</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加模板
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新模板</DialogTitle>
            </DialogHeader>
            <AddTemplateForm onSubmit={addTemplate} categories={categories} allTags={allTags} occasions={occasions} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文案..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="选择场合" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部场合</SelectItem>
                {occasions.map(occasion => (
                  <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSelectedTags([])}>
              <Filter className="w-4 h-4 mr-2" />
              清除标签过滤
            </Button>
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
    <Card className={`${template.isFavorite ? 'ring-2 ring-yellow-400' : ''} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{template.emoji}</span>
              <span>{template.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{template.category}</Badge>
              {template.occasion && <Badge variant="outline">{template.occasion}</Badge>}
              <Badge variant="outline">{template.wordCount}字</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(template.id)}
            >
              <Heart className={`w-4 h-4 ${template.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
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
          <Button
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制文案
          </Button>
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
            placeholder="模板标题"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">分类</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
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
              <SelectValue placeholder="选择场合" />
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
            placeholder="模板标题"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">分类</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
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
              <SelectValue placeholder="选择场合" />
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