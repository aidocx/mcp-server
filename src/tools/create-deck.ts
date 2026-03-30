import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

export function register(server: McpServer, client: AiDocxClient) {
    // @ts-expect-error - MCP SDK deep type inference with Zod enums
    server.registerTool(
        "create_deck",
        {
            description:
                "Create a presentation deck from text content using AI.\n\n" +
                "Provide raw text (article, report, meeting notes, data) and AI will automatically generate " +
                "a multi-slide presentation with professional layout, typography, and design.\n\n" +
                "The generated deck includes:\n" +
                "- Cover slide with title and date\n" +
                "- Content slides with cards, quotes, bullet points\n" +
                "- Summary slide with key takeaways\n" +
                "- Consistent color theme and typography\n\n" +
                "Supports dark and light themes. Each slide is 1280×720px (16:9).\n\n" +
                "Use cases:\n" +
                "- Convert blog posts or articles into presentation decks\n" +
                "- Generate IR (Investor Relations) decks from company data\n" +
                "- Create trend briefings from research notes\n" +
                "- Turn meeting minutes into shareable slide summaries",
            inputSchema: {
                name: z.string().optional().describe("Deck title (max 200 chars). If omitted, auto-generated from content."),
                content: z.string().describe("Raw text content to convert into a presentation deck (10-50,000 chars). Can be plain text, markdown, or structured notes."),
                theme: z.enum(["dark", "light"]).optional().describe("Color theme. Default: 'dark'"),
            },
        },
        async ({ name, content, theme }) => {
            try {
                const result = await client.post("/ir-deck/create-from-content", {
                    ...(name ? { name } : {}),
                    content,
                    ...(theme ? { theme } : {}),
                });
                const editorUrl = `${client.appUrl}/deck/${result.deckId}/editor`;
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            deckId: result.deckId,
                            designId: result.designId,
                            name: result.name,
                            slideCount: result.slideCount,
                            theme: result.theme,
                            tokensUsed: result.tokensUsed,
                            editorUrl,
                            message: `Deck "${result.name}" created with ${result.slideCount} slides.`,
                            nextStep: "Open the editor URL to preview and edit the deck, or share it with viewers.",
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
