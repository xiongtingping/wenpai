/**
 * 农历数据服务
 * 提供农历转换、节假日信息等功能
 */

/**
 * 农历信息接口
 */
export interface LunarInfo {
  lunarDate: string; // 农历日期
  lunarMonth: string; // 农历月份
  lunarDay: string; // 农历日期
  festival?: string; // 节日
  solarTerm?: string; // 节气
}

/**
 * 农历月份名称
 */
const LUNAR_MONTHS = [
  '正', '二', '三', '四', '五', '六',
  '七', '八', '九', '十', '冬', '腊'
];

/**
 * 农历日期名称
 */
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

/**
 * 节气名称
 */
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

/**
 * 2024年节假日数据
 */
const HOLIDAYS_2024 = {
  '2024-01-01': { name: '元旦', isWorkday: false },
  '2024-02-10': { name: '春节', isWorkday: false },
  '2024-02-11': { name: '春节', isWorkday: false },
  '2024-02-12': { name: '春节', isWorkday: false },
  '2024-02-13': { name: '春节', isWorkday: false },
  '2024-02-14': { name: '春节', isWorkday: false },
  '2024-02-15': { name: '春节', isWorkday: false },
  '2024-02-16': { name: '春节', isWorkday: false },
  '2024-02-17': { name: '春节', isWorkday: false },
  '2024-04-04': { name: '清明节', isWorkday: false },
  '2024-04-05': { name: '清明节', isWorkday: false },
  '2024-04-06': { name: '清明节', isWorkday: false },
  '2024-05-01': { name: '劳动节', isWorkday: false },
  '2024-05-02': { name: '劳动节', isWorkday: false },
  '2024-05-03': { name: '劳动节', isWorkday: false },
  '2024-05-04': { name: '劳动节', isWorkday: false },
  '2024-06-10': { name: '端午节', isWorkday: false },
  '2024-09-15': { name: '中秋节', isWorkday: false },
  '2024-09-16': { name: '中秋节', isWorkday: false },
  '2024-09-17': { name: '中秋节', isWorkday: false },
  '2024-10-01': { name: '国庆节', isWorkday: false },
  '2024-10-02': { name: '国庆节', isWorkday: false },
  '2024-10-03': { name: '国庆节', isWorkday: false },
  '2024-10-04': { name: '国庆节', isWorkday: false },
  '2024-10-05': { name: '国庆节', isWorkday: false },
  '2024-10-06': { name: '国庆节', isWorkday: false },
  '2024-10-07': { name: '国庆节', isWorkday: false },
  // 调休工作日
  '2024-02-04': { name: '春节调休', isWorkday: true },
  '2024-02-18': { name: '春节调休', isWorkday: true },
  '2024-04-07': { name: '清明节调休', isWorkday: true },
  '2024-05-05': { name: '劳动节调休', isWorkday: true },
  '2024-09-14': { name: '中秋节调休', isWorkday: true },
  '2024-09-29': { name: '国庆节调休', isWorkday: true },
  '2024-10-12': { name: '国庆节调休', isWorkday: true },
};

/**
 * 2025年节假日数据
 */
const HOLIDAYS_2025 = {
  '2025-01-01': { name: '元旦', isWorkday: false },
  '2025-01-29': { name: '春节', isWorkday: false },
  '2025-01-30': { name: '春节', isWorkday: false },
  '2025-01-31': { name: '春节', isWorkday: false },
  '2025-02-01': { name: '春节', isWorkday: false },
  '2025-02-02': { name: '春节', isWorkday: false },
  '2025-02-03': { name: '春节', isWorkday: false },
  '2025-02-04': { name: '春节', isWorkday: false },
  '2025-04-04': { name: '清明节', isWorkday: false },
  '2025-04-05': { name: '清明节', isWorkday: false },
  '2025-04-06': { name: '清明节', isWorkday: false },
  '2025-05-01': { name: '劳动节', isWorkday: false },
  '2025-05-02': { name: '劳动节', isWorkday: false },
  '2025-05-03': { name: '劳动节', isWorkday: false },
  '2025-05-04': { name: '劳动节', isWorkday: false },
  '2025-05-05': { name: '劳动节', isWorkday: false },
  '2025-05-31': { name: '端午节', isWorkday: false },
  '2025-10-01': { name: '国庆节', isWorkday: false },
  '2025-10-02': { name: '国庆节', isWorkday: false },
  '2025-10-03': { name: '国庆节', isWorkday: false },
  '2025-10-04': { name: '国庆节', isWorkday: false },
  '2025-10-05': { name: '国庆节', isWorkday: false },
  '2025-10-06': { name: '国庆节', isWorkday: false },
  '2025-10-07': { name: '国庆节', isWorkday: false },
};

