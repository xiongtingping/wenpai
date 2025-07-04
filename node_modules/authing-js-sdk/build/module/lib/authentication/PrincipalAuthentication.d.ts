import { AuthenticationTokenProvider } from './AuthenticationTokenProvider';
import { AuthenticationClientOptions, PrincipalDetail, PrincipalInput } from './types';
import { HttpClient } from '../common/HttpClient';
import { BaseAuthenticationClient } from './BaseAuthenticationClient';
/**
 * @class PrincipalAuthenticationClient 主体认证模块
 * @description 此模块用于进行主体认证。
 *
 * 请求主体认证信息：
 *
 * \`\`\`javascript
 * import { AuthenticationClient } from "authing-js-sdk"
 * const authenticationClient = new AuthenticationClient({
 *    appId: "YOUR_APP_ID",
 * })
 * await authenticationClient.principal.detail()
 * \`\`\`
 *
 *
 * @name PrincipalAuthenticationClient
 */
export declare class PrincipalAuthenticationClient {
    options: AuthenticationClientOptions;
    tokenProvider: AuthenticationTokenProvider;
    httpClient: HttpClient;
    baseClient: BaseAuthenticationClient;
    constructor(options: AuthenticationClientOptions, tokenProvider: AuthenticationTokenProvider, httpClient: HttpClient);
    /**
     * @name detail
     * @name_zh 获取主体认证详情
     * @description 获取主体认证详情，未认证时返回 null
     *
     * @example
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     * const authenticators = await authenticationClient.principal.detail()
     *
     * @returns {Promise<PrincipalDetail | null>}
     * @memberof PrincipalAuthenticationClient
     */
    detail(): Promise<PrincipalDetail | null>;
    /**
     * @name authentication
     * @name_zh 进行主体认证
     * @description 获取主体认证详情，未认证时返回 null
     *
     * @example
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     * const authenticators = await authenticationClient.principal.authenticate()
     *
     * @returns {Promise<boolean>}
     * @memberof PrincipalAuthenticationClient
     */
    authenticate(info: PrincipalInput): Promise<boolean>;
}
