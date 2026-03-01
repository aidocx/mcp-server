import { z } from "zod";
const inputSchema = {
    id: z.string().describe("Contract ID to delete"),
};
export function register(server, client) {
    server.registerTool("delete_contract", {
        description: "Delete a contract from AiDocX document management. This action is irreversible.\n\n" +
            "IMPORTANT: Always confirm with the user before deleting a contract.",
        inputSchema,
    }, async ({ id }) => {
        try {
            await client.delete(`/contracts/${id}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: `Contract ${id} has been deleted.`,
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
