/**
 * 营销日历组件
 * 支持国历、农历、节假日、24节气、历史上的今天等
 */

import React, { useState, useEffect } from 'react';
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
  TrendingUp
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
 * 营销日历组件
 * @returns React 组件
 */
export function MarketingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

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
   * 初始化示例事件
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
      },
      {
        id: '4',
        title: '元宵节',
        date: '2024-02-24',
        type: 'holiday',
        description: '正月十五，传统节日',
        color: 'orange'
      },
      {
        id: '5',
        title: '雨水',
        date: '2024-02-19',
        type: 'solar_term',
        description: '二十四节气，雨水增多',
        color: 'blue'
      },
      {
        id: '6',
        title: '妇女节',
        date: '2024-03-08',
        type: 'holiday',
        description: '国际妇女节，女性营销',
        color: 'purple'
      },
      {
        id: '7',
        title: '惊蛰',
        date: '2024-03-05',
        type: 'solar_term',
        description: '二十四节气，春雷始鸣',
        color: 'green'
      },
      {
        id: '8',
        title: '植树节',
        date: '2024-03-12',
        type: 'holiday',
        description: '环保主题营销',
        color: 'green'
      }
    ];
    setEvents(sampleEvents);
  }, []);

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