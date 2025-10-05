/**
 * 全局类型声明
 * 用于声明全局变量和扩展全局接口
 */

import type { i18n as I18nInstance, TFunction } from 'i18next';

declare global {
  /**
   * 全局i18n实例
   * 在main.tsx中设置，供所有模块使用
   */
  var i18n: I18nInstance;

  /**
   * 全局t函数（翻译函数）
   * 用于在非React组件中进行国际化翻译
   */
  var t: TFunction;

  /**
   * Chrome扩展API（可选）
   * 用于支持Chrome扩展功能
   */
  var chrome: any;

  interface Window {
    /**
     * 全局i18n实例（window对象上的引用）
     */
    i18n: I18nInstance;

    /**
     * 全局t函数（window对象上的引用）
     */
    t: TFunction;

    /**
     * Chrome扩展API（window对象上的引用）
     */
    chrome?: any;
  }

  interface globalThis {
    /**
     * 全局i18n实例（globalThis对象上的引用）
     */
    i18n: I18nInstance;

    /**
     * 全局t函数（globalThis对象上的引用）
     */
    t: TFunction;

    /**
     * Chrome扩展API（globalThis对象上的引用）
     */
    chrome?: any;
  }
}

export {};

