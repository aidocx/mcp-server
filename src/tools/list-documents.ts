import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    folderId: z.string().optional().describe("Folder ID to list (UUID). Omit for root folder."),
    limit: z.number().optional().describe("Maximum number of documents to return (1-100). Default: 50"),
    offset: z.number().optional().describe("Number of documents to skip. Default: 0"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "list_documents",
        {
            description:
                "List documents in the user's AiDocX document management. " +
                "Returns all document types (contracts, proposals, quotations, resumes, reports, etc.). " +
                "Supports pagination.",
            inputSchema,
        },
        async ({ folderId, limit, offset }) => {
            try {
                const params: Record<string, string> = {};
                if (folderId) params.folderId = folderId;

                const result = await client.get("/contracts", params);
                const documents = result.contracts || result;
                const all = Array.isArray(documents)
                    ? documents.map((d: any) => ({
                        id: d.id, name: d.name, labels: d.labels,
                        fileType: d.fileType, fileSize: d.fileSize,
                        contentType: d.contentType,
                        createdAt: d.createdAt, updatedAt: d.updatedAt,
                    }))
                    : documents;

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
                            documents: paginated,
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
