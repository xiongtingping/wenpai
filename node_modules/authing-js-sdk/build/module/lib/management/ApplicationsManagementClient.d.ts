import { ManagementTokenProvider } from './ManagementTokenProvider';
import { ActiveUsers, Application, AgreementInput, ApplicationDetail, ManagementClientOptions, IApplication, ApplicationType, ApplicationTenantDetails } from './types';
import { HttpClient } from '../common/HttpClient';
import { AclManagementClient } from './AclManagementClient';
import { GraphqlClient } from '../common/GraphqlClient';
import { RolesManagementClient } from './RolesManagementClient';
import { ResourceType } from '../../types/graphql.v2';
import { AgreementManagementClient } from './AgreementManagementClient';
/**
 * @class ApplicationsManagementClient 管理分组
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
 * managementClient.applications.list // 获取应用列表
 * managementClient.applications.findById // 通过 ID 获取应用详情
 * \`\`\`
 *
 * @name ApplicationsManagementClient
 */
export declare class ApplicationsManagementClient {
    options: ManagementClientOptions;
    httpClient: HttpClient;
    graphqlClient: GraphqlClient;
    tokenProvider: ManagementTokenProvider;
    acl: AclManagementClient;
    roles: RolesManagementClient;
    agreements: AgreementManagementClient;
    constructor(options: ManagementClientOptions, httpClient: HttpClient, graphqlClient: GraphqlClient, tokenProvider: ManagementTokenProvider);
    /**
     * @description 获取用户池应用列表
     *
     */
    list(params?: {
        page: number;
        limit: number;
    }): Promise<{
        totalCount: number;
        list: IApplication[];
    }>;
    /**
     * 创建应用
     * @param options.name 应用名称
     * @param options.identifier 应用认证地址
     * @param options.redirectUris 应用回调链接
     * @param options.logo 应用 logo
     * @returns Promise<Application>
     */
    create(options: {
        name: string;
        identifier: string;
        redirectUris: string[];
        logo?: string;
    }): Promise<Application>;
    /**
     * 删除应用
     * @param appId 应用 ID
     * @returns Promise<boolean>
     */
    delete(appId: string): Promise<boolean>;
    /**
     * @description 通过 ID 获取应用详情
     * @param id 应用 ID
     */
    findById(id: string): Promise<ApplicationDetail>;
    listResources(appId: string, options?: {
        page?: number;
        limit?: number;
        type?: 'DATA' | 'API' | 'MENU' | 'UI' | 'BUTTON';
    }): Promise<any>;
    createResource(appId: string, options: {
        code: string;
        type: 'DATA' | 'API' | 'MENU' | 'UI' | 'BUTTON';
        description?: string;
        actions: Array<{
            name: string;
            description: string;
        }>;
    }): Promise<import("./types").IResourceResponse>;
    updateResource(appId: string, options: {
        code: string;
        type?: 'DATA' | 'API' | 'MENU' | 'UI' | 'BUTTON';
        description?: string;
        actions?: Array<{
            name: string;
            description: string;
        }>;
    }): Promise<import("./types").IResourceResponse>;
    deleteResource(appId: string, code: string): Promise<boolean>;
    /**
     * @description 获取应用访问控制策略
     * @param appId
     * @param options
     */
    getAccessPolicies(appId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<import("./types").IApplicationAccessPolicies>;
    /**
     * @description 启用针对某个用户、角色、分组、组织机构的应用访问控制策略
     * @param appId
     * @param options
     */
    enableAccessPolicy(appId: string, options: {
        targetType: 'USER' | 'ROLE' | 'GROUP' | 'ORG';
        targetIdentifiers: string[];
        inheritByChildren?: boolean;
    }): Promise<{
        code: number;
        message: string;
    }>;
    /**
     * @description 停用针对某个用户、角色、分组、组织机构的应用访问控制策略
     * @param appId
     * @param options
     */
    disableAccessPolicy(appId: string, options: {
        targetType: 'USER' | 'ROLE' | 'GROUP' | 'ORG';
        targetIdentifiers: string[];
        inheritByChildren?: boolean;
    }): Promise<{
        code: number;
        message: string;
    }>;
    /**
     * @description 删除针对某个用户、角色、分组、组织机构的应用访问控制策略
     * @param appId
     * @param options
     */
    deleteAccessPolicy(appId: string, options: {
        targetType: 'USER' | 'ROLE' | 'GROUP' | 'ORG';
        targetIdentifiers: string[];
        inheritByChildren?: boolean;
    }): Promise<{
        code: number;
        message: string;
    }>;
    /**
     * @description 配置「允许主体（用户、角色、分组、组织机构节点）访问应用」的控制策略
     * @param appId
     * @param options
     */
    allowAccess(appId: string, options: {
        targetType: 'USER' | 'ROLE' | 'GROUP' | 'ORG';
        targetIdentifiers: string[];
        inheritByChildren?: boolean;
    }): Promise<{
        code: number;
        message: string;
    }>;
    /**
     * @description 配置「拒绝主体（用户、角色、分组、组织机构节点）访问应用」的控制策略
     * @param appId
     * @param options
     */
    denyAccess(appId: string, options: {
        targetType: 'USER' | 'ROLE' | 'GROUP' | 'ORG';
        targetIdentifiers: string[];
        inheritByChildren?: boolean;
    }): Promise<{
        code: number;
        message: string;
    }>;
    /**
     * @description 更改默认应用访问策略
     * @param appId
     * @param defaultStrategy
     */
    updateDefaultAccessPolicy(appId: string, defaultStrategy: 'ALLOW_ALL' | 'DENY_ALL'): Promise<IApplication>;
    createRole(appId: string, options: {
        code: string;
        description?: string;
    }): Promise<import("../../types").DeepPartial<import("../../types/graphql.v2").Role>>;
    deleteRole(appId: string, code: string): Promise<import("../../types/graphql.v2").CommonMessage>;
    deleteRoles(appId: string, codes: string[]): Promise<import("../../types/graphql.v2").CommonMessage>;
    updateRole(appId: string, options: {
        code: string;
        description?: string;
        newCode?: string;
    }): Promise<import("../../types").DeepPartial<import("../../types/graphql.v2").Role>>;
    findRole(appId: string, code: string): Promise<import("../../types").DeepPartial<import("../../types/graphql.v2").Role>>;
    getRoles(appId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<import("../../types").DeepPartial<import("../../types/graphql.v2").PaginatedRoles>>;
    getUsersByRoleCode(appId: string, code: string): Promise<import("../../types").DeepPartial<import("../..").PaginatedUsers>>;
    addUsersToRole(appId: string, code: string, userIds: string[]): Promise<import("../../types/graphql.v2").CommonMessage>;
    removeUsersFromRole(appId: string, code: string, userIds: string[]): Promise<import("../../types/graphql.v2").CommonMessage>;
    listAuthorizedResourcesByRole(appId: string, code: string, resourceType?: ResourceType): Promise<import("../../types/graphql.v2").PaginatedAuthorizedResources>;
    createAgreement(appId: string, agreement: AgreementInput): Promise<import("./types").AgreementDetail>;
    deleteAgreement(appId: string, agreementId: number): Promise<boolean>;
    modifyAgreement(appId: string, agreementId: number, updates: AgreementInput): Promise<import("./types").AgreementDetail>;
    listAgreement(appId: string): Promise<import("./types").AgreementList>;
    sortAgreement(appId: string, order: number[]): Promise<boolean>;
    /**
     * 查看应用下已登录用户
     * @param appId 应用 ID
     * @param page 当前页数
     * @param limit 每页显示条数
     * @returns Promise<Application>
     */
    activeUsers(appId: string, page?: number, limit?: number): Promise<ActiveUsers>;
    /**
     * 刷新应用密钥
     * @param appId 应用 ID
     * @returns Promise<Application>
     */
    refreshApplicationSecret(appId: string): Promise<Application>;
    /**
     * 更改应用类型
     * @param appId 应用ID
     * @param type 应用类型
     */
    changeApplicationType(appId: string, type: ApplicationType): Promise<IApplication>;
    /**
     * 获取应用关联租户
     * @param appId 应用ID
     */
    applicationTenants(appId: string): Promise<ApplicationTenantDetails>;
}
