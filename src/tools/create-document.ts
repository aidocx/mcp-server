import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const DOCUMENT_TYPES = [
    "contract", "proposal", "quotation", "plan", "business-plan",
    "business-trip-plan", "business-trip-report", "report",
    "official-letter", "resume", "purchase-order", "manual",
] as const;

export function register(server: McpServer, client: AiDocxClient) {
    // @ts-expect-error - MCP SDK deep type inference with Zod enums
    server.registerTool(
        "create_document",
        {
            description:
                "Create a new document in AiDocX. The content is rendered to a professionally formatted PDF " +
                "(A4, proper margins) and stored in document management.\n\n" +
                "Supported document types:\n" +
                "- contract: Contracts, NDAs, employment agreements, service agreements\n" +
                "- proposal: Project proposals, consulting proposals\n" +
                "- quotation: Price quotes, cost estimates, invoices\n" +
                "- plan: Project plans, strategy documents\n" +
                "- business-plan: Investor pitch business plans, startup plans\n" +
                "- business-trip-plan: Travel plans with itinerary and budget\n" +
                "- business-trip-report: Post-trip reports with outcomes and expenses\n" +
                "- report: Analysis reports, audit reports, due diligence\n" +
                "- official-letter: Official letters, notices, requests\n" +
                "- resume: Resumes, CVs, cover letters\n" +
                "- purchase-order: Purchase orders, delivery notes, invoices\n" +
                "- manual: SOPs, user manuals, guides\n\n" +
                "IMPORTANT: Before calling this tool, you MUST confirm the following with the user:\n" +
                "1. Document type (e.g., contract, quotation, resume, proposal)\n" +
                "2. Key details (parties, terms, items, or sections depending on type)\n" +
                "3. Any special requirements or clauses\n\n" +
                "Generate professional, well-structured HTML appropriate for the document type. " +
                "Do NOT include <html>/<head>/<body> wrapper — only the inner content.\n" +
                "- Contracts: include signature blocks at the bottom\n" +
                "- Quotations: include item tables with totals\n" +
                "- Resumes: include profile, experience, education sections\n" +
                "- Proposals: include executive summary, scope, timeline, pricing",
            inputSchema: {
                name: z.string().describe("Document title (max 200 chars)"),
                html: z.string().describe("Document body content as HTML (max 500KB)"),
                documentType: z.enum(DOCUMENT_TYPES).optional().describe(
                    "Document type. Determines formatting and structure. Default: 'contract'"
                ),
                folderId: z.string().optional().describe("Target folder ID (UUID)"),
            },
        },
        async ({ name, html, documentType, folderId }) => {
            try {
                const result = await client.post("/contracts/create-from-html", {
                    name, html, folderId,
                    ...(documentType ? { label: documentType } : {}),
                });
                const viewUrl = `${client.appUrl}/contracts/${result.id}`;
                const signingUrl = `${client.appUrl}/contracts/${result.id}/signing`;
                const isContract = !documentType || documentType === "contract";
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            documentId: result.id,
                            name: result.name,
                            documentType: documentType || "contract",
                            fileSize: result.fileSize,
                            message: `Document "${result.name}" created successfully.`,
                            viewUrl,
                            ...(isContract ? {
                                signingWorkspaceUrl: signingUrl,
                                nextStep: "Open the signing workspace URL to place signature fields and send to signers.",
                            } : {
                                nextStep: "Open the view URL to preview, download, or share the document.",
                            }),
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
