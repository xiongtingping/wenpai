/**
 * 内容适配器 - 统一消息常量
 * 
 * 🎯 目标：
 * - 消除Unicode编码的错误消息
 * - 提供类型安全的消息管理
 * - 支持国际化扩展
 * - 统一用户提示信息
 * 
 * 📌 遵循CLAUDE.md规则：禁止硬编码、统一管理
 */

/**
 * Toast消息类型
 */
export const TOAST_MESSAGES = {
  // 成功消息
  SUCCESS: {
    OPERATION_SUCCESS: '操作成功',
    GENERATION_SUCCESS: '生成成功',
    SAVE_SUCCESS: '保存成功',
    IMPORT_SUCCESS: '导入成功',
    EXPORT_SUCCESS: '导出成功',
    RETRY_SUCCESS: '重试成功',
    REGENERATION_SUCCESS: '重新生成成功',
    BATCH_GENERATION_SUCCESS: '批量生成成功',
    QUEUE_COMPLETE: '队列处理完成',
    SETTINGS_SAVED: '设置已保存',
    CONFIG_IMPORTED: '配置已导入',
    COPY_SUCCESS: '复制成功',
    PUBLISH_SUCCESS: '发布成功',
  },

  // 错误消息
  ERROR: {
    OPERATION_FAILED: '操作失败',
    GENERATION_FAILED: '生成失败',
    SAVE_FAILED: '保存失败',
    IMPORT_FAILED: '导入失败',
    EXPORT_FAILED: '导出失败',
    RETRY_FAILED: '重试失败',
    REGENERATION_FAILED: '重新生成失败',
    BATCH_GENERATION_FAILED: '批量生成失败',
    SETTINGS_SAVE_FAILED: '设置保存失败',
    SETTINGS_LOAD_FAILED: '设置加载失败',
    CONFIG_IMPORT_FAILED: '配置导入失败',
    NETWORK_ERROR: '网络错误',
    API_ERROR: 'API调用失败',
    VALIDATION_ERROR: '验证失败',
    UNKNOWN_ERROR: '未知错误',
  },

  // 警告消息
  WARNING: {
    NO_CONTENT: '请输入内容',
    NO_PLATFORM: '请选择平台',
    NO_MODEL: '请选择模型',
    BRAND_LIBRARY_REQUIRED: '启用品牌库时必须选择品牌资料',
    INVALID_CONFIG: '配置无效',
    CHAR_COUNT_EXCEEDED: '字符数超出限制',
    CHAR_COUNT_TOO_SHORT: '字符数过少',
  },

  // 信息消息
  INFO: {
    GENERATING: '正在生成...',
    PROCESSING: '正在处理...',
    LOADING: '加载中...',
    SAVING: '保存中...',
    RETRYING: '重试中...',
    QUEUE_STARTED: '队列已启动',
    QUEUE_STOPPED: '队列已停止',
    USING_DEFAULT_SETTINGS: '使用默认设置',
    GENERATION_STOPPED: '生成已停止',
  },
} as const;

/**
 * 生成描述消息
 */
export const GENERATION_MESSAGES = {
  BATCH_START: (count: number) => `将为 ${count} 个平台生成内容`,
  BATCH_COMPLETE: (count: number) => `已为 ${count} 个平台生成内容`,
  QUEUE_COMPLETE: (count: number) => `共处理 ${count} 个任务`,
  PLATFORM_GENERATED: (platform: string) => `${platform} 内容已生成`,
  PLATFORM_REGENERATED: (platform: string) => `${platform} 内容已重新生成`,
  VERSION_REGENERATED: (platform: string, version: string) => `${platform} ${version} 已重新生成`,
  RETRY_ATTEMPT: (attempt: number, max: number) => `重试中 (${attempt}/${max})`,
  GENERATION_PROGRESS: (current: number, total: number) => `生成进度: ${current}/${total}`,
} as const;

/**
 * 验证错误消息
 */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `${field}为必填项`,
  INVALID_FORMAT: (field: string) => `${field}格式不正确`,
  OUT_OF_RANGE: (field: string, min: number, max: number) => 
    `${field}必须在 ${min} 到 ${max} 之间`,
  TOO_SHORT: (field: string, min: number) => `${field}至少需要 ${min} 个字符`,
  TOO_LONG: (field: string, max: number) => `${field}不能超过 ${max} 个字符`,
  INVALID_SELECTION: (field: string) => `请选择有效的${field}`,
} as const;

/**
 * 步骤消息
 */
export const STEP_MESSAGES = {
  PREPARE: '准备生成',
  BUILD_PROMPT: '构建提示词',
  CALL_AI: '调用AI服务',
  PROCESS_RESULT: '处理结果',
  GENERATE_TITLE: '生成标题',
  EXTRACT_TAGS: '提取标签',
  VALIDATE: '验证内容',
  COMPLETE: '完成',
} as const;

/**
 * 平台相关消息
 */
export const PLATFORM_MESSAGES = {
  NOT_SELECTED: '未选择平台',
  GENERATING: (platform: string) => `正在为 ${platform} 生成内容...`,
  GENERATED: (platform: string) => `${platform} 内容已生成`,
  FAILED: (platform: string) => `${platform} 生成失败`,
  RETRYING: (platform: string) => `正在重试 ${platform}...`,
} as const;

