/**
 * 营销日历组件 - 上下分栏布局
 * 上半部分：标准月历格式，显示农历、节气、节日等信息
 * 下半部分：Todo任务列表，支持拖拽排序和日期联动
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  GripVertical,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  TrendingUp,
  CalendarDays,
  Search,
  X
} from 'lucide-react';
import { Lunar } from 'lunar-javascript';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * 获取指定日期的节日信息
 */
const getFestivalsForDate = (date: Date): string[] => {
  const festivals: string[] = [];
  const solarMonth = date.getMonth() + 1;
  const solarDay = date.getDate();

  try {
    const lunar = Lunar.fromDate(date);
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();

    // 农历节日
    if (lunarMonth === 1 && lunarDay === 1) festivals.push('春节');
    if (lunarMonth === 1 && lunarDay === 15) festivals.push('元宵节');
    if (lunarMonth === 5 && lunarDay === 5) festivals.push('端午节');
    if (lunarMonth === 8 && lunarDay === 15) festivals.push('中秋节');
    if (lunarMonth === 9 && lunarDay === 9) festivals.push('重阳节');
  } catch (error) {
    // 农历转换失败时忽略
  }

  // 阳历节日
  if (solarMonth === 1 && solarDay === 1) festivals.push('元旦');
  if (solarMonth === 2 && solarDay === 14) festivals.push('情人节');
  if (solarMonth === 3 && solarDay === 8) festivals.push('妇女节');
  if (solarMonth === 5 && solarDay === 1) festivals.push('劳动节');
  if (solarMonth === 6 && solarDay === 1) festivals.push('儿童节');
  if (solarMonth === 10 && solarDay === 1) festivals.push('国庆节');
  if (solarMonth === 12 && solarDay === 25) festivals.push('圣诞节');

  return festivals;
};

/**
 * 获取正确格式的农历日期显示
 */
const getLunarDateDisplay = (date: Date): string => {
  try {
    const lunar = Lunar.fromDate(date);
    const monthInChinese = lunar.getMonthInChinese();
    const dayInChinese = lunar.getDayInChinese();

    // 通过检查月份名称是否包含"闰"字来判断是否为闰月
    const isLeapMonth = monthInChinese.includes('闰');
    let monthDisplay;

    if (isLeapMonth) {
      // 如果是闰月，直接使用包含"闰"字的月份名称
      monthDisplay = `${monthInChinese}月`;
    } else {
      // 普通月份
      monthDisplay = `${monthInChinese}月`;
    }

    return `${monthDisplay} ${dayInChinese}`;
  } catch (error) {
    return '';
  }
};

/**
 * 判断是否为法定节假日
 */
const isHolidayDate = (date: Date): boolean => {
  const festivals = getFestivalsForDate(date);
  const holidayFestivals = ['元旦', '春节', '劳动节', '国庆节'];
  return festivals.some(festival => holidayFestivals.includes(festival));
};

/**
 * 判断是否为调休工作日
 */
const isWorkdayDate = (date: Date): boolean => {
  // 这里可以根据实际的调休安排来判断
  // 简化处理：周末一般不是工作日
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
};

/**
 * Todo任务接口
 */
interface TodoTask {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD格式
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  type: 'marketing' | 'content' | 'event' | 'other';
  isRecurring: boolean;
  createdAt: string;
  order: number;
}

/**
 * 日历日期信息接口
 */
interface CalendarDateInfo {
  date: Date;
  lunarDate: string;
  solarTerm: string | null;
  festivals: string[];
  isHoliday: boolean;
  isWorkday: boolean;
  holidayType: 'holiday' | 'workday' | 'normal';
}

/**
 * 排序选项
 */
type SortOption = 'priority' | 'date' | 'created' | 'title';
type SortDirection = 'asc' | 'desc';

/**
 * 筛选选项
 */
interface FilterOptions {
  status: 'all' | 'pending' | 'completed';
  type: 'all' | 'marketing' | 'content' | 'event' | 'other';
  priority: 'all' | 'high' | 'medium' | 'low';
}

/**
 * 任务表单组件
 */
const TaskForm: React.FC<{
  task?: TodoTask;
  onSubmit: (taskData: Omit<TodoTask, 'id' | 'createdAt' | 'order'>) => void;
  onCancel: () => void;
  defaultDate?: string;
}> = ({ task, onSubmit, onCancel, defaultDate }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    date: task?.date || defaultDate || new Date().toISOString().split('T')[0],
    priority: task?.priority || 'medium' as const,
    type: task?.type || 'marketing' as const,
    status: task?.status || 'pending' as const,
    isRecurring: task?.isRecurring || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">任务标题</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="输入任务标题..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">任务描述</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="输入任务描述..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">日期</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">优先级</label>
          <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">高优先级</SelectItem>
              <SelectItem value="medium">中优先级</SelectItem>
              <SelectItem value="low">低优先级</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">类型</label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketing">营销</SelectItem>
              <SelectItem value="content">内容</SelectItem>
              <SelectItem value="event">活动</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">状态</label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待完成</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={formData.isRecurring}
          onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
          className="rounded"
        />
        <label htmlFor="isRecurring" className="text-sm font-medium">
          重复任务
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {task ? '更新任务' : '添加任务'}
        </Button>
      </div>
    </form>
  );
};

