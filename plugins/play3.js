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
        let apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.download_url) {
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

> ʀᴇᴘʟʏ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴡɪᴛʜ 1 ᴏʀ 2 ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ.`;

        let contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363302677217436@newsletter',
                newsletterName: 'CASEYRHODES-XMD',
                serverMessageId: 143
            }
        };

        // Send thumbnail with options
        const videoMsg = await conn.sendMessage(from, { 
            image: { url: yts.thumbnail }, 
            caption: ytmsg, 
            contextInfo 
        }, { quoted: mek });

        // Store the message info for later response handling
        const messageId = videoMsg.key.id;
        
        // Create a response handler for this specific message
        const responseHandler = async (msg) => {
            if (!msg.message || !msg.message.extendedTextMessage) return;
            
            const replyContext = msg.message.extendedTextMessage.contextInfo;
            if (!replyContext || replyContext.stanzaId !== messageId) return;
            
            const selected = msg.message.extendedTextMessage.text.trim();
            
            await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

            switch (selected) {
                case "1":
                    await conn.sendMessage(from, {
                        document: { url: data.result.download_url },
                        mimetype: "video/mp4",
                        fileName: `${yts.title}.mp4`,
                        contextInfo: {
                            ...contextInfo,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363302677217436@newsletter',
                                newsletterName: 'CASEYRHODES-XMD',
                                serverMessageId: 144
                            }
                        }
                    }, { quoted: msg });
                    break;

                case "2":
                    await conn.sendMessage(from, {
                        video: { url: data.result.download_url },
                        mimetype: "video/mp4",
                        caption: yts.title,
                        contextInfo: {
                            ...contextInfo,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363302677217436@newsletter',
                                newsletterName: 'CASEYRHODES-XMD',
                                serverMessageId: 145
                            }
                        }
                    }, { quoted: msg });
                    break;

                default:
                    await conn.sendMessage(
                        from,
                        { text: "*Please Reply with ( 1 or 2) ❤️*" },
                        { quoted: msg }
                    );
                    return; // Don't remove listener for invalid response
            }
            
            // Remove the listener after successful handling
            conn.ev.off('messages.upsert', responseHandler);
        };

        // Add the listener
        conn.ev.on('messages.upsert', responseHandler);
        
        // Set timeout to remove listener after 2 minutes
        setTimeout(() => {
            conn.ev.off('messages.upsert', responseHandler);
        }, 120000);

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

// MP3 song download - Fixed version
cmd({ 
    pattern: "song", 
    alias: ["ytdl3", "play"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to fetch the audio. Please try again later.");
        }
        
        let ytmsg = `🎵 *Song Details*
🎶 *Title:* ${yts.title}
⏳ *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

*Choose download format:*
1. 📄 MP3 as Document
2. 🎧 MP3 as Audio (Play)
3. 🎙️ MP3 as Voice Note (PTT)

> ʀᴇᴘʟʏ ᴡɪᴛʜ 1,2 ᴏʀ 3 ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴛʜᴇ ғᴏʀᴍᴀᴛ ʏᴏᴜ ᴘʀᴇғᴇʀ.`;
        
        let contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363302677217436@newsletter',
                newsletterName: 'CASEYRHODES-TECH',
                serverMessageId: 143
            }
        };
        
        // Send thumbnail with caption
        const songMsg = await conn.sendMessage(from, { 
            image: { url: yts.thumbnail }, 
            caption: ytmsg, 
            contextInfo 
        }, { quoted: mek });

        const messageId = songMsg.key.id;
        
        // Create response handler
        const responseHandler = async (msg) => {
            if (!msg.message || !msg.message.extendedTextMessage) return;
            
            const replyContext = msg.message.extendedTextMessage.contextInfo;
            if (!replyContext || replyContext.stanzaId !== messageId) return;
            
            const selectedOption = msg.message.extendedTextMessage.text.trim();
            
            await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

            switch (selectedOption) {
                case "1":   
                    await conn.sendMessage(from, { 
                        document: { url: data.result.downloadUrl }, 
                        mimetype: "audio/mpeg", 
                        fileName: `${yts.title}.mp3`, 
                        contextInfo: {
                            ...contextInfo,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363302677217436@newsletter',
                                newsletterName: 'CASEYRHODES-TECH',
                                serverMessageId: 144
                            }
                        }
                    }, { quoted: msg });   
                    break;
                case "2":   
                    await conn.sendMessage(from, { 
                        audio: { url: data.result.downloadUrl }, 
                        mimetype: "audio/mpeg", 
                        contextInfo: {
                            ...contextInfo,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363302677217436@newsletter',
                                newsletterName: 'CASEYRHODES-TECH',
                                serverMessageId: 145
                            }
                        }
                    }, { quoted: msg });
                    break;
                case "3":   
                    await conn.sendMessage(from, { 
                        audio: { url: data.result.downloadUrl }, 
                        mimetype: "audio/mpeg", 
                        ptt: true, 
                        contextInfo: {
                            ...contextInfo,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363302677217436@newsletter',
                                newsletterName: 'CASEYRHODES-TECH',
                                serverMessageId: 146
                            }
                        }
                    }, { quoted: msg });
                    break;
                default:
                    await conn.sendMessage(
                        from,
                        { text: "*Invalid selection please select between (1, 2 or 3) 🔴*" },
                        { quoted: msg }
                    );
                    return; // Don't remove listener for invalid response
            }
            
            // Remove the listener after successful handling
            conn.ev.off('messages.upsert', responseHandler);
        };

        // Add the listener
        conn.ev.on('messages.upsert', responseHandler);
        
        // Set timeout to remove listener after 2 minutes
        setTimeout(() => {
            conn.ev.off('messages.upsert', responseHandler);
        }, 120000);
           
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});
