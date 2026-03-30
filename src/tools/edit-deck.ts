import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

export function register(server: McpServer, client: AiDocxClient) {
    // @ts-expect-error - MCP SDK deep type inference with nested Zod object
    server.registerTool(
        "edit_deck",
        {
            description:
                "Edit a presentation deck's metadata or slide design.\n\n" +
                "Can update:\n" +
                "- Deck name (title)\n" +
                "- Move to a different folder\n" +
                "- Full slide design (components JSON)\n\n" +
                "For design updates, provide the complete pages array. Each page contains:\n" +
                "- theme: { background, fontFamily, accentColor }\n" +
                "- components: array of text, shape, icon, or table components with coordinates\n\n" +
                "IMPORTANT: To edit design, first use get_deck to retrieve the current design, " +
                "modify the specific parts, then send the full updated design back.",
            inputSchema: {
                id: z.string().describe("Deck ID to edit (UUID)"),
                name: z.string().optional().describe("New deck title (max 200 chars)"),
                folderId: z.string().optional().describe("Move deck to this folder ID (UUID)"),
                design: z.object({
                    pages: z.array(z.any()).describe("Array of page objects with theme and components (max 100 slides)"),
                }).optional().describe("Full slide design to save. Must include complete pages array."),
            },
        },
        async ({ id, name, folderId, design }) => {
            try {
                const updates: string[] = [];

                // Update metadata (name)
                if (name) {
                    await client.put(`/ir-deck/${id}`, { name });
                    updates.push(`name → "${name}"`);
                }

                // Move to folder
                if (folderId !== undefined) {
                    await client.put(`/ir-deck/${id}/folder`, { folderId });
                    updates.push(`moved to folder ${folderId}`);
                }

                // Update design
                if (design?.pages) {
                    await client.post("/ir-deck/design", {
                        deckId: id,
                        design: { pages: design.pages },
                    });
                    updates.push(`design updated (${design.pages.length} slides)`);
                }

                if (updates.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: false,
                                message: "No updates provided. Specify name, folderId, or design to edit.",
                            }, null, 2),
                        }],
                    };
                }

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            deckId: id,
                            updates,
                            editorUrl: `${client.appUrl}/deck/${id}/editor`,
                            message: `Deck updated: ${updates.join(", ")}`,
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
