import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "get_deck",
        {
            description:
                "Get details of a specific presentation deck, including its slide design data.\n\n" +
                "Returns deck metadata (name, type, status) and the full design JSON " +
                "(slide components, themes, layout). Use this to inspect deck contents before editing.",
            inputSchema: {
                id: z.string().describe("Deck ID (UUID)"),
                includeDesign: z.boolean().optional().describe("Include full slide design JSON. Default: true"),
            },
        },
        async ({ id, includeDesign }) => {
            try {
                const deck = await client.get(`/ir-deck/${id}`);

                const response: Record<string, any> = {
                    id: deck.id,
                    name: deck.name,
                    deckType: deck.deckType,
                    status: deck.status,
                    folderId: deck.folderId,
                    createdAt: deck.createdAt,
                    updatedAt: deck.updatedAt,
                    editorUrl: `${client.appUrl}/deck/${deck.id}/editor`,
                };

                if (includeDesign !== false) {
                    try {
                        const design = await client.get("/ir-deck/design", { deckId: id });
                        response.design = design.design || design;
                    } catch {
                        response.design = null;
                        response.designNote = "No design data found. This deck may use uploaded PDF slides instead.";
                    }
                }

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(response, null, 2),
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
