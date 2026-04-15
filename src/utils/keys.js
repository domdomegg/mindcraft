import { readFileSync } from 'fs';
import path from 'path';
import { homedir } from 'os';

// Lookup order: ./keys.json (repo-local), then ~/.mindcraft/keys.json
// (written by the web UI's setup wizard), then environment variables.
function tryRead(p) {
    try { return JSON.parse(readFileSync(p, 'utf8')); }
    catch { return null; }
}

const local = tryRead(path.join(process.cwd(), 'keys.json'));
const user = tryRead(path.join(homedir(), '.mindcraft', 'keys.json'));
const keys = { ...(user || {}), ...(local || {}) };

if (!local && !user) {
    console.warn('keys.json not found. Defaulting to environment variables.'); // still works with local models
}

export function getKey(name) {
    let key = keys[name];
    if (!key) {
        key = process.env[name];
    }
    if (!key) {
        throw new Error(`API key "${name}" not found in keys.json or environment variables!`);
    }
    return key;
}

export function hasKey(name) {
    return keys[name] || process.env[name];
}
