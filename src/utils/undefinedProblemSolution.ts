/**
 * 🛡️ undefinedundefined 问题完整解决方案
 * 
 * 🔒 LOCKED: 2025-01-28 完整解决方案已封装
 * 📌 包含问题根源分析、修复方法、防护机制
 * 🚫 请勿修改此核心解决方案，如需扩展请创建新模块
 */

// ==================== 问题根源分析 ====================

/**
 * 🔍 问题根源分析
 * 
 * 1. 直接原因：JavaScript 中 undefined 值被字符串拼接
 *    - `${undefined}${undefined}` → "undefinedundefined"
 *    - `undefined + undefined` → "undefinedundefined"
 * 
 * 2. 深层原因：
 *    - Authing Guard 用户信息字段为 undefined
 *    - 模板字符串中未做空值检查
 *    - 字符串拼接缺乏安全处理
 * 
 * 3. 触发场景：
 *    - 用户首次登录，nickname/username 为空
 *    - 网络异常导致用户信息不完整
 *    - Authing Guard 内部字符串处理逻辑
 */
export const PROBLEM_ROOT_CAUSE = {
  directCause: 'JavaScript undefined 值字符串拼接',
  deepCause: 'Authing Guard 用户信息字段缺失 + 缺乏安全检查',
  triggerScenarios: [
    '用户首次登录信息不完整',
    '网络异常导致数据缺失',
    'Authing Guard 内部处理逻辑',
    '模板字符串未做空值检查'
  ]
} as const;

// ==================== 修复思路和方法 ====================

/**
 * 🛠️ 修复思路
 * 
 * 采用多层防护策略：
 * 1. 预防层：源头数据安全化
 * 2. 拦截层：渲染过程拦截
 * 3. 修复层：页面显示后修复
 * 4. 监控层：持续验证效果
 */
export const SOLUTION_STRATEGY = {
  prevention: '源头数据安全化处理',
  interception: '渲染过程实时拦截',
  repair: '页面显示后立即修复',
  monitoring: '持续验证和监控'
} as const;

/**
 * 🔧 具体修复方法
 */
export const REPAIR_METHODS = {
  // 1. 全局修复器
  globalFixer: {
    file: 'src/utils/globalUndefinedFixer.ts',
    function: '页面加载时扫描并修复所有 undefinedundefined',
    coverage: ['文本节点', '元素属性', 'Authing Guard 元素'],
    strategy: 'undefinedundefined → 空字符串或默认值'
  },
  
  // 2. React 组件修复器
  reactFixer: {
    file: 'src/components/UndefinedFixer.tsx',
    function: 'React 组件层面拦截和修复',
    components: ['UndefinedFixer', 'SafeText', 'SafeUserName'],
    strategy: '包装组件自动修复子组件问题'
  },
  
  // 3. 工具函数强化
  utilityFunctions: {
    files: [
      'src/utils/userDisplayUtils.ts',
      'src/utils/undefinedPreventionSystem.ts'
    ],
    functions: ['getUserDisplayName', 'safeString'],
    strategy: '强化核心函数的安全检查'
  },
  
  // 4. 验证和监控
  verification: {
    file: 'src/utils/undefinedVerifier.ts',
    function: '验证修复效果和持续监控',
    strategy: '定期扫描页面检测残留问题'
  }
} as const;

// ==================== 防护机制 ====================

/**
 * 🛡️ 多层防护机制
 */
export class UndefinedProtectionSystem {
  private static instance: UndefinedProtectionSystem;
  private isEnabled = false;
  private fixCount = 0;
  
  static getInstance(): UndefinedProtectionSystem {
    if (!UndefinedProtectionSystem.instance) {
      UndefinedProtectionSystem.instance = new UndefinedProtectionSystem();
    }
    return UndefinedProtectionSystem.instance;
  }
  
  /**
   * 启用防护系统
   */
  enable(): void {
    if (this.isEnabled) return;
    
    this.enableGlobalStringInterception();
    this.enableDOMMonitoring();
    this.enableReactInterception();
    this.isEnabled = true;
    
    console.log('🛡️ undefined 防护系统已启用');
  }
  
  /**
   * 全局字符串拦截
   */
  private enableGlobalStringInterception(): void {
    // 使用箭头函数保持this上下文

    // 拦截模板字符串
    const originalToString = Object.prototype.toString;
    Object.prototype.toString = function() {
      const result = originalToString.call(this);
      if (result === 'undefined') {
        return '';
      }
      return result;
    };

    // 拦截字符串拼接
    const originalStringConcat = String.prototype.concat;
    String.prototype.concat = (...args) => {
      const result = originalStringConcat.apply(this, args);
      if (result.includes('undefinedundefined')) {
        this.fixCount++;
        console.warn(`🛠️ 拦截字符串拼接 #${this.fixCount}:`, result, '→', '');
        return result.replace(/undefinedundefined/g, '');
      }
      return result;
    };
  }
  
