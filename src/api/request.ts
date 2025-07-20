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
      baseURL: getEnvVar('VITE_AUTHING_BASE_URL', 'https://wenpaiai.authing.cn'),
      apiKey: getEnvVar('VITE_AUTHING_API_KEY', ''),
    },
  };
};

/**
 * 创建axios实例
 */
const createAxiosInstance = (): AxiosInstance => {
  const config = getAPIConfig();
  
  const instance = axios.create({
    timeout: 30000, // 30秒超时
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 根据URL自动添加对应的API密钥
      const url = config.url || '';
      
      if (url.includes('openai') || url.includes('api.openai.com')) {
        config.headers.Authorization = `Bearer ${getAPIConfig().openai.apiKey}`;
        config.baseURL = getAPIConfig().openai.baseURL;
      } else if (url.includes('gemini') || url.includes('generativelanguage.googleapis.com')) {
        config.headers['x-goog-api-key'] = getAPIConfig().gemini.apiKey;
        config.baseURL = getAPIConfig().gemini.baseURL;
      } else if (url.includes('deepseek') || url.includes('api.deepseek.com')) {
        config.headers.Authorization = `Bearer ${getAPIConfig().deepseek.apiKey}`;
        config.baseURL = getAPIConfig().deepseek.baseURL;
      } else if (url.includes('creem') || url.includes('api.creem.com')) {
        config.headers['x-api-key'] = getAPIConfig().creem.apiKey;
        config.baseURL = getAPIConfig().creem.baseURL;
      }
      
      console.log('🔧 API请求:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        hasAuth: !!config.headers.Authorization || !!config.headers['x-goog-api-key'] || !!config.headers['x-api-key']
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
      console.log('✅ API响应成功:', {
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
        console.error('🔐 认证失败，请检查API密钥');
      } else if (error.response?.status === 429) {
        console.error('⏰ API调用频率超限');
      } else if (error.code === 'ECONNABORTED') {
        console.error('⏱️ 请求超时');
      }
      
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
      throw new Error(`POST请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
};

/**
 * 获取API配置
 */
export const getConfig = getAPIConfig;

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