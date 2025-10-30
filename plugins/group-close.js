const { cmd } = require("../../command");
const config = require("../../config");

// Verification contact
const verifiedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "CASEYRHODES VERIFIED ✅",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:CASEYRHODES VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=13135550002:+1 313-555-0002\nEND:VCARD`
        }
    }
};

// Context info with newsletter
const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363420261263259@newsletter',
        newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇 🌟',
        serverMessageId: 143
    },
    externalAdReply: {
        title: "CASEYRHODES VERIFIED ✅",
        body: "Group Management System",
        mediaType: 1,
        thumbnailUrl: "https://i.ibb.co/whs6RtyC/caseywebs.jpg",
        sourceUrl: "https://whatsapp.com/channel/0029Va9aJNY6LtL5wM5pY3z",
        mediaUrl: ""
    }
};

cmd({
    'pattern': "close",
    'alias': ["lock", "closegroup"],
    'react': '🔒',
    'desc': "Lock group (only admins can send messages)",
    'category': "group",
    'use': ".close",
    'filename': __filename
}, async (message, client, context, { from: sender, reply: replyFunction, isGroup, isAdmin, isOwner }) => {
    try {
        await client.sendMessage(sender, { react: { text: '🔒', key: message.key } });
        
        if (!isGroup) {
            return await client.sendMessage(sender, {
                text: '❌ *This command can only be used in groups, sweetie!* 😘',
                contextInfo: contextInfo
            }, { quoted: verifiedContact });
        }
        
        if (!isAdmin && !isOwner) {
            return await client.sendMessage(sender, {
                text: '❌ *Only group admins or bot owner can close the group, darling!* 😘',
                contextInfo: contextInfo
            }, { quoted: verifiedContact });
        }
        
        await client.groupSettingUpdate(sender, 'announcement');
        
        await client.sendMessage(sender, {
            text: `🔒 *GROUP CLOSED*\n\nGroup is now closed! 🔐\n\n${config.BOT_FOOTER}`,
            contextInfo: contextInfo
        }, { quoted: verifiedContact });
        
    } catch (error) {
        console.error('Close command error:', error);
        await client.sendMessage(sender, {
            text: `❌ *Failed to close group, love!* 😢\nError: ${error.message || 'Unknown error'}`,
            contextInfo: contextInfo
        }, { quoted: verifiedContact });
    }
});
