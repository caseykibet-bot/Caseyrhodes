// Block Current Chat
cmd({
    pattern: "block2",
    desc: "Block the current user/group.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    
    try {
        const chatId = m.isGroup ? from : m.key.participant || m.key.remoteJid;
        await reply(`🚫 Blocking ${m.isGroup ? 'group' : 'user'}...`);
        await conn.updateBlockStatus(chatId, 'block');
        reply(`✅ Success! ${m.isGroup ? 'Group' : 'User'} has been blocked.`);
    } catch (error) {
        reply(`❌ Error blocking: ${error.message}`);
    }
});

// Unblock Current Chat
cmd({
    pattern: "unblock",
    desc: "Unblock the current user/group.",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    
    try {
        const chatId = m.isGroup ? from : m.key.participant || m.key.remoteJid;
        await reply(`✅ Unblocking ${m.isGroup ? 'group' : 'user'}...`);
        await conn.updateBlockStatus(chatId, 'unblock');
        reply(`✅ Success! ${m.isGroup ? 'Group' : 'User'} has been unblocked.`);
    } catch (error) {
        reply(`❌ Error unblocking: ${error.message}`);
    }
});
