import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    folderId: z.string().optional().describe("Folder ID to list. Omit for root folder."),
    limit: z.number().optional().describe("Maximum number of contracts to return. Default: 50"),
    offset: z.number().optional().describe("Number of contracts to skip. Default: 0"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "list_contracts",
        {
            description: "List contracts in the user's AiDocX document management. Supports pagination.",
            inputSchema,
        },
        async ({ folderId, limit, offset }: { folderId?: string; limit?: number; offset?: number }) => {
            try {
                const params: Record<string, string> = {};
                if (folderId) params.folderId = folderId;

                const result = await client.get("/contracts", params);
                const contracts = result.contracts || result;
                const all = Array.isArray(contracts)
                    ? contracts.map((c: any) => ({
                        id: c.id, name: c.name, fileType: c.fileType,
                        fileSize: c.fileSize, contentType: c.contentType,
                        createdAt: c.createdAt, updatedAt: c.updatedAt,
                    }))
                    : contracts;

                const effectiveLimit = limit ?? 50;
                const effectiveOffset = offset ?? 0;
                const paginated = Array.isArray(all)
                    ? all.slice(effectiveOffset, effectiveOffset + effectiveLimit)
                    : all;

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            total: Array.isArray(all) ? all.length : 0,
                            count: Array.isArray(paginated) ? paginated.length : 0,
                            contracts: paginated,
                            pagination: { limit: effectiveLimit, offset: effectiveOffset },
                        }, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
