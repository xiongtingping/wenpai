import { ManagementClientOptions } from '../management/types';
import { AuthenticationClientOptions } from '../authentication/types';
import { AxiosInstance } from 'axios';
export declare class GraphqlClient {
    endpoint: string;
    options: ManagementClientOptions | AuthenticationClientOptions;
    axios: AxiosInstance;
    constructor(endpoint: string, options: ManagementClientOptions | AuthenticationClientOptions);
    setOptions(options: ManagementClientOptions | AuthenticationClientOptions): void;
    request(options: {
        query: string;
        variables?: any;
        token?: string;
    }): Promise<any>;
}
