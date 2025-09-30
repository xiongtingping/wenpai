// 🔒 安全的displayName获取工具函数
// 解决TDZ错误：Cannot read properties of undefined (reading 'displayName')

/**
 * 安全地设置React组件的displayName，避免TDZ错误
 * @param Component 要设置displayName的组件
 * @param PrimitiveComponent 原始Radix组件（可能存在displayName）
 * @param fallbackName 后备名称
 */
export function safeSetDisplayName<T>(
  Component: T,
  PrimitiveComponent: any,
  fallbackName: string
): void {
  try {
    // 安全获取Primitive的displayName，避免TDZ错误
    const primitiveDisplayName = (function() {
      try {
        // 检查PrimitiveComponent是否存在且有displayName属性
        if (PrimitiveComponent && typeof PrimitiveComponent === 'object') {
          const displayName = PrimitiveComponent.displayName;
          return typeof displayName === 'string' ? displayName : null;
        }
        return null;
      } catch (error) {
        // 捕获任何TDZ或访问错误
        console.warn(`⚠️ 无法安全访问displayName:`, error);
        return null;
      }
    })();

    // 安全设置displayName
    if (Component && typeof Component === 'object') {
      (Component as any).displayName = primitiveDisplayName || fallbackName;
    }
  } catch (error) {
    console.warn(`⚠️ 设置displayName失败 (${fallbackName}):`, error);
  }
}

/**
 * 安全地获取displayName，避免TDZ错误
 * @param PrimitiveComponent 原始组件
 * @param fallbackName 后备名称
 * @returns 安全的displayName字符串
 */
export function safeGetDisplayName(
  PrimitiveComponent: any,
  fallbackName: string
): string {
  try {
    if (PrimitiveComponent && typeof PrimitiveComponent === 'object') {
      const displayName = PrimitiveComponent.displayName;
      return typeof displayName === 'string' ? displayName : fallbackName;
    }
    return fallbackName;
  } catch (error) {
    console.warn(`⚠️ 无法安全获取displayName，使用后备名称 (${fallbackName}):`, error);
    return fallbackName;
  }
}