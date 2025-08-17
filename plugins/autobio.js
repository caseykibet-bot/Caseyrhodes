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
        if (!text) return citel.reply("❌ Please provide arguments.\nUsage: .autobio on | your bio text | minutes\nExample: .autobio on | Coding life | 30");

        // Split by | but ignore empty splits
        const args = text.split("|").map(arg => arg.trim()).filter(arg => arg);
        
        if (args.length < 1) return citel.reply("❌ Invalid command format");
        
        const action = args[0].toLowerCase();
        
        if (action === "on") {
            if (args.length < 3) return citel.reply("❌ Missing arguments.\nUsage: .autobio on | your bio text | minutes\nExample: .autobio on | Hello World | 15");
            
            const bioText = args[1];
            const intervalInput = args[2];
            
            // Check if interval is in HH:MM format and convert to minutes
            let intervalMinutes;
            if (intervalInput.includes(":")) {
                const [hours, mins] = intervalInput.split(":").map(Number);
                if (isNaN(hours) || isNaN(mins)) {
                    return citel.reply("❌ Invalid time format. Use either minutes (30) or HH:MM (1:30)");
                }
                intervalMinutes = hours * 60 + mins;
            } else {
                intervalMinutes = parseInt(intervalInput);
            }
            
            if (isNaN(intervalMinutes) || intervalMinutes < 1) {
                return citel.reply("❌ Interval must be a positive number (minutes) or HH:MM format");
            }

            // Initialize if doesn't exist
            if (!config.AUTO_BIO) config.AUTO_BIO = {};
            
            // Store settings
            config.AUTO_BIO = {
                enabled: true,
                text: bioText,
                interval: intervalMinutes * 60 * 1000, // Convert to milliseconds
                lastChanged: 0
            };
            
            // Start rotation
            startBioRotation(Void, citel);
            
            return citel.reply(`✅ Auto-bio enabled!\n"${bioText}"\nUpdating every ${intervalMinutes} minutes`);
            
        } else if (action === "off") {
            if (config.AUTO_BIO?.enabled) {
                config.AUTO_BIO.enabled = false;
                return citel.reply("✅ Auto-bio disabled");
            }
            return citel.reply("ℹ️ Auto-bio wasn't enabled");
        } else {
            return citel.reply("❌ Invalid action. Use 'on' or 'off'");
        }
    } catch (error) {
        console.error("Autobio error:", error);
        return citel.reply("❌ Command failed. Please check format:\n.autobio on | text | minutes\nOr: .autobio off");
    }
});

// Bio rotation function
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
            setTimeout(() => startBioRotation(Void, citel), 60000); // Retry in 1 minute
        });
}
