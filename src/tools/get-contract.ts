import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    id: z.string().describe("Contract ID"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "get_contract",
        {
            description: "Get details of a specific contract in AiDocX. Returns name, type, size, and text extract.",
            inputSchema,
        },
        async ({ id }) => {
            try {
                const result = await client.get(`/contracts/${id}`);
                const contract = result.contract || result;
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            id: contract.id, name: contract.name,
                            fileName: contract.fileName, fileType: contract.fileType,
                            fileSize: contract.fileSize, contentType: contract.contentType,
                            folderId: contract.folderId, labels: contract.labels,
                            textExtract: contract.textExtract,
                            createdAt: contract.createdAt, updatedAt: contract.updatedAt,
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
