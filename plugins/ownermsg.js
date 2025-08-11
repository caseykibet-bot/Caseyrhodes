const { cmd } = require('../command');

cmd({
    pattern: "block",
    desc: "Blocks this chat",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, m, { reply, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    
    if (m.sender !== botOwner) {
        await react("❌");
        return reply("_Only the bot owner can use this command._");
    }

    try {
        const chatId = m.chat; // Get current chat ID
        await reply(`_Blocking this chat..._`);
        await conn.updateBlockStatus(chatId, "block");
        await react("✅");
        reply(`_Successfully blocked this chat_`);
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply(`_Failed to block this chat._\nError: ${error.message}_`);
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks this chat",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, m, { reply, react }) => {
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.sender !== botOwner) {
        await react("❌");
        return reply("_Only the bot owner can use this command._");
    }

    try {
        const chatId = m.chat; // Get current chat ID
        await reply(`_Unblocking this chat..._`);
        await conn.updateBlockStatus(chatId, "unblock");
        await react("✅");
        reply(`_Successfully unblocked this chat_`);
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply(`_Failed to unblock this chat._\nError: ${error.message}_`);
    }
});
