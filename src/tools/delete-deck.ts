import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "delete_deck",
        {
            description:
                "Delete a presentation deck from AiDocX. This action is irreversible.\n\n" +
                "IMPORTANT: Always confirm with the user before deleting a deck. " +
                "This will permanently remove the deck and all its slide designs.",
            inputSchema: {
                id: z.string().describe("Deck ID to delete (UUID)"),
            },
        },
        async ({ id }: { id: string }) => {
            try {
                await client.delete(`/ir-deck/${id}`);
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            message: `Deck ${id} has been permanently deleted.`,
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
