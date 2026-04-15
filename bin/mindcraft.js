#!/usr/bin/env node
import { homedir } from 'node:os';
import { join } from 'node:path';
import { init } from '../src/mindcraft/mindcraft.js';
import { overrideSpecDefaults } from '../src/mindcraft/mindserver.js';

const HELP = `
mindcraft — LLM agents for Minecraft

Usage:
  npx mindcraft [ui] [options]

Commands:
  ui (default)   Start the mindserver web UI. Configure your API key,
                 Minecraft server, and bots from the browser.

Options:
  --port <n>        Web UI port                       [default: 8080]
  --data-dir <dir>  Where bot memories/histories live [default: ~/.mindcraft/bots]
  --no-open         Don't auto-open the browser
  -h, --help        Show this help
`.trim();

function parseArgs(argv) {
    const opts = {
        cmd: 'ui',
        port: 8080,
        dataDir: join(homedir(), '.mindcraft', 'bots'),
        open: true,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '-h' || a === '--help') { console.log(HELP); process.exit(0); }
        else if (a === 'ui') opts.cmd = 'ui';
        else if (a === '--port') opts.port = parseInt(argv[++i], 10);
        else if (a === '--data-dir') opts.dataDir = argv[++i];
        else if (a === '--no-open') opts.open = false;
        else { console.error(`Unknown argument: ${a}\n\n${HELP}`); process.exit(2); }
    }
    return opts;
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));

    if (opts.cmd === 'ui') {
        overrideSpecDefaults({ data_dir: opts.dataDir });
        await init(false, opts.port, opts.open);
        console.log(`\nMindcraft UI: http://localhost:${opts.port}`);
        console.log(`Bot data dir: ${opts.dataDir}\n`);
    }
}

main().catch((err) => { console.error(err); process.exit(1); });
