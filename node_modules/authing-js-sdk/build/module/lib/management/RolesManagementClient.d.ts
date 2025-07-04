import { GraphqlClient } from './../common/GraphqlClient';
import { ManagementTokenProvider } from './ManagementTokenProvider';
import { ManagementClientOptions } from './types';
import { CommonMessage, PaginatedAuthorizedResources, PaginatedPolicyAssignments, PaginatedRoles, ResourceType, Role } from '../../types/graphql.v2';
import { DeepPartial, KeyValuePair, PaginatedUsers } from '../../types/index';
import { HttpClient } from '../common/HttpClient';
/**
 * @class RolesManagementClient 管理角色
 * @description 此模块用于管理 Authing 角色，可以进行角色的增删改查、角色添加/删除用户、角色添加/删除策略 等操作。
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
 * managementClient.roles.list // 获取角色列表
 * managementClient.roles.create // 创建角色
 * managementClient.roles.listUsers // 获取角色用户列表
 * \`\`\`
 *
 * @name RolesManagementClient
 */
export declare class RolesManagementClient {
    options: ManagementClientOptions;
    graphqlClient: GraphqlClient;
    httpClient: HttpClient;
    tokenProvider: ManagementTokenProvider;
    constructor(options: ManagementClientOptions, graphqlClient: GraphqlClient, httpClient: HttpClient, tokenProvider: ManagementTokenProvider);
    /**
     * @name create
     * @name_zh 创建角色
     * @description 创建角色
     *
     * @param {string} code 角色唯一标志符
     * @param {string} [options.description] 描述
     * @param {string} [options.namespace] 该角色所在的 namespace，默认为 default
     *
     * @example
     * managementClient.roles.create('rolea', 'RoleA')
     *
     * @returns {Promise<DeepPartial<Role>>}
     * @memberof RolesManagementClient
     */
    create(code: string, description?: string, namespace?: string): Promise<DeepPartial<Role>>;
    /**
     * @name delete
     * @name_zh 删除角色
     * @description 删除角色
     *
     * @param {string} code 角色唯一标志符
     * @param {string} [namespace] 角色所属的 Namespace code，默认值为 'default'
     *
     * @example
     * managementClient.roles.delete('rolea')
     *
     * @returns {Promise<CommonMessage>}
     * @memberof RolesManagementClient
     */
    delete(code: string, namespace?: string): Promise<CommonMessage>;
    /**
     * @name deleteMany
     * @name_zh 批量删除角色
     * @description 批量删除角色
     *
     * @param {string[]} codeList 角色唯一标志符列表
     * @param {string} [namespace] 角色所属的 Namespace，默认值为 'default'
     *
     * @example
     * managementClient.roles.delete(['rolea'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof RolesManagementClient
     */
    deleteMany(codeList: string[], namespace?: string): Promise<CommonMessage>;
    /**
     * @name update
     * @name_zh 修改角色
     * @description 修改角色
     *
     * @param {string} code 角色唯一标志符
     * @param {Object} options
     * @param {string} options.description 描述信息
     * @param {string} options.newCode 新的唯一标志符
     * @param {string} options.namespace 角色所属的 Namespace，默认值为 'default'
     *
     * @example
     * managementClient.roles.update('rolea', {newCode: 'newcode'})
     *
     *
     * @returns {Promise<DeepPartial<Role>>}
     * @memberof RolesManagementClient
     */
    update(code: string, options: {
        description?: string;
        newCode?: string;
        namespace?: string;
    }): Promise<DeepPartial<Role>>;
    /**
     * @deprecated  已过时, 不建议使用
     */
    detail(code: string, namespace?: string): Promise<DeepPartial<Role>>;
    /**
     *
     * @name findByCode
     * @name_zh 获取角色详情
     * @description 获取角色详情
     *
     * @param {string} code 角色唯一标志符
     * @param {string} [namespace] 角色所属的 Namespace，默认值为 'default'
     *
     * @example`
     * managementClient.roles.detail('manager')
     *
     * @returns {Promise<DeepPartial<Role>>} 角色详情
     * @memberof RolesManagementClient
     */
    findByCode(code: string, namespace?: string): Promise<DeepPartial<Role>>;
    /**
     * @name list
     * @name_zh 获取角色列表
     * @description 获取角色列表
     *
     * @param {Object} [options]
     * @param {number} [options.page=1] 页码数
     * @param {number} [options.limit=10] 每页个数
     * @param {string} [options.namespace] 角色所属的 Namespace，默认值为 'default'
     *
     * @example
     * managementClient.roles.list(2, 10)
     *
     * @returns {Promise<DeepPartial<PaginatedRoles>>}
     * @memberof RolesManagementClient
     */
    list(options?: {
        page?: number;
        limit?: number;
        namespace?: string;
    }): Promise<DeepPartial<PaginatedRoles>>;
    /**
     * @name listUsers
     * @name_zh 获取角色用户列表
     * @description 获取角色用户列表
     *
     * @param {string} code 角色唯一标志符
     * * @param {string} [namespace] 角色所属的 Namespace，默认值为 'default'
     *
     * @example
     * managementClient.roles.listUsers(code)
     *
     * @returns {Promise<DeepPartial<PaginatedUsers>>}
     * @memberof RolesManagementClient
     */
    listUsers(code: string, options?: {
        namespace?: string;
        withCustomData?: boolean;
        page?: number;
        limit?: number;
    }): Promise<DeepPartial<PaginatedUsers>>;
    /**
     * @name findUsers
     * @name_zh 查找角色特定用户
     * @description 查找角色特定用户
     *
     * @param {string} code 角色唯一标志符
     * * @param {string} [namespace] 角色所属的 Namespace，默认值为 'default'
     * * @param {string} [search] 匹配用户、手机、组织模糊搜索，默认值为 ''
     *
     * @example
     * managementClient.roles.findUsers(code)
     *
     * @returns {Promise<DeepPartial<PaginatedUsers>>}
     * @memberof RolesManagementClient
     */
    findUsers(code: string, options?: {
        namespace?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<DeepPartial<PaginatedUsers>>;
    /**
     * @name addUsers
     * @name_zh 添加用户
     * @description 添加用户
     *
     * @param {string} code 角色唯一标志符
     * @param {string[]} userIds 用户 ID 列表
     * @param {string} [namespace] 角色所属的 Namespace，默认值为 'default'
     *
     * @example
     * managementClient.roles.addUsers(code, ['USERID1', 'USERID2'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof RolesManagementClient
     */
    addUsers(code: string, userIds: string[], namespace?: string): Promise<CommonMessage>;
    /**
     * @name removeUsers
     * @name_zh 移除用户
     *
     * @description 移除用户
     *
     * @param {string} code 角色唯一标志符
     * @param {string[]} userIds 用户 ID 列表
     * @param {string} [namespace] 角色所属的 Namespace，默认值为 'default'
     *
     * @example
     * managementClient.roles.removeUsers(code, ['USERID1', 'USERID2'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof RolesManagementClient
     */
    removeUsers(code: string, userIds: string[], namespace?: string): Promise<CommonMessage>;
    /**
     * @name listPolicies
     * @name_zh 获取角色策略列表
     *
     * @description 获取角色策略列表
     *
     * @param {string} code 角色唯一标志符
     * @param {number} [page=1] 页码数
     * @param {number} [limit=10] 页码个数
     * @example
     *  managementClient.roles.listPolicies('codea', 1, 10)
     *
     * @returns {Promise<PaginatedPolicyAssignments>}
     * @memberof RolesManagementClient
     */
    listPolicies(code: string, page?: number, limit?: number): Promise<PaginatedPolicyAssignments>;
    /**
     * @name addPolicies
     * @name_zh 授权策略
     *
     * @description 给角色授权策略策略
     *
     * @param {string} code 角色唯一标志符
     * @param {string[]} policies 策略列表
     * @example
     * managementClient.roles.addPolicies('rolea', ['PolicyA', 'PolicyB'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof RolesManagementClient
     */
    addPolicies(code: string, policies: string[]): Promise<CommonMessage>;
    /**
     * @name removePolicies
     * @name_zh 角色移除策略
     *
     * @description 角色移除策略
     *
     * @param {string} code 角色唯一标志符
     * @param {string[]} policies 策略列表
     * @example
     * managementClient.roles.removePolicies('rolea', ['PolicyA', 'PolicyB'])
     *
     * @returns {Promise<CommonMessage>}
     * @memberof RolesManagementClient
     */
    removePolicies(code: string, policies: string[]): Promise<CommonMessage>;
    /**
     * @description 获取角色被授权的所有资源
     *
     * @param code: 角色 code
     * @param namespace: 角色权限组 namespace code
     * @param options.resourceType 资源类型
     */
    listAuthorizedResources(code: string, namespace: string, options?: {
        resourceType?: ResourceType;
    }): Promise<PaginatedAuthorizedResources>;
    /**
     * 获取某个角色扩展字段列表
     * @param roleId 角色 ID
     * @returns Promise<{ [key: string]: any }>
     */
    getUdfValue(roleId: string): Promise<{
        [key: string]: any;
    }>;
    /**
     * 获取某个角色某个扩展字段
     * @param roleId 角色 ID
     * @param udfKey 扩展字段 Key
     * @returns Promise<{ [key: string]: any }>
     */
    getSpecificUdfValue(roleId: string, udfKey: string): Promise<{
        [key: string]: any;
    }>;
    /**
     * 获取多个角色扩展字段列表
     * @param roleId 角色 ID 列表
     * @returns Promise<{ [x: string]: KeyValuePair }>
     */
    getUdfValueBatch(roleIds: string[]): Promise<{
        [x: string]: KeyValuePair;
    }>;
    /**
     * 设置某个角色扩展字段列表
     * @param roleId 角色 ID 列表
     * @param data 扩展字段
     */
    setUdfValue(roleId: string, data: KeyValuePair): Promise<void>;
    /**
     * 设置多个角色扩展字段列表
     * @param input.roleId 角色 ID 列表
     * @param input.data 扩展字段
     */
    setUdfValueBatch(input: {
        roleId: string;
        data: KeyValuePair;
    }[]): Promise<void>;
    /**
     * 删除用户的扩展字段
     * @param input.roleId 角色 ID 列表
     * @param input.key 扩展字段名
     */
    removeUdfValue(roleId: string, key: string): Promise<void>;
}
