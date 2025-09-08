/**
 * 内容适配器组件统一导出
 * 提供完整的UI组件集合
 */

// 主页面组件
export { default as ContentAdapterPage } from './ContentAdapterPage';

// 子组件
export { default as ContentInputSection } from './ContentInputSection';
export { default as PlatformSelector } from './PlatformSelector';
export { default as GenerationControls } from './GenerationControls';
export { default as ResultsDisplay } from './ResultsDisplay';

// 重新导出Hook，方便组件使用
export * from '../hooks';

// 重新导出服务层，保持一致性
export * from '../services';