/**
 * 可拖拽的Todo任务项组件
 */
const SortableTodoItem: React.FC<{
  task: TodoTask;
  onToggleStatus: (id: string) => void;
  onEdit: (task: TodoTask) => void;
  onDelete: (id: string) => void;
  onDragStart?: (task: TodoTask) => void;
}> = ({ task, onToggleStatus, onEdit, onDelete, onDragStart }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'marketing': return <TrendingUp className="w-4 h-4" />;
      case 'content': return <Star className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    if (onDragStart) {
      onDragStart(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg bg-white hover:shadow-md transition-all ${
        task.status === 'completed' ? 'opacity-60' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        <button
          onClick={() => onToggleStatus(task.id)}
          className="mt-1"
        >
          {task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon(task.type)}
            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h4>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
            </Badge>
            {task.isRecurring && (
              <Badge variant="outline" className="text-xs">
                重复
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className={`text-sm text-gray-600 mb-2 ${task.status === 'completed' ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{task.date}</span>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0"
          >
            <Star className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 营销日历组件
 * @returns React 组件
 */
function MarketingCalendar() {
  // 基础状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lunarInfo, setLunarInfo] = useState<any>(null);

  // Todo任务状态
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null);

  // 筛选和排序状态
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
    priority: 'all'
  });

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  // 任务预览状态
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // 拖拽状态
  const [draggedTask, setDraggedTask] = useState<TodoTask | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 初始化示例任务数据
  useEffect(() => {
    const sampleTasks: TodoTask[] = [
      {
        id: '1',
        title: '春节营销活动策划',
        description: '制定春节期间的营销活动方案，包括优惠政策和推广策略',
        date: '2025-01-25',
        priority: 'high',
        status: 'pending',
        type: 'marketing',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        order: 1
      },
      {
        id: '2',
        title: '情人节内容创作',
        description: '准备情人节主题的文案和视觉素材',
        date: '2025-02-10',
        priority: 'medium',
        status: 'pending',
        type: 'content',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        order: 2
      },
      {
        id: '3',
        title: '元宵节活动执行',
        description: '执行元宵节线上活动，监控数据反馈',
        date: '2025-02-12',
        priority: 'high',
        status: 'completed',
        type: 'event',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        order: 3
      }
    ];
    setTasks(sampleTasks);
  }, []);

  /**
   * 获取农历信息
   */
  useEffect(() => {
    try {
      const lunar = Lunar.fromDate(currentDate);
      setLunarInfo(lunar);
    } catch (error) {
      console.error('获取农历信息失败:', error);
    }
  }, [currentDate]);

  /**
   * 生成月历数据
   */
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 获取当月第一天
    const firstDay = new Date(year, month, 1);

    // 获取第一周的开始日期（周一开始）
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    // 如果是周日(0)，则需要往前推6天到周一；其他情况往前推(dayOfWeek-1)天
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // 生成6周的日期数据
    const weeks: CalendarDateInfo[][] = [];
    const currentWeekDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays: CalendarDateInfo[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(currentWeekDate);

        // 获取农历信息（使用新的格式化函数）
        const lunarDate = getLunarDateDisplay(date);
        let solarTerm = null;
        try {
          const lunar = Lunar.fromDate(date);
          // 检查节气
          const jieQi = lunar.getJieQi();
          if (jieQi) {
            solarTerm = jieQi;
          }
        } catch (error) {
          // 忽略错误
        }

        // 获取节日信息
        const festivals = getFestivalsForDate(date);

        // 判断是否为节假日
        const isHoliday = isHolidayDate(date);
        const isWorkday = isWorkdayDate(date);

        weekDays.push({
          date,
          lunarDate,
          solarTerm,
          festivals,
          isHoliday,
          isWorkday,
          holidayType: isHoliday ? 'holiday' : isWorkday ? 'workday' : 'normal'
        });

        currentWeekDate.setDate(currentWeekDate.getDate() + 1);
      }

      weeks.push(weekDays);
    }

    return weeks;
  }, [currentDate]);

  /**
   * 筛选和排序后的任务列表
   */
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // 如果选择了特定日期，只显示该日期的任务
    if (selectedDate) {
      filtered = filtered.filter(task => task.date === selectedDate);
    }

    // 应用搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // 应用筛选条件
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // 应用排序
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = a.order - b.order;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, selectedDate, searchQuery, filters, sortBy, sortDirection]);

  /**
   * 拖拽结束处理
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // 更新order字段
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1
        }));
      });
    }
  };

  /**
   * 切换任务状态
   */
  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  /**
   * 删除任务
   */
  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  /**
   * 添加新任务
   */
  const addTask = (taskData: Omit<TodoTask, 'id' | 'createdAt' | 'order'>) => {
    const newTask: TodoTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      order: tasks.length + 1
    };
    setTasks(prev => [...prev, newTask]);
  };

  /**
   * 编辑任务
   */
  const editTask = (taskId: string, taskData: Partial<TodoTask>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...taskData } : task
    ));
  };

  /**
   * 切换月份
   */
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  /**
   * 选择日期
   */
  const selectDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  /**
   * 回到今天
   */
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDate(todayStr);
  };

  /**
   * 快速添加任务到指定日期
   */
  const quickAddTask = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setQuickAddDate(dateStr);
    setIsAddingTask(true);
  };

  /**
   * 获取任务数量的颜色和样式
   */
  const getTaskCountStyle = (count: number) => {
    if (count === 0) return null;
    if (count <= 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (count <= 4) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  /**
   * 处理任务拖拽到日历日期
   */
  const handleTaskDragToDate = (taskId: string, targetDate: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, date: targetDate } : task
    ));
    setDraggedTask(null);
    setDragOverDate(null);
  };

  /**
   * 处理日历日期的拖拽事件
   */
  const handleDateDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(dateStr);
  };

  const handleDateDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDateDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && draggedTask) {
      handleTaskDragToDate(taskId, dateStr);
    }
  };

  /**
   * 获取指定日期的任务预览内容
   */
  const getTasksPreview = (dateStr: string) => {
    const dateTasks = tasks.filter(task => task.date === dateStr);
    if (dateTasks.length === 0) return null;

    return dateTasks.slice(0, 5).map(task => ({
      title: task.title,
      priority: task.priority,
      status: task.status,
      type: task.type
    }));
  };

  return (
    <div className="space-y-6">
      {/* 上半部分 - 日历视图 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>营销日历</span>
              <Badge variant="outline" className="text-xs">
                农历营销
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {selectedDate && (
                <Badge variant="secondary" className="text-xs">
                  已选择: {selectedDate}
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            点击日期查看对应任务，显示农历、节气、节日等信息。双击日期快速添加任务。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center flex-1">
              <div className="text-xl font-semibold">
                {currentDate.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long'
                })}
              </div>
              {lunarInfo && (
                <div className="text-sm text-muted-foreground">
                  {lunarInfo.getYearInGanZhi()}年 {lunarInfo.getYearShengXiao()}年
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-xs"
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                回到今天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 月历视图 */}
          <div className="border rounded-lg overflow-hidden">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 bg-muted">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                <div key={index} className={`p-3 text-center text-sm font-medium ${
                  index >= 5 ? 'text-red-600' : ''
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-t">
                {week.map((dayInfo, dayIndex) => {
                  const isCurrentMonth = dayInfo.date.getMonth() === currentDate.getMonth();
                  const isToday = dayInfo.date.toDateString() === new Date().toDateString();
                  const dateStr = dayInfo.date.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const dayTasks = tasks.filter(task => task.date === dateStr);
                  const isWeekend = dayIndex >= 5; // 周六、周日
                  const taskCountStyle = getTaskCountStyle(dayTasks.length);
                  const isDragOver = dragOverDate === dateStr;
                  const tasksPreview = getTasksPreview(dateStr);

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        min-h-[80px] p-2 border-r border-b cursor-pointer transition-all relative
                        ${!isCurrentMonth ? 'opacity-40 bg-muted/30 text-muted-foreground' : 'hover:bg-accent'}
                        ${isToday ? 'bg-primary/10 border-primary' : ''}
                        ${isSelected ? 'bg-primary/20 border-primary border-2' : ''}
                        ${dayInfo.isHoliday ? 'bg-red-50' : ''}
                        ${isWeekend && isCurrentMonth ? 'bg-blue-50/50' : ''}
                        ${dayInfo.isWorkday && isWeekend ? 'bg-orange-50' : ''}
                        ${isDragOver ? 'bg-green-100 border-green-400 border-2' : ''}
                      `}
                      onClick={() => selectDate(dayInfo.date)}
                      onDoubleClick={() => quickAddTask(dayInfo.date)}
                      onDragOver={(e) => handleDateDragOver(e, dateStr)}
                      onDragLeave={handleDateDragLeave}
                      onDrop={(e) => handleDateDrop(e, dateStr)}
                    >
                      {/* 日期数字 */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-primary font-bold' : ''
                        } ${isWeekend && isCurrentMonth ? 'text-red-600' : ''} ${
                          !isCurrentMonth ? 'text-gray-400' : ''
                        }`}>
                          {dayInfo.date.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`
                                  text-xs h-5 w-5 rounded-full flex items-center justify-center font-medium cursor-help
                                  ${taskCountStyle || 'bg-gray-100 text-gray-800'}
                                  hover:scale-110 transition-transform
                                `}>
                                  {dayTasks.length > 9 ? '9+' : dayTasks.length}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <div className="font-medium text-xs mb-2">
                                    {dateStr} 的任务 ({dayTasks.length}个)
                                  </div>
                                  {dayTasks.slice(0, 5).map((task, idx) => (
                                    <div key={idx} className="text-xs flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                      }`} />
                                      <span className={task.status === 'completed' ? 'line-through opacity-60' : ''}>
                                        {task.title}
                                      </span>
                                    </div>
                                  ))}
                                  {dayTasks.length > 5 && (
                                    <div className="text-xs text-muted-foreground">
                                      还有 {dayTasks.length - 5} 个任务...
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {/* 农历日期 */}
                      {dayInfo.lunarDate && (
                        <div className="text-xs text-muted-foreground mb-1">
                          {dayInfo.lunarDate}
                        </div>
                      )}

                      {/* 节气 */}
                      {dayInfo.solarTerm && (
                        <div className="text-xs text-green-600 font-medium mb-1">
                          {dayInfo.solarTerm}
                        </div>
                      )}

                      {/* 节日 */}
                      {dayInfo.festivals.length > 0 && (
                        <div className="space-y-1">
                          {dayInfo.festivals.slice(0, 2).map((festival, index) => (
                            <div
                              key={index}
                              className={`text-xs px-1 py-0.5 rounded text-center ${
                                ['元旦', '春节', '劳动节', '国庆节'].includes(festival)
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {festival}
                            </div>
                          ))}
                          {dayInfo.festivals.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayInfo.festivals.length - 2}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 调休标识 */}
                      {dayInfo.holidayType === 'workday' && (dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6) && (
                        <div className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-center mt-1">
                          补班
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 下半部分 - Todo任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>营销任务</span>
              {selectedDate && (
                <Badge variant="secondary" className="text-xs">
                  {selectedDate}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    添加任务
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加新任务</DialogTitle>
                  </DialogHeader>
                  <TaskForm
                    onSubmit={(taskData) => {
                      addTask(taskData);
                      setIsAddingTask(false);
                      setQuickAddDate(null);
                    }}
                    onCancel={() => {
                      setIsAddingTask(false);
                      setQuickAddDate(null);
                    }}
                    defaultDate={quickAddDate || selectedDate || new Date().toISOString().split('T')[0]}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>

          {/* 编辑任务对话框 */}
          {editingTask && (
            <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>编辑任务</DialogTitle>
                </DialogHeader>
                <TaskForm
                  task={editingTask}
                  onSubmit={(taskData) => {
                    editTask(editingTask.id, taskData);
                    setEditingTask(null);
                  }}
                  onCancel={() => setEditingTask(null)}
                />
              </DialogContent>
            </Dialog>
          )}
          <CardDescription className="flex items-center justify-between">
            <span>
              {selectedDate
                ? `显示 ${selectedDate} 的任务，支持拖拽排序`
                : '显示所有任务，点击日历选择特定日期，双击日期快速添加任务'}
            </span>
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-48 h-8 text-xs"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 筛选和排序控件 */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">筛选:</span>
            </div>

            <Select value={filters.status} onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待完成</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="marketing">营销</SelectItem>
                <SelectItem value="content">内容</SelectItem>
                <SelectItem value="event">活动</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value: any) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="high">高优先级</SelectItem>
                <SelectItem value="medium">中优先级</SelectItem>
                <SelectItem value="low">低优先级</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium">排序:</span>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">优先级</SelectItem>
                  <SelectItem value="date">日期</SelectItem>
                  <SelectItem value="created">创建时间</SelectItem>
                  <SelectItem value="title">标题</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* 任务列表 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredAndSortedTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredAndSortedTasks.length > 0 ? (
                  filteredAndSortedTasks.map((task) => (
                    <SortableTodoItem
                      key={task.id}
                      task={task}
                      onToggleStatus={toggleTaskStatus}
                      onEdit={setEditingTask}
                      onDelete={deleteTask}
                      onDragStart={setDraggedTask}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {selectedDate ? '该日期暂无任务' : '暂无任务'}
                    </p>
                    <p className="text-sm mb-4">
                      {selectedDate
                        ? '点击上方"添加任务"按钮为该日期创建新任务'
                        : '点击上方"添加任务"按钮创建第一个任务'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingTask(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加任务
                    </Button>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* 任务统计 */}
          {tasks.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{tasks.length}</div>
                  <div className="text-sm text-muted-foreground">总任务</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">已完成</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">待完成</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">高优先级</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketingCalendar;
