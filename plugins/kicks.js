const { cmd } = require('../command');

// Function to check if bot is admin
async function checkBotAdmin(conn, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        
        const metadata = await conn.groupMetadata(chatId);
        const botId = conn.user.id;
        const botParticipant = metadata.participants.find(p => p.id === botId);
        
        return botParticipant ? ['admin', 'superadmin'].includes(botParticipant.admin) : false;
    } catch (error) {
        console.error('Error checking bot admin status:', error);
        return false;
    }
}

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

        // DOUBLE CHECK: Verify bot is admin (in case plugin parameter is wrong)
        const verifiedBotAdmin = await checkBotAdmin(conn, from);
        if (!verifiedBotAdmin) {
            return await reply('❌ I need to be admin to kick users! Please promote me to admin.');
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
        const botId = conn.user.id;

        // Check if any of the users to kick is the bot itself
        if (usersToKick.some(user => user === botId)) {
            return await reply("🤖 I can't kick myself!");
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
        } else if (error.message?.includes('403')) {
            await reply('❌ Forbidden: Cannot kick users with higher privileges.');
        } else {
            await reply('❌ Failed to kick user(s). Please try again.');
        }
    }
});
