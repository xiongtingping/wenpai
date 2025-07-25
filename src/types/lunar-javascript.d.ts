declare module 'lunar-javascript' {
  export interface LunarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getFestivals(): string[];
    getJieQi(): string;
    toString(): string;
  }

  export interface SolarInterface {
    getLunar(): LunarDate;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): LunarDate;
    static fromDate(date: Date): LunarDate;
  }

  export class Solar implements SolarInterface {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): LunarDate;
  }
}