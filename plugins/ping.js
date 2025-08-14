const config = require('../config');
const { cmd, commands } = require('../command');

// Verification contact object
const verifiedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "CASEYRHODES VERIFIED",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:CASEYRHODES\nORG:Verified Business;\nTEL;type=CELL;type=VOICE;waid=254112192119:+254112192119\nEND:VCARD`
        }
    }
};

cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        // Current timestamp
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timestamp = `${hours}:${minutes}`;

        await conn.sendMessage(from, {
            text: `*CASEYRHODES-XMD: ${responseTime.toFixed(2)}ms*\n${timestamp}`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                // Newsletter info (shows "View channel")
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: "CASEYRHODES-XMD",
                    serverMessageId: 143
                },
                // Verified Business header
                externalAdReply: {
                    title: "Verified Business",
                    body: "CASEYRHODES-TECH",
                    thumbnail: 'https://files.catbox.moe/y3j3kl.jpg', // Your logo image
                    mediaType: 2,
                    mediaUrl: '',
                    sourceUrl: '',
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mek });

        // Send verified contact separately
        await conn.sendMessage(from, {
            contacts: {
                displayName: "CASEYRHODES",
                contacts: [verifiedContact]
            }
        });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
