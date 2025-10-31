const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["demoteadmin", "removeadmin"],
    desc: "Demote user from admin position",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, text, mentionedJid, quoted, isGroup, isBotAdmin, isAdmin: isSenderAdmin }) => {
    try {
        // Check if it's a group
        if (!isGroup) {
            return await reply('❌ This command can only be used in groups!');
        }

        // Check if bot is admin
        if (!isBotAdmin) {
            return await reply('❌ I need to be admin to demote users!');
        }

        // Check if sender is admin
        if (!isSenderAdmin) {
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

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Demote users
        await conn.groupParticipantsUpdate(from, usersToDemote, "demote");
        
        // Get usernames for each demoted user
        const usernames = usersToDemote.map(jid => `@${jid.split('@')[0]}`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

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
        
        if (error.message?.includes('429') || error.data === 429) {
            await reply('❌ Rate limit reached. Please try again in a few seconds.');
        } else if (error.message?.includes('not authorized') || error.message?.includes('permission')) {
            await reply('❌ I don\'t have permission to demote users. Make sure I\'m admin with proper permissions.');
        } else if (error.message?.includes('not in group')) {
            await reply('❌ The specified user is not in this group.');
        } else {
            await reply('❌ Failed to demote user(s). Please try again.');
        }
    }
});

// Function to handle automatic demotion detection (for group events)
async function handleDemotionEvent(conn, groupId, participants, author) {
    try {
        if (!groupId || !participants) {
            console.log('Invalid groupId or participants:', { groupId, participants });
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get usernames for demoted participants
        const demotedUsernames = participants.map(jid => `@${jid.split('@')[0]}`);

        let demotedBy;
        let mentionList = [...participants];

        if (author) {
            demotedBy = `@${author.split('@')[0]}`;
            mentionList.push(author);
        } else {
            demotedBy = 'System';
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
            `👤 *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${demotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Demoted By:* ${demotedBy}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;
        
        await conn.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.message?.includes('429') || error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

module.exports = {
    handleDemotionEvent
};
