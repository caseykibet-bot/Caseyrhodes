const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');
const axios = require("axios");

// List of random emojis to use for blocked numbers
const blockEmojis = ["🚫", "⛔", "🔒", "🔞", "📛", "🚷", "🚯", "🚳", "🚭", "❌", "🛑", "💢", "♨️", "💀", "☠️", "⚠️", "🔞"];

// Helper function to get random emoji
function getRandomBlockEmoji() {
    return blockEmojis[Math.floor(Math.random() * blockEmojis.length)];
}

cmd({
    pattern: "blocklist",
    desc: "View the list of blocked users.",
    category: "privacy",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 You are not the owner!*");

    try {
        // Fetch the block list
        const blockedUsers = await conn.fetchBlocklist();

        if (blockedUsers.length === 0) {
            return reply("📋 Your block list is empty.");
        }

        // Format the blocked users with count and random emojis
        const list = blockedUsers
            .map((user, i) => `${i + 1}. ${getRandomBlockEmoji()} ${user.split('@')[0]}`)
            .join('\n');

        const count = blockedUsers.length;
        const dec = `📋 *Blocked Users* (${count}):\n\n${list}\n\n*Bot Name:* ${config.BOT_NAME}`;

        const verifiedContact = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: `${config.BOT_NAME} Verified ✅`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.BOT_NAME} Verified ✅\nORG:${config.BOT_NAME} TEAM;\nTEL;type=CELL;type=VOICE;waid=${config.MOD_NUMBER}:${config.MOD_NUMBER}\nEND:VCARD`
                }
            }
        };

        await conn.sendMessage(
            from,
            {
                text: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363302677217436@newsletter',
                        newsletterName: `${config.BOT_NAME} Updates`,
                        serverMessageId: Math.floor(Math.random() * 1000)
                    }
                }
            },
            { quoted: verifiedContact }
        );
        
    } catch (err) {
        console.error(err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});
