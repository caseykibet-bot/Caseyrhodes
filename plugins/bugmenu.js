const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');

cmd({
    pattern: "bugmenu",
    desc: "Show bug related menu",
    category: "menu2",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: mek });
        }

        const bugMenu = `*╭───⬡ CASEYRHODES TECH BUG MENU ⬡───*
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
*╰──────────────⬣*

*👑 CASEYRHODES TECH PREMIUM BUGS*
*🔒 Owner Commands Only*
*💎 Premium Features*

> ${config.DESCRIPTION || 'Caseyrhodes Tech - Premium WhatsApp Bot'}
`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: bugMenu,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420261263259@newsletter',
                        newsletterName: 'CASEYRHODES TECH 👑',
                        serverMessageId: -1
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});

// Premium bug commands - all follow the same pattern
const premiumBugCommands = [
    "otplock", "android3", "android2", "android", "ios", "bugcall", 
    "bugpv", "buggroup", "bugblock", "bugauto", "buglag", "bugspam", 
    "bugmulti", "bugrandom", "bugbotcrash", "bugvirus", "bug"
];

premiumBugCommands.forEach(command => {
    cmd({
        pattern: command,
        desc: "Caseyrhodes Tech Premium Bug Command",
        category: "bugs",
        react: "👑",
        filename: __filename
    },
    async (conn, mek, m, { from, reply, isCreator }) => {
        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
            }, { quoted: mek });
        }
        
        const premiumMessage = `*👑 CASEYRHODES TECH PREMIUM ACCESS*

*🚀 Premium Bug Command: ${command}*
*💎 This is a premium feature*

*📞 Contact Developer for Premium Access:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*✨ Features:*
*• Advanced Bug Tools*
*• Premium Support*
*• Regular Updates*
*• Exclusive Access*

*🔒 Owner Restricted Command*`;

        await conn.sendMessage(from, {
            text: premiumMessage
        }, { quoted: mek });
    });
});

cmd({
    pattern: "buybug",
    alias: ["purchasebug", "bugbuy", "bugpurchase", "premiumbug"],
    desc: "Purchase Caseyrhodes Tech Premium Bug Access",
    category: "bugs",
    react: "💎",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*👑 CASEYRHODES TECH - OWNER COMMAND*\n*📛 This command is restricted to bot owner only.*"
        }, { quoted: mek });
    }
    
    const purchaseMessage = `*💎 CASEYRHODES TECH PREMIUM BUG ACCESS*

*🚀 Premium Bug Package Includes:*
*• All Bug Commands Unlocked*
*• Android/iOS Bug Tools*
*• Call & PV Bugs*
*• Group Bug Features*
*• Advanced Spam Protection*
*• Auto Bug Systems*
*• Multi-Device Support*
*• Virus Protection Tools*
*• 24/7 Premium Support*
*• Regular Updates*

*💰 Pricing & Packages:*
*Contact developer for current pricing*

*📞 Contact for Purchase:*
*👉 ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Note: This is a premium service for authorized users only.*`;

    await conn.sendMessage(from, {
        text: purchaseMessage
    }, { quoted: mek });
});

// Additional utility command for Caseyrhodes Tech info
cmd({
    pattern: "caseytech",
    alias: ["caseyrhodes", "techinfo"],
    desc: "Caseyrhodes Tech Information",
    category: "main",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const techInfo = `*👑 CASEYRHODES TECH*

*🚀 Premium WhatsApp Bot Solutions*
*💎 Advanced Bug Tools & Features*
*🔒 Secure & Reliable*

*✨ Services:*
*• Premium Bug Tools*
*• Advanced Security*
*• Custom Bot Development*
*• Bug Fixing Solutions*
*• Multi-Device Support*

*📞 Contact: ${config.OWNER_NUMBER || 'Caseyrhodes Tech'}*

*🔒 Professional Tools for Authorized Users*`;

    await conn.sendMessage(from, {
        text: techInfo
    }, { quoted: mek });
});
