import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    parentId: z.string().optional().describe("Parent folder ID. Omit for root-level folders."),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "list_folders",
        {
            description: "List folders in the user's AiDocX document management.",
            inputSchema,
        },
        async ({ parentId }) => {
            try {
                const params: Record<string, string> = {};
                if (parentId) params.parentId = parentId;

                const result = await client.get("/contracts/folders", params);
                const folders = result.folders || result;
                const summary = Array.isArray(folders)
                    ? folders.map((f: any) => ({
                        id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt,
                    }))
                    : folders;

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            count: Array.isArray(summary) ? summary.length : 0,
                            folders: summary,
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
