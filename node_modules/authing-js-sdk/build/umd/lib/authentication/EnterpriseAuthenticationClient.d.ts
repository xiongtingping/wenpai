import { AuthenticationTokenProvider } from './AuthenticationTokenProvider';
import { AuthenticationClientOptions, Protocol } from './types';
import { HttpClient } from '../common/HttpClient';
import { User } from '../../types/index';
import { BaseAuthenticationClient } from './BaseAuthenticationClient';
/**
 * @class EnterpriseAuthenticationClient 企业身份源登录模块
 * @description 此模块封装了企业身份源登录的功能，可以通过简洁的 API 快速使用企业身份源登录获取用户信息。
 *
 * 发起企业身份源登录授权请求：
 *
 * \`\`\`javascript
 * import { AuthenticationClient } from "authing-js-sdk"
 * const authenticationClient = new AuthenticationClient({
 *    appId: "YOUR_APP_ID",
 * })
 * await authenticationClient.enterprise.authorize("oidc", "identifierxxx" {
 *    onSuccess: (user) => { console.log(user) },
 *    onError: (code, message) => {  }
 * })
 * \`\`\`
 *
 *
 * @name EnterpriseAuthenticationClient
 */
export declare class EnterpriseAuthenticationClient {
    options: AuthenticationClientOptions;
    tokenProvider: AuthenticationTokenProvider;
    httpClient: HttpClient;
    baseClient: BaseAuthenticationClient;
    constructor(options: AuthenticationClientOptions, tokenProvider: AuthenticationTokenProvider, httpClient: HttpClient);
    private initProviderContext;
    private getProviderConfigAndError;
    private getLoginUrl;
    /**
     * @name authorize
     * @name_zh 发送授权登录请求
     * @description 发送授权登录请求，该方法会直接打开一个新窗口，跳转到企业身份源（如 OIDC、SAML 等）的登录授权页面，用户
     * 完成授权之后，会自动关闭此窗口，并触发 onSuccess 回调函数，通过此函数，你可以获取到用户信息。
     *
     * @param {Protocol} protocol: 企业身份源协议
     * @param {string} provider 企业身份源的唯一标志。
     * @param {object} [options]
     * @param {boolean} [options.popup=true] 是否通过弹窗的方式打开社会化登录窗口，如果设置为 false，将会以 window.open 的方式打开一个新的浏览器  tab 。
     * @param {Function} [options.onSuccess] 用户同意授权事件回调函数，第一个参数为用户信息。
     * @param {Function} [options.onError] 企业身份源失败事件回调函数，第一个参数 code 为错误码，第二个参数 message 为错误提示。详细的错误码列表请见：详细说明请见：[Authing 错误代码列表](https://docs.authing.co/advanced/error-code.html)
     * @param {object} [options.position] 只有当 options.popup 为 ture 的时候有效，弹出窗口的位置，默认为 { w: 585, h: 649 } 。
     *
     * @example
     *
     * // 使用身份源标识符为 'oidc1' 的 OIDC 身份源登录
     *
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     *
     * await authenticationClient.enterprise.authorize("oidc", "oidc1" {
     *    onSuccess: (user) => { console.log(user) },
     *    onError: (code, message) => {  },
     *    // 自定义弹出窗口的位置
     *    position: {
     *      w: 100,
     *      h: 100
     *    }
     * })
     *
     * @example
     *
     * // 使用新建浏览器 tab 的形式打开社会化登录页面
     *
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     *
     * await authenticationClient.enterprise.authorize("oidc", "oidc1", {
     *    popup: false,
     *    onSuccess: (user) => { console.log(user) },
     *    onError: (code, message) => {  },
     * })
     *
     * @memberof EnterpriseAuthenticationClient
     */
    authorize(protocol: Protocol, identifier: string, options?: {
        popup?: boolean;
        onSuccess?: (user: User) => void;
        onError?: (code: number, message: string) => void;
        position?: {
            w: number;
            h: number;
        };
    }): Promise<void>;
}
