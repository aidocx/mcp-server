import { z } from "zod";
const inputSchema = {
    id: z.string().describe("Folder ID to delete"),
    recursive: z.boolean().optional().describe("If true, delete the folder and all its contents (subfolders and contracts). " +
        "If false or omitted, the folder must be empty to delete."),
};
export function register(server, client) {
    server.registerTool("delete_folder", {
        description: "Delete a folder from AiDocX document management.\n\n" +
            "IMPORTANT: Always confirm with the user before deleting. " +
            "Use recursive=true only when the user explicitly wants to delete all contents.",
        inputSchema,
    }, 
    // @ts-expect-error -- MCP SDK generic recursion with zod v3.25+ optional()
    async ({ id, recursive }) => {
        try {
            const params = {};
            if (recursive)
                params.recursive = "true";
            await client.delete(`/contracts/folders/${id}`, params);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: `Folder ${id} has been deleted${recursive ? " with all contents" : ""}.`,
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
