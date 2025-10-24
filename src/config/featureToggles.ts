/**
 * 全局功能开关配置
 * 通过集中管理便于临时下线功能而不删除原有实现
 */
export const featureToggles = {
  /** 全网雷达（热点话题）功能开关 */
  hotTopics: false,
} as const;

export type FeatureToggleKey = keyof typeof featureToggles;

/**
 * 读取指定功能是否启用
 */
export const isFeatureEnabled = (key: FeatureToggleKey): boolean => featureToggles[key];
