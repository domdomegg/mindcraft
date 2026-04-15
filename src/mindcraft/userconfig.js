import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, chmodSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Persistence layer used by the web UI's setup wizard.
// Keeps API keys, server config, and saved profiles across restarts.
// Follows the XDG base-dir convention: $XDG_CONFIG_HOME/mindcraft, falling
// back to ~/.config/mindcraft.

const CONFIG_HOME = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
const ROOT = join(CONFIG_HOME, 'mindcraft');
const CONFIG_PATH = join(ROOT, 'config.json');
const KEYS_PATH = join(ROOT, 'keys.json');
const PROFILES_DIR = join(ROOT, 'profiles');
const BOTS_DIR = join(ROOT, 'bots');

export const paths = { ROOT, CONFIG_PATH, KEYS_PATH, PROFILES_DIR, BOTS_DIR };

function readJson(path) {
    if (!existsSync(path)) return null;
    try { return JSON.parse(readFileSync(path, 'utf8')); }
    catch { return null; }
}

function writeJson(path, data, mode) {
    mkdirSync(ROOT, { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2));
    if (mode) chmodSync(path, mode);
}

export function getConfig() {
    return readJson(CONFIG_PATH);
}

export function saveConfig(config) {
    writeJson(CONFIG_PATH, config);
}

// Shallow-merge a partial config into the stored one (so the three setup
// panels — server / providers / agents — can save independently).
export function mergeConfig(partial) {
    const existing = readJson(CONFIG_PATH) || {};
    const merged = { ...existing, ...partial };
    writeJson(CONFIG_PATH, merged);
    return merged;
}

export function getKeys() {
    return readJson(KEYS_PATH) || {};
}

export function hasKeys() {
    const k = readJson(KEYS_PATH);
    return !!k && Object.values(k).some(v => v);
}

export function loadKeysIntoEnv() {
    const k = readJson(KEYS_PATH);
    if (!k) return;
    for (const [name, value] of Object.entries(k)) {
        if (value && !process.env[name]) process.env[name] = value;
    }
}

export function saveKeys(keys) {
    const existing = readJson(KEYS_PATH) || {};
    writeJson(KEYS_PATH, { ...existing, ...keys }, 0o600);
    for (const [name, value] of Object.entries(keys)) {
        if (value) process.env[name] = value;
    }
}

export function listProfiles() {
    if (!existsSync(PROFILES_DIR)) return [];
    return readdirSync(PROFILES_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => readJson(join(PROFILES_DIR, f)))
        .filter(p => p && p.name);
}

export function saveProfile(profile) {
    if (!profile?.name) throw new Error('profile.name is required');
    mkdirSync(PROFILES_DIR, { recursive: true });
    writeJson(join(PROFILES_DIR, `${profile.name}.json`), profile);
}

export function deleteProfile(name) {
    const p = join(PROFILES_DIR, `${name}.json`);
    if (existsSync(p)) unlinkSync(p);
}
