export class AiDocxClient {
    config;
    constructor(config) {
        this.config = config;
    }
    get headers() {
        return {
            "Content-Type": "application/json",
            "X-API-Key": this.config.apiKey,
            "X-API-Secret": this.config.apiSecret,
        };
    }
    get appUrl() {
        return this.config.appUrl;
    }
    url(path) {
        return `${this.config.apiUrl}/api${path}`;
    }
    formatError(status, body) {
        switch (status) {
            case 401:
                return new Error(`[${status}] Authentication failed. Your API key or secret is invalid or expired. Regenerate at https://app.aidocx.ai/settings → API Keys.`);
            case 402:
                return new Error(`[${status}] Insufficient tokens or subscription required. Upgrade your plan at https://app.aidocx.ai/settings → Billing.`);
            case 403:
                return new Error(`[${status}] Permission denied. You do not have access to this resource.`);
            case 404:
                return new Error(`[${status}] Resource not found. The requested contract, folder, or resource does not exist.`);
            case 413:
                return new Error(`[${status}] File too large. Maximum upload size is 50MB.`);
            case 429:
                return new Error(`[${status}] Rate limited. Too many requests — please wait a moment and try again.`);
            default:
                return new Error(`[${status}] ${body || "Unknown error"}`);
        }
    }
    async get(path, params) {
        const url = new URL(this.url(path));
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== "")
                    url.searchParams.set(k, v);
            }
        }
        const res = await fetch(url.toString(), { headers: this.headers });
        if (!res.ok) {
            const body = await res.text();
            throw this.formatError(res.status, body);
        }
        return res.json();
    }
    async post(path, body) {
        const res = await fetch(this.url(path), {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            throw this.formatError(res.status, text);
        }
        return res.json();
    }
    async delete(path, params) {
        const url = new URL(this.url(path));
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== "")
                    url.searchParams.set(k, v);
            }
        }
        const res = await fetch(url.toString(), {
            method: "DELETE",
            headers: this.headers,
        });
        if (!res.ok) {
            const text = await res.text();
            throw this.formatError(res.status, text);
        }
        return res.json();
    }
}
