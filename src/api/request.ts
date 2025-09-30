/**
 * 统一API请求模块
 * 
 * ✅ 重要原则：
 * 1. 所有API请求必须通过此模块处理，禁止使用裸fetch/axios
 * 2. 所有API地址与密钥必须从环境变量读取，严禁硬编码
 * 3. 统一错误处理和响应格式
 * 
 * 📌 使用规范：
 * - 使用 request.get(), request.post() 等方法
 * - 配置通过环境变量注入
 * - 错误统一处理
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '@/utils/logger';

/**
 * API配置接口
 */
interface APIConfig {
  /** OpenAI配置 */
  openai: {
    baseURL: string;
    apiKey: string;
  };
  /** Gemini配置 */
  gemini: {
    baseURL: string;
    apiKey: string;
  };
  /** Deepseek配置 */
  deepseek: {
    baseURL: string;
    apiKey: string;
  };
  /** 其他API配置 */
  [key: string]: {
    baseURL: string;
    apiKey?: string;
  };
}

/**
 * 从环境变量获取API配置
 * 严禁硬编码任何API地址或密钥
 */
const getAPIConfig = (): APIConfig => {
  // 优先使用全局环境变量，回退到import.meta.env
  const globalEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : {};
  
  const getEnvVar = (key: string, defaultValue?: string): string => {
    return globalEnv[key] || import.meta.env[key] || defaultValue || '';

  };

  return {
    openai: {
      baseURL: getEnvVar('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
      apiKey: getEnvVar('VITE_OPENAI_API_KEY', ''),
    },
    gemini: {
      baseURL: getEnvVar('VITE_GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com'),
      apiKey: getEnvVar('VITE_GEMINI_API_KEY', ''),
    },
    deepseek: {
      baseURL: getEnvVar('VITE_DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
      apiKey: getEnvVar('VITE_DEEPSEEK_API_KEY', ''),
    },
    // 其他API配置
    hotTopics: {
      baseURL: getEnvVar('VITE_HOT_TOPICS_BASE_URL', 'https://api-hot.imsyy.top'),
    },
    creem: {
      baseURL: getEnvVar('VITE_CREEM_BASE_URL', 'https://api.creem.com'),
      apiKey: getEnvVar('VITE_CREEM_API_KEY', ''),
    },
    authing: {
      baseURL: getEnvVar('VITE_AUTHING_BASE_URL') || getEnvVar('VITE_AUTHING_HOST'),
      apiKey: getEnvVar('VITE_AUTHING_API_KEY', ''),
    },
  };
};

// 提供可注入的用户令牌获取器，供认证模块设置 - 移到全局作用域
let authTokenGetter: (() => string | null | undefined) | null = null;

/**
 * 创建axios实例
 */
const createAxiosInstance = (): AxiosInstance => {
  const config = getAPIConfig();

  const instance = axios.create({
    timeout: 60000, // 🔧 FIX: 增加到60秒，解决认证超时问题
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache', // 避免缓存问题
    },
    // 🔧 FIX: 添加重试和网络优化配置
    withCredentials: false, // 避免跨域问题
    maxRedirects: 5,
    validateStatus: (status) => status < 500, // 只有5xx才算错误
  });

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 根据URL自动添加对应的API密钥
    const url = config.url || '';

    // 优先附加用户身份令牌（若存在）
    const token = authTokenGetter ? authTokenGetter() : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    if (url.includes('openai') || url.includes('api.openai.com')) {
      config.headers.Authorization = `Bearer ${getAPIConfig().openai.apiKey}`;
      config.baseURL = getAPIConfig().openai.baseURL;
    } else if (url.includes('gemini') || url.includes('generativelanguage.googleapis.com')) {
      (config.headers as any)['x-goog-api-key'] = getAPIConfig().gemini.apiKey;
      config.baseURL = getAPIConfig().gemini.baseURL;
    } else if (url.includes('deepseek') || url.includes('api.deepseek.com')) {
      config.headers.Authorization = `Bearer ${getAPIConfig().deepseek.apiKey}`;
      config.baseURL = getAPIConfig().deepseek.baseURL;
    } else if (url.includes('creem') || url.includes('api.creem.com')) {
      const apiConfig = getAPIConfig();
      if (apiConfig?.creem?.apiKey) {
        (config.headers as any)['x-api-key'] = apiConfig.creem.apiKey;
      }
      if (apiConfig?.creem?.baseURL) {
        config.baseURL = apiConfig.creem.baseURL;
      }
    }

    logger.debug('🔧 API请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasAuth: !!(config.headers as any)?.Authorization || !!(config.headers as any)['x-goog-api-key'] || !!(config.headers as any)['x-api-key']
    });

    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      logger.debug('✅ API响应成功:', {
        status: response.status,
        url: response.config.url,
        dataType: typeof response.data
      });
      return response;
    },
    (error) => {
      console.error('❌ API响应错误:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data
      });

      // 统一错误处理
      if (error.response?.status === 401) {
        console.error('🔐 认证失败，可能需要重新登录');

        // 
        const isAuthRequest = error.config?.headers?.Authorization?.includes('Bearer');
        if (isAuthRequest && authTokenGetter) {
          // 通知认证系统token无效
          localStorage.setItem('auth_token_invalid', Date.now().toString());
          setTimeout(() => localStorage.removeItem('auth_token_invalid'), 1000);
        }
      } else if (error.response?.status === 429) {
        console.error('⏰ API调用频率超限');
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('⏱️ 请求超时 - 可能是网络问题或服务器响应慢');
        // 🔧 FIX: 提供更详细的超时错误信息
        error.message = `请求超时 (${error.config?.timeout || 60000}ms) - 请检查网络连接或稍后重试`;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error('🌐 网络连接失败 - DNS解析或服务器连接问题');
        error.message = '网络连接失败，请检查网络设置或稍后重试';
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建默认axios实例
const axiosInstance = createAxiosInstance();

/**
 * 🔧 API重试机制配置
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  retryCondition: (error) => {
    // 重试条件：超时、网络错误、5xx服务器错误
    return (
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      (error.response?.status >= 500 && error.response?.status < 600)
    );
  }
};

/**
 * 🔧 带重试的请求包装器
 */
async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 检查是否应该重试
      if (
        attempt === finalConfig.maxRetries ||
        !finalConfig.retryCondition?.(error)
      ) {
        break;
      }

      // 计算延迟时间（指数退避）
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(2, attempt),
        finalConfig.maxDelay
      );

      console.warn(`⚠️ API请求失败，${delay}ms后重试 (${attempt + 1}/${finalConfig.maxRetries})`, {
        error: error instanceof Error ? error.message : String(error),
        url: error && typeof error === 'object' && 'config' in error ? (error as any).config?.url : undefined,
        attempt: attempt + 1
      });

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 统一请求方法
 */
