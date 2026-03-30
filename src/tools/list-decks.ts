import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "list_decks",
        {
            description:
                "List presentation decks in the user's AiDocX account.\n\n" +
                "Returns deck ID, name, type, status, creation date, and folder info. " +
                "Supports filtering by folder and pagination.",
            inputSchema: {
                folderId: z.string().optional().describe("Folder ID to filter (UUID). Omit for all decks."),
                page: z.number().optional().describe("Page number (1-based). Default: 1"),
                limit: z.number().optional().describe("Items per page (1-100). Default: 50"),
            },
        },
        async ({ folderId, page, limit }) => {
            try {
                const params: Record<string, string> = {};
                if (folderId) params.folderId = folderId;
                if (page) params.page = String(page);
                if (limit) params.limit = String(limit);

                const result = await client.get("/ir-deck/list", params);
                const items = Array.isArray(result.items) ? result.items : (Array.isArray(result) ? result : []);

                const decks = items.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    status: d.status,
                    folderId: d.folderId,
                    createdAt: d.createdAt,
                    updatedAt: d.updatedAt,
                }));

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            total: result.total ?? decks.length,
                            count: decks.length,
                            decks,
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
