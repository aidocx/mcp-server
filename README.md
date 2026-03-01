# aidocx-mcp-server

MCP (Model Context Protocol) server for [AiDocX](https://aidocx.ai) — AI-powered contract & document management platform.

Create, upload, and manage contracts directly from AI assistants like Claude Desktop, Claude Code, and other MCP-compatible clients.

## Quick Start

### 1. Get API Keys

Sign up at [app.aidocx.ai](https://app.aidocx.ai) and go to **Settings → API Keys** to generate your credentials.

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

- "계약서 양식 만들어서 AiDocX에 올려줘" (Create a contract and upload to AiDocX)
- "NDA 계약서 작성해줘" (Draft an NDA)
- "내 문서 목록 보여줘" (Show my documents)
- "이 계약서 AI로 분석해줘" (Analyze this contract with AI)
- "계약서 검색해줘" (Search my contracts)

## Available Tools

| Tool | Description |
|------|-------------|
| `create_contract` | Create a new contract — auto-generates a professionally formatted PDF |
| `upload_contract` | Upload a PDF or Office file (DOC, DOCX, HWP, XLS, XLSX, PPT, PPTX) |
| `list_contracts` | List contracts with optional pagination |
| `get_contract` | Get contract details and extracted text |
| `delete_contract` | Delete a contract |
| `list_folders` | List folders |
| `create_folder` | Create a new folder |
| `delete_folder` | Delete a folder (optionally with all contents) |
| `search_contracts` | Search contracts with text query, date filters, and pagination |
| `analyze_contract` | AI-powered contract analysis with risk score and insights |

## Workflow

1. **AI generates a contract** → calls `create_contract` → PDF is created in AiDocX
2. **Open the signing workspace URL** returned by the tool
3. **Place signature fields** and send to signers in the AiDocX web app

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AIDOCX_API_KEY` | API key (starts with `ak_`) |
| `AIDOCX_API_SECRET` | API secret (64-char hex) |

## Links

- [AiDocX Website](https://aidocx.ai)
- [AiDocX App](https://app.aidocx.ai)
- [MCP Protocol](https://modelcontextprotocol.io)
