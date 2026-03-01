import { z } from "zod";
export function register(server, client) {
    // @ts-expect-error -- MCP SDK generic recursion with zod v3.25+ optional()
    server.registerTool("create_contract", {
        description: "Create a new contract in AiDocX. The content is rendered to a professionally formatted PDF " +
            "(A4, proper margins) and stored in document management.\n\n" +
            "IMPORTANT: Before calling this tool, you MUST confirm the following with the user:\n" +
            "1. Contract type (e.g., service agreement, employment contract, NDA)\n" +
            "2. Parties involved (company names, representative names, roles)\n" +
            "3. Key terms (duration, amount, payment schedule)\n" +
            "4. Number of signers and their names/roles\n" +
            "5. Any special clauses or conditions\n\n" +
            "Generate professional, legally-structured HTML with proper headings, articles, " +
            "and signature blocks for each signer at the bottom. " +
            "Do NOT include <html>/<head>/<body> wrapper — only the inner content.",
        inputSchema: {
            name: z.string().describe("Contract title"),
            html: z.string().describe("Contract body content"),
            folderId: z.string().optional().describe("Target folder ID"),
        },
    }, async ({ name, html, folderId }) => {
        try {
            const result = await client.post("/contracts/create-from-html", { name, html, folderId });
            const signingUrl = `${client.appUrl}/contracts/${result.id}/signing`;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            contractId: result.id,
                            name: result.name,
                            fileSize: result.fileSize,
                            message: `Contract "${result.name}" created successfully.`,
                            signingWorkspaceUrl: signingUrl,
                            nextStep: "Open the signing workspace URL to place signature fields and send to signers.",
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    });
}
