/**
 * 营销日历组件
 * 支持国历、农历、节假日、24节气、历史上的今天等
 * 融合待办事项功能
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
  Search
} from 'lucide-react';

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
        type: 'holiday',
        description: '西方情人节，浪漫营销好时机',
        color: 'pink'
      }
    ];

    const sampleTodos: TodoItem[] = [
      {
        id: '1',
        title: '准备春节营销方案',
        description: '制定春节期间的营销策略和内容计划',
        date: '2024-02-01',
        completed: false,
        tags: ['营销', '节日', '策划'],
        priority: 'high',
        group: '营销策划'
      },
      {
        id: '2',
        title: '设计情人节海报',
        description: '制作情人节主题的营销海报',
        date: '2024-02-10',
        completed: true,
        tags: ['设计', '节日', '海报'],
        priority: 'medium',
        group: '设计制作'
      },
      {
        id: '3',
        title: '撰写产品介绍文案',
        description: '为新功能撰写介绍文案',
        date: '2024-02-15',
        completed: false,
        tags: ['文案', '产品', '介绍'],
        priority: 'low',
        group: '内容创作'
      }
    ];

    setEvents(sampleEvents);
    setTodos(sampleTodos);
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

    // 组筛选
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
    const tagSet = new Set<string>();
    todos.forEach(todo => {
      todo.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  /**
   * 获取所有组
   */
  const getAllGroups = () => {
    const groupSet = new Set<string>();
    todos.forEach(todo => {
      if (todo.group) groupSet.add(todo.group);
    });
    return Array.from(groupSet).sort();
  };

  /**
   * 添加待办事项
   */
  const addTodo = () => {
    if (!newTodo.title.trim() || !newTodo.date) return;

    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      date: newTodo.date,
      completed: false,
      tags: newTodo.tags ? newTodo.tags.split(',').map(t => t.trim()) : [],
      priority: newTodo.priority,
      group: newTodo.group || undefined
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo({
      title: '',
      description: '',
      date: '',
      tags: '',
      priority: 'medium',
      group: ''
    });
  };

  /**
   * 切换待办事项状态
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
   * 获取农历日期（简化版）
   */
  const getLunarDate = (date: Date) => {
    // 这里可以集成农历转换库
    // 简化实现，返回示例数据
    const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                       '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                       '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    
    const month = lunarMonths[date.getMonth()];
    const day = lunarDays[date.getDate() - 1] || '初一';
    
    return `${month}月${day}`;
  };

  /**
   * 获取历史上的今天
   */
  const getHistoryToday = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 示例历史事件
    const historyEvents = {
      '2-4': '1906年2月4日，中国近代著名教育家蔡元培出生',
      '2-10': '1937年2月10日，中共中央致电国民党五届三中全会',
      '2-14': '1946年2月14日，世界上第一台电子计算机ENIAC诞生',
      '2-24': '1920年2月24日，德国工人党改名为纳粹党',
      '3-8': '1909年3月8日，美国芝加哥女工举行罢工游行',
      '3-12': '1925年3月12日，孙中山在北京逝世'
    };
    
    const key = `${month}-${day}`;
    return historyEvents[key as keyof typeof historyEvents];
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* 日历头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                营销日历
              </CardTitle>
              <CardDescription>
                {formatDate(currentDate)} - 节假日、节气、历史事件一览
              </CardDescription>
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
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-1 border rounded cursor-pointer hover:bg-gray-50 transition-colors
                    ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                    ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                    ${isSelected ? 'bg-primary/10 border-primary' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className="text-xs mb-1">
                    <div className="font-medium">
                      {day.date.getDate()}
                    </div>
                    <div className="text-gray-400">
                      {getLunarDate(day.date)}
                    </div>
                  </div>
                  
                  {/* 事件标记 */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded border ${getEventColor(event.type)}`}
                        title={event.description}
                      >
                        <div className="flex items-center gap-1">
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 选中日期的详细信息 */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 农历信息 */}
              <div>
                <h4 className="font-medium mb-2">农历</h4>
                <p className="text-gray-600">{getLunarDate(selectedDate)}</p>
              </div>

              {/* 当日事件 */}
              {getEventsForDate(selectedDate).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">当日事件</h4>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <div className={`p-1 rounded ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-600">{event.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 历史上的今天 */}
              {getHistoryToday(selectedDate) && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    历史上的今天
                  </h4>
                  <p className="text-gray-600">{getHistoryToday(selectedDate)}</p>
                </div>
              )}

              {/* 营销建议 */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  营销建议
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <p>当日有重要节日/节气，建议结合相关主题进行营销活动策划。</p>
                  ) : (
                    <p>当日无特殊节日，可考虑常规营销活动或内容发布。</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 待办事项 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            待办事项
          </CardTitle>
          <CardDescription>
            管理您的营销任务和待办事项
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 筛选和排序 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索待办事项..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48"
              />
            </div>

            {/* 标签筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">标签：</span>
              <div className="flex flex-wrap gap-1">
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
            </div>

            {/* 组筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">组：</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">全部</option>
                {getAllGroups().map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">排序：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'title')}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="date">日期</option>
                <option value="priority">优先级</option>
                <option value="title">标题</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="asc">升序</option>
                <option value="desc">降序</option>
              </select>
            </div>
          </div>

          {/* 添加新待办事项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input
              placeholder="待办事项标题"
              value={newTodo.title}
              onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              type="date"
              value={newTodo.date}
              onChange={(e) => setNewTodo(prev => ({ ...prev, date: e.target.value }))}
            />
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="low">低优先级</option>
              <option value="medium">中优先级</option>
              <option value="high">高优先级</option>
            </select>
            <Input
              placeholder="标签（用逗号分隔）"
              value={newTodo.tags}
              onChange={(e) => setNewTodo(prev => ({ ...prev, tags: e.target.value }))}
            />
            <Input
              placeholder="组名"
              value={newTodo.group}
              onChange={(e) => setNewTodo(prev => ({ ...prev, group: e.target.value }))}
            />
            <Button onClick={addTodo} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加待办
            </Button>
          </div>

          {/* 待办事项列表 */}
          <div className="space-y-3">
            {filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${
                  todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="mt-1"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${todo.completed ? 'line-through' : ''}`}>
                        {todo.title}
                      </h4>
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(todo.priority)}`}>
                          {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                        </Badge>
                        {todo.group && (
                          <Badge variant="outline" className="text-xs">
                            {todo.group}
                          </Badge>
                        )}
                        {todo.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{todo.date}</span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* 图例说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">图例说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-red-500" />
              <span>节假日</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span>二十四节气</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>历史事件</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-500" />
              <span>自定义事件</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 