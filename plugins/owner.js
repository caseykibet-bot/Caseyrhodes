const { cmd } = require('../command');
const config = require('../config');

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

// Function to create vcard
function createVCard(name, number) {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number.replace('+', '')}:${number}\nEND:VCARD`;
}

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
        
        // Create vcard
        const vcard = createVCard(ownerName, ownerNumber);

        // Get memory usage (if available)
        const usedMemory = process.memoryUsage();
        const usedMem = Math.round(usedMemory.heapUsed / 1024 / 1024);
        const totalMem = Math.round(usedMemory.heapTotal / 1024 / 1024);

        // Send single message with both contact and image
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
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard: vcard }]
            },
            contextInfo: {
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
