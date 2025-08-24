const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

// Newsletter configuration - moved to module level for better performance
const NEWSLETTER_CONFIG = {
    jid: '120363302677217436@newsletter',
    name: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 🌟',
    serverMessageId: 143,
    imageUrl: 'https://files.catbox.moe/y3j3kl.jpg',
    watermark: '> POWERED BY CASEYRHODES TECH'
};

// Precompute newsletter context once
const NEWSLETTER_CONTEXT = Object.freeze({
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_CONFIG.jid,
        newsletterName: NEWSLETTER_CONFIG.name,
        serverMessageId: NEWSLETTER_CONFIG.serverMessageId
    }
});

// Precomputed message type mapping
const MESSAGE_TYPE_MAP = Object.freeze({
    conversation: 'Text',
    imageMessage: 'Image',
    videoMessage: 'Video',
    audioMessage: 'Audio',
    documentMessage: 'Document',
    stickerMessage: 'Sticker',
    extendedTextMessage: 'Text with Link',
    contactMessage: 'Contact',
    locationMessage: 'Location'
});

// Cache for group metadata to reduce API calls
const groupMetadataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to extract message content efficiently
function extractMessageContent(message) {
    if (!message) return '🚫 Content unavailable (may be media without caption)';
    
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    if (message.documentMessage?.caption) return message.documentMessage.caption;
    
    return '🚫 Content unavailable (may be media without caption)';
}

// Helper function to get message type
function getMessageType(message) {
    if (!message) return 'Unknown';
    
    const type = Object.keys(message)[0];
    return MESSAGE_TYPE_MAP[type] || type.replace('Message', '') || 'Unknown';
}

// Pre-formatted date/time options
const TIME_OPTIONS = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

const DATE_OPTIONS = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
};

const getNewsletterContext = () => NEWSLETTER_CONTEXT;

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    try {
        const messageContent = extractMessageContent(mek.message);
        
        const fullMessage = `${deleteInfo}\n\n📝 *Message Content:*\n${messageContent}\n\n${NEWSLETTER_CONFIG.watermark}`;

        const mentionedJids = isGroup 
            ? [update.key.participant, mek.key.participant].filter(Boolean) 
            : [update.key.remoteJid].filter(Boolean);

        await conn.sendMessage(
            jid,
            {
                image: { url: NEWSLETTER_CONFIG.imageUrl },
                caption: fullMessage,
                contextInfo: {
                    ...NEWSLETTER_CONTEXT,
                    mentionedJid: mentionedJids,
                },
            },
            { quoted: mek }
        );
    } catch (error) {
        console.error('Error in DeletedText:', error);
    }
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    try {
        const antideletedmek = structuredClone(mek.message);
        const messageType = Object.keys(antideletedmek)[0];
        
        const mediaTypes = {
            imageMessage: { type: 'image', key: 'imageMessage' },
            videoMessage: { type: 'video', key: 'videoMessage' },
            audioMessage: { type: 'audio', key: 'audioMessage' },
            documentMessage: { type: 'document', key: 'documentMessage' },
            stickerMessage: { type: 'sticker', key: 'stickerMessage' }
        };

        const currentType = mediaTypes[messageType];
        
        if (currentType) {
            const caption = `${deleteInfo}\n\n${NEWSLETTER_CONFIG.watermark}`;

            if (['image', 'video'].includes(currentType.type)) {
                const mediaUrl = antideletedmek[currentType.key]?.url 
                    || NEWSLETTER_CONFIG.imageUrl;
                
                await conn.sendMessage(jid, { 
                    [currentType.type]: { url: mediaUrl },
                    caption: caption,
                    contextInfo: {
                        ...NEWSLETTER_CONTEXT,
                        mentionedJid: [mek.sender],
                    }
                }, { quoted: mek });
            } 
            else {
                // Send all non-visual media in a single batch if possible
                const messages = [
                    { 
                        image: { url: NEWSLETTER_CONFIG.imageUrl },
                        caption: `*⚠️ Deleted ${currentType.type.toUpperCase()} Alert 🚨*`,
                        contextInfo: NEWSLETTER_CONTEXT
                    },
                    { 
                        text: caption,
                        contextInfo: NEWSLETTER_CONTEXT
                    }
                ];

                if (antideletedmek[currentType.key]?.url) {
                    messages.push({
                        [currentType.type]: { url: antideletedmek[currentType.key].url },
                        contextInfo: NEWSLETTER_CONTEXT
                    });
                }

                // Send all messages at once
                for (const msg of messages) {
                    await conn.sendMessage(jid, msg, { quoted: mek });
                }
            }
        } else {
            // Fallback for unsupported media types
            antideletedmek[messageType].contextInfo = {
                ...NEWSLETTER_CONTEXT,
                stanzaId: mek.key.id,
                participant: mek.sender,
                quotedMessage: mek.message,
            };
            await conn.relayMessage(jid, antideletedmek, {});
        }
    } catch (error) {
        console.error('Error in DeletedMedia:', error);
    }
};

const AntiDelete = async (conn, updates) => {
    try {
        // Process updates in parallel where possible
        const processUpdate = async (update) => {
            if (!update.update.message === null) return;

            const store = await loadMessage(update.key.id);
            if (!store || !store.message) return;

            const antiDeleteStatus = await getAnti();
            if (!antiDeleteStatus) return;

            const mek = store.message;
            const isGroup = isJidGroup(store.jid);

            const deleteTime = new Date().toLocaleTimeString('en-GB', TIME_OPTIONS);
            const deleteDate = new Date().toLocaleDateString('en-GB', DATE_OPTIONS);

            let deleteInfo, jid;
            
            if (isGroup) {
                // Use cached group metadata if available
                let groupMetadata = groupMetadataCache.get(store.jid);
                if (!groupMetadata || (Date.now() - groupMetadata.timestamp) > CACHE_TTL) {
                    groupMetadata = await conn.groupMetadata(store.jid);
                    groupMetadataCache.set(store.jid, {
                        ...groupMetadata,
                        timestamp: Date.now()
                    });
                }

                const groupName = groupMetadata.subject;
                const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                deleteInfo = `*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*
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
                
                deleteInfo = `*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*
*├📅 DATE:* ${deleteDate}
*├⏰ TIME:* ${deleteTime}
*├📱 SENDER:* @${senderNumber}
*├📌 MESSAGE TYPE:* ${getMessageType(mek.message)}
*╰⚠️ ACTION:* Message Deletion Detected`;
                jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
            }

            deleteInfo += `\n\n${NEWSLETTER_CONFIG.watermark}`;

            const hasTextContent = mek.message?.conversation || 
                                 mek.message?.extendedTextMessage || 
                                 mek.message?.imageMessage?.caption || 
                                 mek.message?.videoMessage?.caption;

            if (hasTextContent) {
                await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
            } else {
                await DeletedMedia(conn, mek, jid, deleteInfo);
            }
        };

        // Process updates with limited concurrency to avoid rate limiting
        const MAX_CONCURRENT = 3;
        const promises = [];
        
        for (const update of updates) {
            if (promises.length >= MAX_CONCURRENT) {
                await Promise.race(promises);
            }
            promises.push(processUpdate(update));
        }
        
        await Promise.all(promises);

    } catch (error) {
        console.error('Error in AntiDelete:', error);
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
    getMessageType
};
