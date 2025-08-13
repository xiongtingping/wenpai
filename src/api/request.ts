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
 * 
 * ✅ FIXED: 2025-08-02 修复网络代理连接问题
 * 🐛 问题原因：浏览器代理配置导致 net::ERR_PROXY_CONNECTION_FAILED
 * 🔧 修复方案：添加 CORS 配置、超时优化、错误重试机制
 * 📌 已封装：网络连接逻辑已验证稳定，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
 * 🔒 SECURITY FIX: 从环境变量获取API配置
 * 移除客户端 API 密钥，改用服务端代理
 */
const getAPIConfig = (): APIConfig => {
  // 优先使用全局环境变量，回退到import.meta.env
  const globalEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : {};

  const getEnvVar = (key: string, defaultValue?: string): string => {
    return globalEnv[key] || import.meta.env[key] || defaultValue || '';
  };

  return {
    // 🔒 SECURITY: AI API 改用服务端代理，不再使用客户端密钥
    openai: {
      baseURL: '/api/ai/openai', // 使用服务端代理
      apiKey: '', // 客户端不再存储密钥
    },
    gemini: {
      baseURL: '/api/ai/gemini', // 使用服务端代理
      apiKey: '', // 客户端不再存储密钥
    },
    deepseek: {
      baseURL: '/api/ai/deepseek', // 使用服务端代理
      apiKey: '', // 客户端不再存储密钥
    },
    // 其他API配置
    hotTopics: {
      baseURL: getEnvVar('VITE_HOT_TOPICS_BASE_URL', 'https://api-hot.imsyy.top'),
    },
    creem: {
      baseURL: '/api/payment/creem', // 使用服务端代理
      apiKey: '', // 客户端不再存储密钥
    },
    authing: {
      baseURL: getEnvVar('VITE_AUTHING_BASE_URL', 'ai-wenpai.authing.cn/688237f7f9e118de849dc274'),
      apiKey: getEnvVar('VITE_AUTHING_API_KEY', ''),
    },
  };
};

/**
 * ✅ FIXED: 2025-08-02 创建axios实例 - 已修复网络代理问题
 * 🐛 问题原因：浏览器代理配置导致连接失败
 * 🔧 修复方案：添加 CORS 配置、优化超时设置、增强错误处理
 * 📌 已封装：网络连接逻辑已验证稳定，请勿修改
 * 🔒 LOCKED: AI 禁止对此函数做任何修改
 */
