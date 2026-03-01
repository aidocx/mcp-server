import type { AiDocxConfig } from "./config.js";
export declare class AiDocxClient {
    private config;
    constructor(config: AiDocxConfig);
    private get headers();
    get appUrl(): string;
    private url;
    private formatError;
    get<T = any>(path: string, params?: Record<string, string>): Promise<T>;
    post<T = any>(path: string, body: Record<string, any>): Promise<T>;
    delete<T = any>(path: string, params?: Record<string, string>): Promise<T>;
}
