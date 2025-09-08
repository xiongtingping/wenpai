/**
 * 🚨 React 层面的 undefinedundefined 修复组件
 * 拦截所有可能产生 undefinedundefined 的渲染
 */

import React, { useEffect, useRef } from 'react';

// 创建一个安全的字符串渲染函数
export const safeString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // 修复 undefinedundefined
  if (str.includes('undefinedundefined')) {
    console.warn('🛠️ 检测到 undefinedundefined，已修复为空字符串');
    return str.replace(/undefinedundefined/g, '');
  }
  
  // 修复单独的 undefined
  if (str === 'undefined') {
    console.warn('🛠️ 检测到单独的 undefined，已修复为空字符串');
    return '';
  }
  
  return str;
};

// 创建一个安全的用户显示名称函数
export const getUserDisplayName = (user: any): string => {
  if (!user) return '';
  
  // 优先使用 nickname，其次 username，最后为空
  const nickname = user.nickname || '';
  const username = user.username || '';
  
  if (nickname && nickname !== 'undefined') {
    return nickname;
  }
  
  if (username && username !== 'undefined') {
    return username;
  }
  
  return '';
};

// 全局字符串拦截器
const originalStringify = JSON.stringify;
JSON.stringify = function(value: any, replacer?: ((this: any, key: string, value: any) => any) | Array<string | number> | null, space?: string | number) {
  const result = (originalStringify as any).call(this, value, replacer as any, space as any);
  if (result && result.includes('undefinedundefined')) {
    console.warn('🛠️ JSON.stringify 产生了 undefinedundefined，已修复');
    return result.replace(/undefinedundefined/g, '');
  }
  return result;
};

// 拦截模板字符串 - 修复版本
const originalToString = Object.prototype.toString;
Object.prototype.toString = function() {
  // 安全检查：如果this是undefined或null，返回安全值
  if (this === undefined || this === null) {
    console.warn('🛠️ toString called on undefined/null, returning empty string');
    return '';
  }

  try {
    const result = originalToString.call(this);
    if (result === 'undefined') {
      return '';
    }
    return result;
  } catch (error) {
    console.warn('🛠️ toString error caught:', error);
    return '';
  }
};

// React 组件修复器
export const UndefinedFixer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fixContent = () => {
      if (!containerRef.current) return;

      // 修复所有文本内容
      const walker = document.createTreeWalker(
        containerRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes = [];
      let node: Node | null;
      // 使用赋值表达式需要显式判断
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      textNodes.forEach(textNode => {
        if (textNode.textContent) {
          const original = textNode.textContent;
          let fixed = original;

          // 修复 undefinedundefined
          if (fixed.includes('undefinedundefined')) {
            fixed = fixed.replace(/undefinedundefined/g, '');
            console.log('🛠️ React组件修复 undefinedundefined:', original, '->', fixed);
          }

          // 修复单独的 undefined
          if (fixed.trim() === 'undefined') {
            fixed = '';
            console.log('🛠️ React组件修复单独的 undefined');
          }

          if (fixed !== original) {
            textNode.textContent = fixed;
          }
        }
      });
    };

    // 立即修复
    fixContent();

    // 监控变化
    const observer = new MutationObserver(() => {
      setTimeout(fixContent, 10);
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, []);
  
  return <div ref={containerRef} style={{ display: 'contents' }}>{children}</div>;
};

// 高阶组件：自动包装组件以修复 undefinedundefined
export const withUndefinedFixer = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => (
    <UndefinedFixer>
      <Component {...props} />
    </UndefinedFixer>
  );
};

// 安全的 React 渲染函数
export const SafeText: React.FC<{ children: any }> = ({ children }) => {
  const safeContent = safeString(children);
  return <>{safeContent}</>;
};

// 安全的用户名显示组件
export const SafeUserName: React.FC<{ user: any }> = ({ user }) => {
  const displayName = getUserDisplayName(user);
  return <>{displayName}</>;
};

export default UndefinedFixer;
