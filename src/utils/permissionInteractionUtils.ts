/**
 * 权限守卫交互禁用工具函数
 * @description 提供JavaScript层面的交互禁用功能，增强安全性
 * @author 权限系统团队
 * @created 2025-01-15
 */

/**
 * 禁用元素的所有交互
 * @param element 目标元素
 */
export const disableAllInteraction = (element: HTMLElement): void => {
  if (!element) return;
  
  // 禁用鼠标事件
  element.style.pointerEvents = 'none';
  
  // 禁用选择
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.mozUserSelect = 'none';
  element.style.msUserSelect = 'none';
  
  // 禁用拖拽
  element.draggable = false;
  element.style.webkitUserDrag = 'none';
  
  // 移除tabindex
  element.setAttribute('tabindex', '-1');
  element.setAttribute('aria-disabled', 'true');
  
  // 禁用上下文菜单
  element.addEventListener('contextmenu', preventEvent, { passive: false });
  
  // 禁用键盘事件
  element.addEventListener('keydown', preventKeyboardAccess, { passive: false });
  element.addEventListener('keypress', preventEvent, { passive: false });
  element.addEventListener('keyup', preventEvent, { passive: false });
  
  // 禁用触摸事件（移动端）
  element.addEventListener('touchstart', preventEvent, { passive: false });
  element.addEventListener('touchmove', preventEvent, { passive: false });
  element.addEventListener('touchend', preventEvent, { passive: false });
  
  // 禁用鼠标事件（防止CSS被绕过）
  element.addEventListener('mousedown', preventEvent, { passive: false });
  element.addEventListener('mouseup', preventEvent, { passive: false });
  element.addEventListener('click', preventEvent, { passive: false });
  element.addEventListener('dblclick', preventEvent, { passive: false });
  
  // 递归处理子元素
  const children = Array.from(element.children) as HTMLElement[];
  children.forEach(child => disableAllInteraction(child));
};

/**
 * 恢复元素的所有交互
 * @param element 目标元素
 */
export const enableAllInteraction = (element: HTMLElement): void => {
  if (!element) return;
  
  // 恢复样式属性
  element.style.pointerEvents = '';
  element.style.userSelect = '';
  element.style.webkitUserSelect = '';
  element.style.mozUserSelect = '';
  element.style.msUserSelect = '';
  element.style.webkitUserDrag = '';
  element.draggable = true;
  
  // 恢复属性
  element.removeAttribute('tabindex');
  element.removeAttribute('aria-disabled');
  
  // 移除事件监听器
  element.removeEventListener('contextmenu', preventEvent);
  element.removeEventListener('keydown', preventKeyboardAccess);
  element.removeEventListener('keypress', preventEvent);
  element.removeEventListener('keyup', preventEvent);
  element.removeEventListener('touchstart', preventEvent);
  element.removeEventListener('touchmove', preventEvent);
  element.removeEventListener('touchend', preventEvent);
  element.removeEventListener('mousedown', preventEvent);
  element.removeEventListener('mouseup', preventEvent);
  element.removeEventListener('click', preventEvent);
  element.removeEventListener('dblclick', preventEvent);
  
  // 递归处理子元素
  const children = Array.from(element.children) as HTMLElement[];
  children.forEach(child => enableAllInteraction(child));
};

/**
 * 阻止事件的默认行为和传播
 * @param event 事件对象
 */
const preventEvent = (event: Event): void => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

/**
 * 阻止键盘访问
 * @param event 键盘事件
 */
const preventKeyboardAccess = (event: KeyboardEvent): void => {
  // 阻止所有键盘访问，包括Tab、Enter、Space等
  const blockedKeys = ['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
  
  if (blockedKeys.includes(event.key) || event.key.startsWith('F')) {
    preventEvent(event);
  }
  
  // 阻止快捷键
  if (event.ctrlKey || event.altKey || event.metaKey) {
    preventEvent(event);
  }
};

/**
 * React Hook：权限交互控制
 * @param hasPermission 是否有权限
 * @param elementRef 元素引用
 */
export const usePermissionInteraction = (
  hasPermission: boolean, 
  elementRef: React.RefObject<HTMLElement>
): void => {
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    if (!hasPermission) {
      disableAllInteraction(element);
    } else {
      enableAllInteraction(element);
    }
    
    // 清理函数
    return () => {
      if (element) {
        enableAllInteraction(element);
      }
    };
  }, [hasPermission, elementRef]);
};

/**
 * 监听并阻止开发者工具修改
 */
export const preventDevToolsModification = (): void => {
  // 监听DOM变化，防止通过开发者工具移除禁用类
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const element = mutation.target as HTMLElement;
        
        // 如果权限禁用类被移除，重新添加
        if (element.classList.contains('permission-guard-overlay') && 
            !element.classList.contains('permission-disabled')) {
          console.warn('⚠️ 权限守卫：检测到尝试绕过权限限制');
          element.classList.add('permission-disabled');
        }
      }
    });
  });
  
  // 监听所有权限守卫相关元素
  document.querySelectorAll('.permission-guard-overlay, .permission-disabled').forEach((element) => {
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  });
};

// React导入
import React from 'react';