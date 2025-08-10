const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "delete",
    react: "❌",
    alias: ["del", "remove"],
    desc: "Delete a quoted message",
    category: "utility",
    usage: '.del (reply to a message)',
    filename: __filename
},
async (conn, m, { isOwner, isAdmin, reply, quoted, chat }) => {
    try {
        // Check if there's a quoted message
        if (!quoted) return reply("🔍 Please reply to the message you want to delete.");
        
        // For group chats, check if user has permission (owner or admin)
        if (m.isGroup && !isOwner && !isAdmin) {
            return reply("❌ You need to be an admin to use this command in groups.");
        }
        
        // Delete the message
        await conn.sendMessage(chat, {
            delete: {
                remoteJid: chat,
                fromMe: quoted.fromMe,
                id: quoted.id,
                participant: quoted.sender
            }
        });
        
    } catch (e) {
        console.error('Error in delete command:', e);
        reply("❌ Failed to delete the message. Please try again.");
    }
});
