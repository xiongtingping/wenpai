import { AuthenticationClientOptions } from "./authentication/types";
/** 随机字符串 **/
export declare const randomString: () => string;
/**
 * 睡眠函数
 * @param ms 毫秒
 */
export declare const sleep: (ms: number) => Promise<unknown>;
/**
 * 从环境变量中读取配置
 *
 */
export declare const getOptionsFromEnv: () => {
    userPoolId: string;
    secret: string;
    appId: string;
    appHost: string;
    host: string;
    timeout: number;
    publicKey: string;
};
/**
 * 从环境变量中读取初始化 AuthenticationClient 的配置
 *
 */
export declare const getAuthenticationClientOptionsFromEnv: () => AuthenticationClientOptions;
/**
 * @description 生成随机字符串
 *
 */
export declare function generateRandomString(length?: number): string;
export declare function generateRandomEmail(): string;
/**
 * @description 生成随机手机号
 *
 */
export declare const generateRandomPhone: () => string;
