export interface AiDocxConfig {
    apiKey: string;
    apiSecret: string;
    apiUrl: string;
    appUrl: string;
}
export declare function loadConfig(): AiDocxConfig;
