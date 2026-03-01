import { z } from "zod";
const inputSchema = {
    parentId: z.string().optional().describe("Parent folder ID. Omit for root-level folders."),
};
export function register(server, client) {
    server.registerTool("list_folders", {
        description: "List folders in the user's AiDocX document management.",
        inputSchema,
    }, async ({ parentId }) => {
        try {
            const params = {};
            if (parentId)
                params.parentId = parentId;
            const result = await client.get("/contracts/folders", params);
            const folders = result.folders || result;
            const summary = Array.isArray(folders)
                ? folders.map((f) => ({
                    id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt,
                }))
                : folders;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            count: Array.isArray(summary) ? summary.length : 0,
                            folders: summary,
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
