const { cmd } = require('../command');

cmd({
    pattern: "remove",
    alias: ["kick", "k", "out"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber, groupMetadata
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    // Get group metadata to check admin status
    const metadata = groupMetadata || await conn.groupMetadata(from);
    const participants = metadata.participants;
    
    // Check if sender is admin
    const senderJid = m.sender;
    const isAdmin = participants.find(p => p.id === senderJid)?.admin;
    
    if (!isAdmin) return reply("❌ Only group admins can use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If mentioning a user
    } else {
        return reply("❌ Please reply to a message or mention a user to remove.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "remove");
        
        // Combined image + text message
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/y3j3kl.jpg` },
            caption: `✅ Successfully removed @${number}\n\n- Action by admin`,
            mentions: [jid],
            contextInfo: {
                mentionedJid: [jid],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐋𝐈𝐕𝐄🍀',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
    } catch (error) {
        console.error("Remove command error:", error);
        reply("❌ Failed to remove the member.");
    }
});
