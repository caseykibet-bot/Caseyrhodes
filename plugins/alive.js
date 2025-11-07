const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config'); // Assuming you have a config file

cmd({
    pattern: "alive",
    alias: ["status", "live"],
    desc: "Check uptime and system status",
    category: "main",
    react: "🟢",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, reply }) => {
    try {
        const totalCmds = commands.length;
        const uptime = () => {
            let sec = process.uptime();
            let h = Math.floor(sec / 3600);
            let m = Math.floor((sec % 3600) / 60);
            let s = Math.floor(sec % 60);
            return `${h}h ${m}m ${s}s`;
        };

        const status = `╭─〔 *🤖 caseyrhodes tech STATUS* 〕
│
├─ *🌐 Platform:* Heroku
├─ *📦 Mode:* ${config.MODE || 'private'}
├─ *👑 Owner:* caseyrhodes tech
├─ *🔹 Prefix:* ${config.PREFIX || '.'}
├─ *🧩 Version:* 1.0.0 Beta
├─ *📁 Total Commands:* ${totalCmds}
├─ *⏱ Runtime:* ${uptime()}
│
╰─ *⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ caseyrhodes tech*`;

        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/fGSVG8vJ/caseyweb.jpg" },
            caption: status,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: 'caseyrhodes tech',
                    serverMessageId: -1
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
