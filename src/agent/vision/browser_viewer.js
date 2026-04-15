import settings from '../settings.js';

// prismarine-viewer starts an express server on a fixed port. If the port is
// busy (or the optional native deps didn't build), the unhandled error would
// otherwise crash the agent process. Import lazily and swallow errors so the
// agent keeps running without a viewer.
export async function addBrowserViewer(bot, count_id) {
    if (!settings.render_bot_view) return { ok: false, disabled: true };
    const port = 3000 + count_id;
    try {
        const { default: prismarineViewer } = await import('prismarine-viewer');
        prismarineViewer.mineflayer(bot, { port, firstPerson: true });
        // The underlying http server emits 'error' asynchronously (e.g. EADDRINUSE).
        // prismarine-viewer attaches it to bot.viewer; guard the listen error there.
        bot.viewer?.app?.on?.('error', (err) => {
            console.warn(`prismarine-viewer server error on port ${port}:`, err.message);
        });
        return { ok: true, port };
    } catch (err) {
        console.warn(`prismarine-viewer unavailable (port ${port}):`, err.message);
        return { ok: false, port, error: err.message };
    }
}
