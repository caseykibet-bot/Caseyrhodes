const config = require('../config');
const { cmd } = require('../command');

// Contact message for verified context
const verifiedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "CASEYRHODES VERIFIED ✅",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: Caseyrhodes VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=254112192119:+254112192119\nEND:VCARD"
        }
    }
};

cmd({
    pattern: "anticall",
    alias: ["callblock", "togglecall"],
    desc: "Manages the anti-call feature. Use: .anticall [on/off]",
    category: "owner",
    react: "📞",
    filename: __filename,
    fromMe: true
},
async (conn, mek, m, { isOwner, reply, from, sender, args, prefix }) => {
    try {
        if (!isOwner) {
            return await reply("🚫 This command is for the bot owner only.");
        }

        let currentStatus = config.getSetting('ANTICALL') || false;
        const arg = args[0] ? args[0].toLowerCase() : '';

        let replyText;
        let finalReactionEmoji = '📞';

        if (arg === 'on') {
            if (currentStatus) {
                replyText = `📞 Anti-call feature is already *enabled*.`;
                finalReactionEmoji = 'ℹ️';
            } else {
                config.setSetting('ANTICALL', true);
                replyText = `📞 Anti-call feature has been *enabled*!`;
                finalReactionEmoji = '✅';
            }
        } else if (arg === 'off') {
            if (!currentStatus) {
                replyText = `📞 Anti-call feature is already *disabled*.`;
                finalReactionEmoji = 'ℹ️';
            } else {
                config.setSetting('ANTICALL', false);
                replyText = `📞 Anti-call feature has been *disabled*!`;
                finalReactionEmoji = '❌';
            }
        } else if (arg === '') {
            const statusEmoji = currentStatus ? '✅ ON' : '❌ OFF';
            replyText = `
*📞 Anti-Call Feature Manager*

Current Status: *${statusEmoji}*

To turn On:
  \`\`\`${prefix}anticall on\`\`\`
To turn Off:
  \`\`\`${prefix}anticall off\`\`\`
            `.trim();
            finalReactionEmoji = '❓';
        } else {
            replyText = `❌ Invalid argument. Please use \`${prefix}anticall on\`, \`${prefix}anticall off\`, or just \`${prefix}anticall\` for help.`;
            finalReactionEmoji = '❓';
        }

        // React to the command message
        await conn.sendMessage(from, {
            react: { text: finalReactionEmoji, key: mek.key }
        });

        // Send the status/help reply with newsletter context
        await conn.sendMessage(from, {
            text: replyText,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: "𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "CASEYRHODES TECH",
                    body: "Anti-Call Manager",
                    thumbnail: config.get("BOT_LOGO"),
                    mediaType: 1,
                    mediaUrl: "",
                    sourceUrl: config.get("WEBSITE") || "https://github.com/caseyrhodes-tech"
                }
            }
        }, { quoted: verifiedContact });

    } catch (e) {
        console.error("Error in anticall command:", e);
        await reply(`❌ An error occurred: ${e.message}`);
    }
});
