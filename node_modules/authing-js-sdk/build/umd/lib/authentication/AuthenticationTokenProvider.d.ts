import { User } from '../../types/index';
import { AuthenticationClientOptions } from './types';
export declare class AuthenticationTokenProvider {
    options: AuthenticationClientOptions;
    private token?;
    private user?;
    constructor(options: AuthenticationClientOptions);
    setToken(token: string): void;
    getToken(): string;
    getUser(): User | null;
    setUser(user: User): void;
    clearUser(): void;
}
