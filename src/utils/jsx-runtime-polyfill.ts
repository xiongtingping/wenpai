/**
 * 🔧 jsx-runtime Polyfill - 解决模块解析错误
 * 通过vite别名重定向到此文件，使用全局React对象提供jsx运行时
 */

declare global {
  interface Window {
    React: any;
  }
}

// 确保React全局对象可用
const getReact = () => {
  if (typeof window !== 'undefined' && window.React) {
    return window.React;
  }
  // 降级处理，尝试从全局变量获取
  if (typeof globalThis !== 'undefined' && (globalThis as any).React) {
    return (globalThis as any).React;
  }
  throw new Error('jsx-runtime polyfill: React global object not found');
};

let React: any;
try {
  React = getReact();
  console.log('✅ jsx-runtime polyfill loaded successfully');
} catch (e) {
  console.error('🚨 jsx-runtime polyfill error:', e);
  React = {
    createElement: () => null,
    Fragment: 'div'
  };
}

// ES6导出jsx-runtime需要的核心函数
export const jsx = React.createElement;
export const jsxs = React.createElement;
export const Fragment = React.Fragment;

// 默认导出（兼容不同导入方式）
export default {
  jsx: React.createElement,
  jsxs: React.createElement,
  Fragment: React.Fragment
};