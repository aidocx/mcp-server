import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    id: z.string().describe("Contract ID to analyze"),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "analyze_contract",
        {
            description:
                "Analyze a contract using AI. Returns a summary, risk score (0-100), and detailed insights " +
                "including key clauses, missing protections, and opportunities for improvement.\n\n" +
                "NOTE: This operation consumes AI tokens from the user's subscription plan. " +
                "The analysis may take 10-30 seconds depending on contract length.",
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
                            contractId: id,
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
