import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    id: z.string().describe("Document ID (UUID)"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "get_document",
        {
            description:
                "Get details of a specific document in AiDocX. " +
                "Returns name, type, labels, size, and extracted text content.",
            inputSchema,
        },
        async ({ id }) => {
            try {
                const result = await client.get(`/contracts/${id}`);
                const doc = result.contract || result;
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            id: doc.id, name: doc.name,
                            fileName: doc.fileName, fileType: doc.fileType,
                            fileSize: doc.fileSize, contentType: doc.contentType,
                            folderId: doc.folderId, labels: doc.labels,
                            textExtract: doc.textExtract,
                            createdAt: doc.createdAt, updatedAt: doc.updatedAt,
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
