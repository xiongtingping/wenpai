/**
 * 我的资料库页面
 * 整合网络收藏夹、智能采集、文案管理、内容提取四大功能的统一资料库中心
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
  FolderOpen,
  Zap,
  Brain,
  Eye,
  X
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
  type: 'collection' | 'extraction' | 'copywriting' | 'memo';
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
  
  // 智能采集状态
  const [extractMethod, setExtractMethod] = useState<'url' | 'file'>('url');
  const [extractUrl, setExtractUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addContentType, setAddContentType] = useState<'collection' | 'extraction' | 'copywriting'>('collection');
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);
  
  // 新建项表单
  const [newCollection, setNewCollection] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    category: ''
  });
  
  const [newCopywriting, setNewCopywriting] = useState({
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
        type: 'collection',
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
        type: 'copywriting',
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
        type: 'extraction',
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
   * 智能采集功能
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
        title: extractMethod === 'url' ? `内容提取：${extractUrl}` : `内容提取：${selectedFile?.name}`,
        content: generateMockExtractedContent(extractMethod === 'url' ? extractUrl : selectedFile?.name || ''),
        type: 'extraction',
        source: extractMethod === 'url' ? extractUrl : selectedFile?.name,
        sourceType: extractMethod,
                  tags: ['内容提取', extractMethod === 'url' ? '网页提取' : selectedFile?.type.includes('image') ? 'OCR识别' : selectedFile?.type.includes('pdf') ? 'PDF提取' : '文档提取'],
        isFavorite: false,
        isUsed: false,
        category: '智能提取',
        summary: extractMethod === 'url' ? '从网页中智能提取的结构化内容，包含核心信息和关键观点...' : selectedFile?.type.includes('image') ? '通过OCR技术从图片中识别提取的文字内容...' : selectedFile?.type.includes('pdf') ? '从PDF文档中提取的文字和结构化信息...' : '从文档中智能提取的核心内容...',
        metadata: {
          wordCount: 350,
          charCount: 1200,
          date: new Date().toISOString().split('T')[0]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setLibraryItems(prev => [newItem, ...prev]);
      setIsAddDialogOpen(false);
      setExtractUrl('');
      setSelectedFile(null);
      
      toast({
        title: "内容提取成功",
        description: "内容已智能提取并添加到资料库",
      });
    } catch {
      toast({
        title: "内容提取失败",
        description: "请检查网络连接或文件格式后重试",
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
    const isImage = source.includes('.jpg') || source.includes('.png') || source.includes('.jpeg');
    const isPDF = source.includes('.pdf');
    
    return `# 内容提取：${source}

## 📄 智能提取结果

${isImage ? '🖼️ **图片OCR识别**：已成功识别图片中的文字内容' : 
  isPDF ? '📄 **PDF解析**：已提取PDF文档的文字和结构化内容' : 
  '🌐 **网页抓取**：已获取网页的核心文字内容'}

### 🔍 提取的主要内容
- **关键信息1**：${isImage ? '图片中包含的重要文字信息' : isPDF ? 'PDF文档的核心观点和数据' : '网页的主要观点和核心信息'}
- **关键信息2**：详细的分析和实用建议
- **关键信息3**：相关的趋势分析和发展方向

### 📊 结构化信息

#### 💡 核心价值
- 内容具有很强的实用性和参考价值
- 信息结构清晰，便于理解和应用
- 涵盖了重要的概念和实践方法

#### 🎯 应用场景
- 可作为决策参考和行动指南
- 适合用于学习和研究
- 有助于深入理解相关领域

### 🏷️ 智能标签建议
\`${isImage ? 'OCR识别, 图片处理' : isPDF ? 'PDF文档, 文档分析' : '网页内容, 在线资源'}\`

---

*🤖 AI智能提取时间：${new Date().toLocaleString('zh-CN')}*  
*📈 内容质量评分：85分*`;
  };

  /**
   * 创建网络收藏
   */
  const createCollection = () => {
    if (!newCollection.title.trim() || !newCollection.url.trim()) {
      toast({
        title: "请填写完整信息",
        description: "标题和URL不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newCollection.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const collection: LibraryItem = {
      id: Date.now().toString(),
      title: newCollection.title.trim(),
      content: newCollection.description.trim() || '暂无描述',
      type: 'collection',
      source: newCollection.url.trim(),
      sourceType: 'url',
      tags,
      isFavorite: false,
      isUsed: false,
      category: newCollection.category || '未分类',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLibraryItems(prev => [collection, ...prev]);
    setNewCollection({ title: '', url: '', description: '', tags: '', category: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "收藏成功",
      description: "新收藏已保存到资料库",
    });
  };

  /**
   * 创建文案
   */
  const createCopywriting = () => {
    if (!newCopywriting.title.trim() || !newCopywriting.content.trim()) {
      toast({
        title: "请填写完整信息",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newCopywriting.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const copywriting: LibraryItem = {
      id: Date.now().toString(),
      title: newCopywriting.title.trim(),
      content: newCopywriting.content.trim(),
      type: 'copywriting',
      tags,
      isFavorite: false,
      isUsed: false,
      category: newCopywriting.category || '未分类',
      platform: newCopywriting.platform || undefined,
      metadata: {
        wordCount: newCopywriting.content.trim().split(/\s+/).length,
        charCount: newCopywriting.content.trim().length
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLibraryItems(prev => [copywriting, ...prev]);
    setNewCopywriting({ title: '', content: '', tags: '', category: '', platform: '' });
    setIsAddDialogOpen(false);
    
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
      case 'collection':
        return { icon: <Bookmark className="w-4 h-4" />, name: '网络收藏' };
      case 'extraction':
        return { icon: <Zap className="w-4 h-4" />, name: '内容提取' };
      case 'copywriting':
        return { icon: <Brain className="w-4 h-4" />, name: '文案管理' };
      default:
        return { icon: <FileText className="w-4 h-4" />, name: '其他' };
    }
  };

  /**
   * 编辑项目
   */
  const startEdit = (item: LibraryItem) => {
    setEditingItem(item);
  };

  /**
   * 保存编辑
   */
  const saveEdit = () => {
    if (!editingItem) return;
    
    setLibraryItems(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
    
    toast({
      title: "保存成功",
      description: "内容已更新",
    });
  };

  /**
   * 取消编辑
   */
  const cancelEdit = () => {
    setEditingItem(null);
  };

  /**
   * 查看内容详情
   */
  const viewContent = (item: LibraryItem) => {
    setViewingItem(item);
  };

  /**
   * 关闭查看详情
   */
  const closeView = () => {
    setViewingItem(null);
  };

  /**
   * 关闭对话框时保持滚动位置
   */
  const handleDialogClose = (setter: (value: boolean) => void) => {
    return (open: boolean) => {
      if (!open) {
        // 延迟执行以避免页面跳转
        setTimeout(() => {
          setter(false);
        }, 0);
      } else {
        setter(true);
      }
    };
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="我的资料库"
        description="统一管理网络收藏、内容提取和文案管理"
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
              <TabsTrigger value="collection" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                网络收藏
              </TabsTrigger>
              <TabsTrigger value="extraction" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                内容提取
              </TabsTrigger>
              <TabsTrigger value="copywriting" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                文案管理
              </TabsTrigger>
            </TabsList>
            
            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setAddContentType('collection'); setIsAddDialogOpen(true); }}>
                <Bookmark className="w-4 h-4 mr-2" />
                添加收藏
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setAddContentType('extraction'); setIsAddDialogOpen(true); }}>
                <Zap className="w-4 h-4 mr-2" />
                内容提取
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setAddContentType('copywriting'); setIsAddDialogOpen(true); }}>
                <Brain className="w-4 h-4 mr-2" />
                创建文案
              </Button>
            </div>
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
                            <h3 
                              className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => viewContent(item)}
                            >
                              {item.title}
                            </h3>
                            {item.isFavorite && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {item.isUsed && (
                              <Badge variant="secondary" className="text-xs">
                                已使用
                              </Badge>
                            )}
                          </div>
                          
                          <div 
                            className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-pointer hover:text-gray-800 transition-colors"
                            onClick={() => viewContent(item)}
                          >
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
                            onClick={() => startEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
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
                  <p className="text-gray-600">
                    {searchQuery || selectedTags.length > 0 ? '没有找到匹配的资料' : '请使用右上角的按钮开始添加您的第一个资料'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 对话框组件 */}
        <Dialog open={isAddDialogOpen && addContentType === 'collection'} onOpenChange={handleDialogClose(setIsAddDialogOpen)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              添加收藏
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加网络收藏</DialogTitle>
              <DialogDescription>
                保存有价值的网页链接到资料库
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={newCollection.title}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入网页标题"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newCollection.url}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述这个网页的内容"
                  rows={3}
                />
              </div>
              <div>
                <Label>标签（用逗号分隔）</Label>
                <Input
                  value={newCollection.tags}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="营销,策略,分析"
                />
              </div>
              <div>
                <Label>分类</Label>
                <Input
                  value={newCollection.category}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="营销资料"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createCollection}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen && addContentType === 'extraction'} onOpenChange={handleDialogClose(setIsAddDialogOpen)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              内容提取
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>内容提取</DialogTitle>
              <DialogDescription>
                从网页、PDF、图片中智能提取文字内容并生成AI总结
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
                        网页链接
                      </div>
                    </SelectItem>
                    <SelectItem value="file">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        文件上传 (PDF/图片)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {extractMethod === 'url' && (
                <div>
                  <Label>网页链接</Label>
                  <Input
                    placeholder="粘贴网页URL地址，支持自动提取页面文字内容"
                    value={extractUrl}
                    onChange={(e) => setExtractUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    支持提取网页正文、标题、段落等结构化内容
                  </p>
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
                      accept=".pdf,.doc,.docx,.txt,.md,.json,.html,.htm,image/*"
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
                  <p className="text-xs text-gray-500 mt-1">
                    支持 PDF文档、Word文档、图片(PNG/JPG/JPEG)、文本文件等格式
                  </p>
                  {selectedFile && (
                    <div className="mt-2 p-3 bg-blue-50 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <File className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <div className="text-xs text-blue-600">
                        {selectedFile.type.includes('image') && '🖼️ 图片OCR文字识别'}
                        {selectedFile.type.includes('pdf') && '📄 PDF文档内容提取'}
                        {selectedFile.type.includes('text') && '📝 文本内容解析'}
                        {selectedFile.type.includes('doc') && '📄 Word文档内容提取'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-purple-50 p-3 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">AI智能处理</span>
                </div>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• 自动提取和整理文字内容</li>
                  <li>• 生成内容摘要和关键信息</li>
                  <li>• 智能分类和标签建议</li>
                  <li>• 结构化内容展示</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={extractContent} disabled={isExtracting}>
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    智能提取中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始智能提取
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen && addContentType === 'copywriting'} onOpenChange={handleDialogClose(setIsAddDialogOpen)}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
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
                  value={newCopywriting.title}
                  onChange={(e) => setNewCopywriting(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入文案标题"
                />
              </div>
              <div>
                <Label>内容</Label>
                <Textarea
                  value={newCopywriting.content}
                  onChange={(e) => setNewCopywriting(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="输入文案内容，支持Markdown格式"
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>标签（用逗号分隔）</Label>
                  <Input
                    value={newCopywriting.tags}
                    onChange={(e) => setNewCopywriting(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="营销,文案,推广"
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input
                    value={newCopywriting.category}
                    onChange={(e) => setNewCopywriting(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="营销文案"
                  />
                </div>
              </div>
              <div>
                <Label>平台</Label>
                <Input
                  value={newCopywriting.platform}
                  onChange={(e) => setNewCopywriting(prev => ({ ...prev, platform: e.target.value }))}
                  placeholder="微信公众号"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createCopywriting}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑对话框 */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setTimeout(() => cancelEdit(), 0)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑内容</DialogTitle>
              <DialogDescription>
                修改{editingItem?.type === 'collection' ? '网络收藏' : 
                     editingItem?.type === 'extraction' ? '内容提取' : '文案管理'}内容
              </DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label>标题</Label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="输入标题"
                  />
                </div>
                <div>
                  <Label>内容</Label>
                  <Textarea
                    value={editingItem.content}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    placeholder="输入内容"
                    rows={8}
                  />
                </div>
                {editingItem.type === 'collection' && (
                  <div>
                    <Label>链接</Label>
                    <Input
                      value={editingItem.source || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>标签（用逗号分隔）</Label>
                    <Input
                      value={editingItem.tags.join(', ')}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      placeholder="标签1, 标签2"
                    />
                  </div>
                  <div>
                    <Label>分类</Label>
                    <Input
                      value={editingItem.category || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      placeholder="分类名称"
                    />
                  </div>
                </div>
                {editingItem.type === 'copywriting' && (
                  <div>
                    <Label>平台</Label>
                    <Input
                      value={editingItem.platform || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, platform: e.target.value })}
                      placeholder="发布平台"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={cancelEdit}>
                取消
              </Button>
              <Button onClick={saveEdit}>
                <Save className="w-4 h-4 mr-2" />
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 查看内容对话框 */}
        <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setTimeout(() => closeView(), 0)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {viewingItem?.title}
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={closeView}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <DialogDescription>
                {viewingItem?.type === 'collection' ? '网络收藏' : 
                 viewingItem?.type === 'extraction' ? '内容提取' : '文案管理'}
                {viewingItem?.source && ` • 来源：${viewingItem.source}`}
              </DialogDescription>
            </DialogHeader>
            
            {viewingItem && (
              <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                {/* 标签和分类 */}
                <div className="flex flex-wrap gap-2">
                  {viewingItem.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {viewingItem.category && (
                    <Badge variant="secondary" className="text-xs">
                      {viewingItem.category}
                    </Badge>
                  )}
                </div>

                {/* AI总结 */}
                {viewingItem.summary && (
                  <div className="p-4 bg-purple-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-purple-700">AI总结</span>
                    </div>
                    <p className="text-purple-600 text-sm">{viewingItem.summary}</p>
                  </div>
                )}

                {/* 主要内容 */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {viewingItem.content}
                  </div>
                </div>

                {/* 元数据 */}
                {viewingItem.metadata && (
                  <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
                    {viewingItem.metadata.wordCount && (
                      <div>字数：{viewingItem.metadata.wordCount}</div>
                    )}
                    {viewingItem.metadata.charCount && (
                      <div>字符数：{viewingItem.metadata.charCount}</div>
                    )}
                    {viewingItem.metadata.date && (
                      <div>日期：{viewingItem.metadata.date}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewingItem && copyContent(viewingItem.content)}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制内容
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewingItem) {
                    setEditingItem(viewingItem);
                    closeView();
                  }
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 