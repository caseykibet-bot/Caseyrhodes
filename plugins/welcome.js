const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "welcome",
    alias: ['wel'],
    desc: "Welcome message settings",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('This command is only for the bot owner');
    
    try {
        if (!text) {
            return reply(`*Welcome Command*\n\nUsage:\n• .welcome on - Enable welcome messages\n• .welcome off - Disable welcome messages`);
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            // Add your welcome enable logic here
            return reply('✅ Welcome messages have been enabled');
        } 
        else if (action === 'off') {
            // Add your welcome disable logic here
            return reply('❌ Welcome messages have been disabled');
        } 
        else {
            return reply('Invalid command. Usage:\n• .welcome on\n• .welcome off');
        }
    } catch (e) {
        console.error("Error in welcome command:", e);
        return reply("An error occurred while processing your request.");
    }
});
