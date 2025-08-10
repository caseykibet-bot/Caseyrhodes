const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "delete",
    react: "❌",
    alias: ["del", "remove"],
    desc: "Delete a quoted message",
    category: "group",
    usage: '.del (reply to a message)',
    filename: __filename
},
async (conn, m, { isOwner, isAdmin, reply, quoted, chat }) => {
    try {
        // Check if user has permission (owner or admin)
        if (!isOwner && !isAdmin) return reply("❌ You need to be an admin to use this command.");
        
        // Check if there's a quoted message
        if (!quoted) return reply("🔍 Please reply to the message you want to delete.");
        
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
