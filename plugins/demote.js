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
    pattern: "demote",
    alias: ["demoteadmin", "removeadmin"],
    desc: "Demote user from admin position",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, text, mentionedJid, quoted, isGroup, isBotAdmin, isAdmin: isSenderAdmin, isOwner }) => {
    try {
        // Check if it's a group
        if (!isGroup) {
            return await reply('❌ This command can only be used in groups!');
        }

        // DOUBLE CHECK: Verify bot is admin
        const verifiedBotAdmin = await checkBotAdmin(conn, from);
        if (!verifiedBotAdmin) {
            return await reply('❌ I need to be admin to demote users! Please promote me to admin.');
        }

        // Check if sender is admin
        if (!isSenderAdmin && !isOwner) {
            return await reply('❌ Only group admins can use the demote command!');
        }

        let usersToDemote = [];
        
        // Check for mentioned users
        if (mentionedJid && mentionedJid.length > 0) {
            usersToDemote = mentionedJid;
        }
        // Check for replied message
        else if (quoted && quoted.sender) {
            usersToDemote = [quoted.sender];
        }
        
        // If no user found through either method
        if (usersToDemote.length === 0) {
            return await reply('❌ Please mention the user or reply to their message to demote!\nExample: .demote @user');
        }

        // Demote users
        await conn.groupParticipantsUpdate(from, usersToDemote, "demote");
        
        // Get usernames for each demoted user
        const usernames = usersToDemote.map(jid => `@${jid.split('@')[0]}`);

        const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
            `👤 *Demoted User${usersToDemote.length > 1 ? 's' : ''}:*\n` +
            `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Demoted By:* @${sender.split('@')[0]}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;
        
        await conn.sendMessage(from, { 
            text: demotionMessage,
            mentions: [...usersToDemote, sender]
        });

    } catch (error) {
        console.error('Demote command error:', error);
        
        if (error.message?.includes('not authorized') || error.message?.includes('permission')) {
            await reply('❌ I don\'t have permission to demote users. Make sure I\'m admin with proper permissions.');
        } else if (error.message?.includes('not in group')) {
            await reply('❌ The specified user is not in this group.');
        } else if (error.message?.includes('401') || error.message?.includes('auth')) {
            await reply('❌ Authentication error. Please check bot permissions.');
        } else {
            await reply('❌ Failed to demote user(s). Please try again.');
        }
    }
});
