/**
 * 营销日历组件
 * 支持国历、农历、节假日、24节气、历史上的今天等
 * 融合待办事项功能，参考macOS日历样式
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 日历事件接口
 */
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'solar_term' | 'history' | 'custom';
  description?: string;
  color?: string;
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

  // 显示/隐藏侧边栏
  const [showSidebar, setShowSidebar] = useState(true);

  /**
   * 获取当前月份的天数
   */
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * 获取月份第一天是星期几
   */
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  /**
   * 生成日历网格
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
   * 获取事件图标
   */
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday':
        return <Gift className="w-3 h-3" />;
      case 'solar_term':
        return <Leaf className="w-3 h-3" />;
      case 'history':
        return <BookOpen className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  /**
   * 获取事件颜色
   */
  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'solar_term':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'history':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
   * 初始化示例数据
   */
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: '春节',
        date: '2024-02-10',
        type: 'holiday',
        description: '农历新年，最重要的传统节日',
        color: 'red'
      },
      {
        id: '2',
        title: '立春',
        date: '2024-02-04',
        type: 'solar_term',
        description: '二十四节气之首，春季开始',
        color: 'green'
      },
      {
        id: '3',
        title: '情人节',
        date: '2024-02-14',
        type: 'custom',
        description: '西方情人节',
        color: 'pink'
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
        group: '内容创作'
      },
      {
        id: '2',
        title: '策划情人节营销活动',
        description: '设计情人节主题营销活动，包括活动方案、预算规划等',
        date: '2024-02-14',
        completed: true,
        tags: ['情人节', '营销', '活动'],
        priority: 'high',
        group: '营销策划'
      },
      {
        id: '3',
        title: '更新品牌素材库',
        description: '整理和更新品牌相关的图片、视频等素材',
        date: '2024-02-20',
        completed: false,
        tags: ['品牌', '素材', '整理'],
        priority: 'medium',
        group: '品牌管理'
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
      group: newTodo.group || undefined
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
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
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
    // 这里应该调用真实的农历API
    const lunarDates = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十'];
    const day = date.getDate();
    return lunarDates[day % 10] || '十五';
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
      '2-20': '世界社会公正日'
    };
    
    const key = `${month}-${day}`;
    return historyEvents[key] || null;
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
            {/* 星期标题 */}
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
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
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors
                    ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  {/* 日期数字 */}
                  <div className="text-sm font-medium mb-1">
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
                        className={`text-xs px-1 py-0.5 rounded ${getEventColor(event.type)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {/* 历史上的今天 */}
                    {historyEvent && (
                      <div className="text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800">
                        {historyEvent}
                      </div>
                    )}
                    
                    {/* 待办事项 */}
                    {dayTodos.slice(0, 2).map(todo => (
                      <div
                        key={todo.id}
                        className={`
                          text-xs px-1 py-0.5 rounded flex items-center gap-1 cursor-pointer
                          ${todo.completed ? 'bg-gray-100 text-gray-500 line-through' : getPriorityColor(todo.priority)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTodo(todo.id);
                        }}
                      >
                        {todo.completed ? (
                          <CheckSquare className="w-2 h-2" />
                        ) : (
                          <Square className="w-2 h-2" />
                        )}
                        {todo.title}
                      </div>
                    ))}
                    
                    {/* 更多待办事项提示 */}
                    {dayTodos.length > 2 && (
                      <div className="text-xs text-gray-500">
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

      {/* 侧边栏 - 待办事项管理 */}
      {showSidebar && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 添加新待办事项 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                添加待办事项
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题 *</label>
                <Input
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入待办事项标题"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">描述</label>
                <Textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入详细描述"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">日期 *</label>
                <Input
                  type="date"
                  value={newTodo.date}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">标签</label>
                <Input
                  value={newTodo.tags}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="用逗号分隔多个标签"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">优先级</label>
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
                <label className="text-sm font-medium">分组</label>
                <Input
                  value={newTodo.group}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, group: e.target.value }))}
                  placeholder="输入分组名称"
                />
              </div>
              
              <Button onClick={addTodo} className="w-full">
                添加待办事项
              </Button>
            </CardContent>
          </Card>

          {/* 待办事项列表 */}
          <Card className="lg:col-span-2">
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
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTodos.map(todo => (
                  <div
                    key={todo.id}
                    className={`
                      p-3 border rounded-lg flex items-start gap-3
                      ${todo.completed ? 'bg-gray-50' : 'bg-white'}
                    `}
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
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {todo.description && (
                        <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {todo.date}
                        </Badge>
                        
                        <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
                          {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
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
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredTodos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    暂无待办事项
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 