export interface AiDocxConfig {
    apiKey: string;
    apiSecret: string;
    apiUrl: string;
    appUrl: string;
}

export function loadConfig(): AiDocxConfig {
    const apiKey = process.env.AIDOCX_API_KEY;
    const apiSecret = process.env.AIDOCX_API_SECRET;
    const apiUrl = process.env.AIDOCX_API_URL || "https://api.aidocx.ai";
    const appUrl = process.env.AIDOCX_APP_URL || "https://app.aidocx.ai";

    if (!apiKey || !apiSecret) {
        console.error(
            "[AiDocX MCP] Missing AIDOCX_API_KEY or AIDOCX_API_SECRET.\n" +
            "Generate an API key at https://app.aidocx.ai/settings → API Keys."
        );
        process.exit(1);
    }

    return { apiKey, apiSecret, apiUrl, appUrl };
}
