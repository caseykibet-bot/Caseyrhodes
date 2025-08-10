const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    try {
        // Extract message content with fallbacks
        const messageContent = mek.message?.conversation 
            || mek.message?.extendedTextMessage?.text
            || mek.message?.imageMessage?.caption
            || mek.message?.videoMessage?.caption
            || '🚫 Content unavailable (may be media without caption)';
        
        // Enhanced delete info with better formatting
        deleteInfo += `\n\n📝 *Message Content:*\n${messageContent}`;

        await conn.sendMessage(
            jid,
            {
                text: deleteInfo,
                contextInfo: {
                    mentionedJid: isGroup ? [update.key.participant, mek.key.participant] : [update.key.remoteJid],
                },
            },
            { quoted: mek },
        );
    } catch (error) {
        console.error('Error in DeletedText:', error);
    }
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    try {
        const antideletedmek = structuredClone(mek.message);
        const messageType = Object.keys(antideletedmek)[0];
        
        // Enhanced media type detection
        const mediaTypes = {
            imageMessage: { type: 'image', key: 'imageMessage' },
            videoMessage: { type: 'video', key: 'videoMessage' },
            audioMessage: { type: 'audio', key: 'audioMessage' },
            documentMessage: { type: 'document', key: 'documentMessage' },
            stickerMessage: { type: 'sticker', key: 'stickerMessage' }
        };

        const currentType = mediaTypes[messageType];
        
        if (currentType) {
            // For media messages with preview capability
            if (['image', 'video'].includes(currentType.type)) {
                const mediaUrl = antideletedmek[currentType.key]?.url 
                    || `https://files.catbox.moe/y3j3kl.jpg`; // Fallback image
                
                await conn.sendMessage(jid, { 
                    [currentType.type]: { url: mediaUrl },
                    caption: deleteInfo,
                    contextInfo: {
                        mentionedJid: [mek.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363302677217436@newsletter',
                            newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 🌟',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: mek });
            } 
            // For other media types
            else {
                await conn.sendMessage(jid, { 
                    text: `*⚠️ Deleted ${currentType.type.toUpperCase()} Alert 🚨*\n${deleteInfo}`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363302677217436@newsletter',
                            newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 🌟',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: mek });
                
                // Attempt to resend the original media if possible
                if (antideletedmek[currentType.key]?.url) {
                    await conn.sendMessage(jid, {
                        [currentType.type]: { url: antideletedmek[currentType.key].url }
                    }, { quoted: mek });
                }
            }
        } else {
            // Fallback for unsupported media types
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.sender,
                quotedMessage: mek.message,
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: 'CASEYRHODES TECH 🌟',
                    serverMessageId: 143
                }
            };
            await conn.relayMessage(jid, antideletedmek, {});
        }
    } catch (error) {
        console.error('Error in DeletedMedia:', error);
    }
};

const AntiDelete = async (conn, updates) => {
    try {
        for (const update of updates) {
            if (update.update.message === null) {
                const store = await loadMessage(update.key.id);

                if (store && store.message) {
                    const mek = store.message;
                    const isGroup = isJidGroup(store.jid);
                    const antiDeleteStatus = await getAnti();
                    if (!antiDeleteStatus) continue;

                    const deleteTime = new Date().toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                    const deleteDate = new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    let deleteInfo, jid;
                    if (isGroup) {
                        const groupMetadata = await conn.groupMetadata(store.jid);
                        const groupName = groupMetadata.subject;
                        const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                        const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                        deleteInfo = `
*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*
*├📅 DATE:* ${deleteDate}
*├⏰ TIME:* ${deleteTime}
*├👤 SENDER:* @${sender}
*├👥 GROUP:* ${groupName}
*├🗑️ DELETED BY:* @${deleter}
*├📌 MESSAGE TYPE:* ${getMessageType(mek.message)}
*╰⚠️ ACTION:* Message Deletion Detected`;
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : store.jid;
                    } else {
                        const senderNumber = mek.key.remoteJid?.split('@')[0] || 'Unknown';
                        const deleterNumber = update.key.remoteJid?.split('@')[0] || 'Unknown';
                        
                        deleteInfo = `
*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*
*├📅 DATE:* ${deleteDate}
*├⏰ TIME:* ${deleteTime}
*├📱 SENDER:* @${senderNumber}
*├📌 MESSAGE TYPE:* ${getMessageType(mek.message)}
*╰⚠️ ACTION:* Message Deletion Detected`;
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
                    }

                    // Check if it's a text message or media with caption
                    if (mek.message?.conversation || mek.message?.extendedTextMessage || 
                        mek.message?.imageMessage?.caption || mek.message?.videoMessage?.caption) {
                        await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
                    } else {
                        await DeletedMedia(conn, mek, jid, deleteInfo);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in AntiDelete:', error);
    }
};

// Helper function to determine message type
function getMessageType(message) {
    if (!message) return 'Unknown';
    
    const type = Object.keys(message)[0];
    switch(type) {
        case 'conversation': return 'Text';
        case 'imageMessage': return 'Image';
        case 'videoMessage': return 'Video';
        case 'audioMessage': return 'Audio';
        case 'documentMessage': return 'Document';
        case 'stickerMessage': return 'Sticker';
        case 'extendedTextMessage': return 'Text with Link';
        default: return type.replace('Message', '') || 'Unknown';
    }
}

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
