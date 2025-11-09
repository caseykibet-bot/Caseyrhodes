const { cmd } = require('../command');
const config = require('../config');

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function runtime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

cmd({
    pattern: "owner",
    react: "🦋",
    desc: "Get owner number",
    category: "main",
    filename: __filename,
},
async (conn, mek, m, { from, reply, prefix }) => {
    try {
        const ownerNumber = config.owner;
        const ownerName = config.OWNER_NAME || "CASEYRHODES XMD DEVELOPERS🥰💖🥰";
        
        // Get memory usage
        const used = process.memoryUsage();
        const usedMem = Math.round(used.heapUsed / 1024 / 1024);
        const totalMem = Math.round(used.heapTotal / 1024 / 1024);
        
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:CASEYRHODES-TECH BOT;
TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}
END:VCARD`;

        // Send contact card
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard: vcard }]
            }
        });

        // Send image with owner info including phone number
        await conn.sendMessage(from, {
            image: { url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg' },
            caption: `*⟣──────────────────⟢*
▧ *ᴄʀᴇᴀᴛᴏʀ* : *ᴍʀ ᴄᴀsᴇʏʀʜᴏᴅᴇs (🇰🇪)*
▧ *ᴏᴡɴᴇʀ ɴᴜᴍʙᴇʀ* : *${ownerNumber}*
▧ *ᴍᴏᴅᴇ* : *public*
▧ *ᴘʀᴇғɪx* : *${prefix}*
▧ *ʀᴀᴍ* : *${usedMem}MB / ${totalMem}MB*
▧ *ᴠᴇʀsɪᴏɴ* : *V.5* ⚡
▧ *ᴜᴘᴛɪᴍᴇ* :  *${runtime(process.uptime())}*

⟣──────────────────⟢
${readMore}
> 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒-𝐗𝐌𝐃 

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
                    newsletterName: 'POWERED BY CASEYRHODES TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("An error occurred:", error);
        reply("An error occurred: " + error.message);
    }
});
