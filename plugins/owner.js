const { cmd } = require('../command');
const config = require('../config');

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

cmd({
    pattern: "owner",
    alias: ["creator", "dev"],
    react: "🦋",
    desc: "Get owner number and bot info",
    category: "main",
    filename: __filename,
},
async (conn, mek, m, { from, reply, prefix }) => {
    try {
        const ownerNumber = config.owner || "+1234567890";
        const ownerName = config.OWNER_NAME || "CASEYRHODES XMD DEVELOPER";
        
        // Get memory usage
        const used = process.memoryUsage();
        const usedMem = Math.round(used.heapUsed / 1024 / 1024);
        const totalMem = Math.round(used.heapTotal / 1024 / 1024);

        // Create vcard
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:CASEYRHODES-TECH BOT;
TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}
END:VCARD`;

        // Send contact card first
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard: vcard }]
            }
        }, { quoted: mek });

        // Send image with bot info
        await conn.sendMessage(from, {
            image: { 
                url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg',
                mimetype: 'image/jpeg'
            },
            caption: `*⟣──────────────────⟢*
▧ *ᴄʀᴇᴀᴛᴏʀ* : *ᴍʀ ᴄᴀsᴇʏʀʜᴏᴅᴇs*
▧ *ᴏᴡɴᴇʀ ɴᴜᴍʙᴇʀ* : *${ownerNumber}*
▧ *ᴍᴏᴅᴇ* : *public*
▧ *ᴘʀᴇғɪx* : *${prefix || '.'}*
▧ *ʀᴀᴍ* : *${usedMem}MB / ${totalMem}MB*
▧ *ᴠᴇʀsɪᴏɴ* : *V.5* ⚡
*⟣──────────────────⟢*
${readMore}
*𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒-𝐗𝐌𝐃 BOT INFO*

*ᴏᴡɴᴇʀ ᴄᴏɴᴛᴀᴄᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ:*
📞 *ᴘʜᴏɴᴇ*: ${ownerNumber}
👤 *ɴᴀᴍᴇ*: ${ownerName}

*⟣──────────────────⟢*`,
            contextInfo: {
                mentionedJid: [ownerNumber.replace('+', '') + '@s.whatsapp.net'],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: 'CASEYRHODES TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in owner command:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
