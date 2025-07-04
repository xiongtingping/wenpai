import { ManagementClientOptions, AuditLog } from './types';
import { ManagementTokenProvider } from './ManagementTokenProvider';
import { HttpClient } from '../common/HttpClient';
/**
 * @class StatisticsManagementClient 管理日志统计信息
 * @name StatisticsManagementClient
 * @description 管理日志统计信息
 *
 * @example
 *
 * 请使用以下方式使用该模块：
 * \`\`\`javascript
 * import { StatisticsManagementClient } from "authing-js-sdk"
 * const managementClient = new ManagementClient({
 *    userPoolId: "YOUR_USERPOOL_ID",
 *    secret: "YOUR_USERPOOL_SECRET",
 * })
 * managementClient.statistics.listUserActions // 查看用户操作日志
 * managementClient.statistics.listAuditLogs // 查看审计日志
 * \`\`\`
 *
 */
export declare class StatisticsManagementClient {
    options: ManagementClientOptions;
    httpClient: HttpClient;
    tokenProvider: ManagementTokenProvider;
    constructor(options: ManagementClientOptions, httpClient: HttpClient, tokenProvider: ManagementTokenProvider);
    /**
     * 查看用户操作日志
     * @param options.operationNames SupportedUserActionEnum
     */
    listUserActions(options?: {
        clientIp?: string;
        eventType?: string;
        userId?: string;
        appId?: string;
        page?: number;
        limit?: number;
        start?: number;
        end?: number;
    }): Promise<{
        totalCount: number;
        list: AuditLog[];
    }>;
    /**
     * 查看审计日志
     * @param options.operationNames  SupportedAdminActionEnum
     */
    listAuditLogs(options?: {
        clientIp?: string;
        eventType?: string;
        userId?: string;
        appId?: string;
        page?: number;
        limit?: number;
        start?: number;
        end?: number;
    }): Promise<{
        list: AuditLog[];
        totalCount: number;
    }>;
}
