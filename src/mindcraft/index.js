import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import defaultSettings from '../../settings.js';

export {
    init,
    createAgent,
    getAgentProcess,
    startAgent,
    stopAgent,
    destroyAgent,
    shutdown,
} from './mindcraft.js';

export { createMindServer, registerAgent, getIO, getServer } from './mindserver.js';

export { defaultSettings };

const settings_spec_path = fileURLToPath(new URL('./public/settings_spec.json', import.meta.url));
export const settingsSpec = JSON.parse(readFileSync(settings_spec_path, 'utf8'));

/**
 * Build a minimal Claude profile. Omits `embedding` so mindcraft falls back to
 * word-overlap similarity, meaning only ANTHROPIC_API_KEY is required.
 */
export function claudeProfile({ name, model = 'claude-sonnet-4-6' }) {
    return { name, model };
}
