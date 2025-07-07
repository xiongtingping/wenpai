/**
 * 我的资料库页面
 * 整合网络信息收藏、内容提取、文案管理三大功能的资料库中心
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bookmark,
  FileText,
  Globe,
  Upload,
  Search,
  Plus,
  Copy,
  Download,
  Edit,
  Trash2,
  Star,
  Tag,
  Clock,
  Filter,
  Save,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  Link2,
  FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 资料项接口
 */
interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: 'bookmark' | 'extract' | 'memo';
  source?: string;
  sourceType?: 'url' | 'file' | 'manual';
  tags: string[];
  isFavorite: boolean;
  isUsed: boolean;
  category?: string;
  platform?: string;
  summary?: string;
  metadata?: {
    wordCount?: number;
    charCount?: number;
    author?: string;
    date?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 我的资料库页面组件
 * @returns React 组件
 */
export default function BookmarkPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状态管理
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterFavorite, setFilterFavorite] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'title' | 'type'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 内容提取状态
  const [extractMethod, setExtractMethod] = useState<'url' | 'file'>('url');
  const [extractUrl, setExtractUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // 对话框状态
  const [isExtractDialogOpen, setIsExtractDialogOpen] = useState(false);
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  
  // 新建项表单
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    category: ''
  });
  
  const [newMemo, setNewMemo] = useState({
    title: '',
    content: '',
    tags: '',
    category: '',
    platform: ''
  });

  /**
   * 初始化示例数据
   */
  React.useEffect(() => {
    const sampleItems: LibraryItem[] = [
      {
        id: '1',
        title: '小红书营销策略分析',
        content: '深度分析小红书平台的用户特征、内容偏好和营销机会...',
        type: 'bookmark',
        source: 'https://example.com/xiaohongshu-analysis',
        sourceType: 'url',
        tags: ['小红书', '营销策略', '社交媒体'],
        isFavorite: true,
        isUsed: false,
        category: '营销分析',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: '品牌推广文案模板',
        content: '🎯 核心卖点：\n• 高效便捷的操作体验\n• 专业可靠的技术支持\n• 性价比超高的解决方案...',
        type: 'memo',
        tags: ['品牌推广', '文案模板', '营销'],
        isFavorite: true,
        isUsed: true,
        category: '营销文案',
        platform: '微信公众号',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-14T14:20:00Z'
      },
      {
        id: '3',
        title: '2024年内容营销趋势报告',
        content: '# 2024年内容营销趋势报告\n\n## 主要趋势\n1. AI辅助内容创作\n2. 短视频持续火热\n3. 互动式内容增长...',
        type: 'extract',
        source: '2024-content-marketing-report.pdf',
        sourceType: 'file',
        tags: ['内容营销', '趋势报告', '2024'],
        isFavorite: false,
        isUsed: false,
        category: '行业报告',
        summary: '分析了2024年内容营销的主要趋势，包括AI辅助创作、短视频发展、互动内容等关键方向...',
        metadata: {
          wordCount: 2500,
          charCount: 8000,
          date: '2024-01-01'
        },
        createdAt: '2024-01-13T09:15:00Z',
        updatedAt: '2024-01-13T09:15:00Z'
      }
    ];
    
    setLibraryItems(sampleItems);
  }, []);

  /**
   * 获取筛选后的项目
   */
  const getFilteredItems = () => {
    let filtered = [...libraryItems];

    // 按类型筛选
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // 收藏筛选
    if (filterFavorite !== null) {
      filtered = filtered.filter(item => item.isFavorite === filterFavorite);
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'time':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  /**
   * 获取所有标签
   */
  const getAllTags = () => {
    const tagSet = new Set<string>();
    libraryItems.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  /**
   * 内容提取功能
   */
  const extractContent = async () => {
    if (extractMethod === 'url' && !extractUrl.trim()) {
      toast({
        title: "请输入URL",
        description: "请提供有效的网页地址",
        variant: "destructive"
      });
      return;
    }

    if (extractMethod === 'file' && !selectedFile) {
      toast({
        title: "请选择文件",
        description: "请上传要提取内容的文件",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newItem: LibraryItem = {
        id: Date.now().toString(),
        title: extractMethod === 'url' ? `网页内容：${extractUrl}` : `文件内容：${selectedFile?.name}`,
        content: generateMockExtractedContent(extractMethod === 'url' ? extractUrl : selectedFile?.name || ''),
        type: 'extract',
        source: extractMethod === 'url' ? extractUrl : selectedFile?.name,
        sourceType: extractMethod,
        tags: ['内容提取', extractMethod === 'url' ? '网页' : '文档'],
        isFavorite: false,
        isUsed: false,
        category: '提取内容',
        metadata: {
          wordCount: 350,
          charCount: 1200,
          date: new Date().toISOString().split('T')[0]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setLibraryItems(prev => [newItem, ...prev]);
      setIsExtractDialogOpen(false);
      setExtractUrl('');
      setSelectedFile(null);
      
      toast({
        title: "内容提取成功",
        description: "内容已添加到资料库",
      });
    } catch {
      toast({
        title: "提取失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * 生成模拟提取内容
   */
  const generateMockExtractedContent = (source: string) => {
    return `# 提取内容：${source}

## 主要内容

这是从 ${source} 提取的内容。

### 核心要点
- **关键信息1**：详细阐述了重要概念和基本原理
- **关键信息2**：提供了实用的方法和建议
- **关键信息3**：分析了当前趋势和发展方向

### 深入分析

#### 实用价值
- 内容贴近实际需求，具有很强的实用价值
- 提供的方法简单易行，便于实际操作
- 分析深入透彻，有助于理解核心问题

#### 应用建议
- 建议结合实际情况灵活运用
- 可作为决策参考和行动指南
- 注意关注后续发展和更新

---

*提取时间：${new Date().toLocaleString('zh-CN')}*`;
  };

  /**
   * 创建书签
   */
  const createBookmark = () => {
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
      toast({
        title: "请填写完整信息",
        description: "标题和URL不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newBookmark.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const bookmark: LibraryItem = {
      id: Date.now().toString(),
      title: newBookmark.title.trim(),
      content: newBookmark.description.trim() || '暂无描述',
      type: 'bookmark',
      source: newBookmark.url.trim(),
      sourceType: 'url',
      tags,
      isFavorite: false,
      isUsed: false,
      category: newBookmark.category || '未分类',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLibraryItems(prev => [bookmark, ...prev]);
    setNewBookmark({ title: '', url: '', description: '', tags: '', category: '' });
    setIsBookmarkDialogOpen(false);
    
    toast({
      title: "书签创建成功",
      description: "新书签已保存到资料库",
    });
  };

  /**
   * 创建文案
   */
  const createMemo = () => {
    if (!newMemo.title.trim() || !newMemo.content.trim()) {
      toast({
        title: "请填写完整信息",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newMemo.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const memo: LibraryItem = {
      id: Date.now().toString(),
      title: newMemo.title.trim(),
      content: newMemo.content.trim(),
      type: 'memo',
      tags,
      isFavorite: false,
      isUsed: false,
      category: newMemo.category || '未分类',
      platform: newMemo.platform || undefined,
      metadata: {
        wordCount: newMemo.content.trim().split(/\s+/).length,
        charCount: newMemo.content.trim().length
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLibraryItems(prev => [memo, ...prev]);
    setNewMemo({ title: '', content: '', tags: '', category: '', platform: '' });
    setIsMemoDialogOpen(false);
    
    toast({
      title: "文案创建成功",
      description: "新文案已保存到资料库",
    });
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    setLibraryItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  /**
   * 切换使用状态
   */
  const toggleUsed = (id: string) => {
    setLibraryItems(prev => prev.map(item => 
      item.id === id ? { ...item, isUsed: !item.isUsed } : item
    ));
  };

  /**
   * 复制内容
   */
  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "内容已复制",
    });
  };

  /**
   * 删除项目
   */
  const deleteItem = (id: string) => {
    setLibraryItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "已删除",
      description: "项目已从资料库中移除",
    });
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * 获取类型图标和名称
   */
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'bookmark':
        return { icon: <Bookmark className="w-4 h-4" />, name: '书签' };
      case 'extract':
        return { icon: <FileText className="w-4 h-4" />, name: '提取' };
      case 'memo':
        return { icon: <Edit className="w-4 h-4" />, name: '文案' };
      default:
        return { icon: <FileText className="w-4 h-4" />, name: '其他' };
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="我的资料库"
        description="统一管理您的网络收藏、内容提取和文案创作"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsBookmarkDialogOpen(true)}>
              <Bookmark className="w-4 h-4 mr-2" />
              添加书签
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsExtractDialogOpen(true)}>
              <FileText className="w-4 h-4 mr-2" />
              内容提取
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsMemoDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              创建文案
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* 分类标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                全部
              </TabsTrigger>
              <TabsTrigger value="bookmark" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                书签
              </TabsTrigger>
              <TabsTrigger value="extract" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                提取
              </TabsTrigger>
              <TabsTrigger value="memo" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                文案
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 搜索和筛选工具栏 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* 搜索框 */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索标题、内容或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 筛选选项 */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">筛选：</span>
                  <Button
                    size="sm"
                    variant={filterFavorite === null ? 'default' : 'outline'}
                    onClick={() => setFilterFavorite(null)}
                  >
                    全部
                  </Button>
                  <Button
                    size="sm"
                    variant={filterFavorite === true ? 'default' : 'outline'}
                    onClick={() => setFilterFavorite(true)}
                  >
                    已收藏
                  </Button>
                </div>

                {/* 排序选项 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">排序：</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'time' | 'title' | 'type')}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="time">时间</option>
                    <option value="title">标题</option>
                    <option value="type">类型</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="desc">降序</option>
                    <option value="asc">升序</option>
                  </select>
                </div>
              </div>

              {/* 标签筛选 */}
              {getAllTags().length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">标签：</span>
                  {getAllTags().map(tag => (
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
              )}
            </CardContent>
          </Card>

          {/* 内容列表 */}
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.icon}
                              <span className="ml-1">{typeInfo.name}</span>
                            </Badge>
                            <h3 className="font-semibold">{item.title}</h3>
                            {item.isFavorite && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {item.isUsed && (
                              <Badge variant="secondary" className="text-xs">
                                已使用
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.content}
                          </div>

                          {item.source && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                              <Link2 className="w-3 h-3" />
                              <span className="truncate">{item.source}</span>
                            </div>
                          )}

                          {item.summary && (
                            <div className="mb-3 p-2 bg-purple-50 rounded text-xs">
                              <div className="flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-purple-500" />
                                <span className="font-medium text-purple-700">AI总结</span>
                              </div>
                              <p className="text-purple-600">{item.summary}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(item.updatedAt)}
                            </span>
                            {item.category && (
                              <span>{item.category}</span>
                            )}
                            {item.platform && (
                              <span>{item.platform}</span>
                            )}
                            {item.metadata?.wordCount && (
                              <span>{item.metadata.wordCount} 字</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(item.id)}
                          >
                            <Star className={`w-4 h-4 ${item.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyContent(item.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 空状态 */}
            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无资料</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedTags.length > 0 ? '没有找到匹配的资料' : '开始添加您的第一个资料'}
                  </p>
                  {!searchQuery && selectedTags.length === 0 && (
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(true)}>
                        <Bookmark className="w-4 h-4 mr-2" />
                        添加书签
                      </Button>
                      <Button variant="outline" onClick={() => setIsExtractDialogOpen(true)}>
                        <FileText className="w-4 h-4 mr-2" />
                        内容提取
                      </Button>
                      <Button onClick={() => setIsMemoDialogOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        创建文案
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 对话框组件 */}
        <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              添加书签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加网络书签</DialogTitle>
              <DialogDescription>
                保存有价值的网页链接到资料库
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入网页标题"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea
                  value={newBookmark.description}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述这个网页的内容"
                  rows={3}
                />
              </div>
              <div>
                <Label>标签（用逗号分隔）</Label>
                <Input
                  value={newBookmark.tags}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="营销,策略,分析"
                />
              </div>
              <div>
                <Label>分类</Label>
                <Input
                  value={newBookmark.category}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="营销资料"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createBookmark}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isExtractDialogOpen} onOpenChange={setIsExtractDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              内容提取
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>内容提取</DialogTitle>
              <DialogDescription>
                从网页或文件中提取内容到资料库
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>提取方式</Label>
                <Select value={extractMethod} onValueChange={(value: 'url' | 'file') => setExtractMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        网页URL
                      </div>
                    </SelectItem>
                    <SelectItem value="file">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        文件上传
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {extractMethod === 'url' && (
                <div>
                  <Label>网页URL</Label>
                  <Input
                    placeholder="https://example.com"
                    value={extractUrl}
                    onChange={(e) => setExtractUrl(e.target.value)}
                  />
                </div>
              )}

              {extractMethod === 'file' && (
                <div>
                  <Label>文件上传</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".md,.json,.html,.htm,.txt,image/*"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      选择文件
                    </Button>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        <span className="text-sm">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExtractDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={extractContent} disabled={isExtracting}>
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提取中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    开始提取
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isMemoDialogOpen} onOpenChange={setIsMemoDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              创建文案
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建文案</DialogTitle>
              <DialogDescription>
                添加新的文案内容到资料库
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={newMemo.title}
                  onChange={(e) => setNewMemo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入文案标题"
                />
              </div>
              <div>
                <Label>内容</Label>
                <Textarea
                  value={newMemo.content}
                  onChange={(e) => setNewMemo(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="输入文案内容，支持Markdown格式"
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>标签（用逗号分隔）</Label>
                  <Input
                    value={newMemo.tags}
                    onChange={(e) => setNewMemo(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="营销,文案,推广"
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input
                    value={newMemo.category}
                    onChange={(e) => setNewMemo(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="营销文案"
                  />
                </div>
              </div>
              <div>
                <Label>平台</Label>
                <Input
                  value={newMemo.platform}
                  onChange={(e) => setNewMemo(prev => ({ ...prev, platform: e.target.value }))}
                  placeholder="微信公众号"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMemoDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createMemo}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 