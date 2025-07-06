/**
 * 代办事项组件
 * 支持苹果风格的日历和任务管理
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
  CheckSquare,
  Square,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 代办事项接口
 */
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

/**
 * 代办事项组件
 * @returns React 组件
 */
export function TodoList() {
  const { toast } = useToast();
  
  // 状态管理
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  
  // 新任务表单
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    category: '',
    tags: ''
  });

  /**
   * 初始化示例数据
   */
  useEffect(() => {
    const sampleTodos: TodoItem[] = [
      {
        id: '1',
        title: '完成产品推广文案',
        description: '为新产品撰写推广文案，包括微信公众号、微博等多个平台',
        completed: false,
        priority: 'high',
        dueDate: '2024-02-15',
        category: '内容创作',
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-02-10T10:00:00Z',
        tags: ['文案', '推广', '产品']
      },
      {
        id: '2',
        title: '策划情人节营销活动',
        description: '设计情人节主题营销活动，包括活动方案、预算规划等',
        completed: true,
        priority: 'high',
        dueDate: '2024-02-14',
        category: '营销策划',
        createdAt: '2024-02-08T14:30:00Z',
        updatedAt: '2024-02-14T16:00:00Z',
        tags: ['情人节', '营销', '活动']
      },
      {
        id: '3',
        title: '更新品牌素材库',
        description: '整理和更新品牌相关的图片、视频等素材',
        completed: false,
        priority: 'medium',
        dueDate: '2024-02-20',
        category: '品牌管理',
        createdAt: '2024-02-12T09:15:00Z',
        updatedAt: '2024-02-12T09:15:00Z',
        tags: ['品牌', '素材', '整理']
      },
      {
        id: '4',
        title: '分析竞品营销策略',
        description: '研究竞争对手的营销策略和内容表现',
        completed: false,
        priority: 'medium',
        dueDate: '2024-02-18',
        category: '市场分析',
        createdAt: '2024-02-11T11:20:00Z',
        updatedAt: '2024-02-11T11:20:00Z',
        tags: ['竞品', '分析', '策略']
      },
      {
        id: '5',
        title: '准备周报内容',
        description: '整理本周工作成果，准备周报汇报',
        completed: false,
        priority: 'low',
        dueDate: '2024-02-16',
        category: '日常工作',
        createdAt: '2024-02-13T15:45:00Z',
        updatedAt: '2024-02-13T15:45:00Z',
        tags: ['周报', '汇报', '总结']
      }
    ];
    
    setTodos(sampleTodos);
    setFilteredTodos(sampleTodos);
  }, []);

  /**
   * 筛选和排序任务
   */
  useEffect(() => {
    let filtered = [...todos];

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 状态筛选
    if (filterStatus === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // 优先级筛选
    if (filterPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filterPriority);
    }

    // 按创建时间排序
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredTodos(filtered);
  }, [todos, searchQuery, filterStatus, filterPriority]);

  /**
   * 创建新任务
   */
  const createTodo = () => {
    if (!newTodo.title.trim()) {
      toast({
        title: "请填写任务标题",
        description: "任务标题不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newTodo.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title.trim(),
      description: newTodo.description.trim() || undefined,
      completed: false,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || undefined,
      category: newTodo.category || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags.length > 0 ? tags : undefined
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo({ title: '', description: '', priority: 'medium', dueDate: '', category: '', tags: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "任务创建成功",
      description: "新任务已添加到列表",
    });
  };

  /**
   * 更新任务
   */
  const updateTodo = () => {
    if (!editingTodo) return;

    const updatedTodo = {
      ...editingTodo,
      updatedAt: new Date().toISOString()
    };

    setTodos(prev => prev.map(todo => 
      todo.id === editingTodo.id ? updatedTodo : todo
    ));
    
    setEditingTodo(null);
    
    toast({
      title: "任务更新成功",
      description: "任务信息已保存",
    });
  };

  /**
   * 删除任务
   */
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast({
      title: "任务已删除",
      description: "任务已从列表中移除",
    });
  };

  /**
   * 切换完成状态
   */
  const toggleComplete = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() } : todo
    ));
  };

  /**
   * 获取优先级颜色
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 获取优先级标签
   */
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '中';
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * 检查是否过期
   */
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  /**
   * 获取统计信息
   */
  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(todo => todo.dueDate && isOverdue(todo.dueDate) && !todo.completed).length;

    return { total, completed, pending, overdue };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总任务</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待完成</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Circle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已过期</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工具栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 筛选按钮 */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                全部
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                待完成
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                已完成
              </Button>
            </div>

            {/* 优先级筛选 */}
            <div className="flex gap-2">
              <Button
                variant={filterPriority === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('all')}
              >
                全部
              </Button>
              <Button
                variant={filterPriority === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('high')}
              >
                高
              </Button>
              <Button
                variant={filterPriority === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('medium')}
              >
                中
              </Button>
              <Button
                variant={filterPriority === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('low')}
              >
                低
              </Button>
            </div>

            {/* 创建按钮 */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新建任务
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新任务</DialogTitle>
                  <DialogDescription>
                    添加新的代办事项
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>任务标题 *</Label>
                    <Input
                      value={newTodo.title}
                      onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入任务标题"
                    />
                  </div>
                  <div>
                    <Label>任务描述</Label>
                    <Textarea
                      value={newTodo.description}
                      onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入任务描述"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>优先级</Label>
                      <select
                        value={newTodo.priority}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                    <div>
                      <Label>截止日期</Label>
                      <Input
                        type="date"
                        value={newTodo.dueDate}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>分类</Label>
                      <Input
                        value={newTodo.category}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="工作、生活、学习"
                      />
                    </div>
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input
                        value={newTodo.tags}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="重要,紧急,项目"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createTodo}>
                    创建
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <div className="space-y-2">
        {filteredTodos.map((todo) => (
          <Card key={todo.id} className={`transition-all ${todo.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComplete(todo.id)}
                  className="mt-0.5"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`text-sm text-gray-600 mt-1 ${todo.completed ? 'line-through' : ''}`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPriorityColor(todo.priority)}>
                          {getPriorityLabel(todo.priority)}
                        </Badge>
                        {todo.category && (
                          <Badge variant="outline" className="text-xs">
                            {todo.category}
                          </Badge>
                        )}
                        {todo.dueDate && (
                          <div className={`flex items-center gap-1 text-xs ${
                            isOverdue(todo.dueDate) ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(todo.dueDate)}
                            {isOverdue(todo.dueDate) && <span>（已过期）</span>}
                          </div>
                        )}
                      </div>
                      
                      {todo.tags && todo.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {todo.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTodo(todo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredTodos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' 
                ? '没有找到匹配的任务' 
                : '开始创建你的第一个任务'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && filterPriority === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建任务
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 编辑对话框 */}
      {editingTodo && (
        <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑任务</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>任务标题</Label>
                <Input
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>任务描述</Label>
                <Textarea
                  value={editingTodo.description || ''}
                  onChange={(e) => setEditingTodo(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>优先级</Label>
                  <select
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
                <div>
                  <Label>截止日期</Label>
                  <Input
                    type="date"
                    value={editingTodo.dueDate || ''}
                    onChange={(e) => setEditingTodo(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>分类</Label>
                  <Input
                    value={editingTodo.category || ''}
                    onChange={(e) => setEditingTodo(prev => prev ? { ...prev, category: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>标签（用逗号分隔）</Label>
                  <Input
                    value={editingTodo.tags?.join(', ') || ''}
                    onChange={(e) => setEditingTodo(prev => prev ? { 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    } : null)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTodo(null)}>
                取消
              </Button>
              <Button onClick={updateTodo}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 