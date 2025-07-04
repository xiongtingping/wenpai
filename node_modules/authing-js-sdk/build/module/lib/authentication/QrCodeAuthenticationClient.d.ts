/// <reference types="node" />
import { AuthenticationTokenProvider } from './AuthenticationTokenProvider';
import { AuthenticationClientOptions, QRCodeGenarateResult, QRCodeStatus, QRCodeUserInfo } from './types';
import { User } from '../../types/index';
import { HttpClient } from '../common/HttpClient';
import { BaseAuthenticationClient } from './BaseAuthenticationClient';
export declare class QrCodeAuthenticationClient {
    options: AuthenticationClientOptions;
    tokenProvider: AuthenticationTokenProvider;
    scene: string;
    httpClient: HttpClient;
    baseClient: BaseAuthenticationClient;
    timer: NodeJS.Timeout;
    constructor(options: AuthenticationClientOptions, tokenProvider: AuthenticationTokenProvider, httpClient: HttpClient, scene: 'WXAPP_AUTH' | 'APP_AUTH' | 'WECHATMP_AUTH');
    /**
     * @name startScanning
     * @name_zh 一键开始扫码
     * @description 一键开始扫码
     *
     * @param {string} domId DOM 元素的 ID。
     * @param {Object} options
     * @param {boolean} options.autoExchangeUserInfo 是否自定义使用 ticket 换取用户信息
     * @param {number} options.interval 间隔时间，单位为毫秒，默认为 800 毫秒
     * @param {Function} options.onStart 开始轮询的事件回调函数, 第一个参数为 setInterval 返回的计时器，可以用 clearInterval 取消此计时器
     * @param {Function} options.onResult 获取到二维码最新状态事件回调函数，第一个参数为的类型为 QRCodeStatus。
     * @param {Function} options.onScanned 用户首次扫码事件回调函数。此时用户还没有授权，回调的用户信息中通仅包含昵称和头像，用作展示目的。
     * 出于安全性考虑，默认情况下，userInfo 只会包含昵称（nickname）和头像（photo）两个字段，开发者也可以在后台配置使其返回完整用户信息，
     * @param {Function} options.onSuccess 用户同意授权事件回调函数。该函数只会回调一次，之后轮询结束。第一个参数为 userInfo 用户信息，第二个参数为 ticket，用于换取用户的详情。
     * 详情见 https://docs.authing.co/scan-qrcode/app-qrcode/customize.html。
     * ticket 可以用来换取完整的用户信息，相关接口见 https://docs.authing.co/scan-qrcode/app-qrcode/full-api-list.html。
     * @param {Function} options.onCancel 用户取消授权事件回调函数。该事件只会回调一次，之后轮询结束。
     * @param {Function} options.onError 获取二维码状态失败事件回调函数。常见原因为网络失败等，每次查询失败时都会回调。回调参数 data 示例如 {"code": 2241,"message": "二维码不存在" }
     * @param {Function} options.onExpired 二维码失效时被回调，只回调一次，之后轮询结束。
     * @param {Function} options.onCodeShow 二维码首次成功显示的事件。
     * @param {Function} options.onCodeLoaded 二维码首次成功 Load 的事件。
     * @param {Function} options.onCodeLoadFailed 二维码加载失败的事件。
     * @param {Function} options.onCodeDestroyed 二维码被销毁的事件。
     * @param {string} options.extIdpConnId 多租户用的额外的 Idp Id。
     * @param {Function} options.onRetry 二维码重试事件。
     * @param {Object} options.size 二维码图片大小，默认为 240 * 240，单位为 px 。
     * @param {number} options.size.height 高度
     * @param {number} options.size.width 宽度
     * @param {Object} options.containerSize DOM 容器大小，默认为 300 * 300，单位为 px 。
     * @param {number} options.containerSize.height 高度
     * @param {number} options.containerSize.width 宽度
     * @param {Object} options.tips 自定义提示信息
     * @param {number} options.tips.title
     * @param {number} options.tips.scanned
     * @param {Object} options.tips.succeed
     * @param {number} options.tips.canceled
     * @param {number} options.tips.expired
     * @param {number} options.tips.retry
     * @param {number} options.tips.failed
     *
     * @example
     *
     * authenticationClient.wxqrcode.startScanning("qrcode", {
     *  onSuccess: (userInfo, ticket) => {
     *    console.log(userInfo, ticket)
     *  },
     *  onError: (message) => onFail && onFail(`${message}`),
     * });
     *
     * @returns {null}
     * @memberof QrCodeAuthenticationClient
     *
     */
    startScanning(domId: string, options?: {
        extIdpConnId?: string;
        autoExchangeUserInfo?: boolean;
        size?: {
            height: number;
            width: number;
        };
        containerSize?: {
            height: number;
            width: number;
        };
        interval?: number;
        onStart?: (timer: any) => any;
        onResult?: (data: QRCodeStatus) => any;
        onScanned?: (userInfo: QRCodeUserInfo) => any;
        onSuccess?: (userInfo: QRCodeUserInfo, ticket: string) => any;
        onCancel?: () => any;
        onError?: (message: string) => any;
        onExpired?: () => any;
        onCodeShow?: (random: string, url: string) => any;
        onCodeLoaded?: (random: string, url: string) => any;
        onCodeLoadFailed?: (message: string) => any;
        onCodeDestroyed?: (random: string) => any;
        onRetry?: () => any;
        onMfa?: (code: number, message: string, data: Record<string, any>) => {};
        tips?: {
            title?: string;
            scanned?: string;
            succeed?: string;
            canceled?: string;
            expired?: string;
            retry?: string;
            failed?: string;
            middleTitle?: string;
            referText?: string;
        };
        onAuthFlow?: (flow: Record<string, any>) => {};
        /**
         * @description 将会写入配置的用户自定义字段
         */
        customData?: {
            [x: string]: any;
        };
        /**
         * @description 请求上下文，将会传递到 Pipeline 中
         */
        context?: {
            [x: string]: any;
        };
        /**
         * @description 是否获取用户自定义数据
         */
        withCustomData?: boolean;
    }): Promise<void>;
    /**
     * @name geneCode
     * @name_zh 生成二维码
     * @description 生成二维码
     *
     * @example
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     * const { url, random } = await authenticationClient.wxqrcode.geneCode()
     *
     * # random 二维码唯一 ID
     * # url 二维码链接
     *
     * @returns {Promise<QRCodeGenarateResult>}
     * @memberof QrCodeAuthenticationClient
     */
    geneCode(options?: {
        context?: {
            [x: string]: any;
        };
        customData?: {
            [x: string]: any;
        };
        withCustomData?: boolean;
        extIdpConnId?: string;
    }): Promise<QRCodeGenarateResult>;
    /**
     * @name checkStatus
     * @name_zh 检测扫码状态
     * @description 检测扫码状态
     *
     * @param {string} random
     *
     * @example
     *
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     * const { random, status, ticket, userInfo } = await authenticationClient.wxqrcode.checkStatus('RANDOM')
     * # status: 二维码状态: 0 - 未使用, 1 - 已扫码, 2 - 已授权, 3 - 取消授权, -1 - 已过期
     * # ticket: 用于换取用户信息的一个随机字符串
     * # userInfo: 用户信息
     *
     * @returns {Promise<QRCodeStatus>}
     * @memberof QrCodeAuthenticationClient
     */
    checkStatus(random: string): Promise<QRCodeStatus>;
    /**
     * @name exchangeUserInfo
     * @name_zh 使用 ticket 交换用户信息
     * @description 使用 ticket 交换用户信息
     *
     * @example
     *
     * const authenticationClient = new AuthenticationClient({
     *    appId: "YOUR_APP_ID",
     * })
     * const user = await authenticationClient.wxqrcode.exchangeUserInfo('TICKET')
     * # user: 完整的用户信息，其中 user.token 为用户的登录凭证。
     *
     * @param {string} ticket ticket
     * @returns {Promise<Partial<User>>}
     * @memberof QrCodeAuthenticationClient
     */
    exchangeUserInfo(ticket: string): Promise<Partial<User>>;
    /**
     * @name startPolling
     * @name_zh 开始轮询二维码状态
     * @description 开始轮询二维码状态
     *
     * @param {string} random 二维码唯一 ID
     * @param {Object} options
     * @param {number} options.interval 间隔时间，单位为毫秒，默认为 800 毫秒
     * @param {Function} options.onStart 开始轮询的事件回调函数, 第一个参数为 setInterval 返回的计时器，可以用 clearInterval 取消此计时器
     * @param {Function} options.onResult 获取到二维码最新状态事件回调函数，第一个参数为的类型为 QRCodeStatus。
     * @param {Function} options.onScanned 用户首次扫码事件回调函数。此时用户还没有授权，回调的用户信息中通仅包含昵称和头像，用作展示目的。
     * 出于安全性考虑，默认情况下，userInfo 只会包含昵称（nickname）和头像（photo）两个字段，开发者也可以在后台配置使其返回完整用户信息，
     * @param {Function} options.onSuccess 用户同意授权事件回调函数。该函数只会回调一次，之后轮询结束。第一个参数为 userInfo 用户信息，第二个参数为 ticket，用于换取用户的详情。
     * 详情见 https://docs.authing.co/scan-qrcode/app-qrcode/customize.html。
     * ticket 可以用来换取完整的用户信息，相关接口见 https://docs.authing.co/scan-qrcode/app-qrcode/full-api-list.html。
     * @param {Function} options.onCancel 用户取消授权事件回调函数。该事件只会回调一次，之后轮询结束。
     * @param {Function} options.onError 获取二维码状态失败事件回调函数。常见原因为网络失败等，每次查询失败时都会回调。回调参数 data 示例如 {"code": 2241,"message": "二维码不存在" }
     * @param {Function} options.onExpired 二维码失效时被回调，只回调一次，之后轮询结束。
     *
     * @returns {null}
     * @memberof QrCodeAuthenticationClient
     */
    startPolling(random: string, options?: {
        interval?: number;
        onStart?: (timer: any) => any;
        onResult?: (data: QRCodeStatus) => any;
        onScanned?: (userInfo: QRCodeUserInfo) => any;
        onSuccess?: (userInfo: QRCodeUserInfo, ticket: string) => any;
        onCancel?: () => any;
        onError?: (message: string) => any;
        onExpired?: () => any;
        onMfa?: (code: number, message: string, data: Record<string, any>) => {};
        onAuthFlow?: (flow: Record<string, any>) => {};
    }): Promise<NodeJS.Timer>;
    stopPolling(timer: any): Promise<void>;
}
