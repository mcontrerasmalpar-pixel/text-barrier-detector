# Security Policy

## Supported Versions

| Package / Component | Version | Supported |
|---------------------|---------|-----------|
| `@maky/text-barrier-core` | `0.1.x` | ✅ |
| `@maky/text-barrier-mcp` | `0.1.x` | ✅ |
| Web UI (`text-barrier-detector.vercel.app`) | `main` | ✅ |

## Security Model & Guarantees

### 1. `@maky/text-barrier-core`
- **Zero runtime dependencies:** The core analyzer has no third-party runtime dependencies.
- **No network or filesystem access:** All analysis (`analyze`, `analyzeText`, `findBarriers`) operates strictly in-memory on the provided JavaScript string.
- **Bounded input size:** Inputs larger than `MAX_INPUT_CHARS` (`1,000,000` characters) are rejected before analysis with an `AnalysisError` (`TEXT_TOO_LONG`), and linear-time regular expressions prevent catastrophic backtracking on long inputs (verified with `100,000`-word stress tests).

### 2. `@maky/text-barrier-mcp` (`stdio` MCP Server)
- **No network calls or API keys:** The MCP server runs 100% locally over `stdio`. It never transmits text over the network and requires no API keys.
- **No logging of user text:** Neither `stdout` nor `stderr` ever logs user text or file contents. `stdout` carries only JSON-RPC protocol responses, and `stderr` is used only for fatal startup/transport errors.
- **`check_file` local filesystem access:**
  - Because `@maky/text-barrier-mcp` runs as a local `stdio` child process spawned by your MCP host (Claude Desktop, Cursor, Claude Code, etc.), `check_file(path, lang?)` executes with your local OS user permissions and can read **any `.md` or `.txt` file on your local disk** that your user account can read.
  - `check_file` enforces two safeguards:
    1. **Extension allow-list:** Only `.md` and `.txt` files (case-insensitive) are accepted (`UNSUPPORTED_FILE_TYPE` otherwise).
    2. **Size limit:** Files larger than `4,000,000` bytes (`MAX_FILE_BYTES`) or `1,000,000` characters (`MAX_INPUT_CHARS`) are rejected before analysis (`TEXT_TOO_LONG`).
  - Only grant `check_file` tool approval in your MCP client when you want the assistant to inspect a local Markdown or plain-text document.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

- **GitHub Security Advisories:** [Report a vulnerability](https://github.com/mcontrerasmalpar-pixel/text-barrier-detector/security/advisories/new)
- **Email:** `maria@mcontrerasmalpartida.dev`

Please include a minimal reproduction or proof-of-concept. You can expect an initial response within 72 hours.