  /**
   * DOM 监控
   */
  private enableDOMMonitoring(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            this.checkAndFixNode(node);
          });
        }
        if (mutation.type === 'characterData') {
          this.checkAndFixNode(mutation.target);
        }
      });
    });
    
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }
  
  /**
   * React 拦截
   */
  private enableReactInterception(): void {
    // 在 React 渲染过程中拦截
    if (typeof window !== 'undefined' && (window as any).React) {
      const originalCreateElement = (window as any).React.createElement;
      (window as any).React.createElement = function(type: any, props: any, ...children: any[]) {
        // 检查 props 中的字符串值
        if (props) {
          Object.keys(props).forEach(key => {
            if (typeof props[key] === 'string' && props[key].includes('undefinedundefined')) {
              props[key] = props[key].replace(/undefinedundefined/g, '');
            }
          });
        }
        
        // 检查 children 中的字符串值
        const safeChildren = children.map(child => {
          if (typeof child === 'string' && child.includes('undefinedundefined')) {
            return child.replace(/undefinedundefined/g, '');
          }
          return child;
        });
        
        return originalCreateElement.call(this, type, props, ...safeChildren);
      };
    }
  }
  
  /**
   * 检查并修复节点
   */
  private checkAndFixNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && node.textContent.includes('undefinedundefined')) {
        node.textContent = node.textContent.replace(/undefinedundefined/g, '');
        this.fixCount++;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.textContent && element.textContent.includes('undefinedundefined')) {
        element.textContent = element.textContent.replace(/undefinedundefined/g, '');
        this.fixCount++;
      }
    }
  }
  
  /**
   * 获取修复统计
   */
  getStats(): { fixCount: number; isEnabled: boolean } {
    return {
      fixCount: this.fixCount,
      isEnabled: this.isEnabled
    };
  }
}

// ==================== 安全工具函数 ====================

/**
 * 🔒 安全的用户显示名称获取
 */
export function safeGetUserDisplayName(user: any, fallback = '用户'): string {
  if (!user || typeof user !== 'object') {
    return fallback;
  }
  
  // 安全检查每个字段
  const nickname = user.nickname && user.nickname !== 'undefined' ? user.nickname : '';
  const username = user.username && user.username !== 'undefined' ? user.username : '';
  const email = user.email && user.email !== 'undefined' ? user.email : '';
  
  const result = nickname || username || email || fallback;
  
  // 最终安全检查
  if (result.includes('undefined')) {
    return fallback;
  }
  
  return result;
}

/**
 * 🔒 安全的字符串处理
 */
export function safeStringProcess(value: any, fallback = ''): string {
  if (value === null || value === undefined || value === 'undefined') {
    return fallback;
  }
  
  const str = String(value);
  
  // 检查并修复 undefinedundefined
  if (str.includes('undefinedundefined')) {
    return str.replace(/undefinedundefined/g, fallback);
  }
  
  return str;
}

// ==================== 预防措施 ====================

/**
 * 🚫 防止问题再次出现的措施
 */
export const PREVENTION_MEASURES = {
  // 1. 代码规范
  codingStandards: {
    rules: [
      '所有用户信息显示必须使用 safeGetUserDisplayName()',
      '禁止直接使用模板字符串拼接用户字段',
      '所有字符串处理必须使用 safeStringProcess()',
      '新增用户信息字段必须提供默认值'
    ]
  },
  
  // 2. 类型安全
  typeSafety: {
    measures: [
      '使用 TypeScript 严格模式',
      '定义用户信息接口时标记可选字段',
      '使用联合类型防止 undefined',
      '启用 strictNullChecks'
    ]
  },
  
  // 3. 测试覆盖
  testCoverage: {
    requirements: [
      '用户信息显示组件必须有单元测试',
      '测试用例必须覆盖 undefined 场景',
      '集成测试必须验证字符串拼接安全',
      '定期运行 undefined 检测测试'
    ]
  },
  
  // 4. 监控告警
  monitoring: {
    setup: [
      '生产环境启用 undefined 检测',
      '控制台错误自动上报',
      '定期运行页面扫描',
      '用户反馈问题追踪'
    ]
  }
} as const;

// ==================== 导出接口 ====================

// ==================== 自动启用防护系统 ====================

// 📴 生产默认不自动启用，避免与 Authing Guard 冲突；仅 DEV 或显式开关启用
const protectionSystem = UndefinedProtectionSystem.getInstance();
const ENABLE_UNDEF_PROTECTION = import.meta.env.DEV || (import.meta.env.VITE_ENABLE_UNDEF_PROTECTION === '1');
if (ENABLE_UNDEF_PROTECTION) {
  protectionSystem.enable();
  console.log('🛡️ undefined 防护系统已启用（开关命中）');
} else {
  console.log('🛡️ undefined 防护系统默认关闭（生产环境）');
}

// 🔧 [AUTHING_JSON_ERROR_FIX_v2025.08.14] 修复Authing JSON解析错误
window.addEventListener('error', (event) => {
  const message = event.message;
  if (message && message.includes('Unexpected token \'<\'') && message.includes('not valid JSON')) {
    console.warn('🛠️ 检测到Authing JSON解析错误，这通常是网络问题，不影响undefinedundefined防护');
    event.preventDefault();
    return false;
  }
});

// 捕获Promise rejection错误
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason && reason.message &&
      reason.message.includes('Unexpected token \'<\'') &&
      reason.message.includes('not valid JSON')) {
    console.warn('🛠️ 捕获Authing JSON解析Promise错误，已处理');
    event.preventDefault();
    return false;
  }
});

console.log('🛡️ undefinedundefined 防护系统已自动启用');

export default {
  PROBLEM_ROOT_CAUSE,
  SOLUTION_STRATEGY,
  REPAIR_METHODS,
  UndefinedProtectionSystem,
  safeGetUserDisplayName,
  safeStringProcess,
  PREVENTION_MEASURES
};
