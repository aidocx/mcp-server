import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AiDocxClient } from "../api-client.js";

const inputSchema = {
    fileName: z.string().describe("File name with extension (e.g., 'contract.pdf')"),
    fileBase64: z.string().describe("Base64-encoded file content (max 50MB)"),
    fileType: z.string().describe("MIME type (e.g., 'application/pdf')"),
    folderId: z.string().optional().describe("Target folder ID. Omit for root."),
};

export function register(server: McpServer, client: AiDocxClient) {
    server.registerTool(
        "upload_contract",
        {
            description:
                "Upload a PDF or Office document (DOC, DOCX, HWP, XLS, XLSX, PPT, PPTX) to AiDocX. " +
                "Office files are auto-converted to PDF.",
            inputSchema,
        },
        async ({ fileName, fileBase64, fileType, folderId }) => {
            try {
                const result = await client.post("/contracts/upload", {
                    file: fileBase64, fileName, fileType, folderId,
                });
                const signingUrl = `${client.appUrl}/contracts/${result.id}/signing`;
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            contractId: result.id,
                            name: result.name,
                            fileSize: result.fileSize,
                            message: `File "${result.name}" uploaded successfully.`,
                            signingWorkspaceUrl: signingUrl,
                            nextStep: "Open the signing workspace URL to place signature fields and send to signers.",
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
