const fs = require('fs');
const path = require('path');
const {cmd, commands} = require('../command');

// Path for welcome.json in project root
const welcomePath = path.join(__dirname, '..', 'welcome.json');

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
        // Check if used in group
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) return reply('This command can only be used in groups!');

        if (!text) {
            return reply(`*Welcome Command*\n\nUsage:\n• .welcome on - Enable welcome messages\n• .welcome off - Disable welcome messages`);
        }
        
        const action = text.toLowerCase().trim();
        let welcomeData = {};
        
        // Load existing data
        try {
            if (fs.existsSync(welcomePath)) {
                welcomeData = JSON.parse(fs.readFileSync(welcomePath, 'utf8'));
            }
        } catch (e) {
            console.error('Error reading welcome.json:', e);
        }

        if (action === 'on') {
            // Enable for this group
            welcomeData[from] = true;
            fs.writeFileSync(welcomePath, JSON.stringify(welcomeData, null, 2));
            return reply('✅ Welcome messages enabled for this group');
        } 
        else if (action === 'off') {
            // Disable for this group
            delete welcomeData[from];
            fs.writeFileSync(welcomePath, JSON.stringify(welcomeData, null, 2));
            return reply('❌ Welcome messages disabled for this group');
        } 
        else {
            return reply('Invalid command. Usage:\n• .welcome on\n• .welcome off');
        }
    } catch (e) {
        console.error("Error in welcome command:", e);
        return reply("An error occurred while processing your request.");
    }
});
