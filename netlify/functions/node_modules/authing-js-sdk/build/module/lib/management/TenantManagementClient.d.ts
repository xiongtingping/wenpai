import { CommonMessage } from '../../types/graphql.v2';
import { GraphqlClient } from './../common/GraphqlClient';
import { ManagementTokenProvider } from './ManagementTokenProvider';
import { ManagementClientOptions } from './types';
import { HttpClient } from '../common/HttpClient';
import { PublicKeyManager } from '../common/PublicKeyManager';
import { ResourceType } from '../../types/graphql.v2';
/**
 * @name TenantManagementClient
 * @description 租户管理模块
 *
 */
export declare class TenantManagementClient {
    options: ManagementClientOptions;
    graphqlClient: GraphqlClient;
    httpClient: HttpClient;
    tokenProvider: ManagementTokenProvider;
    publickKeyManager: PublicKeyManager;
    constructor(options: ManagementClientOptions, graphqlClient: GraphqlClient, httpClient: HttpClient, tokenProvider: ManagementTokenProvider);
    /**
     * @name list
     * @name_zh  获取用户池下租户列表
     * @description 获取用户池下租户列表
     */
    list(params?: {
        page: number;
        limit: number;
    }): Promise<any>;
    /**
     * @name details
     * @name_zh  获取租户详情
     * @description 获取租户详情
     */
    details(tenantId: string): Promise<any>;
    /**
     * @name create
     * @name_zh  创建租户
     * @description 创建租户
     */
    create(options: {
        name: string;
        appIds: string;
        logo?: string;
        description?: string;
    }): Promise<any>;
    /**
     * @name update
     * @name_zh  修改租户
     * @description 修改租户
     */
    update(tenantId: string, options: {
        name: string;
        appIds?: string;
        logo?: string;
        description?: string;
    }): Promise<any>;
    /**
     * @name delete
     * @name_zh  删除租户
     * @description 删除租户
     */
    delete(tenantId: string): Promise<CommonMessage>;
    /**
     * @name config
     * @name_zh  配置租户品牌化
     * @description 配置租户品牌化
     */
    config(tenantId: string, options: {
        css?: string;
        ssoPageCustomizationSettings?: {
            autoRegisterThenLogin?: boolean;
            hideForgetPassword?: boolean;
            hideIdp?: boolean;
            hideSocialLogin?: boolean;
        };
    }): Promise<any>;
    /**
     * @name members
     * @name_zh  获取租户成员列表
     * @description 获取租户成员列表
     */
    members(tenantId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<any>;
    /**
     * @name addMembers
     * @name_zh  添加租户成员
     * @description 添加租户成员
     */
    addMembers(tenantId: string, userIds: Array<string>): Promise<any>;
    /**
     * @name removeMembers
     * @name_zh  移除租户成员
     * @description 移除租户成员
     */
    removeMembers(tenantId: string, userId: string): Promise<any>;
    /**
     * @name listExtIdp
     * @name_zh  获取身份源列表
     * @description 获取身份源列表
     */
    listExtIdp(tenantId: string): Promise<any>;
    /**
     * @name extIdpDetail
     * @name_zh  获取身份源详细信息
     * @description 获取身份源详细信息
     */
    extIdpDetail(extIdpId: string): Promise<any>;
    /**
     * @name createExtIdp
     * @name_zh  创建身份源
     * @description 创建身份源
     */
    createExtIdp(options: {
        tenantId?: string;
        name: string;
        type: string;
        connections: {
            type: string;
            identifier: string;
            displayName: string;
            fields: any;
            userMatchFields?: string[];
            logo?: string;
        }[];
    }): Promise<any>;
    /**
     * @name updateExtIdp
     * @name_zh  更新身份源配置
     * @description 更新身份源配置
     */
    updateExtIdp(extIdpId: string, options: {
        name: string;
    }): Promise<any>;
    /**
     * @name deleteExtIdp
     * @name_zh  删除身份源
     * @description 删除身份源
     */
    deleteExtIdp(extIdpId: string): Promise<any>;
    /**
     * @name createExtIdpConnection
     * @name_zh  创建身份源连接
     * @description 创建身份源连接
     */
    createExtIdpConnection(options: {
        extIdpId: string;
        type: string;
        identifier: string;
        displayName: string;
        fields: object;
        userMatchFields?: string[];
        logo?: string;
    }): Promise<any>;
    /**
     * @name updateExtIdpConnection
     * @name_zh  更新身份源连接
     * @description 更新身份源连接
     */
    updateExtIdpConnection(extIdpConnectionId: string, options: {
        displayName: string;
        fields: object;
        userMatchFields?: string[];
        logo?: string;
    }): Promise<any>;
    /**
     * @name deleteExtIdpConnection
     * @name_zh  删除身份源连接
     * @description 删除身份源连接
     */
    deleteExtIdpConnection(extIdpConnectionId: string): Promise<any>;
    /**
     * @name checkExtIdpConnectionIdentifierUnique
     * @name_zh  检查连接唯一标识是否冲突
     * @description 检查连接唯一标识是否冲突
     */
    checkExtIdpConnectionIdentifierUnique(identifier: string): Promise<boolean>;
    /**
     * @name changeExtIdpConnectionState
     * @name_zh  开关身份源连接
     * @description 开关身份源连接
     */
    changeExtIdpConnectionState(extIdpConnectionId: string, options: {
        appId?: string;
        tenantId?: string;
        enabled: boolean;
    }): Promise<boolean>;
    /**
     * @name batchChangeExtIdpConnectionState
     * @name_zh  批量开关身份源连接
     * @description 批量开关身份源连接
     */
    batchChangeExtIdpConnectionState(extIdpId: string, options: {
        appId?: string;
        tenantId?: string;
        enabled: boolean;
    }): Promise<boolean>;
    /**
     * 设置租户管理员
     */
    setTanentAdmin(tenantId: string, options: {
        userIds?: string[];
    }): Promise<boolean>;
    /**
     * 取消租户管理员
     */
    deleteTanentAdmin(tenantId: string, userId: string): Promise<boolean>;
    /**
     * 更新租户成员，比如是否启用
     */
    updateTenantMember(tenantId: string, userId: string, isEnabled: boolean): Promise<boolean>;
    /**
     * 批量创建资源
     *
     */
    batchInsertResource(options: {
        bulk: {
            code: string;
            type: ResourceType;
            description?: string;
            actions: [
                {
                    name: string;
                    description: string;
                }
            ];
            apiIdentifier?: string;
            namespace?: string;
        }[];
    }): Promise<boolean>;
}
