import { z } from "zod";
const inputSchema = {
    name: z.string().describe("Folder name"),
    parentId: z.string().optional().describe("Parent folder ID. Omit for root level."),
};
export function register(server, client) {
    server.registerTool("create_folder", {
        description: "Create a new folder in AiDocX document management.",
        inputSchema,
    }, async ({ name, parentId }) => {
        try {
            const result = await client.post("/contracts/folders", { name, parentId });
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            folderId: result.id,
                            name: result.name,
                            message: `Folder "${result.name}" created.`,
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
