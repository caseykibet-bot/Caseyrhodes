const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')

// 1. Shutdown Bot
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    await reply("✅ Bot is shutting down...");
    await sleep(1000);
    process.exit(0);
});

// 2. Broadcast Message to All Groups
cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (args.length === 0) return reply("📢 Please provide a message to broadcast.");
    
    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    
    await reply("✅ Starting broadcast to all groups...");
    
    let successCount = 0;
    let failCount = 0;
    
    for (const groupId of groups) {
        try {
            await conn.sendMessage(groupId, { text: message }, { quoted: mek });
            successCount++;
        } catch (error) {
            failCount++;
            console.error(`Failed to send to ${groupId}:`, error);
        }
    }
    
    reply(`✅ Broadcast completed!\n\n📢 Success: ${successCount} groups\n❌ Failed: ${failCount} groups`);
});

// 8. Group JIDs List
cmd({
    pattern: "gjid",
    desc: "Get the list of JIDs for all groups the bot is part of.",
    category: "owner",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    
    await reply("✅ Fetching group JIDs...");
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups).join('\n');
    
    reply(`✅ Here are all group JIDs:\n\n${groupJids}\n\n📝 Total: ${Object.keys(groups).length} groups`);
});

// block
cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted) return reply("❌ Please reply to the user you want to block.");
    
    const user = quoted.sender;
    try {
        await reply("✅ Blocking user...");
        await conn.updateBlockStatus(user, 'block');
        reply(`🚫 Success! User ${user.split('@')[0]} has been blocked.`);
    } catch (error) {
        reply(`❌ Error blocking user: ${error.message}`);
    }
});

// Unblock User
cmd({
    pattern: "unblock",
    desc: "Unblock a user.",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted) return reply("❌ Please reply to the user you want to unblock.");
    
    const user = quoted.sender;
    try {
        await reply("✅ Unblocking user...");
        await conn.updateBlockStatus(user, 'unblock');
        reply(`✅ Success! User ${user.split('@')[0]} has been unblocked.`);
    } catch (error) {
        reply(`❌ Error unblocking user: ${error.message}`);
    }
});
