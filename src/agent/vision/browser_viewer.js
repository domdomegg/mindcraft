import settings from '../settings.js';
import net from 'net';

// prismarine-viewer starts an express server on a fixed port and doesn't expose
// the http.Server, so an EADDRINUSE becomes an uncaught exception that kills
// the agent process. Probe the port first, and lazy-import so missing optional
// native deps also degrade to "no viewer" instead of crashing.
function portFree(port) {
    return new Promise((resolve) => {
        const s = net.createServer()
            .once('error', () => resolve(false))
            .once('listening', () => s.close(() => resolve(true)))
            .listen(port, '127.0.0.1');
    });
}

export async function addBrowserViewer(bot, count_id) {
    if (!settings.render_bot_view) return { ok: false, disabled: true };
    const port = 3000 + count_id;
    try {
        if (!(await portFree(port))) {
            throw new Error(`port ${port} is already in use`);
        }
        const { default: prismarineViewer } = await import('prismarine-viewer');
        prismarineViewer.mineflayer(bot, { port, firstPerson: true });
        return { ok: true, port };
    } catch (err) {
        console.warn(`prismarine-viewer unavailable (port ${port}):`, err.message);
        return { ok: false, port, error: err.message };
    }
}
