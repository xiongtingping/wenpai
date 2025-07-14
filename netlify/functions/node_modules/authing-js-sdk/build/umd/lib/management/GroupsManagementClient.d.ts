import { GraphqlClient } from './../common/GraphqlClient';
import { ManagementTokenProvider } from './ManagementTokenProvider';
import { ManagementClientOptions } from './types';
import { CommonMessage, Group, PaginatedAuthorizedResources, PaginatedGroups, ResourceType } from '../../types/graphql.v2';
import { DeepPartial, PaginatedUsers } from '../../types/index';
/**
 * @class GroupsManagementClient 管理分组
 * @description 此模块用于管理 Authing 分组，可以进行分组的增删改查、分组添加/删除用户、分组添加/删除策略 等操作。
 *
 * @example
 *
 * 请使用以下方式使用该模块，而不要直接初始化该模块：
 * \`\`\`javascript
 * import { ManagementClient } from "authing-js-sdk"
 * const managementClient = new ManagementClient({
 *    userPoolId: "YOUR_USERPOOL_ID",
 *    secret: "YOUR_USERPOOL_SECRET",
 * })
 * managementClient.groups.list // 获取分组列表
 * managementClient.groups.create // 创建分组
 * managementClient.groups.listUsers // 获取分组用户列表
 * \`\`\`
 *
 * @name GroupsManagementClient
 */
export declare class GroupsManagementClient {
    options: ManagementClientOptions;
    graphqlClient: GraphqlClient;
    tokenProvider: ManagementTokenProvider;
    constructor(options: ManagementClientOptions, graphqlClient: GraphqlClient, tokenProvider: ManagementTokenProvider);
    /**
     * @name create
     * @name_zh 创建分组
     * @description 创建分组
     *
     * @param {string} code 分组唯一标志符
     * @param {string} name 分组名称
     * @param {string} [description] 描述
     *
     * @example
     * managementClient.groups.create('group', '分组 xxx')
     *
     * @returns {Promise<DeepPartial<Group>>}
     * @memberof GroupsManagementClient
     */
    create(code: string, name: string, description?: string): Promise<DeepPartial<Group>>;
    /**
     * @name delete
     * @name_zh 删除分组
     * @description 删除分组
     *
     * @param {string} code 分组唯一标志符
     *
     * @example
     * managementClient.groups.delete('rolea')
     *
     * @returns {Promise<CommonMessage>}
     * @memberof GroupsManagementClient
     */
    delete(code: string): Promise<CommonMessage>;
    /**
     * @name update
     * @name_zh 修改分组
     * @description 修改分组
     *
     * @param {string} code 分组唯一标志符
     * @param {Object} input
     * @param {string} [input.name] 新的名称
     * @param {string} [input.description] 新的描述信息
     * @param {string} [input.newCode] 新的唯一标志符
     *
     * @example
     * managementClient.groups.update('group', {newCode: 'newcode'})
     *
     *
     * @returns {Promise<DeepPartial<Group>>}
     * @memberof GroupsManagementClient
     */
    update(code: string, input: {
        description?: string;
        newCode?: string;
        name?: string;
    }): Promise<DeepPartial<Group>>;
    /**
     * @name detail
     * @name_zh 获取分组详情
     * @description 获取分组详情
     *
     * @param {string} code 分组唯一标志符
     *
     * @example
     * managementClient.groups.detail('manager')
     *
     * @returns {Promise<DeepPartial<Group>>} 分组详情
     * @memberof GroupsManagementClient
     */
    detail(code: string): Promise<DeepPartial<Group>>;
    /**
     * @name list
     * @name_zh 获取分组列表
     * @description 获取分组列表
     *
     * @param {number} [page=1] 页码数
     * @param {number} [limit=10] 每页个数
     *
     * @example
     *
     * managementClient.groups.list(1, 10)
     *
     * @returns {Promise<DeepPartial<PaginatedGroups>>}
     * @memberof GroupsManagementClient
     */
    list(page?: number, limit?: number): Promise<DeepPartial<PaginatedGroups>>;
    /**
     * @name deleteMany
     * @name_zh 批量删除分组
     * @description 批量删除分组
     *
     * @param {string[]} codeList 分组唯一标志符列表
     *
     * @example
     * managementClient.groups.deleteMany(['groupa', 'groupb'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof GroupsManagementClient
     */
    deleteMany(codeList: string[]): Promise<CommonMessage>;
    /**
     * @name listUsers
     * @name_zh 获取分组用户列表
     * @description 获取分组用户列表
     * @param {string} code 分组唯一标志符
     * @param {number} [page=1] 页码数
     * @param {number} [limit=10] 每页个数
     *
     * @example
     *
     * managementClient.groups.listUsers(code)
     *
     * @returns {Promise<DeepPartial<PaginatedUsers>>}
     * @memberof GroupsManagementClient
     */
    listUsers(code: string, options?: {
        withCustomData?: boolean;
        page?: number;
        limit?: number;
    }): Promise<DeepPartial<PaginatedUsers>>;
    /**
     * @name addUsers
     * @name_zh 添加用户
     * @description 添加用户
     *
     * @param {string} code 分组唯一标志符
     * @param {string[]} userIds 用户 ID 列表
     *
     * @example
     * managementClient.groups.addUsers(code, ['USERID1', 'USERID2'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof GroupsManagementClient
     */
    addUsers(code: string, userIds: string[]): Promise<CommonMessage>;
    /**
     * @name removeUsers
     * @name_zh 移除用户
     *
     * @description 移除用户
     *
     * @param {string} code 分组唯一标志符
     * @param {string[]} userIds 用户 ID 列表
     * @example
     * managementClient.groups.removeUsers(code, ['USERID1', 'USERID2'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof GroupsManagementClient
     */
    removeUsers(code: string, userIds: string[]): Promise<CommonMessage>;
    /**
     * @description 获取分组被授权的所有资源
     *
     * @param code: 分组 code
     * @param namespace: 权限组 namespace code
     * @param options.resourceType 资源类型
     */
    listAuthorizedResources(code: string, namespace: string, options?: {
        resourceType?: ResourceType;
    }): Promise<PaginatedAuthorizedResources>;
}
