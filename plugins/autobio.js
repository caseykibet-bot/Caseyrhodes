const { cmd } = require("../command");
const config = require("../config");

// Add this to your command handler
cmd({
    pattern: "autobio",
    desc: "Toggle automatic biography updates on/off",
    category: "owner",
    fromMe: true, // Only owner can use this
}, async (message, match) => {
    try {
        const settings = await getSettings();
        const current = settings.autobio || "off"; // Default to off if not set
        
        if (!match) {
            return message.reply(`😇 Autobio is currently *${current.toUpperCase()}*`);
        }
        
        const text = match.toLowerCase().trim();
        
        if (!["on", "off"].includes(text)) {
            return message.reply("Usage: autobio on/off");
        }
        
        if (text === current) {
            return message.reply(`✅ Autobio is already *${text.toUpperCase()}*`);
        }
        
        await updateSetting("autobio", text);
        return message.reply(`✅ Autobio has been turned *${text.toUpperCase()}*`);
        
    } catch (error) {
        console.error("Autobio command error:", error);
        return message.reply("❌ An error occurred while updating autobio settings");
    }
});

// You'll need these helper functions (add them if they don't exist)
async function getSettings() {
    // Implementation to get settings from database or config
    // Example: return await db.get("settings") || {};
}

async function updateSetting(key, value) {
    // Implementation to update setting in database or config
    // Example: 
    // const settings = await getSettings();
    // settings[key] = value;
    // await db.set("settings", settings);
}