export const request = {
  /**
   * GET请求（带重试机制）
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return requestWithRetry(async () => {
      const response = await axiosInstance.get<T>(url, config);
      return response.data;
    });
  },

  /**
   * POST请求（带重试机制）
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return requestWithRetry(async () => {
      const response = await axiosInstance.post<T>(url, data, config);
      return response.data;
    });
  },

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`PUT请求失败: ${error instanceof Error ? error.message : i18n.t('api.errors.未知错误')}`);
    }
  },

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`DELETE请求失败: ${error instanceof Error ? error.message : i18n.t('api.errors.未知错误')}`);
    }
  },

  /**
   * 自定义请求
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      throw new Error(`请求失败: ${error instanceof Error ? error.message : i18n.t('api.errors.未知错误')}`);
    }
  },
};

/**
 * 获取API配置
 */
export const getConfig = getAPIConfig;

/**
 * 导出getAPIConfig函数（兼容性）
 */
export { getAPIConfig };

/**
 * 检查API配置是否完整
 */
export const validateAPIConfig = (): boolean => {
  const config = getAPIConfig();
  
  const requiredConfigs = [
    { name: 'OpenAI', config: config.openai },
    { name: 'Gemini', config: config.gemini },
    { name: 'Deepseek', config: config.deepseek },
  ];

  for (const { name, config: apiConfig } of requiredConfigs) {
    if (!apiConfig.apiKey) {
      console.warn(`⚠️ ${name} API密钥未配置`);
      return false;
    }
    if (!apiConfig.baseURL) {
      console.warn(`⚠️ ${name} API地址未配置`);
      return false;
    }
  }

  logger.debug('✅ API配置验证通过');
  return true;
};

/**
 * 设置认证令牌获取器
 */
export const setAuthTokenGetter = (getter: () => string | null | undefined) => {
  authTokenGetter = getter;
};

/**
 * 导出axios实例（仅用于特殊情况）
 */
export { axiosInstance };

export default request;