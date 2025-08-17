const { cmd } = require("../command");
const config = require("../config");

// Store active intervals to clear them later
const activeIntervals = new Map();

cmd({
    pattern: "autobio",
    desc: "Automatically update your bio at intervals",
    category: "utility",
    filename: __filename,
    use: '<on/off> | <text> | <interval>'
}, async (Void, citel, text) => {
    try {
        if (!text) return citel.reply("❌ Please specify 'on' or 'off'");

        const args = text.split("|").map(arg => arg.trim());
        const action = args[0].toLowerCase();

        // Handle OFF command
        if (action === "off") {
            if (activeIntervals.has(citel.user.id)) {
                clearInterval(activeIntervals.get(citel.user.id));
                activeIntervals.delete(citel.user.id);
                return citel.reply("✅ Auto-bio disabled");
            }
            return citel.reply("ℹ️ Auto-bio wasn't enabled for you");
        }

        // Handle ON command
        if (action === "on") {
            if (args.length < 3) {
                return citel.reply("❌ Format: .autobio on | text | minutes\nExample: .autobio on | Coding 🚀 | 30");
            }

            const bioText = args[1];
            const intervalInput = args[2];
            let intervalMinutes;

            // Parse time input (supports both 30 and 1:30 formats)
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
                return citel.reply("❌ Minimum interval is 1 minute");
            }

            // Clear existing interval if any
            if (activeIntervals.has(citel.user.id)) {
                clearInterval(activeIntervals.get(citel.user.id));
            }

            // First immediate update
            await updateBio(Void, citel.user.id, bioText);

            // Set up recurring updates
            const intervalMs = intervalMinutes * 60 * 1000;
            const intervalId = setInterval(
                () => updateBio(Void, citel.user.id, bioText),
                intervalMs
            );

            activeIntervals.set(citel.user.id, intervalId);

            return citel.reply(
                `✅ Auto-bio activated!\n` +
                `📝 Bio: "${bioText}"\n` +
                `⏱️ Updating every ${intervalMinutes} minutes`
            );
        }

        return citel.reply("❌ Invalid action. Use 'on' or 'off'");

    } catch (error) {
        console.error("Auto-bio error:", error);
        return citel.reply("❌ An error occurred. Please try again.");
    }
});

async function updateBio(Void, userId, bioText) {
    try {
        await Void.updateProfileStatus(bioText);
        console.log(`[${new Date().toISOString()}] Bio updated for user ${userId}`);
    } catch (error) {
        console.error(`Bio update failed for user ${userId}:`, error);
    }
}

// Clean up on process exit
process.on("exit", () => {
    activeIntervals.forEach(interval => clearInterval(interval));
});
