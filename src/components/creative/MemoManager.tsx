/**
 * 文案管理组件
 * 支持文案保存、标签管理、搜索筛选等功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Tag,
  Star,
  Clock,
  Check,
  X,
  MoreHorizontal,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 文案数据接口
 */
interface MemoItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isUsed: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string;
  platform?: string;
}

/**
 * 文案管理组件
 * @returns React 组件
 */
export function MemoManager() {
  const { toast } = useToast();
  
  // 状态管理
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<MemoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>('all');
  const [filterFavorite, setFilterFavorite] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'title' | 'tags'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 编辑状态
  const [editingMemo, setEditingMemo] = useState<MemoItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // 新文案表单
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
  useEffect(() => {
    const sampleMemos: MemoItem[] = [
      {
        id: '1',
        title: '产品推广文案',
        content: '🎯 核心卖点：\n• 高效便捷的操作体验\n• 专业可靠的技术支持\n• 性价比超高的解决方案\n\n💡 创意亮点：\n将复杂的技术问题简单化，让每个用户都能轻松上手。',
        tags: ['产品推广', '技术', '用户体验'],
        isUsed: true,
        isFavorite: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        category: '产品营销',
        platform: '微信公众号'
      },
      {
        id: '2',
        title: '节日营销活动',
        content: '🎉 新年特惠活动\n\n📅 活动时间：1月1日-1月31日\n🎁 活动内容：\n• 全场8折优惠\n• 满减活动\n• 抽奖送好礼\n\n🔥 限时抢购，先到先得！',
        tags: ['节日营销', '促销', '新年'],
        isUsed: false,
        isFavorite: false,
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-10T14:20:00Z',
        category: '节日营销',
        platform: '微博'
      },
      {
        id: '3',
        title: '品牌故事文案',
        content: '🌟 我们的故事\n\n从一个小小的想法开始，到如今服务千万用户。每一步都凝聚着团队的心血和用户的信任。\n\n我们相信，技术可以改变世界，而我们的使命就是让这种改变更加美好。',
        tags: ['品牌故事', '企业文化', '使命愿景'],
        isUsed: true,
        isFavorite: true,
        createdAt: '2024-01-05T09:15:00Z',
        updatedAt: '2024-01-05T09:15:00Z',
        category: '品牌建设',
        platform: '官网'
      }
    ];
    
    setMemos(sampleMemos);
    setFilteredMemos(sampleMemos);
  }, []);

  /**
   * 筛选和排序文案
   */
  useEffect(() => {
    let filtered = [...memos];

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(memo => 
        memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(memo => 
        selectedTags.some(tag => memo.tags.includes(tag))
      );
    }

    // 使用状态筛选
    if (filterUsed === 'used') {
      filtered = filtered.filter(memo => memo.isUsed);
    } else if (filterUsed === 'unused') {
      filtered = filtered.filter(memo => !memo.isUsed);
    }

    // 收藏状态筛选
    if (filterFavorite !== null) {
      filtered = filtered.filter(memo => memo.isFavorite === filterFavorite);
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
        case 'tags':
          comparison = a.tags.length - b.tags.length;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMemos(filtered);
  }, [memos, searchQuery, selectedTags, filterUsed, filterFavorite, sortBy, sortOrder]);

  /**
   * 获取所有标签
   */
  const getAllTags = () => {
    const tagSet = new Set<string>();
    memos.forEach(memo => {
      memo.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  /**
   * 创建新文案
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
    
    const memo: MemoItem = {
      id: Date.now().toString(),
      title: newMemo.title.trim(),
      content: newMemo.content.trim(),
      tags,
      isUsed: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: newMemo.category || undefined,
      platform: newMemo.platform || undefined
    };

    setMemos(prev => [memo, ...prev]);
    setNewMemo({ title: '', content: '', tags: '', category: '', platform: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "文案创建成功",
      description: "新文案已保存",
    });
  };

  /**
   * 更新文案
   */
  const updateMemo = () => {
    if (!editingMemo) return;

    const updatedMemo = {
      ...editingMemo,
      updatedAt: new Date().toISOString()
    };

    setMemos(prev => prev.map(memo => 
      memo.id === editingMemo.id ? updatedMemo : memo
    ));
    
    setEditingMemo(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "文案更新成功",
      description: "文案已保存",
    });
  };

  /**
   * 删除文案
   */
  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(memo => memo.id !== id));
    toast({
      title: "文案已删除",
      description: "文案已从列表中移除",
    });
  };

  /**
   * 复制文案内容
   */
  const copyMemo = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "文案内容已复制",
    });
  };

  /**
   * 切换使用状态
   */
  const toggleUsed = (id: string) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id ? { ...memo, isUsed: !memo.isUsed } : memo
    ));
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id ? { ...memo, isFavorite: !memo.isFavorite } : memo
    ));
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

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索文案标题、内容或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 筛选按钮 */}
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>

            {/* 创建按钮 */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新建文案
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>创建新文案</DialogTitle>
                  <DialogDescription>
                    添加新的文案内容，支持Markdown格式
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
                        placeholder="营销,产品,推广"
                      />
                    </div>
                    <div>
                      <Label>分类</Label>
                      <Input
                        value={newMemo.category}
                        onChange={(e) => setNewMemo(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="产品营销"
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
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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

          {/* 筛选选项 */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {/* 标签筛选 */}
            <div className="flex items-center gap-2">
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

            {/* 使用状态筛选 */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600">状态：</span>
              <Button
                size="sm"
                variant={filterUsed === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterUsed('all')}
              >
                全部
              </Button>
              <Button
                size="sm"
                variant={filterUsed === 'used' ? 'default' : 'outline'}
                onClick={() => setFilterUsed('used')}
              >
                已使用
              </Button>
              <Button
                size="sm"
                variant={filterUsed === 'unused' ? 'default' : 'outline'}
                onClick={() => setFilterUsed('unused')}
              >
                未使用
              </Button>
            </div>

            {/* 收藏筛选 */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600">收藏：</span>
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
          </div>
        </CardContent>
      </Card>

      {/* 文案列表 */}
      <div className="grid gap-4">
        {filteredMemos.map((memo) => (
          <Card key={memo.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{memo.title}</h3>
                    {memo.isUsed && (
                      <Badge variant="secondary" className="text-xs">
                        已使用
                      </Badge>
                    )}
                    {memo.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {memo.content}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {memo.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(memo.updatedAt)}
                    </span>
                    {memo.category && (
                      <span>{memo.category}</span>
                    )}
                    {memo.platform && (
                      <span>{memo.platform}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleUsed(memo.id)}
                  >
                    {memo.isUsed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(memo.id)}
                  >
                    <Star className={`w-4 h-4 ${memo.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyMemo(memo.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingMemo(memo);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMemo(memo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑文案</DialogTitle>
          </DialogHeader>
          {editingMemo && (
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={editingMemo.title}
                  onChange={(e) => setEditingMemo(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>内容</Label>
                <Textarea
                  value={editingMemo.content}
                  onChange={(e) => setEditingMemo(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>标签（用逗号分隔）</Label>
                  <Input
                    value={editingMemo.tags.join(', ')}
                    onChange={(e) => setEditingMemo(prev => prev ? { 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    } : null)}
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input
                    value={editingMemo.category || ''}
                    onChange={(e) => setEditingMemo(prev => prev ? { ...prev, category: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label>平台</Label>
                <Input
                  value={editingMemo.platform || ''}
                  onChange={(e) => setEditingMemo(prev => prev ? { ...prev, platform: e.target.value } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={updateMemo}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 空状态 */}
      {filteredMemos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文案</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedTags.length > 0 ? '没有找到匹配的文案' : '开始创建你的第一个文案'}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建文案
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 