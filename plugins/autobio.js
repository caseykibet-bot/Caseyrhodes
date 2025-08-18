const { cmd } = require("../command");
const config = require("../config");

// Auto-Bio Manager
let autoBioEnabled = config.AUTO_BIO === 'true';
let bioInterval = null;
const botName = config.BOT_NAME || "MyBot";

// Format uptime
function formatUptime(seconds) {
    seconds = Math.floor(seconds);
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Update bio function
async function updateBio() {
    try {
        const uptime = formatUptime(process.uptime());
        const status = `🔰 ${botName} is Live! 🎉\n\n🕒 Uptime: ${uptime}\n\n${botName}`;
        await conn.updateProfileStatus(status);
        console.log('[Auto-Bio] Updated successfully');
    } catch (err) {
        console.error('[Auto-Bio] Update failed:', err.message);
    }
}

// Start auto-bio updates
function startAutoBio() {
    if (bioInterval) return; // Already running
    
    // Initial update
    updateBio();
    
    // Set interval for updates (every 60 seconds)
    bioInterval = setInterval(updateBio, 60000);
    console.log('[Auto-Bio] Started automatic updates');
}

// Stop auto-bio updates
function stopAutoBio() {
    if (bioInterval) {
        clearInterval(bioInterval);
        bioInterval = null;
        console.log('[Auto-Bio] Stopped automatic updates');
    }
}

// Initialize based on config
if (autoBioEnabled) {
    startAutoBio();
}

// Toggle command
cmd(/^!bio (on|off)$/i, async (m, args) => {
    const [_, state] = args;
    
    if (state === 'on') {
        if (!autoBioEnabled) {
            autoBioEnabled = true;
            startAutoBio();
            await m.reply('✅ Auto-Bio has been enabled');
        } else {
            await m.reply('ℹ️ Auto-Bio is already enabled');
        }
    } 
    else if (state === 'off') {
        if (autoBioEnabled) {
            autoBioEnabled = false;
            stopAutoBio();
            await m.reply('❌ Auto-Bio has been disabled');
        } else {
            await m.reply('ℹ️ Auto-Bio is already disabled');
        }
    }
});

// Status command
cmd(/^!bio status$/i, async (m) => {
    const status = autoBioEnabled ? 'enabled ✅' : 'disabled ❌';
    await m.reply(`Auto-Bio is currently ${status}`);
});
