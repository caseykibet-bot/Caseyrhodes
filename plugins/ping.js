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
            displayName: "CASEYRHODES VERIFIED ✅",
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

        const text = `> *𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒-𝐗𝐌𝐃: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                // Newsletter info
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: "ᴄᴀsᴇʏʀʜᴏᴅᴇs-xᴍᴅ 👻",
                    serverMessageId: 143
                },
                // Verified contact reference
                externalAdReply: {
                    title: "Verified Business",
                    body: "CASEYRHODES-TECH",
                    thumbnail: config.image, // Use your config image
                    mediaType: 2,
                    mediaUrl: '',
                    sourceUrl: '',
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            },
            contacts: {
                displayName: "CASEYRHODES",
                contacts: [verifiedContact]
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
