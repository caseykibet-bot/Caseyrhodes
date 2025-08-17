const { cmd } = require("../command");
const config = require("../config");

// Auto-bio command
cmd({
    pattern: "autobio",
    desc: "Set an automatic rotating bio",
    category: "utility",
    filename: __filename,
    use: '<on/off> | <text> | <interval in minutes>'
}, async (Void, citel, text) => {
    try {
        if (!text) return citel.reply("❌ Please specify 'on' or 'off'");
        
        const args = text.split("|").map(arg => arg.trim());
        const action = args[0].toLowerCase();
        
        // Handle OFF command
        if (action === "off") {
            if (config.AUTO_BIO?.enabled) {
                config.AUTO_BIO.enabled = false;
                return citel.reply("✅ Auto-bio disabled");
            }
            return citel.reply("ℹ️ Auto-bio wasn't enabled");
        }
        
        // Handle ON command
        if (action === "on") {
            if (args.length < 3) {
                return citel.reply("❌ Missing arguments for 'on'\nUsage: .autobio on | text | minutes\nExample: .autobio on | Hello World | 30");
            }
            
            const bioText = args[1];
            const intervalInput = args[2];
            
            let intervalMinutes;
            if (intervalInput.includes(":")) {
                const [hours, mins] = intervalInput.split(":").map(Number);
                if (isNaN(hours) || isNaN(mins)) {
                    return citel.reply("❌ Invalid time format. Use minutes (30) or HH:MM (1:30)");
                }
                intervalMinutes = hours * 60 + mins;
            } else {
                intervalMinutes = parseInt(intervalInput);
                if (isNaN(intervalMinutes)) {
                    return citel.reply("❌ Interval must be a number");
                }
            }
            
            if (intervalMinutes < 1) {
                return citel.reply("❌ Interval must be at least 1 minute");
            }

            // Initialize config if needed
            if (!config.AUTO_BIO) config.AUTO_BIO = {};
            
            config.AUTO_BIO = {
                enabled: true,
                text: bioText,
                interval: intervalMinutes * 60 * 1000,
                lastChanged: 0
            };
            
            startBioRotation(Void, citel);
            return citel.reply(`✅ Auto-bio enabled!\n"${bioText}"\nUpdating every ${intervalMinutes} minutes`);
        }
        
        // If we get here, the action wasn't 'on' or 'off'
        return citel.reply("❌ Invalid action. Use 'on' or 'off'");
        
    } catch (error) {
        console.error("Autobio error:", error);
        return citel.reply("❌ An unexpected error occurred");
    }
});

// Bio rotation function remains the same
function startBioRotation(Void, citel) {
    if (!config.AUTO_BIO?.enabled) return;
    
    const now = Date.now();
    if (now - config.AUTO_BIO.lastChanged < config.AUTO_BIO.interval) {
        setTimeout(() => startBioRotation(Void, citel), 
                  config.AUTO_BIO.interval - (now - config.AUTO_BIO.lastChanged));
        return;
    }
    
    Void.updateProfileStatus(config.AUTO_BIO.text)
        .then(() => {
            config.AUTO_BIO.lastChanged = now;
            setTimeout(() => startBioRotation(Void, citel), config.AUTO_BIO.interval);
        })
        .catch(err => {
            console.error("Bio update failed:", err);
            setTimeout(() => startBioRotation(Void, citel), 60000);
        });
}
