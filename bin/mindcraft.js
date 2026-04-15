#!/usr/bin/env node
import { init, createAgent } from '../src/mindcraft/mindcraft.js';
import { overrideSpecDefaults } from '../src/mindcraft/mindserver.js';
import * as userconfig from '../src/mindcraft/userconfig.js';

const HELP = `
mindcraft — LLM agents for Minecraft

Usage:
  npx mindcraft [ui] [options]

Commands:
  ui (default)   Start the mindserver web UI. Configure your API key,
                 Minecraft server, and bots from the browser.

Options:
  --port <n>        Web UI port                       [default: 8080]
  --data-dir <dir>  Where bot memories/histories live [default: ~/.config/mindcraft/bots]
  --no-open         Don't auto-open the browser
  -h, --help        Show this help

Config is stored under $XDG_CONFIG_HOME/mindcraft (default ~/.config/mindcraft).
`.trim();

function parseArgs(argv) {
    const opts = {
        cmd: 'ui',
        port: 8080,
        dataDir: userconfig.paths.BOTS_DIR,
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
    if (opts.cmd !== 'ui') return;

    // Load persisted config from ~/.config/mindcraft so a restart picks up where the
    // wizard left off: keys → process.env, server settings → spec defaults,
    // saved bots → recreated.
    userconfig.loadKeysIntoEnv();
    const config = userconfig.getConfig();
    overrideSpecDefaults({
        data_dir: opts.dataDir,
        ...(config?.server || {}),
    });

    await init(false, opts.port, opts.open);
    console.log(`\nMindcraft UI: http://localhost:${opts.port}`);
    console.log(`Bot data dir: ${opts.dataDir}`);

    if (config?.bots?.length) {
        const profiles = Object.fromEntries(userconfig.listProfiles().map(p => [p.name, p]));
        for (const bot of config.bots) {
            const profile = profiles[bot.profile];
            if (!profile) { console.warn(`Skipping bot "${bot.profile}": profile not found`); continue; }
            console.log(`Restoring bot: ${bot.profile}`);
            await createAgent({
                ...(config.server || {}),
                data_dir: opts.dataDir,
                base_profile: bot.base_profile || 'assistant',
                profile,
            });
        }
    } else {
        console.log(`No saved bots — open the UI to run setup.\n`);
    }
}

main().catch((err) => { console.error(err); process.exit(1); });
