const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

// MP4 video download
cmd({ 
    pattern: "video", 
    alias: ["videos"], 
    react: "🎥", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.mp4 < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result?.download_url) {
            return reply("Failed to fetch the video. Please try again later.");
        }

        let ytmsg = `📹 *Video Details*
🎬 *Title:* ${yts.title}
⏳ *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

*Choose download format:*
1. 📄 Document (no preview)
2. ▶️ Normal Video (with preview)

_Reply to this message with 1 or 2 to download._`;

        // Verification contact message
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

        let contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363302677217436@newsletter',
                newsletterName: 'CASEYRHODES-XMD',
                serverMessageId: 143
            },
            externalAdReply: verifiedContact
        };

        // Send thumbnail with options
        const videoMsg = await conn.sendMessage(from, { 
            image: { url: yts.thumbnail }, 
            caption: ytmsg, 
            contextInfo 
        }, { quoted: mek });

        // Create a message listener for this specific interaction
        const messageHandler = async (msgUpdate) => {
            try {
                if (!msgUpdate.messages || msgUpdate.messages.length === 0) return;
                
                const replyMsg = msgUpdate.messages[0];
                if (!replyMsg.message || !replyMsg.message.extendedTextMessage) return;
                
                // Check if this is a reply to our video message
                const contextInfo = replyMsg.message.extendedTextMessage.contextInfo;
                if (!contextInfo || contextInfo.stanzaId !== videoMsg.key.id) return;
                
                // Check if message is from the same user and chat
                if (replyMsg.key.remoteJid !== from || (replyMsg.key.participant && replyMsg.key.participant !== m.sender)) return;
                
                const selected = replyMsg.message.extendedTextMessage.text.trim();
                
                // Remove listener to prevent multiple responses
                conn.ev.off("messages.upsert", messageHandler);
                
                await conn.sendMessage(from, { react: { text: "⬇️", key: replyMsg.key } });

                const replyContextInfo = {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363302677217436@newsletter',
                        newsletterName: 'CASEYRHODES-XMD',
                        serverMessageId: 143
                    },
                    externalAdReply: verifiedContact
                };

                if (selected === "1") {
                    await conn.sendMessage(from, {
                        document: { url: data.result.download_url },
                        mimetype: "video/mp4",
                        fileName: `${yts.title.replace(/[^\w\s]/gi, '')}.mp4`,
                        contextInfo: replyContextInfo
                    }, { quoted: replyMsg });
                } else if (selected === "2") {
                    await conn.sendMessage(from, {
                        video: { url: data.result.download_url },
                        mimetype: "video/mp4",
                        caption: yts.title,
                        contextInfo: replyContextInfo
                    }, { quoted: replyMsg });
                } else {
                    await conn.sendMessage(
                        from,
                        { text: "*Please reply with 1 or 2 only* ❤️", contextInfo: replyContextInfo },
                        { quoted: replyMsg }
                    );
                }
            } catch (error) {
                console.error("Error in message handler:", error);
            }
        };

        // Add the listener
        conn.ev.on("messages.upsert", messageHandler);

        // Add timeout to remove listener if no response
        setTimeout(() => {
            conn.ev.off("messages.upsert", messageHandler);
        }, 60000); // Remove after 1 minute

    } catch (e) {
        console.error("Error in mp4 command:", e);
        reply("An error occurred. Please try again later.");
    }
});
