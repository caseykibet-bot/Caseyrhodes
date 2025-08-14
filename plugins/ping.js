const config = {
    image: "https://i.imgur.com/3QZ2JQj.png" // Sample verified business logo URL
};
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

        // Random reaction emoji
        const emojis = ['⚡', '🚀', '💨', '🎯', '💎', '🏆'];
        const reactionEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await conn.sendMessage(from, {
            react: { text: reactionEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        // Get current timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        await conn.sendMessage(from, {
            text: `*CASEYRHODES-XMD: ${responseTime.toFixed(2)}ms* \n${timestamp}`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: "CASEYRHODES-XMD",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "Verified Business",
                    body: "CASEYRHODES-TECH",
                    thumbnailUrl: config.image,
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: mek });

        // Send verified contact separately
        await conn.sendMessage(from, {
            contacts: {
                displayName: "CASEYRHODES VERIFIED",
                contacts: [verifiedContact]
            }
        });

    } catch (e) {
        console.error("Ping command error:", e);
        await conn.sendMessage(from, { 
            text: `An error occurred: ${e.message}` 
        }, { quoted: mek });
    }
});
