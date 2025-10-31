const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "ban"],
    desc: "Kick user from group",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, text, mentionedJid, quoted, isGroup, isBotAdmin, isAdmin: isSenderAdmin, isOwner }) => {
    try {
        // Check if it's a group
        if (!isGroup) {
            return await reply('❌ This command can only be used in groups!');
        }

        // Check if bot is admin
        if (!isBotAdmin) {
            return await reply('❌ I need to be admin to kick users!');
        }

        // Check if sender is admin or owner
        if (!isSenderAdmin && !isOwner) {
            return await reply('❌ Only group admins or bot owner can use the kick command!');
        }

        let usersToKick = [];
        
        // Check for mentioned users
        if (mentionedJid && mentionedJid.length > 0) {
            usersToKick = mentionedJid;
        }
        // Check for replied message
        else if (quoted && quoted.sender) {
            usersToKick = [quoted.sender];
        }
        
        // If no user found through either method
        if (usersToKick.length === 0) {
            return await reply('❌ Please mention the user or reply to their message to kick!\nExample: .kick @user');
        }

        // Get bot's ID
        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        // Check if any of the users to kick is the bot itself
        if (usersToKick.includes(botId)) {
            return await reply("🤖 I can't kick myself!");
        }

        // Check if trying to kick owner
        if (usersToKick.includes(conn.user.id) || usersToKick.some(user => user.includes(conn.user.id))) {
            return await reply("👑 I can't kick my owner!");
        }

        // Kick users
        await conn.groupParticipantsUpdate(from, usersToKick, "remove");
        
        // Get usernames for each kicked user
        const usernames = usersToKick.map(jid => `@${jid.split('@')[0]}`);
        
        const kickMessage = `🚫 *USER${usersToKick.length > 1 ? 'S' : ''} KICKED*\n\n` +
            `👤 *Kicked User${usersToKick.length > 1 ? 's' : ''}:*\n` +
            `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `⚡ *Action By:* @${sender.split('@')[0]}\n` +
            `📅 *Time:* ${new Date().toLocaleString()}`;

        await conn.sendMessage(from, { 
            text: kickMessage,
            mentions: [...usersToKick, sender]
        });

    } catch (error) {
        console.error('Kick command error:', error);
        
        if (error.message?.includes('not authorized') || error.message?.includes('permission')) {
            await reply('❌ I don\'t have permission to kick users. Make sure I\'m admin with proper permissions.');
        } else if (error.message?.includes('not in group')) {
            await reply('❌ The specified user is not in this group.');
        } else if (error.message?.includes('401') || error.message?.includes('auth')) {
            await reply('❌ Authentication error. Please check bot permissions.');
        } else {
            await reply('❌ Failed to kick user(s). Please try again.');
        }
    }
});
