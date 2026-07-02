const mineflayer = require('mineflayer');
const fs = require('fs');

// Load settings from settings.json
let settings;
try {
    settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
} catch (err) {
    console.error("Could not load settings.json file!", err);
    process.exit(1);
}

function createBot() {
    console.log(`[Bot] Connecting to ${settings.server.ip}:${settings.server.port || 25565}...`);
    
    const bot = mineflayer.createBot({
        host: settings.server.ip,
        port: settings.server.port || 25565,
        username: settings['bot-account'].username,
        version: settings.server.version || false,
        auth: 'offline'
    });

    // FORCE INSTANT LOGIN ON SPAWN
    bot.once('spawn', () => {
        console.log("[Bot] Spawned into the world! Sending instant login command...");
        bot.chat('/login iopiopiop');
        
        // Start anti-afk actions if enabled
        if (settings.utils && settings.utils['anti-afk'] && settings.utils['anti-afk'].enabled) {
            bot.setControlState('sneak', settings.utils['anti-afk'].sneak);
        }
    });

    // Auto-reconnect if kicked or disconnected
    bot.on('end', (reason) => {
        console.log(`[Bot] Disconnected: ${reason}. Reconnecting in 10 seconds...`);
        setTimeout(() => createBot(), 10000);
    });

    bot.on('error', (err) => {
        console.error('[Bot] Error encountered: ', err);
    });

    bot.on('kicked', (reason) => {
        console.log('[Bot] Kicked from server: ', reason);
    });
}

// Start the bot web service interface for Render
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('AFK Bot is running 24/7!\n');
});
server.listen(10000, () => {
    console.log('[Server] HTTP server started on port 10000');
    createBot();
});
