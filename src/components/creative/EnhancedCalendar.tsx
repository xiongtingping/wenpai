/**
 * 增强日历组件
 * 参考macOS日历样式，支持农历、节假日、事件等功能
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  MoreHorizontal,
  Plus
} from 'lucide-react';

/**
 * 日历事件接口
 */
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'solar_term' | 'history' | 'custom' | 'birthday' | 'reminder';
  description?: string;
  color?: string;
  isWorkday?: boolean; // 是否调休工作日
}

/**
 * 农历信息接口
 */
interface LunarInfo {
  lunarDate: string; // 农历日期
  lunarMonth: string; // 农历月份
  lunarDay: string; // 农历日期
  festival?: string; // 节日
  solarTerm?: string; // 节气
}

/**
 * 增强日历组件Props
 */
interface EnhancedCalendarProps {
  events?: CalendarEvent[];
  lunarData?: Record<string, LunarInfo>;
  startOfWeek?: 'sunday' | 'monday';
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

/**
 * 增强日历组件
 * @returns React 组件
 */
export function EnhancedCalendar({
  events = [],
  lunarData = {},
  startOfWeek = 'sunday',
  onDateClick,
  onEventClick,
  className = ''
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

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
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return startOfWeek === 'monday' ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;
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
   * 获取农历信息
   */
  const getLunarInfo = (date: Date): LunarInfo => {
    const dateString = date.toISOString().split('T')[0];
    const lunarInfo = lunarData[dateString];
    
    if (lunarInfo) {
      return lunarInfo;
    }

    // 默认农历信息（简化版）
    return {
      lunarDate: '初一',
      lunarMonth: '正',
      lunarDay: '初一'
    };
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
      case 'birthday':
        return <Star className="w-3 h-3" />;
      case 'reminder':
        return <Clock className="w-3 h-3" />;
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
      case 'birthday':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'reminder':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return `${year}年 ${monthNames[month - 1]}`;
  };

  /**
   * 获取星期标题
   */
  const getWeekDays = () => {
    if (startOfWeek === 'monday') {
      return ['一', '二', '三', '四', '五', '六', '日'];
    }
    return ['日', '一', '二', '三', '四', '五', '六'];
  };

  /**
   * 处理日期点击
   */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  /**
   * 处理事件点击
   */
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  const calendarDays = generateCalendarDays();
  const weekDays = getWeekDays();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 日历头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                增强日历
              </CardTitle>
              <CardDescription>
                {formatDate(currentDate)} - 支持农历、节假日、事件管理
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
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const lunarInfo = getLunarInfo(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              const isHovered = hoveredDate && day.date.toDateString() === hoveredDate.toDateString();

              // 判断是否为节假日
              const holidayEvent = dayEvents.find(event => event.type === 'holiday');
              const isHoliday = !!holidayEvent;

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all duration-200
                    ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'bg-white'}
                    ${isToday ? 'bg-blue-50 border-blue-300 shadow-sm' : ''}
                    ${isSelected ? 'bg-primary/10 border-primary shadow-md' : ''}
                    ${isHovered ? 'bg-gray-50 border-gray-300 shadow-sm' : ''}
                    ${isHoliday ? 'bg-red-50 border-red-200' : ''}
                    hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                  `}
                  onClick={() => handleDateClick(day.date)}
                  onMouseEnter={() => setHoveredDate(day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* 日期头部 */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-lg font-semibold">
                      {day.date.getDate()}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`w-2 h-2 rounded-full ${getEventColor(event.type).replace('bg-', 'bg-').replace(' border-', '')}`}
                            title={event.title}
                            onClick={(e) => handleEventClick(event, e)}
                          />
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="w-2 h-2 rounded-full bg-gray-400" title={`还有${dayEvents.length - 2}个事件`} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* 农历信息 */}
                  <div className="text-xs text-gray-500 mb-1">
                    {lunarInfo.lunarDate}
                  </div>

                  {/* 节假日/事件信息 */}
                  <div className="space-y-1">
                    {holidayEvent && (
                      <div className={`text-xs px-1 py-0.5 rounded ${getEventColor(holidayEvent.type)}`}>
                        <div className="flex items-center gap-1">
                          {getEventIcon(holidayEvent.type)}
                          <span className="truncate">
                            {holidayEvent.title}
                            {holidayEvent.isWorkday ? '(班)' : '(休)'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* 其他事件 */}
                    {dayEvents.filter(event => event.type !== 'holiday').slice(0, 1).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded ${getEventColor(event.type)} cursor-pointer`}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.description}
                      >
                        <div className="flex items-center gap-1">
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
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
              {selectedDate.toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 农历信息 */}
              <div>
                <h4 className="font-medium mb-2">农历</h4>
                <p className="text-gray-600">{getLunarInfo(selectedDate).lunarDate}</p>
              </div>

              {/* 当日事件 */}
              {getEventsForDate(selectedDate).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">当日事件</h4>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div 
                        key={event.id} 
                        className="flex items-start gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className={`p-1 rounded ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
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

              {/* 快速操作 */}
              <div>
                <h4 className="font-medium mb-2">快速操作</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    添加事件
                  </Button>
                  <Button size="sm" variant="outline">
                    <Clock className="w-4 h-4 mr-1" />
                    设置提醒
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 