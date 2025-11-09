const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

// Newsletter configuration
const NEWSLETTER_CONFIG = Object.freeze({
    imageUrl: "https://files.catbox.moe/y3j3kl.jpg",
    watermark: `\n\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ*`,
    newsletterJid: '120363420261263259@newsletter',
    newsletterName: 'CASEYRHODES TECH 👑'
});

// Pre-computed values for maximum performance
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

// Optimized cache with faster lookups
const groupMetadataCache = new Map();
const messageCache = new Map(); // Cache recent messages for instant access
const CACHE_TTL = 2 * 60 * 1000; // Reduced to 2 minutes
const MESSAGE_CACHE_TTL = 1 * 60 * 1000; // 1 minute for message cache

// Pre-define context to avoid object creation overhead
const NEWSLETTER_CONTEXT = Object.freeze({
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_CONFIG.newsletterJid,
        newsletterName: NEWSLETTER_CONFIG.newsletterName,
        serverMessageId: -1
    }
});

// Pre-compiled regex for faster string operations
const JID_REGEX = /^(\d+)@/;

// Ultra-fast message content extraction
function extractMessageContent(message) {
    if (!message) return '🚫 Content unavailable';
    
    // Direct property access for maximum speed
    if (message.conversation) return message.conversation;
    const extended = message.extendedTextMessage;
    if (extended?.text) return extended.text;
    const image = message.imageMessage;
    if (image?.caption) return image.caption;
    const video = message.videoMessage;
    if (video?.caption) return video.caption;
    const document = message.documentMessage;
    if (document?.caption) return document.caption;
    
    return '🚫 Content unavailable';
}

// Optimized message type detection
function getMessageType(message) {
    if (!message) return 'Unknown';
    
    // Direct key access instead of Object.keys() for speed
    for (const key in message) {
        if (message.hasOwnProperty(key)) {
            return MESSAGE_TYPE_MAP[key] || key.replace('Message', '') || 'Unknown';
        }
    }
    return 'Unknown';
}

// Fast date/time formatting - pre-compute as much as possible
const now = new Date();
const deleteTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Faster without 12-hour conversion
});

const deleteDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short', // Shorter for faster rendering
    year: 'numeric'
});

// Cache group metadata with promise to avoid duplicate requests
const groupMetadataPromises = new Map();

async function getGroupMetadata(conn, jid) {
    const cached = groupMetadataCache.get(jid);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached;
    }

    // Check if request already in progress
    if (groupMetadataPromises.has(jid)) {
        return groupMetadataPromises.get(jid);
    }

    const promise = conn.groupMetadata(jid).then(metadata => {
        const result = { ...metadata, timestamp: Date.now() };
        groupMetadataCache.set(jid, result);
        groupMetadataPromises.delete(jid);
        return result;
    }).catch(err => {
        groupMetadataPromises.delete(jid);
        throw err;
    });

    groupMetadataPromises.set(jid, promise);
    return promise;
}

// Pre-cache messages as they arrive for instant deletion detection
function cacheMessage(messageId, messageData) {
    messageCache.set(messageId, {
        ...messageData,
        timestamp: Date.now()
    });
    
    // Auto-cleanup old messages
    if (messageCache.size > 1000) {
        const now = Date.now();
        for (const [key, value] of messageCache.entries()) {
            if (now - value.timestamp > MESSAGE_CACHE_TTL) {
                messageCache.delete(key);
            }
        }
    }
}

// Optimized deletion text handler
const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    try {
        const messageContent = extractMessageContent(mek.message);
        const fullMessage = `${deleteInfo}\n\n📝 *Message Content:*\n${messageContent}\n\n${NEWSLETTER_CONFIG.watermark}`;

        const mentionedJids = isGroup 
            ? [update.key.participant, mek.key.participant].filter(Boolean) 
            : [update.key.remoteJid].filter(Boolean);

        // Send without waiting for response
        conn.sendMessage(
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
        ).catch(console.error); // Don't block on errors

    } catch (error) {
        console.error('Error in DeletedText:', error);
    }
};

