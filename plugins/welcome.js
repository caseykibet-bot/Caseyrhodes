const fs = require('fs');
const { fetchJson } = require('../lib/groupevents');
const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "welcome",
    alias: ['wel'],
    desc: "Welcome message settings",
    category: "misc",
    filename: __filename,
    usage: ".welcome on/off - Enable/disable welcome messages"
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('This command is only for the bot owner');
    
    try {
        if (!text) {
            const currentStatus = config.welcomeEnabled ? 'enabled' : 'disabled';
            return reply(
                `*Welcome Message Settings*\n\n` +
                `Current status: ${currentStatus}\n\n` +
                `Usage:\n` +
                `• .welcome on - Enable welcome messages\n` +
                `• .welcome off - Disable welcome messages`
            );
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            // Enable welcome messages
            config.welcomeEnabled = true;
            // You might want to save this to a config file
            // fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
            return reply('✅ Welcome messages have been enabled');
        } 
        else if (action === 'off') {
            // Disable welcome messages
            config.welcomeEnabled = false;
            // You might want to save this to a config file
            // fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
            return reply('❌ Welcome messages have been disabled');
        } 
        else {
            return reply('Invalid option. Usage:\n• .welcome on\n• .welcome off');
        }
    } catch (e) {
        console.error("Error in welcome command:", e);
        return reply("An error occurred while processing your request.");
    }
});
