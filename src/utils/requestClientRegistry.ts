// @ts-nocheck - 工具文件，允许类型检查宽松
import type { default as RequestClient } from '@/api/request';

let clientInstance: RequestClient | null = null;

export function setRequestClient(instance: RequestClient): void {
  clientInstance = instance;
}

export function getRequestClient(): RequestClient {
  if (!clientInstance) {
    throw new Error('请求客户端未注册，请先调用 setRequestClient');
  }
  return clientInstance;
}

