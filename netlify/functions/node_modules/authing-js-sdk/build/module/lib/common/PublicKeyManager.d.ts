import { BaseAuthenticationClient } from '../authentication/BaseAuthenticationClient';
import { AuthenticationClientOptions } from '../authentication/types';
import { ManagementClientOptions } from '../management/types';
import { HttpClient } from './HttpClient';
export declare class PublicKeyManager {
    options: AuthenticationClientOptions | ManagementClientOptions;
    httpClient: HttpClient;
    baseClient: BaseAuthenticationClient;
    /**
     * @description 密码加密公钥
     */
    private publicKey;
    constructor(options: AuthenticationClientOptions | ManagementClientOptions, httpClient: HttpClient);
    /**
     * @description 获取密码加密公钥
     */
    getPublicKey(): Promise<string>;
}
