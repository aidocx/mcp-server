# aidocx-mcp-server

MCP (Model Context Protocol) server for [AiDocX](https://aidocx.ai) — AI-powered document management platform.

Create, upload, and manage business documents and presentation decks directly from AI assistants like Claude Desktop, Claude Code, and other MCP-compatible clients.

**Supported document types:** Contracts, Proposals, Quotations, Resumes, Business Plans, Reports, Official Letters, Purchase Orders, Manuals/SOPs, and more.

**Presentation decks:** Convert any text content into professionally designed slide decks using AI.

## Quick Start

### 1. Get API Keys

Sign up at [app.aidocx.ai](https://app.aidocx.ai) and go to **Settings > API Keys** to generate your credentials.

### 2. Configure Your AI Client

#### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "aidocx": {
      "command": "npx",
      "args": ["aidocx-mcp-server"],
      "env": {
        "AIDOCX_API_KEY": "ak_xxxxxxxx",
        "AIDOCX_API_SECRET": "your_secret_here"
      }
    }
  }
}
```

#### Claude Code

```bash
claude mcp add aidocx \
  -e AIDOCX_API_KEY=ak_xxxxxxxx \
  -e AIDOCX_API_SECRET=your_secret_here \
  -- npx aidocx-mcp-server
```

### 3. Start Using

Ask your AI assistant:

- "NDA 계약서 작성해줘" (Draft an NDA contract)
- "견적서 만들어줘" (Create a quotation)
- "이력서 작성해줘" (Create a resume)
- "제안서 만들어줘" (Create a proposal)
- "내 문서 목록 보여줘" (Show my documents)
- "이 문서 AI로 분석해줘" (Analyze this document with AI)
- "이 기사로 IR 덱 만들어줘" (Create an IR deck from this article)
- "내 덱 목록 보여줘" (Show my decks)
- "이 덱 제목 바꿔줘" (Rename this deck)

## Available Tools

### Document Management

| Tool | Description |
|------|-------------|
| `create_document` | Create a new document (contract, proposal, quotation, resume, report, etc.) — auto-generates PDF |
| `upload_document` | Upload a PDF or Office file (DOC, DOCX, HWP, XLS, XLSX, PPT, PPTX) |
| `list_documents` | List documents with optional pagination |
| `get_document` | Get document details and extracted text |
| `delete_document` | Delete a document |
| `search_documents` | Search documents with text query, date filters, and pagination |
| `analyze_document` | AI-powered document analysis with risk score and insights |

### Folder Management

| Tool | Description |
|------|-------------|
| `list_folders` | List folders |
| `create_folder` | Create a new folder |
| `delete_folder` | Delete a folder (optionally with all contents) |

### Presentation Decks

| Tool | Description |
|------|-------------|
| `create_deck` | Create a presentation deck from text content using AI (dark/light themes, 16:9 slides) |
| `list_decks` | List presentation decks with folder filtering and pagination |
| `get_deck` | Get deck details and full slide design JSON |
| `edit_deck` | Edit deck title, folder, or slide design components |
| `delete_deck` | Delete a deck and all its slide designs |

## Document Types

| Type | Examples |
|------|----------|
| `contract` | Service agreements, NDAs, employment contracts |
| `proposal` | Project proposals, consulting proposals |
| `quotation` | Price quotes, cost estimates |
| `plan` | Project plans, strategy documents |
| `business-plan` | Investor pitch business plans |
| `report` | Analysis reports, audit reports |
| `official-letter` | Official letters, notices, requests |
| `resume` | Resumes, CVs, cover letters |
| `purchase-order` | Purchase orders, delivery notes |
| `manual` | SOPs, user manuals, guides |

## Workflow

### Documents
1. **AI generates a document** -> calls `create_document` -> PDF is created in AiDocX
2. **Open the URL** returned by the tool to view, download, or share
3. **For contracts:** open the signing workspace URL to place signature fields and send to signers

### Presentation Decks
1. **Provide text content** (article, notes, data) -> calls `create_deck` -> AI generates multi-slide deck
2. **Open the editor URL** to preview, customize slides, and adjust design
3. **Share** the deck with viewers or export as needed

## Security

- **API credentials** are transmitted via `X-API-Key` and `X-API-Secret` headers over HTTPS only
- **Credentials are never logged** — the MCP server does not write API keys to stdout, files, or any persistent storage
- **Per-key rate limiting** is enforced server-side (plan-dependent: 30-600 req/min)
- **All inputs are validated** with strict schemas — UUID format for IDs, length limits on text fields, bounded pagination
- **API keys can be rotated or revoked** at any time from Settings > API Keys
- **Each key has an optional expiry** (7d / 30d / 90d / never) — use short-lived keys for CI/CD or shared environments
- **Destructive operations** (delete document/deck/folder) require explicit confirmation by the AI assistant

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AIDOCX_API_KEY` | Yes | API key (starts with `ak_`) |
| `AIDOCX_API_SECRET` | Yes | API secret (64-char hex) |
| `AIDOCX_API_URL` | No | API base URL (default: `https://api.aidocx.ai`) |
| `AIDOCX_APP_URL` | No | App base URL (default: `https://app.aidocx.ai`) |

## Changelog

### v0.5.0
- Added 5 presentation deck tools: `create_deck`, `list_decks`, `get_deck`, `edit_deck`, `delete_deck`
- Added `PUT` method support to API client
- Strengthened input validation across all tools (UUID format, length limits, bounded pagination)

### v0.4.1
- Tool rename: contract -> document for broader document type support
- Improved error messages with actionable guidance

### v0.4.0
- Added `search_documents` and `analyze_document` tools
- Added folder management tools

### v0.1.0
- Initial release with document CRUD and upload

## Links

- [AiDocX Website](https://aidocx.ai)
- [AiDocX App](https://app.aidocx.ai)
- [MCP Protocol](https://modelcontextprotocol.io)
