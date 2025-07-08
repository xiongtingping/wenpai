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
  Flag,
  RotateCcw,
  Archive
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
  deletedAt?: string; // 删除时间（用于回收站）
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
  const [selectedTag, setSelectedTag] = useState<string>('all'); // 改为单选
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 默认降序（最新在前）
  
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
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false); // 回收站显示状态
  const [statisticsRange, setStatisticsRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

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
   * 获取日期的待办事项（排除已删除的）
   */
  const getTodosForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return todos.filter(todo => todo.date === dateString && !todo.deletedAt);
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
   * 初始化示例数据 - 增加更多中国节假日和国际节日
   */
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const sampleEvents: CalendarEvent[] = [
      // 中国法定节假日
      {
        id: '1',
        title: '元旦',
        date: `${currentYear}-01-01`,
        type: 'holiday',
        description: '公历新年',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '2',
        title: '春节',
        date: `${currentYear}-02-10`,
        type: 'holiday',
        description: '农历新年，最重要的传统节日',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '3',
        title: '清明节',
        date: `${currentYear}-04-05`,
        type: 'holiday',
        description: '祭祖扫墓的传统节日',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '4',
        title: '劳动节',
        date: `${currentYear}-05-01`,
        type: 'holiday',
        description: '国际劳动节',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '5',
        title: '端午节',
        date: `${currentYear}-06-10`,
        type: 'holiday',
        description: '农历五月初五，纪念屈原',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '6',
        title: '中秋节',
        date: `${currentYear}-09-17`,
        type: 'holiday',
        description: '农历八月十五，团圆节',
        color: 'red',
        isLegalHoliday: true
      },
      {
        id: '7',
        title: '国庆节',
        date: `${currentYear}-10-01`,
        type: 'holiday',
        description: '中华人民共和国成立纪念日',
        color: 'red',
        isLegalHoliday: true
      },
      
      // 24节气（部分）
      {
        id: '8',
        title: '立春',
        date: `${currentYear}-02-04`,
        type: 'solar_term',
        description: '二十四节气之首，春季开始',
        color: 'green'
      },
      {
        id: '9',
        title: '春分',
        date: `${currentYear}-03-20`,
        type: 'solar_term',
        description: '昼夜平分，春季中点',
        color: 'green'
      },
      {
        id: '10',
        title: '立夏',
        date: `${currentYear}-05-05`,
        type: 'solar_term',
        description: '夏季开始',
        color: 'green'
      },
      {
        id: '11',
        title: '夏至',
        date: `${currentYear}-06-21`,
        type: 'solar_term',
        description: '北半球白昼最长的一天',
        color: 'green'
      },
      {
        id: '12',
        title: '立秋',
        date: `${currentYear}-08-07`,
        type: 'solar_term',
        description: '秋季开始',
        color: 'green'
      },
      {
        id: '13',
        title: '秋分',
        date: `${currentYear}-09-23`,
        type: 'solar_term',
        description: '昼夜平分，秋季中点',
        color: 'green'
      },
      {
        id: '14',
        title: '立冬',
        date: `${currentYear}-11-07`,
        type: 'solar_term',
        description: '冬季开始',
        color: 'green'
      },
      {
        id: '15',
        title: '冬至',
        date: `${currentYear}-12-22`,
        type: 'solar_term',
        description: '北半球白昼最短的一天',
        color: 'green'
      },
      
      // 农历节日
      {
        id: '16',
        title: '元宵节',
        date: `${currentYear}-02-24`,
        type: 'lunar_holiday',
        description: '农历正月十五，观灯节',
        color: 'orange'
      },
      {
        id: '17',
        title: '七夕节',
        date: `${currentYear}-08-10`,
        type: 'lunar_holiday',
        description: '农历七月初七，中国情人节',
        color: 'orange'
      },
      {
        id: '18',
        title: '重阳节',
        date: `${currentYear}-10-11`,
        type: 'lunar_holiday',
        description: '农历九月初九，敬老节',
        color: 'orange'
      },
      {
        id: '19',
        title: '腊八节',
        date: `${currentYear}-01-18`,
        type: 'lunar_holiday',
        description: '农历腊月初八，喝腊八粥',
        color: 'orange'
      },
      
      // 国际节日
      {
        id: '20',
        title: '情人节',
        date: `${currentYear}-02-14`,
        type: 'international',
        description: '西方情人节',
        color: 'purple'
      },
      {
        id: '21',
        title: '妇女节',
        date: `${currentYear}-03-08`,
        type: 'international',
        description: '国际妇女节',
        color: 'purple'
      },
      {
        id: '22',
        title: '愚人节',
        date: `${currentYear}-04-01`,
        type: 'international',
        description: '西方愚人节',
        color: 'purple'
      },
      {
        id: '23',
        title: '世界地球日',
        date: `${currentYear}-04-22`,
        type: 'international',
        description: '保护地球环境的节日',
        color: 'purple'
      },
      {
        id: '24',
        title: '母亲节',
        date: `${currentYear}-05-12`,
        type: 'international',
        description: '感恩母亲的节日',
        color: 'purple'
      },
      {
        id: '25',
        title: '儿童节',
        date: `${currentYear}-06-01`,
        type: 'international',
        description: '国际儿童节',
        color: 'purple'
      },
      {
        id: '26',
        title: '父亲节',
        date: `${currentYear}-06-16`,
        type: 'international',
        description: '感恩父亲的节日',
        color: 'purple'
      },
      {
        id: '27',
        title: '万圣节',
        date: `${currentYear}-10-31`,
        type: 'international',
        description: '西方万圣节',
        color: 'purple'
      },
      {
        id: '28',
        title: '圣诞节',
        date: `${currentYear}-12-25`,
        type: 'international',
        description: '西方圣诞节',
        color: 'purple'
      },
      
      // 历史事件
      {
        id: '29',
        title: '世界无线电日',
        date: `${currentYear}-02-13`,
        type: 'history',
        description: '联合国设立的世界无线电日',
        color: 'blue'
      },
      {
        id: '30',
        title: '世界读书日',
        date: `${currentYear}-04-23`,
        type: 'history',
        description: '联合国教科文组织设立',
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

    // 根据是否显示回收站筛选
    if (showRecycleBin) {
      filtered = filtered.filter(todo => todo.deletedAt);
    } else {
      filtered = filtered.filter(todo => !todo.deletedAt);
    }

    // 默认隐藏已完成的待办事项（回收站模式下显示所有）
    if (!showCompletedTodos && !showRecycleBin) {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 标签筛选（改为单选）
    if (selectedTag !== 'all') {
      filtered = filtered.filter(todo => todo.tags.includes(selectedTag));
    }

    // 分组筛选
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(todo => todo.group === selectedGroup);
    }

    // 排序
    filtered.sort((a, b) => {
      // 已完成的项目排在底部（除非在回收站模式）
      if (!showRecycleBin && a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
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
  }, [todos, searchQuery, selectedTag, selectedGroup, sortBy, sortOrder, showCompletedTodos, showRecycleBin]);

  /**
   * 获取所有标签
   */
  const getAllTags = () => {
    const allTags = new Set<string>();
    todos.filter(todo => !todo.deletedAt).forEach(todo => {
      todo.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  /**
   * 获取所有分组
   */
  const getAllGroups = () => {
    const allGroups = new Set<string>();
    todos.filter(todo => !todo.deletedAt).forEach(todo => {
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
   * 删除待办事项（移至回收站）
   */
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? {
        ...todo,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : todo
    ));
    toast({
      title: "已移至回收站",
      description: "待办事项已移至回收站",
    });
  };

  /**
   * 彻底删除待办事项
   */
  const permanentlyDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast({
      title: "彻底删除成功",
      description: "待办事项已彻底删除",
    });
  };

  /**
   * 从回收站恢复待办事项
   */
  const restoreTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? {
        ...todo,
        deletedAt: undefined,
        updatedAt: new Date().toISOString()
      } : todo
    ));
    toast({
      title: "恢复成功",
      description: "待办事项已从回收站恢复",
    });
  };

  /**
   * 清空回收站
   */
  const clearRecycleBin = () => {
    setTodos(prev => prev.filter(todo => !todo.deletedAt));
    toast({
      title: "回收站已清空",
      description: "所有已删除的待办事项已彻底删除",
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
   * 获取农历日期（简化版，实际项目中建议使用专门的农历库）
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
   * 获取历史上的今天（简化版）
   */
  const getHistoryToday = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const historyEvents = {
      '1-1': '元旦',
      '2-14': '情人节',
      '3-8': '妇女节',
      '3-12': '植树节',
      '4-1': '愚人节',
      '4-22': '世界地球日',
      '5-1': '劳动节',
      '6-1': '儿童节',
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

  /**
   * 获取统计数据
   */
  const getStatistics = (range: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周一开始
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    const endDate = new Date();
    switch (range) {
      case 'day':
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const weekEndDiff = 6 - (endDate.getDay() === 0 ? 6 : endDate.getDay() - 1);
        endDate.setDate(endDate.getDate() + weekEndDiff);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    const filteredTodos = todos.filter(todo => {
      const todoDate = new Date(todo.date);
      return todoDate >= startDate && todoDate <= endDate && !todo.deletedAt;
    });
    
    const completed = filteredTodos.filter(todo => todo.completed);
    const pending = filteredTodos.filter(todo => !todo.completed);
    const highPriority = pending.filter(todo => todo.priority === 'high');
    const overdue = pending.filter(todo => new Date(todo.date) < now);
    
    return {
      total: filteredTodos.length,
      completed: completed.length,
      pending: pending.length,
      highPriority: highPriority.length,
      overdue: overdue.length,
      completionRate: filteredTodos.length > 0 ? Math.round((completed.length / filteredTodos.length) * 100) : 0,
      startDate: startDate.toLocaleDateString('zh-CN'),
      endDate: endDate.toLocaleDateString('zh-CN'),
      range: range === 'day' ? '今日' : range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'
    };
  };

  /**
   * 获取已完成的待办事项（按完成时间排序）
   */
  const getCompletedTodos = () => {
    return todos
      .filter(todo => todo.completed && !todo.deletedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  /**
   * 获取未完成的待办事项
   */
  const getPendingTodos = () => {
    return todos.filter(todo => !todo.completed && !todo.deletedAt);
  };

  /**
   * 获取回收站中的待办事项数量
   */
  const getRecycleBinCount = () => {
    return todos.filter(todo => todo.deletedAt).length;
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
                onClick={() => setShowStatistics(!showStatistics)}
              >
                📊 统计
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

      {/* 统计信息面板 */}
      {showStatistics && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                📊 待办事项统计
              </CardTitle>
              <div className="flex items-center gap-2">
                {(['day', 'week', 'month', 'year'] as const).map(range => (
                  <Button
                    key={range}
                    size="sm"
                    variant={statisticsRange === range ? "default" : "outline"}
                    onClick={() => setStatisticsRange(range)}
                  >
                    {range === 'day' ? '日' : range === 'week' ? '周' : range === 'month' ? '月' : '年'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const stats = getStatistics(statisticsRange);
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>统计范围</span>
                    <span>{stats.range} ({stats.startDate} - {stats.endDate})</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-gray-600">总计</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-sm text-gray-600">已完成</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                      <div className="text-sm text-gray-600">待完成</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                      <div className="text-sm text-gray-600">高优先级</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{stats.overdue}</div>
                      <div className="text-sm text-gray-600">已逾期</div>
                    </div>
                  </div>
                  
                  {/* 完成率进度条 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">完成率</span>
                      <span className="font-medium">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 趋势分析 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="font-medium text-gray-700 mb-1">效率评价</div>
                      <div className={`${stats.completionRate >= 80 ? 'text-green-600' : stats.completionRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                        {stats.completionRate >= 80 ? '🎉 效率很高' : stats.completionRate >= 60 ? '⚡ 效率良好' : '📈 需要改进'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="font-medium text-gray-700 mb-1">任务负载</div>
                      <div className={`${stats.pending <= 5 ? 'text-green-600' : stats.pending <= 10 ? 'text-orange-600' : 'text-red-600'}`}>
                        {stats.pending <= 5 ? '😌 负载适中' : stats.pending <= 10 ? '😅 负载较重' : '😰 负载过重'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="font-medium text-gray-700 mb-1">时间管理</div>
                      <div className={`${stats.overdue === 0 ? 'text-green-600' : stats.overdue <= 2 ? 'text-orange-600' : 'text-red-600'}`}>
                        {stats.overdue === 0 ? '⏰ 时间管理很好' : stats.overdue <= 2 ? '⏳ 稍有延误' : '🚨 严重延误'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

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
              
              <Button
                variant={showCompletedTodos ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCompletedTodos(!showCompletedTodos)}
                className="flex items-center gap-1"
              >
                <CheckSquare className="w-3 h-3" />
                {showCompletedTodos ? '隐藏已完成' : '显示已完成'}
                {!showCompletedTodos && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {getCompletedTodos().length}
                  </Badge>
                )}
              </Button>

              <Button
                variant={showRecycleBin ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRecycleBin(!showRecycleBin)}
                className="flex items-center gap-1"
              >
                <Archive className="w-3 h-3" />
                {showRecycleBin ? '显示回收站' : '显示待办'}
                {getRecycleBinCount() > 0 && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {getRecycleBinCount()}
                  </Badge>
                )}
              </Button>
              
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

            {/* 标签筛选（改为单选） */}
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge
                variant={selectedTag === 'all' ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedTag('all')}
              >
                全部标签
              </Badge>
              {getAllTags().map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTag(tag)}
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