const { cmd } = require('../command');
const { formatMessage } = require('../../lib/functions'); // Adjust path as needed
const config = require('../../config'); // Adjust path as needed

cmd({
    pattern: "close",
    desc: "Close the group (admins only)",
    category: "group",
    react: "🔒",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, isGroup, isBotAdmin, isSenderGroupAdmin, isOwner, fakevCard }) => {
    try {
        // React to the command
        await conn.sendMessage(sender, { react: { text: '🔒', key: mek.key } });
        
        // Check if it's a group
        if (!isGroup) {
            return await reply('❌ *This command can only be used in groups, sweetie!* 😘', { quoted: fakevCard });
        }
        
        // Check if user has permission
        if (!isSenderGroupAdmin && !isOwner) {
            return await reply('❌ *Only group admins or bot owner can close the group, darling!* 😘', { quoted: fakevCard });
        }
        
        // Check if bot is admin
        if (!isBotAdmin) {
            return await reply('❌ *I need to be an admin to close the group, honey!* 😘', { quoted: fakevCard });
        }
        
        // Close the group
        await conn.groupSettingUpdate(from, 'announcement');
        
        // Send success message without buttons
        await reply(
            formatMessage(
                '🔒 GROUP CLOSED',
                'Group is now closed! Only admins can send messages.\n\nUse *.open* to open the group again.',
                config.BOT_FOOTER || 'Powered by ALI-XMD'
            ),
            { quoted: fakevCard }
        );
        
    } catch (error) {
        console.error('Close command error:', error);
        await reply(`❌ *Failed to close group, love!* 😢\nError: ${error.message || 'Unknown error'}`, { quoted: fakevCard });
    }
});
