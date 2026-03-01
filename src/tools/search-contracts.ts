import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    query: z.string().optional().describe("Search query text. Searches contract names and content."),
    sortBy: z.enum(["relevance", "date", "name"]).optional().describe("Sort results by relevance, date, or name. Default: relevance"),
    sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort order. Default: desc"),
    dateFrom: z.string().optional().describe("Filter results from this date (ISO 8601, e.g., '2024-01-01')"),
    dateTo: z.string().optional().describe("Filter results up to this date (ISO 8601)"),
    limit: z.number().optional().describe("Maximum results to return (1-100). Default: 20"),
    offset: z.number().optional().describe("Number of results to skip for pagination. Default: 0"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "search_contracts",
        {
            description:
                "Search contracts in AiDocX. Supports text search, date filtering, and pagination. " +
                "Returns matching contracts sorted by relevance by default.",
            inputSchema,
        },
        // @ts-expect-error -- MCP SDK generic recursion with zod v3.25+ optional()
        async ({ query, sortBy, sortOrder, dateFrom, dateTo, limit, offset }: {
            query?: string; sortBy?: string; sortOrder?: string;
            dateFrom?: string; dateTo?: string; limit?: number; offset?: number;
        }) => {
            try {
                const params: Record<string, string> = { types: "contract" };
                if (query) params.q = query;
                if (sortBy) params.sortBy = sortBy;
                if (sortOrder) params.sortOrder = sortOrder;
                if (dateFrom) params.dateFrom = dateFrom;
                if (dateTo) params.dateTo = dateTo;
                if (limit !== undefined) params.limit = String(limit);
                if (offset !== undefined) params.offset = String(offset);

                const result = await client.get("/search", params);
                const items = result.results || result;
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            total: result.total ?? (Array.isArray(items) ? items.length : 0),
                            results: Array.isArray(items)
                                ? items.map((item: any) => ({
                                    id: item.id,
                                    name: item.name,
                                    type: item.type,
                                    fileType: item.fileType,
                                    fileSize: item.fileSize,
                                    createdAt: item.createdAt,
                                    updatedAt: item.updatedAt,
                                }))
                                : items,
                            pagination: {
                                limit: limit ?? 20,
                                offset: offset ?? 0,
                            },
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
