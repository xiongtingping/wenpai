import { AuthenticationClientOptions } from './types';
export declare class BaseAuthenticationClient {
    options: AuthenticationClientOptions;
    get appHost(): string;
    constructor(options: AuthenticationClientOptions);
}
