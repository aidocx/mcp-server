import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    id: z.string().describe("Folder ID to delete"),
    recursive: z.boolean().optional().describe(
        "If true, delete the folder and all its contents (subfolders and contracts). " +
        "If false or omitted, the folder must be empty to delete."
    ),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "delete_folder",
        {
            description:
                "Delete a folder from AiDocX document management.\n\n" +
                "IMPORTANT: Always confirm with the user before deleting. " +
                "Use recursive=true only when the user explicitly wants to delete all contents.",
            inputSchema,
        },
        // @ts-expect-error -- MCP SDK generic recursion with zod v3.25+ optional()
        async ({ id, recursive }: { id: string; recursive?: boolean }) => {
            try {
                const params: Record<string, string> = {};
                if (recursive) params.recursive = "true";
                await client.delete(`/contracts/folders/${id}`, params);
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            message: `Folder ${id} has been deleted${recursive ? " with all contents" : ""}.`,
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
