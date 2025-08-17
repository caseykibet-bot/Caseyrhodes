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
        if (!text) return citel.reply("Please provide arguments. Usage: .autobio <on/off> | <text> | <interval>");
        
        const args = text.split("|").map(arg => arg.trim());
        const action = args[0].toLowerCase();
        
        if (action === "on") {
            if (args.length < 3) return citel.reply("Please provide bio text and interval. Usage: .autobio on | your bio text | 10");
            
            const bioText = args[1];
            const interval = parseInt(args[2]);
            
            if (isNaN(interval) || interval < 1) return citel.reply("Please provide a valid interval in minutes (minimum 1)");
            
            // Store the settings
            config.AUTO_BIO = {
                enabled: true,
                text: bioText,
                interval: interval * 60 * 1000, // Convert minutes to milliseconds
                lastChanged: 0
            };
            
            // Start the bio rotation
            startBioRotation(Void, citel);
            
            return citel.reply(`Auto-bio enabled! Bio will change every ${interval} minutes.`);
            
        } else if (action === "off") {
            if (config.AUTO_BIO?.enabled === true) {
                config.AUTO_BIO.enabled = false;
                return citel.reply("Auto-bio disabled.");
            } else {
                return citel.reply("Auto-bio wasn't enabled.");
            }
        } else {
            return citel.reply("Invalid action. Use 'on' or 'off'.");
        }
    } catch (error) {
        console.error("Error in autobio command:", error);
        return citel.reply("An error occurred while processing your request.");
    }
});

// Function to handle bio rotation
function startBioRotation(Void, citel) {
    if (config.AUTO_BIO?.enabled !== true) return;
    
    const now = Date.now();
    if (now - config.AUTO_BIO.lastChanged < config.AUTO_BIO.interval) {
        // Not time to change yet, schedule next check
        setTimeout(() => startBioRotation(Void, citel), config.AUTO_BIO.interval - (now - config.AUTO_BIO.lastChanged));
        return;
    }
    
    // Change the bio
    const bioText = config.AUTO_BIO.text;
    Void.updateProfileStatus(bioText)
        .then(() => {
            config.AUTO_BIO.lastChanged = Date.now();
            citel.reply(`Bio updated to: ${bioText}`);
            
            // Schedule next change
            setTimeout(() => startBioRotation(Void, citel), config.AUTO_BIO.interval);
        })
        .catch(error => {
            console.error("Error updating bio:", error);
            citel.reply("Failed to update bio. Retrying in 1 minute.");
            setTimeout(() => startBioRotation(Void, citel), 60000); // Retry after 1 minute
        });
}
