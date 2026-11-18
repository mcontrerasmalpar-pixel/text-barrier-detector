import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('@maky/text-barrier-mcp stdio integration test', () => {
  let client: Client;
  let transport: StdioClientTransport;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'tbd-mcp-stdio-'));
    const cliPath = resolve(process.cwd(), 'packages/mcp/dist/cli.js');
    transport = new StdioClientTransport({
      command: process.execPath,
      args: [cliPath],
      stderr: 'pipe',
    });
    client = new Client(
      { name: 'tbd-integration-test-client', version: '0.1.0' },
      { capabilities: {} }
    );
    await client.connect(transport);
  });

  afterAll(async () => {
    await client?.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('lists analyze_text, find_barriers, and check_file tools (and no rewrite tool)', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(['analyze_text', 'check_file', 'find_barriers']);
  });

  it('calls analyze_text over stdio in EN and ES', async () => {
    const res = await client.callTool({
      name: 'analyze_text',
      arguments: {
        text: 'The report was written by the team. She is turned on.',
      },
    });
    expect(res.isError).toBeFalsy();
    const content = (res.content as Array<{ type: string; text: string }>)[0];
    const parsed = JSON.parse(content.text);
    expect(parsed.language).toBe('en');
    expect(parsed.passiveCount).toBe(1);
    expect(parsed.level.disclaimer).toMatch(/CEFR-inspired/);
  });

  it('calls find_barriers over stdio', async () => {
    const res = await client.callTool({
      name: 'find_barriers',
      arguments: {
        text: 'Se registró el usuario. Se me olvidó la contraseña.',
        lang: 'es',
      },
    });
    expect(res.isError).toBeFalsy();
    const content = (res.content as Array<{ type: string; text: string }>)[0];
    const parsed = JSON.parse(content.text);
    expect(parsed.lang).toBe('es');
    expect(parsed.issues.some((i: any) => i.type === 'passive' && i.text === 'Se registró')).toBe(
      true
    );
  });

  it('calls check_file over stdio on a .md file', async () => {
    const filePath = join(tempDir, 'doc.md');
    writeFileSync(
      filePath,
      '# Guide\n\nThe report was written by the team. She is turned on.\n',
      'utf8'
    );
    const res = await client.callTool({
      name: 'check_file',
      arguments: { path: filePath, lang: 'en' },
    });
    expect(res.isError).toBeFalsy();
    const content = (res.content as Array<{ type: string; text: string }>)[0];
    const parsed = JSON.parse(content.text);
    expect(parsed.analysis.passiveCount).toBe(1);
    expect(parsed.issues).toHaveLength(1);
  });
});
