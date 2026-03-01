import { z } from "zod";
const inputSchema = {
    folderId: z.string().optional().describe("Folder ID to list. Omit for root folder."),
    limit: z.number().optional().describe("Maximum number of contracts to return. Default: 50"),
    offset: z.number().optional().describe("Number of contracts to skip. Default: 0"),
};
export function register(server, client) {
    server.registerTool("list_contracts", {
        description: "List contracts in the user's AiDocX document management. Supports pagination.",
        inputSchema,
    }, async ({ folderId, limit, offset }) => {
        try {
            const params = {};
            if (folderId)
                params.folderId = folderId;
            const result = await client.get("/contracts", params);
            const contracts = result.contracts || result;
            const all = Array.isArray(contracts)
                ? contracts.map((c) => ({
                    id: c.id, name: c.name, fileType: c.fileType,
                    fileSize: c.fileSize, contentType: c.contentType,
                    createdAt: c.createdAt, updatedAt: c.updatedAt,
                }))
                : contracts;
            const effectiveLimit = limit ?? 50;
            const effectiveOffset = offset ?? 0;
            const paginated = Array.isArray(all)
                ? all.slice(effectiveOffset, effectiveOffset + effectiveLimit)
                : all;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            total: Array.isArray(all) ? all.length : 0,
                            count: Array.isArray(paginated) ? paginated.length : 0,
                            contracts: paginated,
                            pagination: { limit: effectiveLimit, offset: effectiveOffset },
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
