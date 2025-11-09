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
        const ownerNumber = config.owner || "+254112192119";
        const ownerName = config.OWNER_NAME || "CASEYRHODES XMD DEVELOPER";

        // Define fakevCard for quoting messages
        const fakevCard = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "❯❯ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴠᴇʀɪғɪᴇᴅ ✅",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=254112192119:+25412192119\nEND:VCARD`
                }
            }
        };

        // Get memory usage
        const usedMemory = process.memoryUsage();
        const usedMem = Math.round(usedMemory.heapUsed / 1024 / 1024);
        const totalMem = Math.round(usedMemory.heapTotal / 1024 / 1024);

        // Send image with bot info using fakevCard as quoted message
        await conn.sendMessage(from, {
            image: { 
                url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg'
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
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: 'CASEYRHODES TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: fakevCard }); // Using fakevCard as the quoted message

    } catch (error) {
        console.error("Error in owner command:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
