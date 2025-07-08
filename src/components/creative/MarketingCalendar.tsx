/**
 * 营销日历组件
 * 支持国历、农历、节假日、24节气、历史上的今天等
 * 融合待办事项功能，参考macOS日历样式
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Gift,
  Leaf,
  BookOpen,
  TrendingUp,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Tag,
  Filter,
  Search,
  MoreHorizontal,
  X,
  Edit3,
  Move,
  AlertCircle,
  Flag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 日历事件接口
 */
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'solar_term' | 'history' | 'lunar_holiday' | 'international' | 'custom';
  description?: string;
  color?: string;
  isLegalHoliday?: boolean;
}

/**
 * 待办事项接口
 */
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  group?: string;
  links?: string[]; // 双链功能
  createdAt: string;
  updatedAt: string;
}

/**
 * 营销日历组件
 * @returns React 组件
 */
export function MarketingCalendar() {
  const { toast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // 新待办事项表单
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    date: '',
    tags: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    group: ''
  });

  // 编辑待办事项状态
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    tags: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    group: ''
  });

  // 显示/隐藏侧边栏和对话框
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 拖拽相关状态
  const [draggedTodo, setDraggedTodo] = useState<TodoItem | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  /**
   * 获取当前月份的天数
   */
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * 获取月份第一天是星期几 (修改为周一开始)
   */
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // 周日(0)变为6，其他减1
  };

  /**
   * 生成日历网格 (周一开始)
   */
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 添加上个月的剩余天数
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // 添加当前月的天数
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true
      });
    }

    // 添加下个月的天数
    const remainingDays = 42 - days.length; // 6行7列 = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  /**
   * 获取日期的事件
   */
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  /**
   * 获取日期的待办事项
   */
  const getTodosForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return todos.filter(todo => todo.date === dateString);
  };

  /**
   * 判断是否为周末
   */
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 周日和周六
  };

  /**
   * 获取事件图标
   */
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday':
      case 'lunar_holiday':
        return <Gift className="w-3 h-3" />;
      case 'solar_term':
        return <Leaf className="w-3 h-3" />;
      case 'history':
        return <BookOpen className="w-3 h-3" />;
      case 'international':
        return <Flag className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  /**
   * 获取事件颜色
   */
  const getEventColor = (type: string, isLegal?: boolean) => {
    if (isLegal) {
      return 'bg-red-100 text-red-800 border-red-300 font-semibold';
    }
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lunar_holiday':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'solar_term':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'history':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'international':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 获取优先级颜色和图标
   */
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'high':
        return { 
          color: 'bg-red-50 text-red-700 border-red-200', 
          icon: <AlertCircle className="w-3 h-3" />,
          text: '高'
        };
      case 'medium':
        return { 
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
          icon: <Clock className="w-3 h-3" />,
          text: '中'
        };
      case 'low':
        return { 
          color: 'bg-green-50 text-green-700 border-green-200', 
          icon: <CheckSquare className="w-3 h-3" />,
          text: '低'
        };
      default:
        return { 
          color: 'bg-gray-50 text-gray-700 border-gray-200', 
          icon: <Square className="w-3 h-3" />,
          text: '低'
        };
    }
  };

  /**
   * 初始化示例数据 - 增加更多节假日
   */
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      // 法定节假日
      {
        id: '1',
        title: '春节',
        date: '2024-02-10',
        type: 'holiday',
        description: '农历新年，最重要的传统节日',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '2',
        title: '国庆节',
        date: '2024-10-01',
        type: 'holiday',
        description: '中华人民共和国成立纪念日',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '3',
        title: '劳动节',
        date: '2024-05-01',
        type: 'holiday',
        description: '国际劳动节',
        color: 'red',
        isLegalHoliday: true
      },
      // 24节气
      {
        id: '4',
        title: '立春',
        date: '2024-02-04',
        type: 'solar_term',
        description: '二十四节气之首，春季开始',
        color: 'green'
      },
      {
        id: '5',
        title: '春分',
        date: '2024-03-20',
        type: 'solar_term',
        description: '昼夜平分，春季中点',
        color: 'green'
      },
      // 农历节日
      {
        id: '6',
        title: '元宵节',
        date: '2024-02-24',
        type: 'lunar_holiday',
        description: '农历正月十五，观灯节',
        color: 'orange'
      },
      {
        id: '7',
        title: '中秋节',
        date: '2024-09-17',
        type: 'lunar_holiday',
        description: '农历八月十五，团圆节',
        color: 'orange'
      },
      // 国际节日
      {
        id: '8',
        title: '情人节',
        date: '2024-02-14',
        type: 'international',
        description: '西方情人节',
        color: 'pink'
      },
      {
        id: '9',
        title: '妇女节',
        date: '2024-03-08',
        type: 'international',
        description: '国际妇女节',
        color: 'purple'
      },
      {
        id: '10',
        title: '世界地球日',
        date: '2024-04-22',
        type: 'international',
        description: '保护地球环境的节日',
        color: 'green'
      },
      // 历史上的今天
      {
        id: '11',
        title: '世界无线电日',
        date: '2024-02-13',
        type: 'history',
        description: '联合国设立的世界无线电日',
        color: 'blue'
      }
    ];

    const sampleTodos: TodoItem[] = [
      {
        id: '1',
        title: '完成产品推广文案',
        description: '为新产品撰写推广文案，包括微信公众号、微博等多个平台',
        date: '2024-02-15',
        completed: false,
        tags: ['文案', '推广', '产品'],
        priority: 'high',
        group: '内容创作',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: '策划情人节营销活动',
        description: '设计情人节主题营销活动，包括活动方案、预算规划等',
        date: '2024-02-14',
        completed: true,
        tags: ['情人节', '营销', '活动'],
        priority: 'high',
        group: '营销策划',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: '更新品牌素材库',
        description: '整理和更新品牌相关的图片、视频等素材',
        date: '2024-02-20',
        completed: false,
        tags: ['品牌', '素材', '整理'],
        priority: 'medium',
        group: '品牌管理',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setEvents(sampleEvents);
    setTodos(sampleTodos);
    setFilteredTodos(sampleTodos);
  }, []);

  /**
   * 筛选和排序待办事项
   */
  useEffect(() => {
    let filtered = [...todos];

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(todo => 
        selectedTags.some(tag => todo.tags.includes(tag))
      );
    }

    // 分组筛选
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(todo => todo.group === selectedGroup);
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTodos(filtered);
  }, [todos, searchQuery, selectedTags, selectedGroup, sortBy, sortOrder]);

  /**
   * 获取所有标签
   */
  const getAllTags = () => {
    const allTags = new Set<string>();
    todos.forEach(todo => {
      todo.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  /**
   * 获取所有分组
   */
  const getAllGroups = () => {
    const allGroups = new Set<string>();
    todos.forEach(todo => {
      if (todo.group) allGroups.add(todo.group);
    });
    return Array.from(allGroups);
  };

  /**
   * 添加待办事项
   */
  const addTodo = () => {
    if (!newTodo.title.trim() || !newTodo.date) {
      toast({
        title: "请填写必要信息",
        description: "标题和日期不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = newTodo.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title.trim(),
      description: newTodo.description.trim(),
      date: newTodo.date,
      completed: false,
      tags,
      priority: newTodo.priority,
      group: newTodo.group || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTodos(prev => [...prev, todo]);
    
    // 重置表单
    setNewTodo({
      title: '',
      description: '',
      date: '',
      tags: '',
      priority: 'medium',
      group: ''
    });

    setShowAddDialog(false);

    toast({
      title: "添加成功",
      description: "待办事项已添加到日历",
    });
  };

  /**
   * 切换待办事项完成状态
   */
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        updatedAt: new Date().toISOString()
      } : todo
    ));
  };

  /**
   * 删除待办事项
   */
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast({
      title: "删除成功",
      description: "待办事项已删除",
    });
  };

  /**
   * 开始编辑待办事项
   */
  const startEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      date: todo.date,
      tags: todo.tags.join(', '),
      priority: todo.priority,
      group: todo.group || ''
    });
    setShowEditDialog(true);
  };

  /**
   * 保存编辑的待办事项
   */
  const saveEditTodo = () => {
    if (!editingTodo || !editForm.title.trim() || !editForm.date) {
      toast({
        title: "请填写必要信息",
        description: "标题和日期不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    setTodos(prev => prev.map(todo => 
      todo.id === editingTodo.id ? {
        ...todo,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        date: editForm.date,
        tags,
        priority: editForm.priority,
        group: editForm.group || undefined,
        updatedAt: new Date().toISOString()
      } : todo
    ));

    setShowEditDialog(false);
    setEditingTodo(null);

    toast({
      title: "保存成功",
      description: "待办事项已更新",
    });
  };

  /**
   * 拖拽开始
   */
  const handleDragStart = (e: React.DragEvent, todo: TodoItem) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * 拖拽结束
   */
  const handleDragEnd = () => {
    setDraggedTodo(null);
    setDragOverDate(null);
  };

  /**
   * 拖拽悬停
   */
  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date.toISOString().split('T')[0]);
  };

  /**
   * 放置拖拽
   */
  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    
    if (draggedTodo) {
      const newDate = date.toISOString().split('T')[0];
      setTodos(prev => prev.map(todo => 
        todo.id === draggedTodo.id ? {
          ...todo,
          date: newDate,
          updatedAt: new Date().toISOString()
        } : todo
      ));

      toast({
        title: "移动成功",
        description: `待办事项已移动到 ${date.toLocaleDateString('zh-CN')}`,
      });
    }
    
    setDraggedTodo(null);
    setDragOverDate(null);
  };

  /**
   * 格式化日期
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * 获取农历日期（模拟）
   */
  const getLunarDate = (date: Date) => {
    const lunarDates = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    const day = date.getDate();
    return lunarDates[(day - 1) % 30] || '初一';
  };

  /**
   * 获取历史上的今天（模拟）
   */
  const getHistoryToday = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const historyEvents = {
      '2-14': '情人节',
      '2-15': '世界无线电日',
      '2-20': '世界社会公正日',
      '3-8': '国际妇女节',
      '3-12': '植树节',
      '4-22': '世界地球日',
      '5-1': '国际劳动节',
      '6-1': '国际儿童节',
      '10-1': '国庆节',
      '12-25': '圣诞节'
    };
    
    const key = `${month}-${day}`;
    return historyEvents[key] || null;
  };

  /**
   * 日期选择器
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setNewTodo(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* 日历头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                今天
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    添加待办
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加待办事项</DialogTitle>
                    <DialogDescription>
                      创建新的待办事项到日历中
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>标题 *</Label>
                      <Input
                        value={newTodo.title}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="输入待办事项标题"
                      />
                    </div>
                    
                    <div>
                      <Label>描述</Label>
                      <Textarea
                        value={newTodo.description}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="输入详细描述"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>日期 *</Label>
                      <Input
                        type="date"
                        value={newTodo.date}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>优先级</Label>
                        <select
                          value={newTodo.priority}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="low">低</option>
                          <option value="medium">中</option>
                          <option value="high">高</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label>分组</Label>
                        <Input
                          value={newTodo.group}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, group: e.target.value }))}
                          placeholder="输入分组名称"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input
                        value={newTodo.tags}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="营销,策划,重要"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={addTodo}>
                      添加
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* 星期标题 - 周一开始 */}
            {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
              <div 
                key={day} 
                className={`h-10 flex items-center justify-center text-sm font-medium ${
                  index >= 5 ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
            
            {/* 日历网格 */}
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const dayTodos = getTodosForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              const historyEvent = getHistoryToday(day.date);
              const isDragOver = dragOverDate === day.date.toISOString().split('T')[0];
              const isWeekendDay = isWeekend(day.date);
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors
                    ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : isWeekendDay ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                    ${isDragOver ? 'bg-green-100 border-green-400 border-2' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                  onDragOver={(e) => handleDragOver(e, day.date)}
                  onDrop={(e) => handleDrop(e, day.date)}
                >
                  {/* 日期数字 */}
                  <div className={`text-sm font-medium mb-1 ${isWeekendDay && day.isCurrentMonth ? 'text-red-600' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* 农历日期 */}
                  {day.isCurrentMonth && (
                    <div className="text-xs text-gray-500 mb-1">
                      {getLunarDate(day.date)}
                    </div>
                  )}
                  
                  {/* 事件和待办事项 */}
                  <div className="space-y-1">
                    {/* 节假日和事件 */}
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded flex items-center gap-1 ${getEventColor(event.type, event.isLegalHoliday)}`}
                        title={event.description}
                      >
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    
                    {/* 历史上的今天 */}
                    {historyEvent && (
                      <div className="text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800 flex items-center gap-1">
                        <BookOpen className="w-2 h-2" />
                        <span className="truncate">{historyEvent}</span>
                      </div>
                    )}
                    
                    {/* 待办事项 */}
                    {dayTodos.slice(0, 2).map(todo => {
                      const priorityDisplay = getPriorityDisplay(todo.priority);
                      return (
                        <div
                          key={todo.id}
                          className={`
                            text-xs px-1 py-0.5 rounded flex items-center gap-1 cursor-pointer group relative
                            ${todo.completed ? 'bg-gray-100 text-gray-500 line-through' : priorityDisplay.color}
                          `}
                          draggable={!todo.completed}
                          onDragStart={(e) => handleDragStart(e, todo)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditTodo(todo);
                          }}
                          title={todo.description || todo.title}
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-2 h-2" />
                          ) : (
                            priorityDisplay.icon
                          )}
                          <span className="truncate flex-1">{todo.title}</span>
                          <Edit3 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                    
                    {/* 更多待办事项提示 */}
                    {dayTodos.length > 2 && (
                      <div className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                        +{dayTodos.length - 2} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 编辑待办事项对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑待办事项</DialogTitle>
            <DialogDescription>
              修改待办事项的详细信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>标题 *</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入待办事项标题"
              />
            </div>
            
            <div>
              <Label>描述</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入详细描述"
                rows={3}
              />
            </div>
            
            <div>
              <Label>日期 *</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>优先级</Label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              
              <div>
                <Label>分组</Label>
                <Input
                  value={editForm.group}
                  onChange={(e) => setEditForm(prev => ({ ...prev, group: e.target.value }))}
                  placeholder="输入分组名称"
                />
              </div>
            </div>
            
            <div>
              <Label>标签（用逗号分隔）</Label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="营销,策划,重要"
              />
            </div>
            
            {editingTodo && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>完成状态</Label>
                  <Button
                    variant={editingTodo.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTodo(editingTodo.id)}
                    className="w-full"
                  >
                    {editingTodo.completed ? '已完成' : '未完成'}
                  </Button>
                </div>
                <div>
                  <Label>删除</Label>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deleteTodo(editingTodo.id);
                      setShowEditDialog(false);
                      setEditingTodo(null);
                    }}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={saveEditTodo}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 侧边栏 - 待办事项管理 */}
      {showSidebar && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              待办事项管理
            </CardTitle>
            
            {/* 筛选和搜索 */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索待办事项..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">所有分组</option>
                {getAllGroups().map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="date">按日期</option>
                <option value="priority">按优先级</option>
                <option value="title">按标题</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '升序' : '降序'}
              </Button>
            </div>

            {/* 标签筛选 */}
            <div className="flex flex-wrap gap-1 mt-2">
              {getAllTags().map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
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
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTodos.map(todo => {
                const priorityDisplay = getPriorityDisplay(todo.priority);
                return (
                  <div
                    key={todo.id}
                    className={`
                      p-3 border rounded-lg flex items-start gap-3 transition-all
                      ${todo.completed ? 'bg-gray-50' : 'bg-white hover:shadow-sm'}
                    `}
                    draggable={!todo.completed}
                    onDragStart={(e) => handleDragStart(e, todo)}
                    onDragEnd={handleDragEnd}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="mt-1"
                    >
                      {todo.completed ? (
                        <CheckSquare className="w-4 h-4 text-green-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditTodo(todo)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTodo(todo.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {todo.description && (
                        <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {new Date(todo.date).toLocaleDateString('zh-CN')}
                        </Badge>
                        
                        <Badge className={`text-xs ${priorityDisplay.color}`}>
                          {priorityDisplay.icon}
                          <span className="ml-1">{priorityDisplay.text}</span>
                        </Badge>
                        
                        {todo.group && (
                          <Badge variant="outline" className="text-xs">
                            {todo.group}
                          </Badge>
                        )}
                        
                        {todo.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}

                        {!todo.completed && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            <Move className="w-2 h-2 mr-1" />
                            可拖拽
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredTodos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p>暂无待办事项</p>
                  <p className="text-sm">点击上方"添加待办"创建新任务</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 