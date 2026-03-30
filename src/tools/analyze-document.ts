import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    id: z.string().describe("Document ID to analyze (UUID)"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "analyze_document",
        {
            description:
                "Analyze a document using AI. For contracts, returns a risk score (0-100), key clauses, " +
                "and missing protections. For other document types, returns a summary and improvement suggestions.\n\n" +
                "NOTE: This operation consumes AI tokens from the user's subscription plan. " +
                "The analysis may take 10-30 seconds depending on document length.",
            inputSchema,
        },
        async ({ id }) => {
            try {
                const result = await client.post("/ai/analyze", { id });
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            documentId: id,
                            summary: result.summary,
                            riskScore: result.riskScore,
                            insights: result.insights,
                            tokensUsed: result.tokensUsed,
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
