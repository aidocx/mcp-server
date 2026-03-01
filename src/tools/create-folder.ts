import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    name: z.string().describe("Folder name"),
    parentId: z.string().optional().describe("Parent folder ID. Omit for root level."),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "create_folder",
        {
            description: "Create a new folder in AiDocX document management.",
            inputSchema,
        },
        async ({ name, parentId }) => {
            try {
                const result = await client.post("/contracts/folders", { name, parentId });
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            folderId: result.id,
                            name: result.name,
                            message: `Folder "${result.name}" created.`,
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