/**
 * 模型相关消息
 */
export const MODEL_MESSAGES = {
  NOT_AVAILABLE: '模型不可用',
  SWITCHING: (from: string, to: string) => `模型切换: ${from} → ${to}`,
  FALLBACK: (model: string) => `使用备用模型: ${model}`,
  QUOTA_EXCEEDED: '模型配额已用尽',
  API_ERROR: (model: string) => `${model} API调用失败`,
} as const;

/**
 * 品牌库相关消息
 */
export const BRAND_MESSAGES = {
  LOADING: '加载品牌资料...',
  LOADED: '品牌资料已加载',
  NOT_FOUND: '未找到品牌资料',
  REQUIRED: '请选择品牌资料',
  EMPTY: '品牌库资料为空，请尽快至品牌库补充完善资料',
  APPLIED: '已应用品牌调性',
} as const;

/**
 * 缓存相关消息
 */
export const CACHE_MESSAGES = {
  HIT: '使用缓存内容',
  MISS: '缓存未命中',
  CLEARED: '缓存已清空',
  EXPIRED: '缓存已过期',
} as const;

/**
 * 性能相关消息
 */
export const PERFORMANCE_MESSAGES = {
  SLOW_GENERATION: '生成速度较慢，请耐心等待',
  TIMEOUT: '请求超时，请重试',
  RATE_LIMIT: '请求过于频繁，请稍后再试',
} as const;

/**
 * 帮助提示消息
 */
export const HELP_MESSAGES = {
  NO_CONTENT: '请输入要适配的原始内容',
  SELECT_PLATFORM: '选择要生成内容的目标平台',
  SELECT_MODEL: '选择用于生成内容的AI模型',
  BRAND_LIBRARY: '启用品牌库可以让生成的内容符合品牌调性',
  CUSTOM_PROMPT: '添加自定义要求来定制生成内容',
  CHAR_COUNT: '设置生成内容的字符数范围',
  MULTI_VERSION: '生成标准版和创意版两个不同风格的版本',
} as const;

/**
 * 确认消息
 */
export const CONFIRM_MESSAGES = {
  CLEAR_RESULTS: '确定要清空所有生成结果吗？',
  STOP_GENERATION: '确定要停止生成吗？',
  DELETE_HISTORY: '确定要删除历史记录吗？',
  RESET_SETTINGS: '确定要重置所有设置吗？',
  OVERWRITE_CONTENT: '确定要覆盖当前内容吗？',
} as const;

/**
 * 获取错误消息的辅助函数 - 增强版
 * 根据错误类型返回更具体的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // 🔍 配额相关错误
    if (message.includes('exhausted') || message.includes('配额') || message.includes('quota')) {
      return '⚠️ AI服务配额已用完，系统已自动切换到备用模型';
    }

    // 🔍 403权限错误
    if (message.includes('403') || message.includes('forbidden')) {
      return '⚠️ API访问受限，已切换到备用服务继续生成';
    }

    // 🔍 超时相关错误
    if (message.includes('timeout') || message.includes('超时') || message.includes('504') || message.includes('gateway timeout')) {
      return '⏱️ 请求超时，请检查网络连接或稍后重试';
    }

    // 🔍 网关错误
    if (message.includes('502') || message.includes('503') || message.includes('bad gateway') || message.includes('service unavailable')) {
      return '🔧 服务暂时不可用，请稍后重试';
    }

    // 🔍 频率限制
    if (message.includes('rate') || message.includes('limit') || message.includes('429') || message.includes('频繁')) {
      return '🚦 请求过于频繁，请稍后再试';
    }

    // 🔍 网络连接错误
    if (message.includes('network') || message.includes('网络') || message.includes('fetch') || message.includes('connection')) {
      return '🌐 网络连接失败，请检查网络设置';
    }

    // 🔍 认证错误
    if (message.includes('auth') || message.includes('401') || message.includes('unauthorized') || message.includes('认证')) {
      return '🔐 认证失败，请重新登录';
    }

    // 🔍 模型不可用
    if (message.includes('model') && (message.includes('not') || message.includes('unavailable') || message.includes('不可用'))) {
      return '🤖 当前AI模型不可用，请尝试其他模型';
    }

    // 返回原始错误消息（如果不匹配任何模式）
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
}

/**
 * 获取网络错误消息
 */
export function getNetworkErrorMessage(statusCode?: number): string {
  if (!statusCode) {
    return TOAST_MESSAGES.ERROR.NETWORK_ERROR;
  }

  switch (statusCode) {
    case 400:
      return '请求参数错误';
    case 401:
      return '未授权，请登录';
    case 403:
      return '无权限访问';
    case 404:
      return '资源不存在';
    case 429:
      return '请求过于频繁，请稍后再试';
    case 500:
      return '服务器错误';
    case 502:
      return '网关错误';
    case 503:
      return '服务暂时不可用';
    default:
      return `网络错误 (${statusCode})`;
  }
}

/**
 * 类型导出
 */
export type ToastMessageType = typeof TOAST_MESSAGES;
export type GenerationMessageType = typeof GENERATION_MESSAGES;
export type ValidationMessageType = typeof VALIDATION_MESSAGES;