/**
 * 历史事件数据
 */
const HISTORICAL_EVENTS = {
  '01-01': { name: '元旦', description: '新年第一天' },
  '02-14': { name: '情人节', description: '西方情人节' },
  '03-08': { name: '妇女节', description: '国际劳动妇女节' },
  '03-12': { name: '植树节', description: '中国植树节' },
  '04-01': { name: '愚人节', description: '愚人节' },
  '05-04': { name: '青年节', description: '中国青年节' },
  '06-01': { name: '儿童节', description: '国际儿童节' },
  '07-01': { name: '建党节', description: '中国共产党成立纪念日' },
  '08-01': { name: '建军节', description: '中国人民解放军建军节' },
  '09-10': { name: '教师节', description: '中国教师节' },
  '10-01': { name: '国庆节', description: '中华人民共和国成立纪念日' },
  '12-25': { name: '圣诞节', description: '西方圣诞节' },
};

/**
 * 简化版农历转换（基于固定算法）
 * 注意：这是一个简化版本，实际应用中建议使用专业的农历库
 */
function getLunarDate(date: Date): LunarInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 简化的农历计算（仅作演示用）
  // 实际项目中建议使用专业的农历库如 lunar-javascript
  
  // 这里使用一个简化的算法来生成农历信息
  const lunarMonth = LUNAR_MONTHS[month - 1];
  const lunarDay = LUNAR_DAYS[day - 1] || '初一';
  
  // 检查是否为节假日
  const dateString = date.toISOString().split('T')[0];
  const holiday = HOLIDAYS_2024[dateString] || HOLIDAYS_2025[dateString];
  
  // 检查是否为历史事件
  const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const historicalEvent = HISTORICAL_EVENTS[monthDay];
  
  return {
    lunarDate: `${lunarMonth}月${lunarDay}`,
    lunarMonth,
    lunarDay,
    festival: holiday?.name || historicalEvent?.name,
    solarTerm: getSolarTerm(date)
  };
}

/**
 * 获取节气信息
 */
function getSolarTerm(date: Date): string | undefined {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 简化的节气判断（实际应用中需要精确的天文计算）
  const solarTermsMap: Record<string, string> = {
    '1-6': '小寒',
    '1-20': '大寒',
    '2-4': '立春',
    '2-19': '雨水',
    '3-6': '惊蛰',
    '3-21': '春分',
    '4-5': '清明',
    '4-20': '谷雨',
    '5-6': '立夏',
    '5-21': '小满',
    '6-6': '芒种',
    '6-21': '夏至',
    '7-7': '小暑',
    '7-23': '大暑',
    '8-8': '立秋',
    '8-23': '处暑',
    '9-8': '白露',
    '9-23': '秋分',
    '10-8': '寒露',
    '10-24': '霜降',
    '11-8': '立冬',
    '11-22': '小雪',
    '12-7': '大雪',
    '12-22': '冬至'
  };
  
  const key = `${month}-${day}`;
  return solarTermsMap[key];
}

/**
 * 获取指定日期的农历信息
 * @param date 日期
 * @returns 农历信息
 */
export function getLunarInfo(date: Date): LunarInfo {
  return getLunarDate(date);
}

/**
 * 获取指定月份的所有农历信息
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 该月所有日期的农历信息
 */
export function getMonthLunarInfo(year: number, month: number): Record<string, LunarInfo> {
  const result: Record<string, LunarInfo> = {};
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = date.toISOString().split('T')[0];
    result[dateString] = getLunarInfo(date);
  }
  
  return result;
}

/**
 * 获取节假日信息
 * @param date 日期
 * @returns 节假日信息
 */
export function getHolidayInfo(date: Date) {
  const dateString = date.toISOString().split('T')[0];
  return HOLIDAYS_2024[dateString] || HOLIDAYS_2025[dateString];
}

/**
 * 获取历史事件信息
 * @param date 日期
 * @returns 历史事件信息
 */
export function getHistoricalEvent(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return HISTORICAL_EVENTS[monthDay];
}

/**
 * 检查是否为工作日
 * @param date 日期
 * @returns 是否为工作日
 */
export function isWorkday(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const holidayInfo = getHolidayInfo(date);
  
  // 如果是节假日且不是调休工作日，则不是工作日
  if (holidayInfo && !holidayInfo.isWorkday) {
    return false;
  }
  
  // 如果是调休工作日，则是工作日
  if (holidayInfo && holidayInfo.isWorkday) {
    return true;
  }
  
  // 周末不是工作日
  return dayOfWeek !== 0 && dayOfWeek !== 6;
} 