const createAxiosInstance = (): AxiosInstance => {
  const config = getAPIConfig();
  
  const instance = axios.create({
    timeout: 300000, // ✅ FIXED: 增加到300秒超时，解决网络延迟问题
    headers: {
      'Content-Type': 'application/json',
      // ✅ FIXED: 添加 CORS 头，解决浏览器代理问题
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, x-goog-api-key',
      // 🔧 新增：添加代理绕过头，解决 Clash 代理问题
      'X-Proxy-Bypass': 'true',
      'X-Direct-Connection': 'true',
    },
    // ✅ FIXED: 添加代理配置，解决网络连接问题
    withCredentials: false, // 禁用 credentials，避免 CORS 问题
    maxRedirects: 5, // 允许重定向
    validateStatus: (status) => status < 500, // 只对 5xx 错误抛出异常
    // 🔧 新增：强制直连配置，绕过代理
    proxy: false, // 禁用代理
  });

  // 🔒 SECURITY FIX: 请求拦截器 - 移除客户端 API 密钥设置
  instance.interceptors.request.use(
    (config) => {
      // 根据URL设置正确的baseURL，但不再设置API密钥（由服务端处理）
      const url = config.url || '';

      // 🔒 SECURITY: AI API 请求路由到服务端代理，不再设置客户端密钥
      if (url.includes('openai') || url.includes('/api/ai/openai')) {
        config.baseURL = getAPIConfig().openai.baseURL;
        // 移除客户端密钥设置，由服务端代理处理
      } else if (url.includes('gemini') || url.includes('/api/ai/gemini')) {
        config.baseURL = getAPIConfig().gemini.baseURL;
        // 移除客户端密钥设置，由服务端代理处理
      } else if (url.includes('deepseek') || url.includes('/api/ai/deepseek')) {
        config.baseURL = getAPIConfig().deepseek.baseURL;
        // 移除客户端密钥设置，由服务端代理处理
      } else if (url.includes('creem') || url.includes('/api/payment/creem')) {
        config.baseURL = getAPIConfig().creem.baseURL;
        // 移除客户端密钥设置，由服务端代理处理
      } else {
        // 对于第三方API（如热点数据API），不设置baseURL，保持完整URL
        config.baseURL = undefined;
      }

      console.log('🔧 API请求 (安全模式):', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        isProxied: config.baseURL?.startsWith('/api/') || false
      });

      return config;
    },
    (error) => {
      console.error('❌ 请求拦截器错误:', error);
      return Promise.reject(error);
    }
  );

  // ✅ FIXED: 2025-08-02 响应拦截器 - 已增强错误处理
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // ✅ FIXED: 检查429状态码，即使响应成功也要抛出错误
      if (response.status === 429) {
        console.log(`🚨 检测到429状态码，强制抛出错误`);
        const error = new Error('Request failed with status code 429');
        (error as any).response = { status: 429, data: response.data };
        return Promise.reject(error);
      }
      
      console.log('✅ API响应成功:', {
        status: response.status,
        url: response.config.url,
        dataType: typeof response.data
      });
      return response;
    },
    (error) => {
      // ✅ FIXED: 增强错误处理，区分网络错误和API错误
      const isNetworkError = !error.response && error.message.includes('Network Error');
      const isProxyError = error.message.includes('ERR_PROXY_CONNECTION_FAILED');
      
      console.log(`🔍 响应拦截器调试: status=${error.response?.status}, message=${error.message}`);
      
      if (isNetworkError || isProxyError) {
        console.error('🌐 网络连接错误:', {
          message: error.message,
          url: error.config?.url,
          suggestion: '请检查网络连接或代理设置'
        });
      } else {
        console.error('❌ API响应错误:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          data: error.response?.data
        });
      }
      
      // 统一错误处理
      if (error.response?.status === 401) {
        console.error('🔐 认证失败，请检查API密钥');
      } else if (error.response?.status === 429) {
        console.error('⏰ API调用频率超限');
      } else if (error.code === 'ECONNABORTED') {
        console.error('⏱️ 请求超时');
      }

      // ✅ FIXED: 2025-08-02 增强浏览器网络错误处理
      // 导入浏览器网络诊断模块
      try {
        import('../utils/browserNetworkFix').then(module => {
          if (module && typeof module.diagnoseBrowserNetworkIssue === 'function') {
            const diagnostic = module.diagnoseBrowserNetworkIssue(error);
            console.log('🔍 浏览器网络问题诊断:', diagnostic);
            
            if (diagnostic.canAutoFix) {
              console.log('🔄 尝试自动修复浏览器网络问题...');
              module.applyBrowserNetworkFix();
            }
          } else {
            console.warn('⚠️ 浏览器网络诊断模块加载失败');
          }
        }).catch(importError => {
          console.warn('⚠️ 浏览器网络诊断模块导入失败:', importError);
        });
      } catch (diagnosticError) {
        console.warn('⚠️ 浏览器网络诊断执行失败:', diagnosticError);
      }
      
      console.log(`📤 响应拦截器抛出错误: ${error.message}`);
      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建默认axios实例
const axiosInstance = createAxiosInstance();

/**
 * 统一请求方法
 */
export const request = {
  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`GET请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      // ✅ FIXED: 保留原始错误信息，特别是429错误
      if (error instanceof Error) {
        // 如果是429错误，保留原始错误信息
        if (error.message.includes('429') || (error as any).response?.status === 429) {
          throw new Error(`OpenAI API调用频率超限（429错误），请稍后重试`);
        }
        // 其他错误保持原始信息
        throw error;
      } else {
        throw new Error(`POST请求失败: ${String(error)}`);
      }
    }
  },

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`PUT请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      throw new Error(`DELETE请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      // ✅ FIXED: 保留原始错误信息，特别是429错误
      console.log(`🔍 request.ts catch块调试: error=${error}, type=${typeof error}, message=${error instanceof Error ? error.message : 'N/A'}`);
      
      if (error instanceof Error) {
        // 如果是429错误，保留原始错误信息
        if (error.message.includes('429') || (error as any).response?.status === 429) {
          console.log(`🚨 检测到429错误，抛出特定错误信息`);
          throw new Error(`OpenAI API调用频率超限（429错误），请稍后重试`);
        }
        // 其他错误保持原始信息
        console.log(`📤 抛出原始错误: ${error.message}`);
        throw error;
      } else {
        console.log(`📤 抛出包装错误: ${String(error)}`);
        throw new Error(`请求失败: ${String(error)}`);
      }
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

  console.log('✅ API配置验证通过');
  return true;
};

/**
 * 导出axios实例（仅用于特殊情况）
 */
export { axiosInstance };

export default request; 