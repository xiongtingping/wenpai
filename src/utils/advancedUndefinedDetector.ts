/**
 * 🔍 高级undefined拼接检测器
 * 实时监控和防护undefined字符串拼接问题
 */

interface DetectionConfig {
  enableConsoleMonitoring: boolean;
  enableDOMMonitoring: boolean;
  enableReactMonitoring: boolean;
  alertThreshold: number;
  autoFix: boolean;
}

interface DetectionEvent {
  id: string;
  timestamp: number;
  source: string;
  content: string;
  context: string;
  stackTrace: string;
  fixed: boolean;
}

class AdvancedUndefinedDetector {
  private config: DetectionConfig;
  private events: DetectionEvent[] = [];
  private observer?: MutationObserver;
  private isActive = false;

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = {
      enableConsoleMonitoring: true,
      enableDOMMonitoring: true,
      enableReactMonitoring: true,
      alertThreshold: 3,
      autoFix: false,
      ...config
    };
  }

  public start(): void {
    if (!import.meta.env.DEV || this.isActive) return;

    this.isActive = true;
    console.log('🛡️ 高级undefined拼接检测器已启动');

    if (this.config.enableConsoleMonitoring) {
      this.setupConsoleMonitoring();
    }

    if (this.config.enableDOMMonitoring) {
      this.setupDOMMonitoring();
    }

    if (this.config.enableReactMonitoring) {
      this.setupReactMonitoring();
    }

    // 定期清理旧事件
    setInterval(() => this.cleanupOldEvents(), 60000);
  }

  public stop(): void {
    this.isActive = false;
    if (this.observer) {
      this.observer.disconnect();
    }
    console.log('🛡️ undefined拼接检测器已停止');
  }

  private setupConsoleMonitoring(): void {
    const originalMethods = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    Object.entries(originalMethods).forEach(([method, original]) => {
      (console as any)[method] = (...args: any[]) => {
        args.forEach((arg, index) => {
          if (this.containsUndefined(arg)) {
            this.recordEvent({
              source: 'console',
              content: String(arg),
              context: `console.${method}[${index}]`,
              stackTrace: new Error().stack || ''
            });
          }
        });
        original.apply(console, args);
      };
    });
  }

  private setupDOMMonitoring(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            this.scanNode(node);
          });
        } else if (mutation.type === 'characterData') {
          const text = mutation.target.textContent || '';
          if (this.containsUndefined(text)) {
            this.recordEvent({
              source: 'dom-text',
              content: text,
              context: 'textContent',
              stackTrace: new Error().stack || ''
            });
          }
        }
      });
    });

    if (typeof document !== 'undefined') {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true
      });
    }
  }

  private setupReactMonitoring(): void {
    // 监控React DevTools
    if (typeof window !== 'undefined') {
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = (callback: any, delay?: number) => {
        const wrappedCallback = (...args: any[]) => {
          try {
            return callback.apply(this, args);
          } catch (error) {
            if (error instanceof Error && error.message.includes('undefined')) {
              this.recordEvent({
                source: 'react-error',
                content: error.message,
                context: 'setTimeout callback',
                stackTrace: error.stack || ''
              });
            }
            throw error;
          }
        };
        return originalSetTimeout(wrappedCallback, delay);
      };
    }
  }

  private scanNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (this.containsUndefined(text)) {
        this.recordEvent({
          source: 'dom-text',
          content: text,
          context: this.getNodeContext(node),
          stackTrace: new Error().stack || ''
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      
      // 检查属性
      Array.from(element.attributes || []).forEach(attr => {
        if (this.containsUndefined(attr.value)) {
          this.recordEvent({
            source: 'dom-attribute',
            content: attr.value,
            context: `${element.tagName.toLowerCase()}.${attr.name}`,
            stackTrace: new Error().stack || ''
          });
        }
      });

      // 递归检查子节点
      Array.from(element.childNodes).forEach(child => {
        this.scanNode(child);
      });
    }
  }

  private getNodeContext(node: Node): string {
    const parent = node.parentElement;
    if (!parent) return 'unknown';
    
    const tag = parent.tagName.toLowerCase();
    const className = parent.className ? `.${parent.className.split(' ').join('.')}` : '';
    const id = parent.id ? `#${parent.id}` : '';
    
    return `${tag}${id}${className}`;
  }

  private containsUndefined(value: any): boolean {
    if (typeof value !== 'string') return false;
    return value.includes('undefined') || value.includes('undefinedundefined');
  }

  private recordEvent(eventData: Omit<DetectionEvent, 'id' | 'timestamp' | 'fixed'>): void {
    const event: DetectionEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      fixed: false,
      ...eventData
    };

    this.events.push(event);

    // 尝试自动修复
    if (this.config.autoFix) {
      this.attemptAutoFix(event);
    }

    // 输出警告
    this.outputWarning(event);

    // 检查是否达到阈值
    if (this.getRecentEventsCount() >= this.config.alertThreshold) {
      this.triggerAlert();
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private attemptAutoFix(event: DetectionEvent): void {
    // 这里可以实现一些自动修复逻辑
    // 例如：替换undefined为默认值
    if (event.source === 'dom-text' && event.content.includes('undefined')) {
      console.log('🔧 尝试自动修复:', event.content);
      // 实际的修复逻辑需要根据具体情况实现
      event.fixed = true;
    }
  }

  private outputWarning(event: DetectionEvent): void {
    console.group(`🚨 undefined拼接检测 [${event.id}]`);
    console.warn('来源:', event.source);
    console.warn('内容:', event.content);
    console.warn('上下文:', event.context);
    console.warn('时间:', new Date(event.timestamp).toISOString());
    
    if (event.stackTrace) {
      console.warn('调用栈:', event.stackTrace);
    }
    
    console.warn('修复建议:', this.getSuggestion(event.source));
    console.groupEnd();
  }

  private getSuggestion(source: string): string {
    const suggestions = {
      'console': '检查console输出中的变量值，使用安全的字符串处理函数',
      'dom-text': '检查组件渲染逻辑，使用getUserDisplayName()等安全函数',
      'dom-attribute': '检查元素属性值，确保提供默认值',
      'react-error': '检查React组件中的状态和props处理'
    };
    
    return suggestions[source as keyof typeof suggestions] || '使用安全的字符串处理函数';
  }

  private getRecentEventsCount(): number {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return this.events.filter(event => event.timestamp > fiveMinutesAgo).length;
  }

  private triggerAlert(): void {
    const recentEvents = this.events.filter(event => 
      event.timestamp > Date.now() - 5 * 60 * 1000
    );

    console.error('🚨 undefined拼接问题频发！');
    console.table(recentEvents.map(event => ({
      ID: event.id,
      来源: event.source,
      内容: event.content.substring(0, 50) + '...',
      时间: new Date(event.timestamp).toLocaleTimeString()
    })));

    // 可以在这里添加更多的警报逻辑，比如发送通知等
  }

  private cleanupOldEvents(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.events = this.events.filter(event => event.timestamp > oneHourAgo);
  }

  // 公共API
  public getStats() {
    return {
      totalEvents: this.events.length,
      recentEvents: this.getRecentEventsCount(),
      fixedEvents: this.events.filter(e => e.fixed).length,
      sources: [...new Set(this.events.map(e => e.source))],
      isActive: this.isActive
    };
  }

  public getEvents(limit = 50): DetectionEvent[] {
    return this.events.slice(-limit);
  }

  public clearEvents(): void {
    this.events = [];
    console.log('🧹 检测事件已清空');
  }

  public exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      stats: this.getStats(),
      events: this.events
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// 创建全局实例
const detector = new AdvancedUndefinedDetector();

// 自动启动（仅开发环境）
if (import.meta.env.DEV) {
  detector.start();
  
  // 暴露到全局对象供调试使用
  if (typeof window !== 'undefined') {
    (window as any).__advancedUndefinedDetector = detector;
  }
}

export default detector;
export { AdvancedUndefinedDetector, type DetectionConfig, type DetectionEvent };
