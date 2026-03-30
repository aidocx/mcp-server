import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    id: z.string().describe("Document ID to delete (UUID)"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "delete_document",
        {
            description:
                "Delete a document from AiDocX document management. This action is irreversible.\n\n" +
                "IMPORTANT: Always confirm with the user before deleting a document.",
            inputSchema,
        },
        async ({ id }) => {
            try {
                await client.delete(`/contracts/${id}`);
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            message: `Document ${id} has been deleted.`,
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