// Optimized media handler
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
        if (!currentType) return;

        const caption = `${deleteInfo}\n\n${NEWSLETTER_CONFIG.watermark}`;

        if (['image', 'video'].includes(currentType.type)) {
            const mediaUrl = antideletedmek[currentType.key]?.url || NEWSLETTER_CONFIG.imageUrl;
            
            conn.sendMessage(jid, { 
                [currentType.type]: { url: mediaUrl },
                caption: caption,
                contextInfo: {
                    ...NEWSLETTER_CONTEXT,
                    mentionedJid: [mek.sender],
                }
            }, { quoted: mek }).catch(console.error);
        } else {
            // Batch send for non-visual media
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

            // Send all messages without waiting
            for (const msg of messages) {
                conn.sendMessage(jid, msg, { quoted: mek }).catch(console.error);
            }
        }
    } catch (error) {
        console.error('Error in DeletedMedia:', error);
    }
};

// Ultra-fast anti-delete detection
const AntiDelete = async (conn, updates) => {
    const startTime = Date.now();
    let processed = 0;
    
    try {
        // Parallel processing with higher concurrency
        const MAX_CONCURRENT = 8; // Increased for faster processing
        const activePromises = new Set();
        
        const processUpdate = async (update) => {
            processed++;
            
            // Fast validation checks
            if (!update.update?.message) return;
            
            const messageId = update.key.id;
            if (!messageId) return;

            // Check cache first for instant response
            let store = messageCache.get(messageId);
            if (!store) {
                store = await loadMessage(messageId);
                if (store) cacheMessage(messageId, store);
            }
            
            if (!store?.message) return;

            // Fast anti-delete status check
            const antiDeleteStatus = await getAnti();
            if (!antiDeleteStatus) return;

            const mek = store.message;
            const isGroup = isJidGroup(store.jid);

            // Fast timestamp generation
            const now = new Date();
            const deleteTime = now.toLocaleTimeString('en-GB', { 
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
            });
            const deleteDate = now.toLocaleDateString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric' 
            });

            let deleteInfo, jid;
            
            if (isGroup) {
                // Parallel group metadata fetch
                const groupMetadata = await getGroupMetadata(conn, store.jid);
                const groupName = groupMetadata.subject;
                
                const sender = mek.key.participant?.match(JID_REGEX)?.[1] || 'Unknown';
                const deleter = update.key.participant?.match(JID_REGEX)?.[1] || 'Unknown';

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
                const senderNumber = mek.key.remoteJid?.match(JID_REGEX)?.[1] || 'Unknown';
                
                deleteInfo = `*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*
*├📅 DATE:* ${deleteDate}
*├⏰ TIME:* ${deleteTime}
*├📱 SENDER:* @${senderNumber}
*├📌 MESSAGE TYPE:* ${getMessageType(mek.message)}
*╰⚠️ ACTION:* Message Deletion Detected`;
                
                jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
            }

            // Fast content detection
            const hasTextContent = mek.message?.conversation || 
                                 mek.message?.extendedTextMessage || 
                                 mek.message?.imageMessage?.caption || 
                                 mek.message?.videoMessage?.caption;

            // Fire and forget - don't wait for send to complete
            if (hasTextContent) {
                DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
            } else {
                DeletedMedia(conn, mek, jid, deleteInfo);
            }
        };

        // High-performance parallel processing
        for (const update of updates) {
            // Wait if we have too many concurrent operations
            while (activePromises.size >= MAX_CONCURRENT) {
                await Promise.race(activePromises);
            }

            const promise = processUpdate(update).finally(() => {
                activePromises.delete(promise);
            });
            
            activePromises.add(promise);
        }

        // Wait for remaining operations
        if (activePromises.size > 0) {
            await Promise.all(activePromises);
        }

        const endTime = Date.now();
        if (processed > 0) {
            console.log(`🚀 AntiDelete: Processed ${processed} updates in ${endTime - startTime}ms`);
        }

    } catch (error) {
        console.error('Error in AntiDelete:', error);
    }
};

// Export cache function for external use
module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
    getMessageType,
    cacheMessage, // Export for external caching
    messageCache, // Export for monitoring
    NEWSLETTER_CONFIG
};
