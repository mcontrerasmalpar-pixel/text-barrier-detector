#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './index.js';

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // Never log user text; only report startup/transport errors on stderr.
  process.stderr.write(
    `[@maky/text-barrier-mcp] Fatal startup error: ${err instanceof Error ? err.message : String(err)}\n`
  );
  process.exit(1);
});
