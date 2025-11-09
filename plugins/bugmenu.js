const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "bugmenu",
    desc: "Show bug menu",
    category: "menu2",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, isCreator }) => {
    if (!isCreator) return;
    const bugMenu = `*╭───⬡ BUG MENU ⬡───*
*├▢ 🤖* *android* 
*├▢ 📱* *android2*
*├▢ 🔥* *android3*
*├▢ 🔒* *otplock*
*├▢ * *ios*
*├▢ 🪲* *bugcall*
*├▢ 💣* *bugpv*
*├▢ 👥* *buggroup*
*├▢ 🚀* *bugspam*
*├▢ ⚡* *buglag*
*├▢ 🧨* *bugauto*
*├▢ 🕸️* *bugblock*
*├▢ 🔄* *bugmulti*
*├▢ 🧩* *bugrandom*
*├▢ 🐝* *bugbotcrash*
*├▢ ☠️* *bugvirus*
*├▢ 💀* *bug*
*├▢ 💸* *buybug*
*╰──────────────⬣*`;
    await conn.sendMessage(from, {
        image: { url: config.MENU_IMAGE_URL },
        caption: bugMenu
    }, { quoted: mek });
});

const bugs = [
    "android", "android2", "android3", "otplock", "ios", 
    "bugcall", "bugpv", "buggroup", "bugspam", "buglag", 
    "bugauto", "bugblock", "bugmulti", "bugrandom", 
    "bugbotcrash", "bugvirus", "bug"
];

bugs.forEach(pattern => {
    cmd({ pattern, category: "bugs", filename: __filename },
    async (conn, mek, m, { from, isCreator }) => {
        if (!isCreator) return;
        await conn.sendMessage(from, { 
            text: `*${pattern.toUpperCase()}*\nContact: ${config.OWNER_NUMBER}` 
        }, { quoted: mek });
    });
});

cmd({
    pattern: "buybug",
    alias: ["purchasebug", "bugbuy"],
    category: "bugs",
    filename: __filename
},
async (conn, mek, m, { from, isCreator }) => {
    if (!isCreator) return;
    await conn.sendMessage(from, { 
        text: `*BUY BUG*\nContact: ${config.OWNER_NUMBER}` 
    }, { quoted: mek });
});

cmd({
    pattern: "caseytech",
    alias: ["caseyrhodes"],
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    await conn.sendMessage(from, { 
        text: `*CASEYRHODES TECH*\nContact: ${config.OWNER_NUMBER}` 
    }, { quoted: mek });
});
