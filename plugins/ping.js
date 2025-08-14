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
async (Void, citel, text, { from }) => {
    try {
        const start = Date.now();
        
        // Reaction emojis
        await Void.sendMessage(citel.chat, {
            react: {
                text: "⚡",
                key: citel.key
            }
        });

        const end = Date.now();
        const responseTime = (end - start) / 1000;
        
        // Get current time HH:MM format
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timestamp = `${hours}:${minutes}`;

        // Main ping response
        await Void.sendMessage(citel.chat, {
            text: `*CASEYRHODES-XMD: ${responseTime.toFixed(2)}ms*\n${timestamp}`,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: "CASEYRHODES-XMD",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "Verified Business",
                    body: "CASEYRHODES-TECH",
                    thumbnail: config.image,
                    mediaType: 2,
                    showAdAttribution: true
                }
            }
        }, { quoted: citel });

        // Send verified contact
        await Void.sendMessage(citel.chat, {
            contacts: {
                displayName: "CASEYRHODES",
                contacts: [verifiedContact]
            }
        });

    } catch (error) {
        console.error("Ping command error:", error);
        await Void.sendMessage(citel.chat, {
            text: `An error occurred: ${error.message}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: citel });
    }
});
