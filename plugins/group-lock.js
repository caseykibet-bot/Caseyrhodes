const { cmd } = require('../command');
const { formatMessage } = require('../lib/functions'); // Adjust path as needed
const config = require('../config'); // Adjust path as needed

cmd({
    pattern: "close",
    desc: "Close the group (admins only)",
    category: "group",
    react: "🔒",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, isGroup, isBotAdmin, isSenderGroupAdmin, isOwner }) => {
    try {
        // React to the command
        await conn.sendMessage(sender, { react: { text: '🔒', key: mek.key } });
        
        // Check if it's a group
        if (!isGroup) {
            return await reply('❌ *This command can only be used in groups, sweetie!* 😘');
        }
        
        // Check if user has permission
        if (!isSenderGroupAdmin && !isOwner) {
            return await reply('❌ *Only group admins or bot owner can close the group, darling!* 😘');
        }
        
        // Check if bot is admin
        if (!isBotAdmin) {
            return await reply('❌ *I need to be an admin to close the group, honey!* 😘');
        }
        
        // Close the group
        await conn.groupSettingUpdate(from, 'announcement');
        
        // Send success message
        await reply(
            formatMessage(
                '🔒 GROUP CLOSED',
                'Group is now closed! Only admins can send messages.\n\nUse *.open* to open the group again.',
                config.BOT_FOOTER || 'Powered by ALI-XMD'
            )
        );
        
    } catch (error) {
        console.error('Close command error:', error);
        await reply(`❌ *Failed to close group, love!* 😢\nError: ${error.message || 'Unknown error'}`);
    }
});
