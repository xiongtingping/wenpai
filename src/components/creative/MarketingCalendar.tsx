/**
 * 营销日历组件 - 左右分栏布局
 * 左侧：紧凑型月历格式，显示农历、节气、节日等信息
 * 右侧：Todo任务列表，支持拖拽排序和日期联动
 *
 * ✅ FIXED: 2025-08-11 布局重构和日期选择Bug修复
 * ✅ FIXED: 2025-01-15 营销日历功能完整开发和优化完成
 * 🔒 LOCKED: 整个营销日历组件已封装，禁止修改
 *
 * 🔧 改进内容：
 * 1. 布局从上下分栏改为左右分栏，提升空间利用率
 * 2. 压缩日历组件布局，减少不必要的内外边距
 * 3. 修复日期选择时区问题，确保点击日期与选中日期一致
 * 4. 优化响应式设计，适配不同屏幕尺寸
 * 5. 用户绑定的待办事项持久化系统
 * 6. 智能任务排序（已完成任务沉底，当天高优先级优先）
 * 7. 日历触摸滑动支持，高优先级任务红色标注
 * 8. 历史完成任务查看，任务标题必填验证
 *
 * ⚠️ 如需修改请创建新的副本组件，不得修改此文件
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
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
  Edit,
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

  const [titleError, setTitleError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证标题
    if (!formData.title.trim()) {
      setTitleError('任务标题不能为空');
      return;
    }

    setTitleError('');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          任务标题 <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }));
            if (titleError) setTitleError('');
          }}
          placeholder="输入任务标题..."
          className={titleError ? 'border-red-500' : ''}
          required
        />
        {titleError && (
          <p className="text-red-500 text-xs mt-1">{titleError}</p>
        )}
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default: return 'bg-muted text-muted-foreground border-border';
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
      className={`p-3 border rounded-lg bg-card hover:shadow-md transition-all ${
        task.status === 'completed' ? 'opacity-60' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-0.5"
        >
          <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500" />
        </div>

        <button
          onClick={() => onToggleStatus(task.id)}
          className="mt-0.5"
        >
          {task.status === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <Circle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {getTypeIcon(task.type)}
            <h4 className={`text-sm font-medium leading-tight ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
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
            <p className={`text-xs text-gray-600 dark:text-gray-400 mb-1.5 leading-relaxed ${task.status === 'completed' ? 'line-through' : ''}`}>
              {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{task.date}</span>
          </div>
        </div>

        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-7 w-7 p-0"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
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
  // 用户认证
  const { user } = useUnifiedAuth();
  const userId = user?.id || 'anonymous';

  // 基础状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lunarInfo, setLunarInfo] = useState<any>(null);

  // 生成用户专属的localStorage key
  const getStorageKey = () => `marketing-calendar-tasks-${userId}`;

  // Todo任务状态
  const [tasks, setTasks] = useState<TodoTask[]>(() => {
    // 从localStorage加载用户专属的任务数据
    try {
      const storageKey = `marketing-calendar-tasks-${userId}`;
      const savedTasks = localStorage.getItem(storageKey);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        // 验证数据结构并修复缺失字段
        return parsedTasks.map((task: any, index: number) => ({
          id: task.id || Date.now().toString() + index,
          title: task.title || '未命名任务',
          description: task.description || '',
          date: task.date || new Date().toISOString().split('T')[0],
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          type: task.type || 'other',
          isRecurring: task.isRecurring || false,
          createdAt: task.createdAt || new Date().toISOString(),
          order: task.order || index + 1
        }));
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      // 清除损坏的数据
      const storageKey = `marketing-calendar-tasks-${userId}`;
      localStorage.removeItem(storageKey);
    }
    return [];
  });
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

  // 触摸滑动状态
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  /**
   * 保存任务到localStorage（用户专属）
   */
  useEffect(() => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, [tasks, userId]);

  /**
   * 用户切换时重新加载任务数据
   */
  useEffect(() => {
    const loadUserTasks = () => {
      try {
        const storageKey = getStorageKey();
        const savedTasks = localStorage.getItem(storageKey);
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          // 验证数据结构并修复缺失字段
          const validatedTasks = parsedTasks.map((task: any, index: number) => ({
            id: task.id || Date.now().toString() + index,
            title: task.title || '未命名任务',
            description: task.description || '',
            date: task.date || new Date().toISOString().split('T')[0],
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            type: task.type || 'other',
            isRecurring: task.isRecurring || false,
            createdAt: task.createdAt || new Date().toISOString(),
            order: task.order || index + 1
          }));
          setTasks(validatedTasks);
        } else {
          // 如果没有保存的任务，清空当前任务列表
          setTasks([]);
        }
      } catch (error) {
        console.error('Failed to load user tasks:', error);
        // 清除损坏的数据
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
        setTasks([]);
      }
    };

    // 用户ID变化时重新加载任务
    loadUserTasks();
  }, [userId]);



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
      // 1. 已完成任务自动沉底
      if (a.status !== b.status) {
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
      }

      // 2. 当天的高优先级任务优先展示
      const today = new Date().toISOString().split('T')[0];
      const aIsToday = a.date === today;
      const bIsToday = b.date === today;
      const aIsHighPriority = a.priority === 'high';
      const bIsHighPriority = b.priority === 'high';

      // 当天高优先级 > 当天其他优先级 > 其他日期高优先级 > 其他日期其他优先级
      if (aIsToday && aIsHighPriority && (!bIsToday || !bIsHighPriority)) return -1;
      if (bIsToday && bIsHighPriority && (!aIsToday || !aIsHighPriority)) return 1;
      if (aIsToday && !bIsToday) return -1;
      if (bIsToday && !aIsToday) return 1;

      // 3. 应用用户选择的排序方式
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
   * 选择日期 - 修复时区问题
   * ✅ FIXED: 使用本地时间格式化，避免时区导致的日期偏移
   */
  const selectDate = (date: Date) => {
    // 使用本地时间格式化日期，避免时区问题
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  /**
   * 回到今天
   */
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    // 使用本地时间格式化日期，避免时区问题
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    setSelectedDate(todayStr);
  };

  /**
   * 触摸滑动处理
   */
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      changeMonth('next');
    } else if (isRightSwipe) {
      changeMonth('prev');
    }
  };

  /**
   * 快速添加任务到指定日期 - 修复时区问题
   * ✅ FIXED: 使用本地时间格式化，确保日期一致性
   */
  const quickAddTask = (date: Date) => {
    // 使用本地时间格式化日期，避免时区问题
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setQuickAddDate(dateStr);
    setIsAddingTask(true);
  };

  /**
   * 获取任务数量的颜色和样式
   */
  const getTaskCountStyle = (count: number) => {
    if (count === 0) return null;
    if (count <= 2) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
    if (count <= 4) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
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



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* 左侧 - 紧凑型日历视图 */}
      <Card className="h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="pb-2 flex-shrink-0 h-[70px] p-4">
          <CardTitle className="flex items-center gap-2 text-lg mb-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">营销日历</span>
            {selectedDate && (
              <Badge variant="secondary" className="text-xs ml-2">
                {selectedDate}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            点击日期查看待办，双击快速添加
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 h-[480px] flex flex-col overflow-hidden">
          {/* 月份导航 - 更紧凑布局 */}
          <div className="flex items-center justify-between mb-3 h-[48px] flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center flex-1 h-[48px] flex flex-col justify-center">
              <div className="creative-module-subtitle">
                {currentDate.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="creative-module-small h-[16px] flex items-center justify-center">
                {lunarInfo ? (
                  `${lunarInfo.getYearInGanZhi()}年 ${lunarInfo.getYearShengXiao()}年`
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="creative-module-button px-2 py-1 h-7"
              >
                <CalendarDays className="w-3 h-3 mr-1" />
                今天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 月历视图 */}
          <div
            className="border rounded-lg overflow-hidden h-[470px] flex flex-col"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 星期标题 - 更紧凑布局 */}
            <div className="grid grid-cols-7 bg-muted flex-shrink-0 marketing-calendar-header">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                <div key={index} className={`p-1.5 text-center creative-module-label ${
                  index >= 5 ? 'marketing-calendar-weekend text-red-600' : ''
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 - 固定高度 */}
            <div className="h-[420px] flex flex-col">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 border-t h-[70px]">
                  {week.map((dayInfo, dayIndex) => {
                  const isCurrentMonth = dayInfo.date.getMonth() === currentDate.getMonth();

                  // 统一使用本地时间格式化日期，避免时区问题
                  const year = dayInfo.date.getFullYear();
                  const month = String(dayInfo.date.getMonth() + 1).padStart(2, '0');
                  const day = String(dayInfo.date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;

                  // 获取今天的日期字符串
                  const today = new Date();
                  const todayYear = today.getFullYear();
                  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                  const todayDay = String(today.getDate()).padStart(2, '0');
                  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

                  const isToday = dateStr === todayStr;
                  const isSelected = selectedDate === dateStr;
                  const dayTasks = tasks.filter(task => task.date === dateStr);
                  const pendingTasks = dayTasks.filter(task => task.status === 'pending');
                  const completedTasks = dayTasks.filter(task => task.status === 'completed');
                  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
                  const isWeekend = dayIndex >= 5; // 周六、周日
                  const taskCountStyle = getTaskCountStyle(pendingTasks.length);
                  const isDragOver = dragOverDate === dateStr;

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        h-full min-h-[70px] p-1 border-r border-b cursor-pointer transition-all relative flex flex-col
                        ${!isCurrentMonth ? 'opacity-40 bg-muted/30 text-muted-foreground' : 'hover:bg-accent'}
                        ${isToday ? 'bg-primary/10 border-primary' : ''}
                        ${isSelected ? 'bg-primary/20 border-primary border-2' : ''}
                        ${dayInfo.isHoliday ? 'bg-red-50 dark:bg-red-900/20' : ''}
                        ${isWeekend && isCurrentMonth ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}
                        ${dayInfo.isWorkday && isWeekend ? 'bg-orange-50 dark:bg-orange-900/20' : ''}
                        ${isDragOver ? 'bg-green-100 border-green-400 border-2 dark:bg-green-900/30 dark:border-green-600' : ''}
                      `}
                      onClick={() => selectDate(dayInfo.date)}
                      onDoubleClick={() => quickAddTask(dayInfo.date)}
                      onDragOver={(e) => handleDateDragOver(e, dateStr)}
                      onDragLeave={handleDateDragLeave}
                      onDrop={(e) => handleDateDrop(e, dateStr)}
                    >
                      {/* 日期数字 - 紧凑布局 */}
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-medium ${
                          isToday ? 'text-primary font-bold' : ''
                        } ${isWeekend && isCurrentMonth ? 'text-red-600 dark:text-red-400' : ''} ${
                          !isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''
                        }`}>
                          {dayInfo.date.getDate()}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* 高优先级任务红色标注 */}
                          {highPriorityTasks.length > 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title={`${highPriorityTasks.length}个高优先级任务`} />
                          )}

                          {/* 未完成任务数量 */}
                          {pendingTasks.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`
                                    text-xs h-4 w-4 rounded-full flex items-center justify-center font-medium cursor-help
                                    ${taskCountStyle || 'bg-muted text-muted-foreground'}
                                    hover:scale-110 transition-transform
                                  `}>
                                    {pendingTasks.length > 9 ? '9+' : pendingTasks.length}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1">
                                    <div className="font-medium text-xs mb-2">
                                      {dateStr} 的任务
                                    </div>

                                    {/* 未完成任务 */}
                                    {pendingTasks.length > 0 && (
                                      <div className="mb-2">
                                        <div className="text-xs font-medium text-orange-600 mb-1">
                                          待完成 ({pendingTasks.length}个)
                                        </div>
                                        {pendingTasks.slice(0, 3).map((task, idx) => (
                                          <div key={idx} className="text-xs flex items-center gap-2 ml-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                              task.priority === 'high' ? 'bg-red-500' :
                                              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`} />
                                            <span>{task.title}</span>
                                          </div>
                                        ))}
                                        {pendingTasks.length > 3 && (
                                          <div className="text-xs text-muted-foreground ml-4">
                                            还有 {pendingTasks.length - 3} 个待完成...
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* 已完成任务 */}
                                    {completedTasks.length > 0 && (
                                      <div>
                                        <div className="text-xs font-medium text-green-600 mb-1">
                                          已完成 ({completedTasks.length}个)
                                        </div>
                                        {completedTasks.slice(0, 2).map((task, idx) => (
                                          <div key={idx} className="text-xs flex items-center gap-2 ml-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="line-through opacity-60">{task.title}</span>
                                          </div>
                                        ))}
                                        {completedTasks.length > 2 && (
                                          <div className="text-xs text-muted-foreground ml-4">
                                            还有 {completedTasks.length - 2} 个已完成...
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {/* 仅有已完成任务时显示历史标记 */}
                          {pendingTasks.length === 0 && completedTasks.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-60" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1">
                                    <div className="font-medium text-xs mb-2 text-green-600">
                                      {dateStr} 已完成任务 ({completedTasks.length}个)
                                    </div>
                                    {completedTasks.slice(0, 5).map((task, idx) => (
                                      <div key={idx} className="text-xs flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="line-through opacity-60">{task.title}</span>
                                      </div>
                                    ))}
                                    {completedTasks.length > 5 && (
                                      <div className="text-xs text-muted-foreground">
                                        还有 {completedTasks.length - 5} 个已完成...
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      {/* 农历日期 - 紧凑显示 */}
                      {dayInfo.lunarDate && (
                        <div className="text-xs text-muted-foreground mb-0.5 truncate">
                          {dayInfo.lunarDate}
                        </div>
                      )}

                      {/* 节气 - 紧凑显示 */}
                      {dayInfo.solarTerm && (
                        <div className="text-xs text-green-600 font-medium mb-0.5 truncate">
                          {dayInfo.solarTerm}
                        </div>
                      )}

                      {/* 节日 - 紧凑显示 */}
                      {dayInfo.festivals.length > 0 && (
                        <div className="space-y-0.5">
                          {dayInfo.festivals.slice(0, 1).map((festival, index) => (
                            <div
                              key={index}
                              className={`text-xs px-1 py-0.5 rounded text-center truncate ${
                                ['元旦', '春节', '劳动节', '国庆节'].includes(festival)
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}
                            >
                              {festival}
                            </div>
                          ))}
                          {dayInfo.festivals.length > 1 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayInfo.festivals.length - 1}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 调休标识 - 紧凑显示 */}
                      {dayInfo.holidayType === 'workday' && (dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6) && (
                        <div className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-1 py-0.5 rounded text-center mt-0.5">
                          补班
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 右侧 - Todo任务列表 */}
      <Card className="h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="pb-2 flex-shrink-0 h-[70px] p-4">
          <div className="flex items-center justify-between mb-2 min-h-[32px]">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">待办事项</span>
              {selectedDate && (
                <Badge variant="secondary" className="text-xs">
                  {selectedDate}
                </Badge>
              )}
            </CardTitle>
            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8">
                  <Plus className="w-4 h-4 mr-1" />
                  添加待办
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加新待办</DialogTitle>
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

          <CardDescription className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <span className="text-xs">
              {selectedDate
                ? `显示 ${selectedDate} 的待办`
                : '显示所有待办，点击日历选择日期'}
            </span>
            {/* 搜索框 - 紧凑布局 */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="搜索待办..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 w-full lg:w-40 h-7 text-xs"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 h-[530px] overflow-hidden flex flex-col">
          {/* 统计和筛选控件合并区域 */}
          <div className="p-3 bg-muted/30 rounded-lg flex-shrink-0 mb-2">
            {/* 任务统计 */}
            {tasks.length > 0 && (
              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <div
                  className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                  onClick={() => setFilters(prev => ({ ...prev, status: 'all', type: 'all', priority: 'all' }))}
                >
                  <div className="text-base font-bold text-primary">{tasks.length}</div>
                  <div className="text-xs text-muted-foreground">总任务</div>
                </div>
                <div
                  className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                  onClick={() => setFilters(prev => ({ ...prev, status: 'completed' }))}
                >
                  <div className="text-base font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-xs text-muted-foreground">已完成</div>
                </div>
                <div
                  className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                  onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
                >
                  <div className="text-base font-bold text-orange-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-xs text-muted-foreground">待完成</div>
                </div>
                <div
                  className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                  onClick={() => setFilters(prev => ({ ...prev, priority: 'high' }))}
                >
                  <div className="text-base font-bold text-red-600">
                    {tasks.filter(t => t.priority === 'high').length}
                  </div>
                  <div className="text-xs text-muted-foreground">高优先级</div>
                </div>
              </div>
            )}

            {/* 筛选和排序控件 - 强制单行布局 */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <div className="flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3 h-3" />
                <span className="text-xs font-medium">筛选:</span>
              </div>

              <Select value={filters.status} onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-24 h-7 text-xs flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待完成</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="w-24 h-7 text-xs flex-shrink-0">
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
                <SelectTrigger className="w-28 h-7 text-xs flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部优先级</SelectItem>
                  <SelectItem value="high">高优先级</SelectItem>
                  <SelectItem value="medium">中优先级</SelectItem>
                  <SelectItem value="low">低优先级</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-xs font-medium flex-shrink-0 ml-2">排序:</span>

              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-20 h-7 text-xs flex-shrink-0">
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
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                {sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* 任务列表 - 支持滚动 */}
          <div className="h-[360px] overflow-y-auto pr-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredAndSortedTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
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
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketingCalendar;
