import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ExternalLink, Bookmark, Edit, Trash2, Plus, Search, Filter, Tag, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

/**
 * 书签项接口定义
 */
interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
  isUsed: boolean;
  isFavorite: boolean;
}

/**
 * 网络信息收藏页面组件
 */
const BookmarkPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUsed, setShowUsed] = useState<boolean | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);

  // 预设分类
  const categories = [
    '技术文章', '设计灵感', '营销案例', '行业资讯', 
    '工具推荐', '教程指南', '产品分析', '其他'
  ];

  // 预设标签
  const allTags = [
    'React', 'Vue', 'TypeScript', 'JavaScript', 'CSS', 'UI/UX', 
    '营销', 'SEO', '数据分析', 'AI', '机器学习', '设计', '产品'
  ];

  /**
   * 初始化示例数据
   */
  useEffect(() => {
    const sampleBookmarks: BookmarkItem[] = [
      {
        id: '1',
        title: 'React 18 新特性详解',
        url: 'https://react.dev/blog/2022/03/29/react-v18',
        description: 'React 18 带来的并发特性、自动批处理等新功能',
        category: '技术文章',
        tags: ['React', 'JavaScript'],
        source: 'React 官方博客',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        notes: '重点关注并发渲染和 Suspense 的改进',
        isUsed: false,
        isFavorite: true
      },
      {
        id: '2',
        title: '2024年UI设计趋势',
        url: 'https://www.behance.net/gallery/2024-ui-trends',
        description: '2024年最新的UI设计趋势和最佳实践',
        category: '设计灵感',
        tags: ['UI/UX', '设计'],
        source: 'Behance',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
        notes: '可以参考新拟态和玻璃拟态设计',
        isUsed: true,
        isFavorite: false
      },
      {
        id: '3',
        title: 'TypeScript 高级类型技巧',
        url: 'https://typescriptlang.org/docs/handbook/advanced-types.html',
        description: 'TypeScript 高级类型系统的使用技巧',
        category: '技术文章',
        tags: ['TypeScript', 'JavaScript'],
        source: 'TypeScript 官方文档',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
        notes: '条件类型和映射类型很实用',
        isUsed: false,
        isFavorite: true
      }
    ];
    setBookmarks(sampleBookmarks);
    setFilteredBookmarks(sampleBookmarks);
  }, []);

  /**
   * 过滤书签
   */
  useEffect(() => {
    let filtered = bookmarks;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.category === selectedCategory);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark =>
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
    }

    // 使用状态过滤
    if (showUsed !== null) {
      filtered = filtered.filter(bookmark => bookmark.isUsed === showUsed);
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm, selectedCategory, selectedTags, showUsed]);

  /**
   * 添加新书签
   */
  const addBookmark = (bookmark: Omit<BookmarkItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBookmark: BookmarkItem = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBookmarks(prev => [newBookmark, ...prev]);
    setIsAddDialogOpen(false);
  };

  /**
   * 更新书签
   */
  const updateBookmark = (id: string, updates: Partial<BookmarkItem>) => {
    setBookmarks(prev => prev.map(bookmark =>
      bookmark.id === id
        ? { ...bookmark, ...updates, updatedAt: new Date() }
        : bookmark
    ));
    setEditingBookmark(null);
  };

  /**
   * 删除书签
   */
  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  /**
   * 切换使用状态
   */
  const toggleUsed = (id: string) => {
    setBookmarks(prev => prev.map(bookmark =>
      bookmark.id === id
        ? { ...bookmark, isUsed: !bookmark.isUsed, updatedAt: new Date() }
        : bookmark
    ));
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    setBookmarks(prev => prev.map(bookmark =>
      bookmark.id === id
        ? { ...bookmark, isFavorite: !bookmark.isFavorite, updatedAt: new Date() }
        : bookmark
    ));
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
            <h1 className="text-3xl font-bold">网络信息收藏</h1>
            <p className="text-muted-foreground">收藏和管理有用的网络资源</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加书签
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新书签</DialogTitle>
            </DialogHeader>
            <AddBookmarkForm onSubmit={addBookmark} categories={categories} allTags={allTags} />
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
                placeholder="搜索书签..."
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
            <Select 
              value={showUsed === null ? 'all' : showUsed ? 'used' : 'unused'}
              onValueChange={(value) => setShowUsed(value === 'all' ? null : value === 'used')}
            >
              <SelectTrigger>
                <SelectValue placeholder="使用状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="used">已使用</SelectItem>
                <SelectItem value="unused">未使用</SelectItem>
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

      {/* 书签列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBookmarks.map(bookmark => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onUpdate={updateBookmark}
            onDelete={deleteBookmark}
            onToggleUsed={toggleUsed}
            onToggleFavorite={toggleFavorite}
            onEdit={setEditingBookmark}
            categories={categories}
            allTags={allTags}
          />
        ))}
      </div>

      {/* 编辑对话框 */}
      {editingBookmark && (
        <Dialog open={!!editingBookmark} onOpenChange={() => setEditingBookmark(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑书签</DialogTitle>
            </DialogHeader>
            <EditBookmarkForm
              bookmark={editingBookmark}
              onSubmit={(updates) => updateBookmark(editingBookmark.id, updates)}
              categories={categories}
              allTags={allTags}
            />
          </DialogContent>
        </Dialog>
      )}

      {filteredBookmarks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无书签</h3>
            <p className="text-muted-foreground">开始添加你的第一个书签吧！</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * 书签卡片组件
 */
interface BookmarkCardProps {
  bookmark: BookmarkItem;
  onUpdate: (id: string, updates: Partial<BookmarkItem>) => void;
  onDelete: (id: string) => void;
  onToggleUsed: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (bookmark: BookmarkItem) => void;
  categories: string[];
  allTags: string[];
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onUpdate,
  onDelete,
  onToggleUsed,
  onToggleFavorite,
  onEdit,
  categories,
  allTags
}) => {
  return (
    <Card className={`${bookmark.isUsed ? 'opacity-75' : ''} ${bookmark.isFavorite ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{bookmark.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{bookmark.category}</Badge>
              <Badge variant="outline">{bookmark.source}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(bookmark.id)}
            >
              <Bookmark className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(bookmark)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(bookmark.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{bookmark.description}</p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{format(bookmark.createdAt, 'yyyy-MM-dd', { locale: zhCN })}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {bookmark.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {bookmark.notes && (
          <div className="bg-muted p-2 rounded text-sm">
            <p className="font-medium mb-1">备注：</p>
            <p className="text-muted-foreground">{bookmark.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={bookmark.isUsed}
              onCheckedChange={() => onToggleUsed(bookmark.id)}
            />
            <span className="text-sm">已使用</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(bookmark.url, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            访问
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 添加书签表单组件
 */
interface AddBookmarkFormProps {
  onSubmit: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  categories: string[];
  allTags: string[];
}

const AddBookmarkForm: React.FC<AddBookmarkFormProps> = ({ onSubmit, categories, allTags }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: [] as string[],
    source: '',
    notes: '',
    isUsed: false,
    isFavorite: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      url: '',
      description: '',
      category: '',
      tags: [],
      source: '',
      notes: '',
      isUsed: false,
      isFavorite: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">标题 *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="书签标题"
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
        <label className="text-sm font-medium">URL *</label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://example.com"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">描述</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="简要描述这个书签的内容"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">来源</label>
          <Input
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            placeholder="网站或作者名称"
          />
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
      </div>

      <div>
        <label className="text-sm font-medium">备注</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="添加个人备注或批注"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.isUsed}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUsed: !!checked }))}
          />
          <span className="text-sm">已使用</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.isFavorite}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: !!checked }))}
          />
          <span className="text-sm">收藏</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">添加书签</Button>
      </div>
    </form>
  );
};

/**
 * 编辑书签表单组件
 */
interface EditBookmarkFormProps {
  bookmark: BookmarkItem;
  onSubmit: (updates: Partial<BookmarkItem>) => void;
  categories: string[];
  allTags: string[];
}

const EditBookmarkForm: React.FC<EditBookmarkFormProps> = ({ bookmark, onSubmit, categories, allTags }) => {
  const [formData, setFormData] = useState({
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    category: bookmark.category,
    tags: bookmark.tags,
    source: bookmark.source,
    notes: bookmark.notes,
    isUsed: bookmark.isUsed,
    isFavorite: bookmark.isFavorite
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">标题 *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="书签标题"
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
        <label className="text-sm font-medium">URL *</label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://example.com"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">描述</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="简要描述这个书签的内容"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">来源</label>
          <Input
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            placeholder="网站或作者名称"
          />
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
      </div>

      <div>
        <label className="text-sm font-medium">备注</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="添加个人备注或批注"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.isUsed}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUsed: !!checked }))}
          />
          <span className="text-sm">已使用</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.isFavorite}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: !!checked }))}
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

export default BookmarkPage; 