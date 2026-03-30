#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { AiDocxClient } from "./api-client.js";
import { register as registerCreateDocument } from "./tools/create-document.js";
import { register as registerUploadDocument } from "./tools/upload-document.js";
import { register as registerListDocuments } from "./tools/list-documents.js";
import { register as registerGetDocument } from "./tools/get-document.js";
import { register as registerListFolders } from "./tools/list-folders.js";
import { register as registerCreateFolder } from "./tools/create-folder.js";
import { register as registerDeleteDocument } from "./tools/delete-document.js";
import { register as registerDeleteFolder } from "./tools/delete-folder.js";
import { register as registerSearchDocuments } from "./tools/search-documents.js";
import { register as registerAnalyzeDocument } from "./tools/analyze-document.js";
import { register as registerCreateDeck } from "./tools/create-deck.js";
import { register as registerListDecks } from "./tools/list-decks.js";
import { register as registerGetDeck } from "./tools/get-deck.js";
import { register as registerEditDeck } from "./tools/edit-deck.js";
import { register as registerDeleteDeck } from "./tools/delete-deck.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

async function main() {
    const config = loadConfig();
    const client = new AiDocxClient(config);

    const server = new McpServer({
        name: "aidocx",
        version,
    });

    registerCreateDocument(server, client);
    registerUploadDocument(server, client);
    registerListDocuments(server, client);
    registerGetDocument(server, client);
    registerListFolders(server, client);
    registerCreateFolder(server, client);
    registerDeleteDocument(server, client);
    registerDeleteFolder(server, client);
    registerSearchDocuments(server, client);
    registerAnalyzeDocument(server, client);
    registerCreateDeck(server, client);
    registerListDecks(server, client);
    registerGetDeck(server, client);
    registerEditDeck(server, client);
    registerDeleteDeck(server, client);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[AiDocX MCP] Server running on stdio");
}

main().catch((error) => {
    console.error("[AiDocX MCP] Fatal:", error);
    process.exit(1);
});
