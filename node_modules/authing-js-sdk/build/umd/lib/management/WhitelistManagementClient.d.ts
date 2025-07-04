import { WhiteList, WhitelistType } from '../../types/graphql.v2';
import { GraphqlClient } from './../common/GraphqlClient';
import { ManagementTokenProvider } from './ManagementTokenProvider';
import { ManagementClientOptions } from './types';
/**
 * @name WhitelistManagementClient
 * @description 为你的用户池配置一个注册白名单，类似于邀请注册规则，开启后，只有白名单里的用户才能进行注册。 Authing 目前支持的白名单方式有手机号、邮箱、用户名。
 *
 * 此模块可以用于对注册白名单进行管理。
 *
 * @example
 *
 * 请使用以下方式使用该模块：
 * \`\`\`javascript
 * import { ManagementClient } from "authing-js-sdk"
 * const managementClient = new ManagementClient({
 *    userPoolId: "YOUR_USERPOOL_ID",
 *    secret: "YOUR_USERPOOL_SECRET",
 * })
 * managementClient.whitelist.list // 获取注册白名单记录
 * managementClient.whitelist.add // 添加白名单记录
 * managementClient.whitelist.remove // 移除白名单记录
 * \`\`\`
 *
 * @class WhitelistManagementClient 管理注册白名单
 */
export declare class WhitelistManagementClient {
    options: ManagementClientOptions;
    graphqlClient: GraphqlClient;
    tokenProvider: ManagementTokenProvider;
    constructor(options: ManagementClientOptions, graphqlClient: GraphqlClient, tokenProvider: ManagementTokenProvider);
    /**
     * @name list
     * @name_zh 获取白名单记录
     * @description 获取白名单记录
     *
     * @param {WhitelistType} type 白名单类型，USERNAME 为用户名、Email 为邮箱、Phone 为手机号。
     *
     * @example
     *
     * import { WhitelistType } from "authing-js-sdk"
     * const list = await managementClient.whitelist.list(WhitelistType.Email);
     *
     * @returns {Promise<WhiteList[]>}
     * @memberof WhitelistManagementClient
     */
    list(type: WhitelistType): Promise<WhiteList[]>;
    /**
     * @name add
     * @name_zh 添加白名单
     * @description 添加白名单
     *
     * @param {WhitelistType} type 白名单类型，USERNAME 为用户名、Email 为邮箱、Phone 为手机号。
     * @param {string[]} list 白名单列表，请注意邮箱不区分大小写。
     *
     * @example
     *
     * await managementClient.whitelist.add(WhitelistType.Email, 'a@example.com');
     *
     * @returns {Promise<WhiteList[]>}
     * @memberof WhitelistManagementClient
     */
    add(type: WhitelistType, list: string[]): Promise<WhiteList[]>;
    /**
     * @name remove
     * @name_zh 移除白名单
     * @description 移除白名单
     *
     * @param {WhitelistType} type 白名单类型，USERNAME 为用户名、Email 为邮箱、Phone 为手机号。
     * @param {string[]} list 白名单列表，请注意邮箱不区分大小写。
     *
     * @example
     *
     * await managementClient.whitelist.remove(WhitelistType.Email, 'a@example.com');
     *
     *
     * @returns {Promise<WhiteList[]>}
     * @memberof WhitelistManagementClient
     */
    remove(type: WhitelistType, list: string[]): Promise<WhiteList[]>;
    /**
     * @name enable
     * @name_zh 开启白名单
     * @description 开启白名单
     *
     * @param {WhitelistType} type 白名单类型，USERNAME 为用户名、Email 为邮箱、Phone 为手机号。
     *
     * @example
     *
     *
     * // 添加白名单
     *
     * import { WhitelistType } from "authing-js-sdk"
     * await managementClient.whitelist.enable(WhitelistType.Email);
     * await managementClient.whitelist.add(WhitelistType.Email, [‘a@wxample.com’]);
     *
     * // 使用不在白名单内的账号注册，不提示无法注册。
     *
     * await authing.registerByEmail(email, 'b@example.com');
     *
     * @memberof WhitelistManagementClient
     */
    enable(type: WhitelistType): Promise<void>;
    /**
     * @name disable
     * @name_zh 关闭白名单
     * @description 关闭白名单
     *
     * @param {WhitelistType} type 白名单类型，USERNAME 为用户名、Email 为邮箱、Phone 为手机号。
     *
     * @memberof WhitelistManagementClient
     */
    disable(type: WhitelistType): Promise<void>;
}
