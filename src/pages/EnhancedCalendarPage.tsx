/**
 * 增强日历示例页面
 * 展示增强日历组件的各种功能
 */

import React, { useState, useEffect } from 'react';
import { EnhancedCalendar } from '@/components/creative/EnhancedCalendar';
import { getMonthLunarInfo, getHolidayInfo, getHistoricalEvent } from '@/services/lunarService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Settings, Info, Plus } from 'lucide-react';

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
  isWorkday?: boolean;
}

/**
 * 增强日历示例页面
 * @returns React 组件
 */
export default function EnhancedCalendarPage() {
  const [currentDate] = useState(new Date());
  const [lunarData, setLunarData] = useState<Record<string, any>>({});
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  /**
   * 初始化农历数据
   */
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthLunarData = getMonthLunarInfo(year, month);
    setLunarData(monthLunarData);
  }, [currentDate]);

  /**
   * 初始化示例事件数据
   */
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      // 节假日事件
      {
        id: '1',
        title: '元旦',
        date: '2024-01-01',
        type: 'holiday',
        description: '新年第一天，祝大家新年快乐！',
        isWorkday: false
      },
      {
        id: '2',
        title: '春节',
        date: '2024-02-10',
        type: 'holiday',
        description: '农历新年，阖家团圆的日子',
        isWorkday: false
      },
      {
        id: '3',
        title: '清明节',
        date: '2024-04-04',
        type: 'holiday',
        description: '扫墓祭祖，缅怀先人',
        isWorkday: false
      },
      {
        id: '4',
        title: '劳动节',
        date: '2024-05-01',
        type: 'holiday',
        description: '国际劳动节，向劳动者致敬',
        isWorkday: false
      },
      {
        id: '5',
        title: '端午节',
        date: '2024-06-10',
        type: 'holiday',
        description: '吃粽子，赛龙舟',
        isWorkday: false
      },
      {
        id: '6',
        title: '中秋节',
        date: '2024-09-15',
        type: 'holiday',
        description: '月圆人团圆',
        isWorkday: false
      },
      {
        id: '7',
        title: '国庆节',
        date: '2024-10-01',
        type: 'holiday',
        description: '中华人民共和国成立纪念日',
        isWorkday: false
      },
      
      // 节气事件
      {
        id: '8',
        title: '立春',
        date: '2024-02-04',
        type: 'solar_term',
        description: '二十四节气之首，春季开始'
      },
      {
        id: '9',
        title: '春分',
        date: '2024-03-21',
        type: 'solar_term',
        description: '昼夜平分，春季中期'
      },
      {
        id: '10',
        title: '清明',
        date: '2024-04-05',
        type: 'solar_term',
        description: '天气清爽明朗，适合踏青'
      },
      {
        id: '11',
        title: '立夏',
        date: '2024-05-06',
        type: 'solar_term',
        description: '夏季开始，万物生长'
      },
      {
        id: '12',
        title: '夏至',
        date: '2024-06-21',
        type: 'solar_term',
        description: '一年中白昼最长的一天'
      },
      {
        id: '13',
        title: '立秋',
        date: '2024-08-08',
        type: 'solar_term',
        description: '秋季开始，天气转凉'
      },
      {
        id: '14',
        title: '秋分',
        date: '2024-09-23',
        type: 'solar_term',
        description: '昼夜平分，秋季中期'
      },
      {
        id: '15',
        title: '立冬',
        date: '2024-11-08',
        type: 'solar_term',
        description: '冬季开始，万物收藏'
      },
      {
        id: '16',
        title: '冬至',
        date: '2024-12-22',
        type: 'solar_term',
        description: '一年中白昼最短的一天'
      },
      
      // 历史事件
      {
        id: '17',
        title: '情人节',
        date: '2024-02-14',
        type: 'history',
        description: '西方情人节，表达爱意的日子'
      },
      {
        id: '18',
        title: '妇女节',
        date: '2024-03-08',
        type: 'history',
        description: '国际劳动妇女节'
      },
      {
        id: '19',
        title: '青年节',
        date: '2024-05-04',
        type: 'history',
        description: '中国青年节'
      },
      {
        id: '20',
        title: '儿童节',
        date: '2024-06-01',
        type: 'history',
        description: '国际儿童节'
      },
      {
        id: '21',
        title: '教师节',
        date: '2024-09-10',
        type: 'history',
        description: '中国教师节'
      },
      {
        id: '22',
        title: '圣诞节',
        date: '2024-12-25',
        type: 'history',
        description: '西方圣诞节'
      },
      
      // 自定义事件
      {
        id: '23',
        title: '项目截止',
        date: '2024-01-15',
        type: 'reminder',
        description: '重要项目交付日期'
      },
      {
        id: '24',
        title: '团队会议',
        date: '2024-01-20',
        type: 'reminder',
        description: '每周团队例会'
      },
      {
        id: '25',
        title: '生日聚会',
        date: '2024-03-15',
        type: 'birthday',
        description: '朋友的生日聚会'
      }
    ];
    
    setEvents(sampleEvents);
  }, []);

  /**
   * 处理日期点击
   */
  const handleDateClick = (date: Date) => {
    console.log('点击日期:', date.toLocaleDateString());
    
    // 获取该日期的详细信息
    const holidayInfo = getHolidayInfo(date);
    const historicalEvent = getHistoricalEvent(date);
    const lunarInfo = lunarData[date.toISOString().split('T')[0]];
    
    console.log('节假日信息:', holidayInfo);
    console.log('历史事件:', historicalEvent);
    console.log('农历信息:', lunarInfo);
  };

  /**
   * 处理事件点击
   */
  const handleEventClick = (event: CalendarEvent) => {
    console.log('点击事件:', event);
    alert(`事件详情：${event.title}\n${event.description || '暂无描述'}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calendar className="w-8 h-8" />
          增强日历
        </h1>
        <p className="text-gray-600">
          参考macOS日历样式，支持农历、节假日、事件管理等功能
        </p>
      </div>

      {/* 功能说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            功能特性
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">📅 月视图布局</h4>
              <p className="text-sm text-gray-600">支持周日/周一为起始日，6x7网格布局</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🌙 农历信息</h4>
              <p className="text-sm text-gray-600">显示农历日期、节气、传统节日</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎉 节假日管理</h4>
              <p className="text-sm text-gray-600">法定节假日、调休工作日标识</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📝 事件系统</h4>
              <p className="text-sm text-gray-600">支持多种事件类型，颜色区分</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主日历区域 */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">日历视图</TabsTrigger>
          <TabsTrigger value="events">事件管理</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <EnhancedCalendar
            events={events}
            lunarData={lunarData}
            startOfWeek="sunday"
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                事件管理
              </CardTitle>
              <CardDescription>
                管理日历中的各种事件和提醒
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 事件类型说明 */}
                <div>
                  <h4 className="font-medium mb-3">事件类型说明</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">节假日</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">节气</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">历史事件</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-pink-50 rounded">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm">生日</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">提醒</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">自定义</span>
                    </div>
                  </div>
                </div>

                {/* 事件列表 */}
                <div>
                  <h4 className="font-medium mb-3">当前事件列表</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.type === 'holiday' ? 'bg-red-500' :
                            event.type === 'solar_term' ? 'bg-green-500' :
                            event.type === 'history' ? 'bg-blue-500' :
                            event.type === 'birthday' ? 'bg-pink-500' :
                            event.type === 'reminder' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-gray-600">{event.date}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                日历设置
              </CardTitle>
              <CardDescription>
                自定义日历显示和行为
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">周起始日</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">周日</Button>
                    <Button variant="outline" size="sm">周一</Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">显示选项</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>显示农历</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>显示节假日</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>显示节气</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>显示历史事件</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 