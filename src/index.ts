#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { AiDocxClient } from "./api-client.js";
import { register as registerCreateContract } from "./tools/create-contract.js";
import { register as registerUploadContract } from "./tools/upload-contract.js";
import { register as registerListContracts } from "./tools/list-contracts.js";
import { register as registerGetContract } from "./tools/get-contract.js";
import { register as registerListFolders } from "./tools/list-folders.js";
import { register as registerCreateFolder } from "./tools/create-folder.js";
import { register as registerDeleteContract } from "./tools/delete-contract.js";
import { register as registerDeleteFolder } from "./tools/delete-folder.js";
import { register as registerSearchContracts } from "./tools/search-contracts.js";
import { register as registerAnalyzeContract } from "./tools/analyze-contract.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

async function main() {
    const config = loadConfig();
    const client = new AiDocxClient(config);

    const server = new McpServer({
        name: "aidocx",
        version,
    });

    registerCreateContract(server, client);
    registerUploadContract(server, client);
    registerListContracts(server, client);
    registerGetContract(server, client);
    registerListFolders(server, client);
    registerCreateFolder(server, client);
    registerDeleteContract(server, client);
    registerDeleteFolder(server, client);
    registerSearchContracts(server, client);
    registerAnalyzeContract(server, client);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[AiDocX MCP] Server running on stdio");
}

main().catch((error) => {
    console.error("[AiDocX MCP] Fatal:", error);
    process.exit(1);
});
