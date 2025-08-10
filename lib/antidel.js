const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || 'Unknown content';
    deleteInfo += `\n◈ Content ━ ${messageContent}`;

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
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    const antideletedmek = structuredClone(mek.message);
    const messageType = Object.keys(antideletedmek)[0];
    
    if (messageType === 'imageMessage' || messageType === 'videoMessage') {
        // For media messages, send with image and newsletter info
        await conn.sendMessage(jid, { 
            image: { url: `https://files.catbox.moe/y3j3kl.jpg` },
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
    else if (messageType === 'audioMessage' || messageType === 'documentMessage') {
        // For audio/document messages, send with newsletter info
        await conn.sendMessage(jid, { 
            text: `*⚠️ Deleted Message Alert 🚨*\n${deleteInfo}`,
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
    }
    else {
        // Fallback for other media types
        if (antideletedmek[messageType]) {
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
        }
        await conn.relayMessage(jid, antideletedmek, {});
    }
};

const AntiDelete = async (conn, updates) => {
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
                });

                let deleteInfo, jid;
                if (isGroup) {
                    const groupMetadata = await conn.groupMetadata(store.jid);
                    const groupName = groupMetadata.subject;
                    const sender = mek.key.participant?.split('@')[0];
                    const deleter = update.key.participant?.split('@')[0];

                    deleteInfo = `
*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*

*├♻️ SENDER:* @${sender}
*├👥 GROUP:* ${groupName}
*├⏰ DELETE TIME:* ${deleteTime}
*├🗑️ DELETED BY:* @${deleter}
*├⚠️ ACTION:* Deleted a Message 
*╰🪀 MESSAGE:* Content Below 🔽`;
                    jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : store.jid;
                } else {
                    const senderNumber = mek.key.remoteJid?.split('@')[0];
                    const deleterNumber = update.key.remoteJid?.split('@')[0];
                    
                    deleteInfo = `
*🔰 𝐀𝐍𝐓𝐈𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 🔰*

*├👤 SENDER:* @${senderNumber}
*├⏰ DELETE TIME:* ${deleteTime}
*├⚠️ ACTION:* Deleted a Message 
*╰💫 MESSAGE:* Content Below 🔽`;
                    jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
                }

                if (mek.message?.conversation || mek.message?.extendedTextMessage) {
                    // For text messages, send with image and newsletter info
                    await conn.sendMessage(jid, { 
                        image: { url: `https://files.catbox.moe/y3j3kl.jpg` },
                        caption: deleteInfo,
                        contextInfo: {
                            mentionedJid: isGroup ? [update.key.participant, mek.key.participant] : [update.key.remoteJid],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363302677217436@newsletter',
                                newsletterName: 'CASEYRHODES ANTIDELETE 👻',
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: mek });
                } else {
                    await DeletedMedia(conn, mek, jid, deleteInfo);
                }
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
