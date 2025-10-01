/**
 * 统一Z-Index层级管理系统
 * 解决弹窗遮挡问题的根本性解决方案
 */

/**
 * Z-Index层级枚举
 * 基于设计令牌系统的标准层级定义
 */
export enum ZIndexLayers {
  BASE = 0,                    // 基础层级
  BACKGROUND = -1,             // 背景装饰
  CONTENT = 1,                 // 普通内容
  DROPDOWN = 1000,             // 下拉菜单
  STICKY = 1010,               // 粘性元素
  FIXED = 1020,                // 固定定位
  OVERLAY = 1030,              // 遮罩层
  MODAL_BACKDROP = 1040,       // 模态框背景
  MODAL = 1050,                // 模态框内容
  DIALOG_OVERLAY = 1045,       // 对话框遮罩
  DIALOG_CONTENT = 1055,       // 对话框内容
  POPOVER = 1060,              // 弹出提示
  TOOLTIP = 1070,              // 工具提示
  TOAST = 1080,                // 消息通知
  CRITICAL = 1090,             // 关键系统弹窗
  AUTHING = 1100000,           // 认证相关（覆盖第三方库）
  EMERGENCY = 2147483640       // 紧急覆盖层（接近最大值）
}

/**
 * Z-Index管理器
 */
export class ZIndexManager {
  private static instance: ZIndexManager;
  private currentStack: number[] = [];

  private constructor() {}

  static getInstance(): ZIndexManager {
    if (!ZIndexManager.instance) {
      ZIndexManager.instance = new ZIndexManager();
    }
    return ZIndexManager.instance;
  }

  /**
   * 获取CSS变量值
   */
  getZIndexCSSVar(layer: keyof typeof ZIndexLayers): string {
    const layerName = layer.toLowerCase().replace('_', '-');
    return `var(--z-${layerName})`;
  }

  /**
   * 获取数值
   */
  getZIndexValue(layer: keyof typeof ZIndexLayers): number {
    return ZIndexLayers[layer];
  }

  /**
   * 为弹窗分配安全的z-index值
   * 确保新弹窗总是在最顶层
   */
  allocateModalIndex(baseLayer: keyof typeof ZIndexLayers = 'MODAL'): number {
    const baseValue = ZIndexLayers[baseLayer];
    const newIndex = baseValue + this.currentStack.length;
    this.currentStack.push(newIndex);
    return newIndex;
  }

  /**
   * 释放z-index值
   */
  releaseModalIndex(index: number): void {
    const indexInStack = this.currentStack.indexOf(index);
    if (indexInStack > -1) {
      this.currentStack.splice(indexInStack, 1);
    }
  }

  /**
   * 获取当前最高z-index
   */
  getCurrentHighest(): number {
    if (this.currentStack.length === 0) {
      return ZIndexLayers.MODAL;
    }
    return Math.max(...this.currentStack);
  }

  /**
   * 应用z-index到元素
   */
  applyZIndex(element: HTMLElement, layer: keyof typeof ZIndexLayers): void {
    element.style.zIndex = this.getZIndexValue(layer).toString();
  }

  /**
   * 创建弹窗样式对象
   */
  createModalStyles(layer: keyof typeof ZIndexLayers = 'MODAL'): React.CSSProperties {
    return {
      position: 'fixed',
      zIndex: this.getZIndexValue(layer),
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  /**
   * 创建遮罩层样式对象
   */
  createOverlayStyles(): React.CSSProperties {
    return {
      position: 'fixed',
      inset: 0,
      zIndex: this.getZIndexValue('OVERLAY'),
      backgroundColor: 'hsl(var(--foreground) / 0.5)'
    };
  }

  /**
   * 检查并修复z-index冲突
   * 用于调试和开发阶段
   */
  debugZIndexConflicts(): void {
    if (process.env.NODE_ENV === 'development') {
      const elements = document.querySelectorAll('[style*="z-index"]');
      const conflicts: { element: Element; zIndex: string }[] = [];
      
      elements.forEach(el => {
        const style = (el as HTMLElement).style;
        const zIndex = style.zIndex;
        if (zIndex && !this.isValidZIndex(parseInt(zIndex))) {
          conflicts.push({ element: el, zIndex });
        }
      });

      if (conflicts.length > 0) {
        console.warn('🚨 发现z-indexconflict:', conflicts);
      }
    }
  }

  /**
   * 验证z-index是否符合设计系统标准
   */
  private isValidZIndex(value: number): boolean {
    const validValues = Object.values(ZIndexLayers) as number[];
    return validValues.includes(value) || 
           (value > ZIndexLayers.MODAL && value < ZIndexLayers.AUTHING);
  }
}

// 导出单例实例
export const zIndexManager = ZIndexManager.getInstance();

// 导出常用的工具函数
export const getZIndex = (layer: keyof typeof ZIndexLayers) => 
  zIndexManager.getZIndexValue(layer);

export const getZIndexVar = (layer: keyof typeof ZIndexLayers) => 
  zIndexManager.getZIndexCSSVar(layer);

export const createModalStyles = (layer?: keyof typeof ZIndexLayers) => 
  zIndexManager.createModalStyles(layer);

export const createOverlayStyles = () => 
  zIndexManager.createOverlayStyles();